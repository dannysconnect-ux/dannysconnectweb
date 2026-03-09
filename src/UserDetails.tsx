import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore'; // <-- NEW IMPORTS
import { db, auth } from './firebase'; // <-- IMPORT db and auth
import { Phone, MapPin, ArrowRight } from 'lucide-react';

export default function UserDetails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("No user is currently logged in.");
      }

      // Update the existing user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        profileCompleted: true // Flag to show they finished onboarding
      });

      // Redirect to the dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error("Error updating user details:", err);
      setError(err.message || "Failed to save details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-8 border-t-8 border-yellow-400">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Complete Profile</h2>
        <p className="text-blue-600 mb-8">Just a few more details before we personalize your AI dashboard.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-blue-400" size={20} />
              <input 
                type="tel" 
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+260 XXX XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Home Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-blue-400" size={20} />
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="123 Example Street"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">City / Province</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-blue-400" size={20} />
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Lusaka, Lusaka Province"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Go to Dashboard'} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}