import { useState, useEffect } from 'react';
import { 
  Globe, Bot, LogOut, Sparkles, CheckCircle, GraduationCap, 
  FileText, Eye, Settings, X, Mail, Phone, MapPin, BookOpen, 
  DollarSign, Briefcase, Building, FolderOpen, Download, Bell, BellRing 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc } from 'firebase/firestore'; 
import { auth, db } from './firebase'; 
import Chatbot from './components/Chatbot'; 
import Application from './components/Application'; 



const API_BASE_URL = import.meta.env?.VITE_API_BASE || 
  (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://dannysconnect-938159032176.us-central1.run.app');


export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAppOpen, setIsAppOpen] = useState(false); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Match State
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [appliedPrograms, setAppliedPrograms] = useState<string[]>([]);
  
  // Applications & Messages State
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [myMessages, setMyMessages] = useState<any[]>([]); 

  const fetchUserData = async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.name || 'Student'); 
        setUserProfile(data); 
      } else {
        setUserName('Student');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchMyApplicationsAndMessages = async (userId: string) => {
    try {
      // 1. Fetch Applications
      const qApps = query(collection(db, 'applications'), where('userId', '==', userId));
      const appSnap = await getDocs(qApps);
      const apps: any[] = [];
      appSnap.forEach((doc) => apps.push({ id: doc.id, ...doc.data() }));
      setMyApplications(apps);
      setAppliedPrograms(apps.map(a => a.program));

      // 2. Fetch Messages
      const qMsgs = query(collection(db, 'messages'), where('userId', '==', userId));
      const msgSnap = await getDocs(qMsgs);
      const msgs: any[] = [];
      msgSnap.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      
      // Sort newest first
      msgs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setMyMessages(msgs);

    } catch (error) {
      console.error("Error fetching applications and messages:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
        fetchMyApplicationsAndMessages(user.uid);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const handleFindMatches = async () => {
    if (!userProfile?.profileCompleted) {
      alert("Please complete your profile and upload documents first!");
      return;
    }
    
    setLoadingMatches(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_profile: userProfile }),
      });
      
      const data = await response.json();
      setMatches(data.matches || []); 
      
      if (!data.matches || data.matches.length === 0) {
        alert("No matches found. Try adjusting your preferences.");
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      alert("Make sure your Python AI Backend is running!");
      setMatches([]); 
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleApply = async (match: any) => {
    try {
      if (!auth.currentUser) return;

      // 1. Save application to Firestore
      await addDoc(collection(db, 'applications'), {
        userId: auth.currentUser.uid,
        studentName: userName,
        studentEmail: auth.currentUser.email,
        program: match.program,
        university: match.university,
        documents: userProfile.documents || {}, 
        status: 'Pending Review',
        appliedAt: serverTimestamp()
      });

      // 2. Trigger email notification to Admin (Danny's Connect)
      await addDoc(collection(db, 'mail'), {
        to: 'dannysconnect@gmail.com', // Admin email
        message: {
          subject: `New Application Alert: ${userName} applied for ${match.program}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #1e3a8a;">New Student Application</h2>
              <p>A new application has been submitted through the portal.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding: 8px 0;"><strong>Student Name:</strong></td><td>${userName}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Email:</strong></td><td>${auth.currentUser.email}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Program:</strong></td><td>${match.program}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>University:</strong></td><td>${match.university}</td></tr>
              </table>
              <br/>
              <p style="background-color: #f3f4f6; padding: 12px; border-left: 4px solid #f97316;">
                Please log in to the admin dashboard to review their documents and process the application.
              </p>
            </div>
          `
        }
      });

      // 3. Refresh UI
      fetchMyApplicationsAndMessages(auth.currentUser.uid);
      alert(`Application sent to Danny's Connect for ${match.program}!`);
      
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application.");
    }
  };

  const handleOpenInbox = async () => {
    setIsInboxOpen(true);
    const unreadMsgs = myMessages.filter(m => !m.read);
    
    // Optimistically update UI so the badge disappears immediately
    setMyMessages(myMessages.map(m => ({ ...m, read: true })));

    // Update read status in Firestore silently
    for (let msg of unreadMsgs) {
      await updateDoc(doc(db, 'messages', msg.id), { read: true });
    }
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 75) return 'text-green-700 bg-green-100 border-green-200';
    if (rate >= 50) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const totalSent = myApplications.length;
  const underReview = myApplications.filter(a => a.status === 'Under Review' || a.status === 'Pending Review').length;
  const processed = myApplications.filter(a => a.status === 'Processed').length;
  
  const unreadCount = myMessages.filter(m => !m.read).length;

  return (
    <div className="min-h-screen bg-blue-50 relative">
      <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="text-xl font-bold text-yellow-400 flex items-center gap-2">
          <Globe className="text-orange-500" />
          Student Dashboard
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={handleOpenInbox} className="relative flex items-center gap-2 text-sm hover:text-yellow-400 transition-colors">
            {unreadCount > 0 ? <BellRing className="text-yellow-400 animate-pulse" size={20} /> : <Bell size={20} />}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 text-sm hover:text-yellow-400 transition-colors border-l border-blue-700 pl-6">
            <Settings size={18} /> Settings
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm hover:text-orange-400 transition-colors border-l border-blue-700 pl-6">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 mt-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          {loading ? 'Loading your portal...' : `Welcome, ${userName}!`}
        </h1>
        <p className="text-blue-700 mb-6">Your AI assistant is ready to help you find the best opportunities.</p>

        {/* Application Status Banner */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Applications Sent</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalSent}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Under Review</p>
              <h3 className="text-2xl font-bold text-gray-900">{underReview}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Processed</p>
              <h3 className="text-2xl font-bold text-gray-900">{processed}</h3>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-500">
            <h3 className="font-bold text-lg mb-2 text-blue-900">Application Profile</h3>
            {userProfile?.profileCompleted ? (
              <p className="text-green-600 text-sm font-semibold">Profile updated! AI is ready to match you.</p>
            ) : (
              <p className="text-blue-600 text-sm">You haven't updated your academic profile yet.</p>
            )}
            <button 
              onClick={() => setIsAppOpen(true)}
              className="mt-4 text-orange-500 font-bold text-sm hover:underline"
            >
              {userProfile?.profileCompleted ? 'Edit Profile & Documents' : 'Complete Profile'}
            </button>
          </div>

          {/* AI Matches Card */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-400">
            <h3 className="font-bold text-lg mb-2 text-blue-900 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={20} /> AI Matches
            </h3>
            <p className="text-blue-600 text-sm mb-4">
              {userProfile?.programOfStudy 
                ? `Destination: ${userProfile?.preferredCountry || 'Any'}` 
                : 'Complete profile to unlock matches.'}
            </p>
            <button 
               onClick={handleFindMatches}
               disabled={!userProfile?.profileCompleted || loadingMatches}
               className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-2 px-4 rounded w-full transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
               {loadingMatches ? <><Bot className="animate-spin" size={18}/> Scanning Universities...</> : 'Find My Best Matches'}
            </button>
          </div>

          {/* Chatbot Card */}
          <div className="bg-blue-900 p-6 rounded-xl shadow-md text-white flex flex-col items-center justify-center text-center">
            <Bot size={40} className="text-yellow-400 mb-3 animate-bounce" />
            <h3 className="font-bold text-lg mb-2">Talk to AI Assistant</h3>
            <p className="text-blue-200 text-sm mb-4">Get 24/7 help with your applications and flights.</p>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-orange-500 px-4 py-2 rounded font-bold text-sm hover:bg-orange-600 transition"
            >
              Open Chat
            </button>
          </div>
        </div>

        {/* Display Matches Section */}
        {matches.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Sparkles className="text-orange-500" /> Recommended Programs For You
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, idx) => (
                <div key={idx} className="border border-gray-200 p-5 rounded-xl hover:shadow-xl transition flex flex-col justify-between bg-gray-50 hover:bg-white">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-blue-900 leading-tight pr-2">{match.program}</h3>
                      <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${getSuccessColor(match.success_rate)}`}>
                        {match.success_rate}% Match
                      </span>
                    </div>
                    
                    <p className="text-sm font-bold text-orange-500 mb-4">{match.university}</p>
                    
                    <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
                      <p className="text-xs font-bold text-blue-900 flex items-center gap-1 mb-1">
                        <GraduationCap size={14} /> Financial Aid / Scholarships
                      </p>
                      <p className="text-xs text-blue-700">{match.scholarship}</p>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{match.reason}</p>
                  </div>
                  
                  {appliedPrograms.includes(match.program) ? (
                    <button disabled className="mt-auto flex items-center justify-center gap-2 bg-green-100 text-green-700 font-bold py-2.5 px-4 rounded-lg w-full">
                      <CheckCircle size={18} /> Application Sent
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(match)}
                      className="mt-auto bg-blue-900 hover:bg-blue-800 text-yellow-400 font-bold py-2.5 px-4 rounded-lg w-full transition shadow-md"
                    >
                      Apply via Danny's Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <Chatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        studentProfile={userProfile} 
      />

      {auth.currentUser && (
        <Application 
          isOpen={isAppOpen}
          onClose={() => setIsAppOpen(false)}
          userId={auth.currentUser.uid}
          userProfile={userProfile}
          onProfileUpdated={() => fetchUserData(auth.currentUser!.uid)}
        />
      )}

      {/* --- INBOX MODAL --- */}
      {isInboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-blue-900 text-white p-5 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <Bell size={22} className="text-yellow-400"/> Notifications & Updates
              </h2>
              <button onClick={() => setIsInboxOpen(false)} className="hover:text-red-400 transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {myMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <Bell size={40} className="mx-auto mb-3 text-gray-300" />
                  <p>No messages yet.</p>
                  <p className="text-sm">When your application status updates, you will see it here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {myMessages.map((msg) => (
                    <div key={msg.id} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 relative">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-blue-900">{msg.title}</h3>
                        <span className="text-xs text-gray-400">
                          {msg.createdAt ? msg.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SETTINGS MODAL --- */}
      {isSettingsOpen && userProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="bg-blue-900 text-white p-5 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <Settings size={22} /> My Account Details
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="hover:text-red-400 transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-6">
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Contact Info */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">My Information</h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2"><Eye size={16} className="text-gray-400"/> <strong>Name:</strong> {userProfile.name}</p>
                    <p className="flex items-center gap-2"><Mail size={16} className="text-gray-400"/> <strong>Email:</strong> {userProfile.email}</p>
                    <p className="flex items-center gap-2"><Phone size={16} className="text-gray-400"/> <strong>Phone:</strong> {userProfile.phone || 'Not provided'}</p>
                    <p className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> <strong>Location:</strong> {userProfile.city ? `${userProfile.city}, ${userProfile.address}` : 'Not provided'}</p>
                  </div>
                </div>

                {/* Study Preferences */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">My Preferences</h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2"><BookOpen size={16} className="text-gray-400"/> <strong>Program:</strong> {userProfile.programOfStudy || 'N/A'}</p>
                    <p className="flex items-center gap-2"><DollarSign size={16} className="text-gray-400"/> <strong>Budget:</strong> {userProfile.budget || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Globe size={16} className="text-gray-400"/> <strong>Country:</strong> {userProfile.preferredCountry || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Briefcase size={16} className="text-gray-400"/> <strong>IAESTE Account:</strong> {userProfile.iaesteAccount || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* My Applications */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <Building className="text-blue-600" size={20} /> My Applications
                </h3>
                {myApplications.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">You haven't submitted any applications yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myApplications.map((app: any) => (
                      <div key={app.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{app.university}</p>
                          <p className="text-sm text-blue-700">{app.program}</p>
                          {app.appliedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Applied on: {app.appliedAt.toDate().toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          app.status === 'Processed' ? 'bg-green-100 text-green-700 border border-green-200' :
                          app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-gray-200 text-gray-700 border border-gray-300'
                        }`}>
                          {app.status || 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Uploaded Documents */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <FolderOpen className="text-orange-500" size={20} /> My Documents
                </h3>
                
                {!userProfile.documents || Object.keys(userProfile.documents).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No documents uploaded.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(userProfile.documents).map(([docKey, url]) => (
                      <div key={docKey} className="border border-gray-200 p-3 rounded-lg flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="text-orange-500 shrink-0" size={20} />
                          <span className="text-xs font-bold text-gray-700 truncate capitalize">
                            {docKey.replace('_', ' ')}
                          </span>
                        </div>
                        <a 
                          href={url as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:bg-blue-100 p-2 rounded transition shrink-0"
                          title="View / Download"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}