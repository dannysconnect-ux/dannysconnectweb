import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import { Globe, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Authenticate with Google
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // 2. Check the user's role in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // Update their last login time so you can track active users in the Admin dashboard
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });

        // 3. Smart Routing based on Role
        if (userData.role === 'admin') {
          navigate('/admin'); // Send to Command Center
        } else {
          // If it's a student, check if they finished setting up
          if (userData.profileCompleted) {
            navigate('/dashboard');
          } else {
            navigate('/setup-profile');
          }
        }
      } else {
        // Fallback: If they use Google Sign-In on the Login page but don't have an account yet,
        // create one for them safely as a 'student'.
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          role: 'student',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
        navigate('/setup-profile');
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border-t-8 border-orange-500">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Globe className="text-blue-900" size={40} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">Welcome Back</h2>
        <p className="text-center text-blue-600 mb-8">Sign in to continue to Danny's Connect</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="animate-spin text-blue-900" size={20} />
          ) : (
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google logo" />
          )}
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="mt-8 text-center text-sm text-blue-600">
          New to Danny's Connect?{' '}
          <Link to="/signup" className="text-orange-500 font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}