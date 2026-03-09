import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // <-- NEW IMPORTS
import { auth, googleProvider, db } from './firebase'; // <-- IMPORT db
import { Globe, Mail, Lock, UserPlus } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save the user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'student', // Default role
        createdAt: serverTimestamp(),
      });

      // 3. Redirect to profile setup
      navigate('/setup-profile');
    } catch (err: any) {
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      // 1. Sign in/up with Google
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // 2. Save/Update user in Firestore
      // We use { merge: true } so we don't overwrite existing data if they already have an account
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || '',
        role: 'student',
        lastLogin: serverTimestamp(),
      }, { merge: true });

      // 3. Redirect to profile setup
      navigate('/setup-profile');
    } catch (err) {
      setError('Failed to sign up with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border-t-8 border-yellow-400">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Globe className="text-blue-900" size={40} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">Create an Account</h2>
        <p className="text-center text-blue-600 mb-8">Join Danny's Connect to start your journey</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-blue-400" size={20} />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-blue-400" size={20} />
              <input 
                type="password" 
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-blue-400" size={20} />
              <input 
                type="password" 
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:opacity-70"
          >
            <UserPlus size={20} />
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-blue-200"></div>
          <span className="px-3 text-blue-400 text-sm">OR</span>
          <div className="flex-grow border-t border-blue-200"></div>
        </div>

        <button 
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-70"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google logo" />
          Sign up with Google
        </button>

        <div className="mt-8 text-center text-sm text-blue-600">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}