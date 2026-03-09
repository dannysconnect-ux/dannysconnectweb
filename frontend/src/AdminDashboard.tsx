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

  // 🔥 Wait for Firebase Auth to load before fetching students
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

  // 🔥 UPDATED: Now triggers an email and portal message to the student, and BCCs Admin
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

  // 🔥 UPDATED: Now BCCs Admin on custom messages too
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
      <nav className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center shrink-0">
        <div className="text-xl font-bold text-orange-500 flex items-center gap-2">
          Danny's Connect Admin
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm hover:text-orange-400 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-6 w-full flex-1">
        
        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{students.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-green-600">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Ready to Process</p>
              <h3 className="text-2xl font-bold text-gray-900">{completedProfiles}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Pending Profiles</p>
              <h3 className="text-2xl font-bold text-gray-900">{students.length - completedProfiles}</h3>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-lg">Student Roster</h2>
            <button onClick={fetchStudents} className="text-sm text-blue-600 hover:underline">
              Refresh Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm">
                  <th className="p-4 font-semibold">Student Name</th>
                  <th className="p-4 font-semibold">Program of Interest</th>
                  <th className="p-4 font-semibold">Budget</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
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
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{student.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-700">{student.programOfStudy || 'Not set'}</td>
                      <td className="p-4 text-sm text-gray-700">{student.budget || 'Not set'}</td>
                      <td className="p-4">
                        {student.applications && student.applications.length > 0 ? (
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">Application Sent</span>
                        ) : student.profileCompleted ? (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Documents Ready</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">Incomplete</span>
                        )}
                      </td>
                      <td className="p-4 flex items-center justify-center gap-3">
                        <a 
                          href={getWhatsAppLink(student.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-600 hover:bg-green-50 p-2 rounded-full transition tooltip"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle size={20} />
                        </a>
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 p-2 rounded-full transition"
                          title="View Documents"
                        >
                          <Folder size={20} />
                        </button>
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition"
                          title="View Full Profile"
                        >
                          <Eye size={20} />
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="bg-gray-900 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-bold text-xl">{selectedStudent.name}'s Profile</h2>
                <p className="text-xs text-gray-400">UID: {selectedStudent.id}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="hover:text-red-400 transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-6">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Contact Details</h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2"><Mail size={16} className="text-gray-400"/> {selectedStudent.email}</p>
                    <p className="flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {selectedStudent.phone || 'N/A'}</p>
                    <p className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {selectedStudent.city || 'N/A'}, {selectedStudent.address || 'N/A'}</p>
                  </div>
                  
                  {/* Communication Action Buttons */}
                  <div className="mt-4 flex flex-col gap-2">
                    {selectedStudent.phone && (
                       <a 
                         href={getWhatsAppLink(selectedStudent.phone)}
                         target="_blank" rel="noopener noreferrer"
                         className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition"
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
                      className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold py-2 px-4 rounded-lg transition"
                    >
                      <Bell size={16} className="text-yellow-400" /> Send Portal Update
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Study Preferences</h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2"><BookOpen size={16} className="text-gray-400"/> <strong>Program:</strong> {selectedStudent.programOfStudy || 'N/A'}</p>
                    <p className="flex items-center gap-2"><DollarSign size={16} className="text-gray-400"/> <strong>Budget:</strong> {selectedStudent.budget || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Globe size={16} className="text-gray-400"/> <strong>Country:</strong> {selectedStudent.preferredCountry || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Briefcase size={16} className="text-gray-400"/> <strong>IAESTE Account:</strong> {selectedStudent.iaesteAccount || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Submitted Applications Section with ACTION BUTTONS */}
              {selectedStudent.applications && selectedStudent.applications.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2 flex items-center gap-2">
                    <Building size={20} /> Submitted Applications
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedStudent.applications.map((app: any) => (
                      <div key={app.id} className="bg-white p-4 rounded-lg border border-blue-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{app.university}</p>
                            <p className="text-sm text-blue-700">{app.program}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            app.status === 'Processed' ? 'bg-green-100 text-green-700' :
                            app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {app.status || 'Pending'}
                          </span>
                        </div>
                        
                        {/* Status Update & Message Buttons */}
                        <div className="flex gap-2 mt-2 border-t pt-2 items-center flex-wrap">
                          <button 
                            onClick={() => updateApplicationStatus(app, 'Under Review')}
                            className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-3 rounded transition"
                          >
                            Mark Under Review
                          </button>
                          <button 
                            onClick={() => updateApplicationStatus(app, 'Processed')}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 py-1 px-3 rounded transition"
                          >
                            Mark Processed
                          </button>
                          
                          {/* 🔥 NEW: App-Specific Message Button */}
                          <button
                            onClick={() => {
                              setMessageTitle(`Update on your application: ${app.university}`);
                              setMessageBody('');
                              setIsMessageModalOpen(true);
                            }}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-3 rounded transition flex items-center gap-1 ml-auto"
                          >
                            <MessageCircle size={14} /> Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              {/* ... (Documents Section code remains unchanged) ... */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <FolderOpen className="text-orange-500" size={20} /> 
                  Uploaded Documents
                </h3>
                
                {!selectedStudent.documents || Object.keys(selectedStudent.documents).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">This student has not uploaded any documents yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedStudent.documents).map(([docKey, url]) => (
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

      {/* --- SEND MESSAGE MODAL (Overlaps the Student Profile) --- */}
      {isMessageModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Send size={18} className="text-yellow-400" /> Message {selectedStudent.name}
              </h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="hover:text-red-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject / Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Application Status Update"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button 
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-semibold transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={sendingMessage}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold transition flex items-center gap-2 disabled:opacity-50"
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