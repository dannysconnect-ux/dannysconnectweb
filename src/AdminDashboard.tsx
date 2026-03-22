import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, CheckCircle, LogOut, MessageCircle, 
  Eye, X, Download, MapPin, DollarSign, BookOpen, Phone, Mail,
  Folder, FolderOpen, Globe, Briefcase, Building, Send, Bell
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // State for Custom Messages
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Admin Email to receive copies
  const ADMIN_EMAIL = "dannysconnect@gmail.com"; 

  // Wait for Firebase Auth to load before fetching students
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchStudents();
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);
      
      const appsSnapshot = await getDocs(collection(db, 'applications'));
      const allApplications: any[] = [];
      appsSnapshot.forEach((doc) => {
        allApplications.push({ id: doc.id, ...doc.data() });
      });

      const studentData: any[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const studentApps = allApplications.filter(app => app.userId === doc.id);
        
        studentData.push({ 
          id: doc.id, 
          ...userData,
          applications: studentApps
        });
      });

      studentData.sort((a, b) => {
        const timeA = a.lastLogin?.toMillis() || 0;
        const timeB = b.lastLogin?.toMillis() || 0;
        return timeB - timeA;
      });

      setStudents(studentData);
      
      // If a modal is currently open, update its data so the UI refreshes instantly
      if (selectedStudent) {
        const updatedSelectedStudent = studentData.find(s => s.id === selectedStudent.id);
        if (updatedSelectedStudent) setSelectedStudent(updatedSelectedStudent);
      }

    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (app: any, newStatus: string) => {
    if (!selectedStudent) return;
    try {
      // 1. Update status in database
      const appRef = doc(db, 'applications', app.id);
      await updateDoc(appRef, { status: newStatus });

      // Auto-generate notification content
      const autoTitle = `Application Status Update: ${newStatus}`;
      const autoBody = `Great news! Your application to ${app.university} for the ${app.program} program has been marked as "${newStatus}".`;

      // 2. Save to the Student's Portal Inbox
      await addDoc(collection(db, 'messages'), {
        userId: selectedStudent.id,
        title: autoTitle,
        text: autoBody,
        read: false,
        createdAt: serverTimestamp()
      });

      // 3. BACKEND TRIGGER: Send Email to Student & BCC Admin
      await addDoc(collection(db, 'mail'), {
        to: selectedStudent.email,
        bcc: ADMIN_EMAIL, 
        message: {
          subject: `Danny's Connect - ${autoTitle}`,
          html: `
            <h2>Hello ${selectedStudent.name},</h2>
            <p>You have an important update regarding your application:</p>
            <blockquote style="border-left: 4px solid #f97316; padding-left: 10px; color: #333;">
              ${autoBody}
            </blockquote>
            <p>Log in to your Danny's Connect portal to view more details.</p>
            <br/>
            <p>Best regards,<br/>The Danny's Connect Team</p>
          `
        }
      });

      fetchStudents();
      alert(`Status updated to "${newStatus}" and email sent to ${selectedStudent.name}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !messageTitle || !messageBody) return;

    setSendingMessage(true);
    try {
      // 1. Save to the Student's Portal Inbox
      await addDoc(collection(db, 'messages'), {
        userId: selectedStudent.id,
        title: messageTitle,
        text: messageBody,
        read: false,
        createdAt: serverTimestamp()
      });
      
      // 2. BACKEND TRIGGER: Email Student & BCC Admin
      await addDoc(collection(db, 'mail'), {
        to: selectedStudent.email,
        bcc: ADMIN_EMAIL,
        message: {
          subject: `Update: ${messageTitle}`,
          html: `
            <h2>Hello ${selectedStudent.name},</h2>
            <p>You have a new message regarding your application on Danny's Connect:</p>
            <blockquote style="border-left: 4px solid #f97316; padding-left: 10px; color: #333;">
              ${messageBody}
            </blockquote>
            <p>Log in to your portal to view more details.</p>
            <br/>
            <p>Best regards,<br/>The Danny's Connect Team</p>
          `
        }
      });

      alert(`Portal message and email sent to ${selectedStudent.name}!`);
      setIsMessageModalOpen(false);
      setMessageTitle('');
      setMessageBody('');
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const getWhatsAppLink = (phone: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  const completedProfiles = students.filter(s => s.profileCompleted).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 text-white p-3 sm:p-4 shadow-md flex justify-between items-center shrink-0 sticky top-0 z-40">
        <div className="text-lg sm:text-xl font-bold text-orange-500 flex items-center gap-2 truncate">
          Danny's Connect <span className="hidden sm:inline">Admin</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm hover:text-orange-400 transition-colors">
          <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 w-full flex-1">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600 shrink-0">
              <Users size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold">Total Students</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{students.length}</h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-green-600 shrink-0">
              <CheckCircle size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold">Ready to Process</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{completedProfiles}</h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg text-orange-600 shrink-0">
              <FileText size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold">Pending Profiles</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{students.length - completedProfiles}</h3>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-base sm:text-lg">Student Roster</h2>
            <button onClick={fetchStudents} className="text-xs sm:text-sm text-blue-600 hover:underline">
              Refresh Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs sm:text-sm">
                  <th className="p-3 sm:p-4 font-semibold">Student Name</th>
                  {/* Hidden on mobile to save space */}
                  <th className="p-3 sm:p-4 font-semibold hidden md:table-cell">Program of Interest</th>
                  <th className="p-3 sm:p-4 font-semibold hidden lg:table-cell">Budget</th>
                  <th className="p-3 sm:p-4 font-semibold">Status</th>
                  <th className="p-3 sm:p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading students...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">No students found.</td></tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 sm:p-4">
                        <div className="font-bold text-gray-800 text-sm sm:text-base">{student.name || 'N/A'}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px] sm:max-w-xs">{student.email}</div>
                      </td>
                      <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700 hidden md:table-cell">{student.programOfStudy || 'Not set'}</td>
                      <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700 hidden lg:table-cell">{student.budget || 'Not set'}</td>
                      <td className="p-3 sm:p-4">
                        {student.applications && student.applications.length > 0 ? (
                          <span className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">App Sent</span>
                        ) : student.profileCompleted ? (
                          <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">Docs Ready</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">Incomplete</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 flex items-center justify-center gap-1 sm:gap-3">
                        <a 
                          href={getWhatsAppLink(student.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-600 hover:bg-green-50 p-1.5 sm:p-2 rounded-full transition"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                        </a>
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 p-1.5 sm:p-2 rounded-full transition"
                          title="View Documents"
                        >
                          <Folder size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 sm:p-2 rounded-full transition"
                          title="View Full Profile"
                        >
                          <Eye size={18} className="sm:w-5 sm:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- STUDENT DETAILS MODAL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="bg-gray-900 text-white p-4 sm:p-5 flex justify-between items-center shrink-0">
              <div className="truncate pr-2">
                <h2 className="font-bold text-lg sm:text-xl truncate">{selectedStudent.name}'s Profile</h2>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate">UID: {selectedStudent.id}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="hover:text-red-400 transition shrink-0 p-1">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-4 sm:gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Contact Details</h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2 truncate"><Mail size={16} className="text-gray-400 shrink-0"/> <span className="truncate">{selectedStudent.email}</span></p>
                    <p className="flex items-center gap-2"><Phone size={16} className="text-gray-400 shrink-0"/> {selectedStudent.phone || 'N/A'}</p>
                    <p className="flex items-center gap-2 truncate"><MapPin size={16} className="text-gray-400 shrink-0"/> <span className="truncate">{selectedStudent.city || 'N/A'}, {selectedStudent.address || 'N/A'}</span></p>
                  </div>
                  
                  {/* Communication Action Buttons */}
                  <div className="mt-4 flex flex-col gap-2">
                    {selectedStudent.phone && (
                       <a 
                         href={getWhatsAppLink(selectedStudent.phone)}
                         target="_blank" rel="noopener noreferrer"
                         className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 sm:py-2.5 px-4 rounded-lg transition w-full"
                       >
                         <MessageCircle size={16} /> Chat on WhatsApp
                       </a>
                    )}
                    <button 
                      onClick={() => {
                        setMessageTitle('');
                        setMessageBody('');
                        setIsMessageModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold py-2 sm:py-2.5 px-4 rounded-lg transition w-full"
                    >
                      <Bell size={16} className="text-yellow-400" /> Send Portal Update
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Study Preferences</h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2"><BookOpen size={16} className="text-gray-400 shrink-0"/> <strong>Program:</strong> <span className="truncate">{selectedStudent.programOfStudy || 'N/A'}</span></p>
                    <p className="flex items-center gap-2"><DollarSign size={16} className="text-gray-400 shrink-0"/> <strong>Budget:</strong> {selectedStudent.budget || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Globe size={16} className="text-gray-400 shrink-0"/> <strong>Country:</strong> <span className="truncate">{selectedStudent.preferredCountry || 'N/A'}</span></p>
                    <p className="flex items-center gap-2"><Briefcase size={16} className="text-gray-400 shrink-0"/> <strong>IAESTE Account:</strong> {selectedStudent.iaesteAccount || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Submitted Applications Section with ACTION BUTTONS */}
              {selectedStudent.applications && selectedStudent.applications.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2 flex items-center gap-2">
                    <Building size={20} className="shrink-0" /> Submitted Applications
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedStudent.applications.map((app: any) => (
                      <div key={app.id} className="bg-white p-3 sm:p-4 rounded-lg border border-blue-100 flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="w-full sm:w-auto">
                            <p className="text-sm font-bold text-gray-800 leading-tight">{app.university}</p>
                            <p className="text-xs sm:text-sm text-blue-700 mt-0.5">{app.program}</p>
                          </div>
                          <span className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded-full border shrink-0 ${
                            app.status === 'Processed' ? 'bg-green-100 text-green-700 border-green-200' :
                            app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {app.status || 'Pending'}
                          </span>
                        </div>
                        
                        {/* Status Update & Message Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-1 sm:mt-2 border-t pt-3 sm:pt-2 items-stretch sm:items-center w-full">
                          <button 
                            onClick={() => updateApplicationStatus(app, 'Under Review')}
                            className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1.5 sm:py-1 px-3 rounded transition text-center"
                          >
                            Mark Under Review
                          </button>
                          <button 
                            onClick={() => updateApplicationStatus(app, 'Processed')}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 py-1.5 sm:py-1 px-3 rounded transition text-center"
                          >
                            Mark Processed
                          </button>
                          
                          {/* App-Specific Message Button */}
                          <button
                            onClick={() => {
                              setMessageTitle(`Update on your application: ${app.university}`);
                              setMessageBody('');
                              setIsMessageModalOpen(true);
                            }}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1.5 sm:py-1 px-3 rounded transition flex items-center justify-center gap-1 sm:ml-auto mt-2 sm:mt-0"
                          >
                            <MessageCircle size={14} /> Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <FolderOpen className="text-orange-500" size={20} /> 
                  Uploaded Documents
                </h3>
                
                {!selectedStudent.documents || Object.keys(selectedStudent.documents).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">This student has not uploaded any documents yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {Object.entries(selectedStudent.documents).map(([docKey, url]) => (
                      <div key={docKey} className="border border-gray-200 p-3 rounded-lg flex items-center justify-between bg-gray-50 w-full overflow-hidden">
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                          <FileText className="text-orange-500 shrink-0" size={18} />
                          <span className="text-xs font-bold text-gray-700 truncate capitalize flex-1">
                            {docKey.replace('_', ' ')}
                          </span>
                        </div>
                        <a 
                          href={url as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:bg-blue-100 p-1.5 sm:p-2 rounded transition shrink-0 ml-2"
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

      {/* --- SEND MESSAGE MODAL (Overlaps the Student Profile) --- */}
      {isMessageModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base">
                <Send size={18} className="text-yellow-400 shrink-0" /> <span className="truncate">Message {selectedStudent.name}</span>
              </h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="hover:text-red-400 p-1 shrink-0">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 sm:p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject / Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Application Status Update"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Type your update here..."
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end mt-2">
                <button 
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-semibold transition w-full sm:w-auto text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={sendingMessage}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto text-sm"
                >
                  {sendingMessage ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}