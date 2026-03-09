import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle, FileText, Globe2, Briefcase } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase'; 

interface ApplicationProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userProfile: any;
  onProfileUpdated: () => void;
}

// Configuration for all the required documents
const DOCUMENT_TYPES = [
  { id: 'hs_transcript', label: 'High School Transcripts' },
  { id: 'hs_certificate', label: 'High School Certificate' },
  { id: 'id_passport', label: 'National ID / National Passport' },
  { id: 'photo', label: 'Passport Size Photo' },
  { id: 'cv', label: 'Curriculum Vitae' },
  { id: 'bsc_certificate', label: 'Bachelors Degree Certificate (if applying for PG)' },
  { id: 'bsc_transcript', label: 'Bachelors Degree Transcripts' },
  { id: 'msc_certificate', label: 'Masters Degree Certificate' },
  { id: 'msc_transcript', label: 'Masters Degree Transcripts (for PhD programs)' },
  { id: 'intent_letter', label: 'Letter of Intent (if applicable)' },
  { id: 'language_cert', label: 'Language Certificate (IELTS, SAT, TOEFL, Duolingo)' },
];

export default function Application({ isOpen, onClose, userId, userProfile, onProfileUpdated }: ApplicationProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // API State
  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [fetchingCountries, setFetchingCountries] = useState(true);

  // Text Form State
  const [programOfStudy, setProgramOfStudy] = useState(userProfile?.programOfStudy || '');
  const [budget, setBudget] = useState(userProfile?.budget || '');
  const [iaesteAccount, setIaesteAccount] = useState(userProfile?.iaesteAccount || '');
  const [preferredCountry, setPreferredCountry] = useState(userProfile?.preferredCountry || '');
  
  // File Upload State: A dictionary holding { docId: File object }
  const [files, setFiles] = useState<Record<string, File>>({});

  // Fetch Countries from API on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
        const data = await response.json();
        // Extract common names and sort them alphabetically
        const names = data.map((country: any) => country.name.common).sort();
        setCountriesList(names);
      } catch (error) {
        console.error("Error fetching countries API:", error);
      } finally {
        setFetchingCountries(false);
      }
    };
    
    if (isOpen) {
      fetchCountries();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle individual file selection
  const handleFileChange = (docId: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [docId]: file }));
    } else {
      const newFiles = { ...files };
      delete newFiles[docId];
      setFiles(newFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Keep existing documents if they already uploaded some previously
      const uploadedDocuments: Record<string, string> = { ...(userProfile?.documents || {}) };

      // 1. Loop through all newly selected files and upload them to Firebase Storage
      for (const [docId, fileObj] of Object.entries(files)) {
        // Create a safe path: documents/userId/docId_filename
        const fileRef = ref(storage, `documents/${userId}/${docId}_${fileObj.name}`);
        await uploadBytes(fileRef, fileObj);
        const downloadUrl = await getDownloadURL(fileRef);
        uploadedDocuments[docId] = downloadUrl; // Save the URL to our dictionary
      }

      // 2. Update their profile in Firestore (Passing all data to fuel the AI matching engine)
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        programOfStudy: programOfStudy,
        budget: budget,
        iaesteAccount: iaesteAccount,
        preferredCountry: preferredCountry,
        documents: uploadedDocuments,
        profileCompleted: true
      });

      setSuccess(true);
      onProfileUpdated(); 
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-lg text-yellow-400">Application & AI Profile setup</h2>
            <p className="text-xs text-blue-200">Complete this to unlock personalized matches & success predictions</p>
          </div>
          <button onClick={onClose} className="hover:text-orange-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        {success ? (
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <CheckCircle size={60} className="text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-blue-900">Profile Updated!</h3>
            <p className="text-blue-600 mt-2">The Danny's Connect AI now has your latest information and is computing your success rates.</p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
            <form id="application-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Section 1: Study Preferences */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-4 border-b pb-2 flex items-center gap-2">
                  <Briefcase className="text-orange-500" size={18} /> Academic Focus
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-1">Program of Study</label>
                    <input 
                      type="text"
                      value={programOfStudy}
                      onChange={(e) => setProgramOfStudy(e.target.value)}
                      placeholder="e.g. BSc Nursing, MBA..."
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-1">Yearly Budget (Tuition & Living)</label>
                    <select 
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    >
                      <option value="">Select budget range...</option>
                      <option value="Under $5,000">Under $5,000</option>
                      <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                      <option value="$10,000 - $20,000">$10,000 - $20,000</option>
                      <option value="$20,000+">$20,000+</option>
                      <option value="Seeking Full Scholarship">Seeking Full Scholarship</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* NEW Section 2: Destination & Internship Matching */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-4 border-b pb-2 flex items-center gap-2">
                  <Globe2 className="text-orange-500" size={18} /> Destination & Internships
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* IAESTE Account Check */}
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-1">Do you have an IAESTE account?</label>
                    <select 
                      value={iaesteAccount}
                      onChange={(e) => setIaesteAccount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    >
                      <option value="">Select option...</option>
                      <option value="Yes">Yes, I have an account</option>
                      <option value="No">No, I don't</option>
                    </select>
                    
                    {iaesteAccount === 'No' && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-orange-800 font-medium">
                          Danny's Connect partners with IAESTE for global internships. 
                          Please apply and create an account here first: 
                        </p>
                        <a 
                          href="https://iaeste.org/internships" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-1 inline-block text-blue-600 font-bold text-xs hover:underline"
                        >
                          → iaeste.org/internships
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Country Dropdown via API */}
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-1">Preferred Country</label>
                    <select 
                      value={preferredCountry}
                      onChange={(e) => setPreferredCountry(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100"
                      required
                      disabled={fetchingCountries}
                    >
                      <option value="">{fetchingCountries ? 'Loading countries...' : 'Select a country...'}</option>
                      {countriesList.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Our AI will calculate your success score for universities in this region.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Document Uploads */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-1 border-b pb-2">Required Documents</h3>
                <p className="text-xs text-gray-500 mb-4">Upload applicable files (PDF, JPG, PNG). You can skip documents that don't apply to your degree level.</p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  {DOCUMENT_TYPES.map((docType) => {
                    const isAlreadyUploaded = userProfile?.documents?.[docType.id];
                    const selectedFile = files[docType.id];

                    return (
                      <div key={docType.id} className="border border-gray-200 rounded-lg p-3 flex flex-col justify-center bg-gray-50 hover:bg-blue-50 transition relative">
                        <label className="text-xs font-bold text-blue-900 mb-2 truncate">
                          {docType.label}
                        </label>
                        
                        <div className="flex items-center gap-2">
                          <input 
                            type="file"
                            id={docType.id}
                            onChange={(e) => handleFileChange(docType.id, e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <label 
                            htmlFor={docType.id}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-blue-200 text-blue-700 hover:text-orange-500 text-xs py-1.5 px-3 rounded cursor-pointer transition shadow-sm"
                          >
                            <Upload size={14} /> 
                            {selectedFile ? 'Change File' : 'Choose File'}
                          </label>
                        </div>

                        {/* Status Indicators */}
                        <div className="mt-2 text-[10px] font-medium">
                          {selectedFile ? (
                            <span className="text-orange-500 flex items-center gap-1">
                              <FileText size={12} /> {selectedFile.name} (Ready to save)
                            </span>
                          ) : isAlreadyUploaded ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle size={12} /> Safely stored in profile
                            </span>
                          ) : (
                            <span className="text-gray-400">Not uploaded</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        {!success && (
          <div className="bg-white border-t border-gray-200 p-4 shrink-0">
            <button 
              form="application-form"
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition shadow-md disabled:opacity-70"
            >
              {loading ? <><Loader2 className="animate-spin" size={20} /> Analyzing & Saving Profile...</> : 'Save & Update Profile'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}