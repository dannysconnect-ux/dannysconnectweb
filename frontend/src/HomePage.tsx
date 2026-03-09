import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  FileCheck, 
  Sparkles, 
  GraduationCap, 
  Plane, 
  Briefcase, 
  Globe,
  Loader2, 
  CheckCircle, 
  MapPin 
} from 'lucide-react';

// --- AI Chat & Match Animation Component ---
const AiActionAnimation = () => {
  const [step, setStep] = useState(0);

  // Cycle through the animation steps
  useEffect(() => {
    const sequence = async () => {
      if (step === 0) setTimeout(() => setStep(1), 1500); // Show User Chat
      if (step === 1) setTimeout(() => setStep(2), 2000); // Show AI Analyzing
      if (step === 2) setTimeout(() => setStep(3), 2500); // Show Matching Results
      if (step === 3) setTimeout(() => setStep(0), 5000); // Reset after showing results
    };
    sequence();
  }, [step]);

  return (
    <div className="w-full h-100 bg-blue-950 rounded-2xl border-4 border-orange-100 p-4 relative overflow-hidden flex flex-col shadow-2xl shadow-blue-900/50">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-blue-800 pb-2 mb-4">
        <Bot className="text-yellow-400" size={20} />
        <span className="text-blue-200 text-sm font-semibold tracking-wider uppercase">Danny's AI Assistant</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 justify-end pb-2">
        
        {/* Step 1: User Chat Bubble */}
        <div className={`flex justify-end transition-all duration-500 transform ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] text-sm shadow-md">
            I'm looking for a paid IT internship and study program in Europe.
          </div>
        </div>

        {/* Step 2: AI Analyzing / Matching */}
        <div className={`flex justify-start transition-all duration-500 transform ${step >= 2 && step < 3 ? 'translate-y-0 opacity-100' : 'hidden'}`}>
          <div className="bg-blue-800 border border-yellow-400 text-white p-3 rounded-2xl rounded-tl-none flex items-center gap-3 text-sm shadow-[0_0_15px_rgba(250,204,21,0.2)]">
            <Loader2 className="animate-spin text-orange-500" size={18} />
            <span className="text-yellow-200 animate-pulse">Analyzing profile & matching universities...</span>
          </div>
        </div>

        {/* Step 3: Results */}
        <div className={`flex flex-col gap-2 transition-all duration-700 transform ${step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 hidden'}`}>
          <div className="flex justify-start">
             <div className="bg-blue-800 border border-blue-700 text-white p-3 rounded-2xl rounded-tl-none text-sm mb-1">
              Here are your top matches:
            </div>
          </div>
          
          {/* Result Card 1 */}
          <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-lg border-l-4 border-orange-500 transform hover:scale-105 transition-transform cursor-pointer">
            <div className="bg-orange-100 p-2 rounded-full">
              <GraduationCap className="text-orange-600" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-blue-900 font-bold text-sm">Tech University of Berlin</h4>
              <div className="flex items-center gap-1 text-blue-600 text-xs">
                <MapPin size={12} /> Germany • 85% Match
              </div>
            </div>
            <CheckCircle className="text-green-500" size={18} />
          </div>

          {/* Result Card 2 */}
          <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-lg border-l-4 border-yellow-400 transform hover:scale-105 transition-transform cursor-pointer">
            <div className="bg-yellow-100 p-2 rounded-full">
              <GraduationCap className="text-yellow-600" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-blue-900 font-bold text-sm">Innovate Institute</h4>
              <div className="flex items-center gap-1 text-blue-600 text-xs">
                <MapPin size={12} /> France • 78% Match
              </div>
            </div>
            <CheckCircle className="text-green-500" size={18} />
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Main Homepage Component ---
export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50 font-sans text-blue-900">
      
      {/* Navigation */}
      <nav className="bg-blue-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <Globe className="text-orange-500" />
            Danny's Connect
          </div>
          <div className="hidden md:flex gap-6 font-semibold">
            <a href="#" className="hover:text-yellow-400 transition-colors">Home</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">About Us</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Services</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Gallery</a>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="px-4 py-2 text-blue-900 bg-yellow-400 hover:bg-yellow-500 rounded font-bold transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded font-bold transition-colors text-white"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight text-blue-900">
            We Help You Land the <span className="text-orange-500">Internship</span>, You Build the <span className="text-yellow-500">Future</span>.
          </h1>
          <p className="text-lg text-blue-700 mb-8 font-medium">
            Connecting Zambian students to top universities globally. Now powered by next-generation AI to make your study abroad, flight booking, and internship journey seamless and personalized.
          </p>
          <div className="flex gap-4">
            {/* The "Apply Now" button can also route to signup for new users */}
            <button 
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow-lg shadow-blue-300 transition-all transform hover:-translate-y-1"
            >
              Apply Now
            </button>
            <button className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded-lg font-bold text-lg shadow-lg shadow-yellow-200 transition-all transform hover:-translate-y-1">
              Watch Our Process
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <AiActionAnimation />
        </div>
      </header>

      {/* AI Features Section */}
      <section className="bg-blue-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-400" /> 
              Supercharged by AI
              <Sparkles className="text-yellow-400" />
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto">Experience a faster, smarter, and highly personalized application process with our new integrated AI features.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-800 border border-blue-700 p-8 rounded-xl hover:border-orange-500 transition-all duration-300">
              <div className="bg-orange-500 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Bot className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Consultation Bot</h3>
              <p className="text-blue-200">24/7 personalized guidance. Answers FAQs, explains the application process, and recommends paths based on your academic goals.</p>
            </div>
            
            <div className="bg-blue-800 border border-blue-700 p-8 rounded-xl hover:border-yellow-400 transition-all duration-300">
              <div className="bg-yellow-400 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <FileCheck className="text-blue-900" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Automated Processing</h3>
              <p className="text-blue-200">Smart tools automatically scan, verify, and organize your documents, minimizing human error and accelerating submissions.</p>
            </div>

            <div className="bg-blue-800 border border-blue-700 p-8 rounded-xl hover:border-orange-500 transition-all duration-300">
              <div className="bg-orange-500 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Globe className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Matching Engine</h3>
              <p className="text-blue-200">Our AI analyzes your unique profile to automatically match you with the perfect scholarships and paid international internships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Services Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Core Services</h2>
          <p className="text-blue-700 font-medium">Real guidance, real opportunities across the globe.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-yellow-400 flex gap-6 items-start">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Study Abroad & Scholarships</h3>
              <p className="text-blue-800">Get connected to top universities abroad, with guidance on institutions that offer scholarships or education loans to eligible students.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-orange-500 flex gap-6 items-start">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <Plane size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Flight Ticket Booking</h3>
              <p className="text-blue-800">We help you find affordable and convenient flight options for students and travelers heading abroad for studies, work, or tours.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-blue-600 flex gap-6 items-start">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Briefcase size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Work Abroad</h3>
              <p className="text-blue-800">Get assistance with finding and applying for job opportunities in trusted countries, with guidance on visa and relocation processes.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-yellow-400 flex gap-6 items-start">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <Globe size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Paid Internships Abroad</h3>
              <p className="text-blue-800">Access international internship opportunities that offer real-world experience—and a paycheck—across various industries and countries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Footer */}
      <footer className="bg-blue-950 text-blue-200 py-12 px-4 border-t-8 border-orange-500">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">Dreaming of studying abroad?</h2>
            <p className="mb-6">Danny's Connect links Zambian students to universities across India, Europe, China, and more.</p>
            <div className="flex gap-4">
              <input 
                type="email" 
                placeholder="example@gmail.com" 
                className="px-4 py-3 rounded text-blue-900 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded transition-colors">
                Subscribe
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm font-medium">
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-yellow-400">About Us</a>
              <a href="#" className="hover:text-yellow-400">For Students</a>
              <a href="#" className="hover:text-yellow-400">For Universities</a>
              <a href="#" className="hover:text-yellow-400">Blog</a>
            </div>
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-orange-400">Privacy Policy</a>
              <a href="#" className="hover:text-orange-400">Terms</a>
              <a href="#" className="hover:text-orange-400">Conditions</a>
              <a href="#" className="hover:text-orange-400">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}