import { useState, useEffect, useRef } from 'react';
import { 
  collection, query, where, getDocs, doc, 
  updateDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, uploadBytes, getDownloadURL 
} from 'firebase/storage';
import { db, auth, storage } from './firebase'; 
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, CheckCircle, LogOut, MessageCircle, 
  Eye, X, Download, MapPin, Phone, Mail,
  FolderOpen, Send, Bell,
  Upload, Image as ImageIcon, Loader2, Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- States ---
  const [activeTab, setActiveTab] = useState<'students' | 'gallery'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Gallery States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Messaging States
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const ADMIN_EMAIL = "dannysconnect@gmail.com"; 

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
    setLoading(true);
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

      // Sort by last login
      studentData.sort((a, b) => (b.lastLogin?.toMillis() || 0) - (a.lastLogin?.toMillis() || 0));
      setStudents(studentData);

      // Refresh selected student data if modal is open
      if (selectedStudent) {
        const updated = studentData.find(s => s.id === selectedStudent.id);
        if (updated) setSelectedStudent(updated);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Gallery Logic ---
  const simulateAISorting = async (fileName: string): Promise<string> => {
    const name = fileName.toLowerCase();
    if (name.includes('grad') || name.includes('cap')) return 'Education';
    if (name.includes('uni') || name.includes('campus') || name.includes('class')) return 'University';
    if (name.includes('flight') || name.includes('travel') || name.includes('airport')) return 'Travel';
    if (name.includes('work') || name.includes('job') || name.includes('office')) return 'Work';
    return 'Our Stories';
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const fileArray = Array.from(files);
    
    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Processing ${i + 1}/${fileArray.length}: ${file.name}`);

        const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        const category = await simulateAISorting(file.name);

        await addDoc(collection(db, 'gallery'), {
          title: file.name.split('.')[0].replace(/[-_]/g, ' '),
          url: downloadURL,
          filePath: snapshot.ref.fullPath,
          category: category,
          createdAt: serverTimestamp()
        });
      }
      alert("Successfully uploaded and AI-categorized all images!");
    } catch (error) {
      console.error(error);
      alert("Upload failed. Check your Firebase Storage rules.");
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Student Actions ---
  const updateApplicationStatus = async (app: any, newStatus: string) => {
    if (!selectedStudent) return;
    try {
      const appRef = doc(db, 'applications', app.id);
      await updateDoc(appRef, { status: newStatus });
      
      const autoTitle = `Application Status Update: ${newStatus}`;
      const autoBody = `Great news! Your application to ${app.university} for ${app.program} has been marked as "${newStatus}".`;

      await addDoc(collection(db, 'messages'), {
        userId: selectedStudent.id,
        title: autoTitle,
        text: autoBody,
        read: false,
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, 'mail'), {
        to: selectedStudent.email,
        bcc: ADMIN_EMAIL,
        message: {
          subject: `Danny's Connect - ${autoTitle}`,
          html: `<h2>Hello ${selectedStudent.name},</h2><p>${autoBody}</p><p>Log in to your portal for details.</p>`
        }
      });
      fetchStudents();
      alert(`Status updated to ${newStatus}!`);
    } catch (error) { console.error(error); alert("Failed to update status."); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !messageTitle || !messageBody) return;
    setSendingMessage(true);
    try {
      await addDoc(collection(db, 'messages'), {
        userId: selectedStudent.id,
        title: messageTitle,
        text: messageBody,
        read: false,
        createdAt: serverTimestamp()
      });
      
      await addDoc(collection(db, 'mail'), {
        to: selectedStudent.email,
        bcc: ADMIN_EMAIL,
        message: {
          subject: `Update: ${messageTitle}`,
          html: `<p>Hello ${selectedStudent.name},</p><blockquote>${messageBody}</blockquote>`
        }
      });

      alert(`Portal message and email sent to ${selectedStudent.name}!`);
      setIsMessageModalOpen(false);
      setMessageTitle('');
      setMessageBody('');
    } catch (error) { console.error(error); } finally { setSendingMessage(false); }
  };

  const handleLogout = () => { auth.signOut(); navigate('/'); };
  const getWhatsAppLink = (phone: string) => phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : '#';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar with Tabs */}
      <nav className="bg-gray-900 text-white p-3 sm:p-4 shadow-md flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="text-lg sm:text-xl font-bold text-orange-500 truncate">Danny's Connect <span className="hidden sm:inline">Admin</span></div>
          <div className="flex gap-1 sm:gap-2">
            <button 
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-2 ${activeTab === 'students' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Users size={16}/> <span className="hidden xs:inline">Students</span>
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-2 ${activeTab === 'gallery' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <ImageIcon size={16}/> <span className="hidden xs:inline">Gallery</span>
            </button>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs sm:text-sm hover:text-orange-400">
          <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 w-full flex-1">
        {activeTab === 'students' ? (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Users size={24} /></div>
                <div><p className="text-xs sm:text-sm text-gray-500 font-semibold">Total Students</p><h3 className="text-xl sm:text-2xl font-bold">{students.length}</h3></div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-600"><CheckCircle size={24} /></div>
                <div><p className="text-xs sm:text-sm text-gray-500 font-semibold">Docs Ready</p><h3 className="text-xl sm:text-2xl font-bold">{students.filter(s => s.profileCompleted).length}</h3></div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><FileText size={24} /></div>
                <div><p className="text-xs sm:text-sm text-gray-500 font-semibold">Total Apps</p><h3 className="text-xl sm:text-2xl font-bold">{students.reduce((acc, s) => acc + (s.applications?.length || 0), 0)}</h3></div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 text-sm sm:text-base">Student Roster</h2>
                <button onClick={fetchStudents} className="text-xs sm:text-sm text-blue-600 hover:underline">Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-xs sm:text-sm">
                      <th className="p-4">Student</th>
                      <th className="p-4">Program</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="p-10 text-center text-gray-400">Loading student data...</td></tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                          <td className="p-4">
                            <div className="font-bold text-sm text-gray-800">{student.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{student.programOfStudy || 'Not Selected'}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${student.profileCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {student.profileCompleted ? 'DOCS READY' : 'INCOMPLETE'}
                            </span>
                          </td>
                          <td className="p-4 flex justify-center gap-2">
                            <button onClick={() => setSelectedStudent(student)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition">
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
          </>
        ) : (
          /* Gallery Manager Tab */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-8 sm:p-12 text-center">
              <div className="bg-orange-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                {uploading ? <Loader2 className="animate-spin" size={40} /> : <Upload size={40} />}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Bulk Image Upload</h2>
              <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                Upload student success stories. Our AI will automatically tag them based on file names.
              </p>
              
              <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleBulkUpload} className="hidden" />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-full font-bold shadow-lg transition-all flex items-center gap-3 mx-auto ${uploading ? 'opacity-50' : ''}`}
              >
                {uploading ? 'Processing AI...' : <><Plus size={20}/> Select Images</>}
              </button>

              {uploading && (
                <div className="mt-8">
                  <div className="text-sm font-bold text-orange-600 mb-2 animate-pulse">{uploadProgress}</div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-orange-500 h-full w-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- MERGED STUDENT DETAILS MODAL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            
            <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-900 text-white">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{selectedStudent.name}'s Profile</h2>
                <p className="text-xs text-gray-400">UID: {selectedStudent.id}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-white/10 rounded-full transition"><X /></button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact & Bio */}
                <div className="space-y-6">
                  <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 border-b pb-2">Contact Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700 text-sm">
                        <Mail size={16} className="text-gray-400 shrink-0"/> <span className="truncate">{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700 text-sm">
                        <Phone size={16} className="text-gray-400 shrink-0"/> {selectedStudent.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-3 text-gray-700 text-sm">
                        <MapPin size={16} className="text-gray-400 shrink-0"/> <span className="truncate">{selectedStudent.city}, {selectedStudent.address}</span>
                      </div>
                      
                      <div className="pt-4 flex flex-col gap-2">
                        <a href={getWhatsAppLink(selectedStudent.phone)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2.5 rounded-lg transition">
                          <MessageCircle size={16}/> Chat on WhatsApp
                        </a>
                        <button onClick={() => setIsMessageModalOpen(true)} className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold py-2.5 rounded-lg transition">
                          <Bell size={16} className="text-yellow-400"/> Send Portal Notification
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 border-b pb-2">Preferences</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-gray-50 rounded border"><p className="text-[10px] text-gray-400 font-bold uppercase">Program</p><p className="text-xs font-semibold truncate">{selectedStudent.programOfStudy || 'N/A'}</p></div>
                      <div className="p-2 bg-gray-50 rounded border"><p className="text-[10px] text-gray-400 font-bold uppercase">Budget</p><p className="text-xs font-semibold">{selectedStudent.budget || 'N/A'}</p></div>
                      <div className="p-2 bg-gray-50 rounded border"><p className="text-[10px] text-gray-400 font-bold uppercase">Country</p><p className="text-xs font-semibold">{selectedStudent.preferredCountry || 'N/A'}</p></div>
                      <div className="p-2 bg-gray-50 rounded border"><p className="text-[10px] text-gray-400 font-bold uppercase">IAESTE</p><p className="text-xs font-semibold">{selectedStudent.iaesteAccount || 'No'}</p></div>
                    </div>
                  </section>
                </div>

                {/* Applications & Documents */}
                <div className="space-y-6">
                  {/* Applications Section */}
                  <section className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-4 border-b border-blue-200 pb-2">University Applications</h3>
                    {selectedStudent.applications && selectedStudent.applications.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStudent.applications.map((app: any) => (
                          <div key={app.id} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-xs text-gray-800">{app.university}</p>
                                <p className="text-[10px] text-blue-600">{app.program}</p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase border border-blue-200">{app.status || 'Pending'}</span>
                            </div>
                            <div className="flex gap-1.5 pt-2 border-t mt-2">
                              <button onClick={() => updateApplicationStatus(app, 'Under Review')} className="flex-1 bg-yellow-100 text-yellow-700 text-[10px] py-1.5 rounded font-bold hover:bg-yellow-200 transition">Review</button>
                              <button onClick={() => updateApplicationStatus(app, 'Processed')} className="flex-1 bg-green-600 text-white text-[10px] py-1.5 rounded font-bold hover:bg-green-700 transition">Process</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-blue-400 italic text-center py-4">No active applications found.</p>
                    )}
                  </section>

                  {/* DOCUMENTS SECTION (Restored) */}
                  <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 border-b pb-2 flex items-center gap-2">
                      <FolderOpen size={16} /> Uploaded Documents
                    </h3>
                    {!selectedStudent.documents || Object.keys(selectedStudent.documents).length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No documents uploaded yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(selectedStudent.documents).map(([key, url]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText size={14} className="text-orange-500 shrink-0"/>
                              <span className="text-[11px] font-bold text-gray-700 truncate capitalize">{key.replace(/_/g, ' ')}</span>
                            </div>
                            <a href={url as string} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                              <Download size={14} />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Send size={20} className="text-blue-600"/> Message to {selectedStudent?.name}
            </h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
                <input required className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="Subject/Title" value={messageTitle} onChange={(e) => setMessageTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Message Content</label>
                <textarea required rows={4} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none text-sm" placeholder="Write update here..." value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsMessageModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={sendingMessage} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition">
                  {sendingMessage ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}