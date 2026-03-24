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
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

// --- Carousel Data (Images + Services) ---
const CAROUSEL_DATA = [
  {
    img: "Education.jpeg",
    title: "Study Abroad & Scholarships",
    desc: "Connecting students to top universities globally. Seamless study abroad and scholarship opportunities."
  },
  {
    img: "air.jpg",
    title: "Flight Ticket Booking",
    desc: "We help you find affordable and convenient flight options for students and travelers heading abroad."
  },
  {
    img: "/work.jpeg", 
    title: "Paid Internships Abroad",
    desc: "Access international internship opportunities that offer real-world experience and a paycheck."
  }
];

// --- Video Data exactly mapped to 2.mp4 -> 5.mp4 (4 items total) ---
const TESTIMONIALS = [
  { id: 2, src: "/2.mp4" },
  { id: 3, src: "/3.mp4" },
  { id: 4, src: "/4.mp4" },
  { id: 5, src: "/5.mp4" },
];

export default function Homepage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_DATA.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_DATA.length) % CAROUSEL_DATA.length);

  return (
    <div className="min-h-screen bg-blue-50 font-sans text-blue-900 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="bg-white text-blue-900 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-2">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Danny's Connect Logo" className="w-20 md:w-24 h-auto object-contain" />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-6 font-bold text-blue-900">
            <a href="/" className="hover:text-orange-500 transition-colors">Home</a>
            <a href="/about-us" className="hover:text-orange-500 transition-colors">About Us</a>
            <a href="/gallery" className="hover:text-orange-500 transition-colors">Gallery</a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-4">
            <button onClick={() => navigate('/login')} className="px-5 py-2 text-blue-900 bg-yellow-400 hover:bg-yellow-500 rounded font-bold transition-colors">
              Login
            </button>
            <button onClick={() => navigate('/signup')} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 rounded font-bold transition-colors text-white">
              Sign Up
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden p-2 text-blue-900 hover:text-orange-500 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-blue-100 shadow-xl flex flex-col py-4 px-6 gap-4 animate-in slide-in-from-top-2">
            <a href="/" className="font-bold text-blue-900 hover:text-orange-500 py-2 border-b border-blue-50">Home</a>
            <a href="/about-us" className="font-bold text-blue-900 hover:text-orange-500 py-2 border-b border-blue-50">About Us</a>
            <a href="/gallery" className="font-bold text-blue-900 hover:text-orange-500 py-2 border-b border-blue-50">Gallery</a>
            <div className="flex flex-col gap-3 mt-2">
              <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded font-bold text-center">Login</button>
              <button onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold text-center">Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* 1. Hero Carousel Section */}
      <header className="relative w-full h-[500px] sm:h-[600px] overflow-hidden bg-blue-950">
        {CAROUSEL_DATA.map((slide, index) => (
          <div key={index} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
            <div className="absolute inset-0 bg-blue-950/70 z-10"></div>
            <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 sm:px-8">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight text-white max-w-4xl drop-shadow-lg">
                <span className="text-yellow-400 block text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-2">
                  {slide.title}
                </span>
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-blue-100 mb-8 font-medium max-w-2xl drop-shadow-md">
                {slide.desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-base md:text-lg shadow-lg transition-transform hover:-translate-y-1">
                  Apply Now
                </button>
                <button onClick={() => {
                  const videoElement = document.getElementById('intro-video') as HTMLVideoElement;
                  if (videoElement) {
                    videoElement.scrollIntoView({ behavior: 'smooth' });
                    videoElement.play();
                  }
                }} className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-blue-600/50 hover:bg-blue-600 border border-blue-400 text-white backdrop-blur-sm rounded-lg font-bold text-base md:text-lg shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  <PlayCircle size={20} /> Watch Process
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button onClick={prevSlide} className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-blue-900/50 hover:bg-blue-900 text-yellow-400 rounded-full transition backdrop-blur-sm"><ChevronLeft size={32} /></button>
        <button onClick={nextSlide} className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-blue-900/50 hover:bg-blue-900 text-yellow-400 rounded-full transition backdrop-blur-sm"><ChevronRight size={32} /></button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {CAROUSEL_DATA.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-orange-500 w-8' : 'bg-white/50 w-2 hover:bg-yellow-400'}`}
            />
          ))}
        </div>
      </header>

      {/* 2. Intro Video Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-10 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border-t-4 border-orange-500">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-blue-900 mb-4">What we do best?</h2>
            <div className="w-16 h-1 bg-yellow-400 mx-auto md:mx-0 mb-6"></div>
            <p className="text-blue-800 text-base sm:text-lg leading-relaxed font-medium mb-6">
              Watch this short video as you meet <strong className="text-orange-500">One of our students</strong>, She explains the process and what you should expect from our dedicated team.
            </p>
            <button 
              onClick={() => navigate('/about-us')}
              className="bg-blue-900 hover:bg-blue-800 text-yellow-400 font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Learn More About Us
            </button>
          </div>
          
          <div className="flex-1 w-full rounded-xl overflow-hidden shadow-lg border-4 border-blue-100 bg-black">
            <video 
              id="intro-video"
              src="/1.mp4" 
              controls 
              preload="metadata"
              className="w-full aspect-video object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. AI Features Section - UPDATED TO BE CLICKABLE */}
      <section className="bg-blue-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-400" size={28} /> Supercharged by AI <Sparkles className="text-yellow-400" size={28} />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div 
              onClick={() => navigate('/signup')}
              className="bg-blue-800 border border-blue-700 p-8 rounded-xl hover:border-orange-500 transition-all cursor-pointer hover:scale-105 active:scale-95 group"
            >
              <Bot className="text-orange-500 mb-4 mx-auto group-hover:animate-bounce" size={48} />
              <h3 className="text-white font-bold text-xl mb-3">Consultation Bot</h3>
              <p className="text-blue-200 text-sm">24/7 personalized guidance for your application process and general inquiries.</p>
            </div>
            
            <div 
              onClick={() => navigate('/signup')}
              className="bg-blue-800 border border-blue-700 p-8 rounded-xl hover:border-yellow-400 transition-all cursor-pointer hover:scale-105 active:scale-95 group"
            >
              <FileCheck className="text-yellow-400 mb-4 mx-auto group-hover:animate-bounce" size={48} />
              <h3 className="text-white font-bold text-xl mb-3">Auto-Processing</h3>
              <p className="text-blue-200 text-sm">Smart tools to instantly verify, organize, and format your application documents.</p>
            </div>
            
            <div 
              onClick={() => navigate('/signup')}
              className="bg-blue-800 border border-blue-700 p-8 rounded-xl hover:border-orange-500 transition-all cursor-pointer hover:scale-105 active:scale-95 group sm:col-span-2 md:col-span-1"
            >
              <Globe className="text-orange-500 mb-4 mx-auto group-hover:animate-bounce" size={48} />
              <h3 className="text-white font-bold text-xl mb-3">Matching Engine</h3>
              <p className="text-blue-200 text-sm">Matches your specific profile with the perfect global universities and scholarships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Services Section */}
      <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-blue-900 mb-4">Our Core Services</h2>
          <p className="text-blue-700 font-medium max-w-2xl mx-auto">Real guidance, real opportunities across the globe. We hold your hand from application to your destination.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-l-8 border-blue-600 flex flex-col sm:flex-row gap-6 items-start hover:-translate-y-1 transition-transform">
            <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 shrink-0"><GraduationCap size={32} /></div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Study Abroad & Scholarships</h3>
              <p className="text-blue-800 text-sm sm:text-base leading-relaxed">Get connected to top universities abroad, with guidance on institutions that offer scholarships or education loans to eligible students.</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-l-8 border-orange-500 flex flex-col sm:flex-row gap-6 items-start hover:-translate-y-1 transition-transform">
            <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 shrink-0"><Plane size={32} /></div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Flight Ticket Booking</h3>
              <p className="text-blue-800 text-sm sm:text-base leading-relaxed">We help you find affordable and convenient flight options for students and travelers heading abroad for studies, work, or tours.</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-l-8 border-yellow-400 flex flex-col sm:flex-row gap-6 items-start hover:-translate-y-1 transition-transform">
            <div className="p-4 bg-yellow-100 rounded-2xl text-yellow-600 shrink-0"><Briefcase size={32} /></div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Work Abroad</h3>
              <p className="text-blue-800 text-sm sm:text-base leading-relaxed">Get assistance with finding and applying for job opportunities in trusted countries, with guidance on visa and relocation processes.</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-l-8 border-orange-500 flex flex-col sm:flex-row gap-6 items-start hover:-translate-y-1 transition-transform">
            <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 shrink-0"><Globe size={32} /></div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Paid Internships Abroad</h3>
              <p className="text-blue-800 text-sm sm:text-base leading-relaxed">Access international internship opportunities that offer real-world experience—and a paycheck—across various industries and countries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonials / Success Stories */}
      <section className="py-16 bg-blue-100 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-blue-900 mb-3">Student Success Stories</h2>
            <div className="w-20 h-1.5 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-blue-800 mt-4">Hear directly from students who have made their global dreams a reality.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {TESTIMONIALS.map((video) => (
              <div 
                key={video.id} 
                className="flex-1 min-w-[240px] max-w-[320px] relative rounded-xl overflow-hidden shadow-lg border-2 border-white hover:border-yellow-400 aspect-[3/4] bg-black transition-all"
              >
                <video 
                  src={video.src} 
                  controls 
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-blue-100 py-12 px-4 border-t-8 border-yellow-400">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Begin Your Journey Today</h2>
            <p className="mb-6 text-blue-200">Join thousands of Zambian students succeeding abroad with Danny's Connect.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="email" placeholder="Enter your email address" className="px-4 py-3 rounded-lg text-blue-900 w-full sm:max-w-xs focus:ring-2 focus:ring-orange-500 outline-none font-medium border-none" />
              <button className="bg-orange-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-lg">Subscribe</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
            <div className="flex flex-col gap-3">
              <a href="/about-us" className="hover:text-yellow-400 transition-colors">About Us</a>
              <a href="/scholarships" className="hover:text-yellow-400 transition-colors">Scholarships</a>
              <a href="/gallery" className="hover:text-yellow-400 transition-colors">Gallery</a>
              <a href="/login" className="hover:text-yellow-400 transition-colors text-orange-400">Student Portal</a>
            </div>
            <div className="flex flex-col gap-3">
              <a href="/terms" className="hover:text-yellow-400 transition-colors">Terms & Conditions</a>
              <a href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</a>
              <a href="/help" className="hover:text-yellow-400 transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}