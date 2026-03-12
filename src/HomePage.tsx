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
  ChevronLeft,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

// --- Mock Data for Carousel and Testimonials ---
const CAROUSEL_IMAGES = [
  "/grads.jpg", // Graduation
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000", // University Campus
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000", // Travel/Flight
];

const TESTIMONIALS = [
  { id: 1, duration: "0:00 / 0:32", thumbnail: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600" },
  { id: 2, duration: "0:00 / 1:20", thumbnail: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600" },
  { id: 3, duration: "0:00 / 1:40", thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600" },
  { id: 4, duration: "0:00 / 2:04", thumbnail: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=600" },
  { id: 5, duration: "0:00 / 1:36", thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600" },
];

export default function Homepage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000); // Changes every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans text-blue-900 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="bg-white text-blue-900 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-2">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/logo.png" 
                alt="Danny's Connect Logo" 
                className="w-36 sm:w-48 md:w-60 h-auto object-contain"
              />
            </div>
          <div className="hidden lg:flex gap-6 font-semibold">
            <a href="/" className="hover:text-yellow-400 transition-colors">Home</a>
            <a href="/about-us" className="hover:text-yellow-400 transition-colors">About Us</a>
            <a href="/gallery" className="hover:text-yellow-400 transition-colors">Gallery</a>
          </div>
          <div className="flex gap-2 sm:gap-4 ml-auto lg:ml-0">
            <button 
              onClick={() => navigate('/login')} 
              className="px-3 py-2 md:px-4 text-sm md:text-base text-blue-900 bg-yellow-400 hover:bg-yellow-500 rounded font-bold transition-colors whitespace-nowrap"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="px-3 py-2 md:px-4 text-sm md:text-base bg-orange-500 hover:bg-orange-600 rounded font-bold transition-colors text-white whitespace-nowrap"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Carousel Section */}
      <header className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        {/* Background Images */}
        {CAROUSEL_IMAGES.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-blue-900/60 z-10"></div> {/* Dark Overlay */}
            <img 
              src={img} 
              alt={`Slide ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Carousel Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 md:px-8 mt-8 md:mt-0">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 leading-tight text-white max-w-4xl drop-shadow-lg">
            Paid Internship <br className="hidden sm:block"/>
            <span className="text-yellow-400 sm:mt-2 block text-2xl sm:text-3xl md:text-5xl">We Help You Land the Internship, You Build the Future.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 md:mb-8 font-medium max-w-2xl drop-shadow-md px-2">
            Connecting Zambian students to top universities globally. Seamless study abroad, flight booking, and internship journeys.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-base md:text-lg shadow-lg transition-all transform hover:-translate-y-1"
            >
              Get Started
            </button>
            <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/50 rounded-lg font-bold text-base md:text-lg shadow-lg transition-all transform hover:-translate-y-1">
              Watch Our Process
            </button>
          </div>
        </div>

        {/* Carousel Controls (Hidden on very small screens for cleaner UI) */}
        <button 
          onClick={prevSlide}
          className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition backdrop-blur-sm"
        >
          <ChevronLeft size={28} md={36} />
        </button>
        <button 
          onClick={nextSlide}
          className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition backdrop-blur-sm"
        >
          <ChevronRight size={28} md={36} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {CAROUSEL_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 md:h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-orange-500 w-6 md:w-8' : 'bg-white/50 hover:bg-white w-2 md:w-3'}`}
            />
          ))}
        </div>
      </header>

      {/* AI Features Section */}
      <section className="bg-blue-900 py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-400" size={24} /> 
              Supercharged by AI
              <Sparkles className="text-yellow-400" size={24} />
            </h2>
            <p className="text-sm md:text-base text-blue-200 max-w-2xl mx-auto">Experience a faster, smarter, and highly personalized application process with our new integrated AI features.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-blue-800 border border-blue-700 p-6 md:p-8 rounded-xl hover:border-orange-500 transition-all duration-300">
              <div className="bg-orange-500 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 md:mb-6">
                <Bot className="text-white" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Consultation Bot</h3>
              <p className="text-sm md:text-base text-blue-200">24/7 personalized guidance. Answers FAQs, explains the application process, and recommends paths based on your academic goals.</p>
            </div>
            
            <div className="bg-blue-800 border border-blue-700 p-6 md:p-8 rounded-xl hover:border-yellow-400 transition-all duration-300">
              <div className="bg-yellow-400 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 md:mb-6">
                <FileCheck className="text-blue-900" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Automated Processing</h3>
              <p className="text-sm md:text-base text-blue-200">Smart tools automatically scan, verify, and organize your documents, minimizing human error and accelerating submissions.</p>
            </div>

            <div className="bg-blue-800 border border-blue-700 p-6 md:p-8 rounded-xl hover:border-orange-500 transition-all duration-300 sm:col-span-2 md:col-span-1">
              <div className="bg-orange-500 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 md:mb-6">
                <Globe className="text-white" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Matching Engine</h3>
              <p className="text-sm md:text-base text-blue-200">Our AI analyzes your unique profile to automatically match you with the perfect scholarships and paid international internships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Services Section */}
      <section className="py-12 md:py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2 md:mb-4">Our Core Services</h2>
          <p className="text-sm md:text-base text-blue-700 font-medium">Real guidance, real opportunities across the globe.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border-l-4 border-yellow-400 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 self-start">
              <GraduationCap size={28} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Study Abroad & Scholarships</h3>
              <p className="text-sm md:text-base text-blue-800">Get connected to top universities abroad, with guidance on institutions that offer scholarships or education loans to eligible students.</p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border-l-4 border-orange-500 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600 self-start">
              <Plane size={28} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Flight Ticket Booking</h3>
              <p className="text-sm md:text-base text-blue-800">We help you find affordable and convenient flight options for students and travelers heading abroad for studies, work, or tours.</p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border-l-4 border-blue-600 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 self-start">
              <Briefcase size={28} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Work Abroad</h3>
              <p className="text-sm md:text-base text-blue-800">Get assistance with finding and applying for job opportunities in trusted countries, with guidance on visa and relocation processes.</p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border-l-4 border-yellow-400 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 self-start">
              <Globe size={28} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Paid Internships Abroad</h3>
              <p className="text-sm md:text-base text-blue-800">Access international internship opportunities that offer real-world experience—and a paycheck—across various industries and countries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Video Proof Section */}
      <section className="py-12 md:py-16 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2 md:mb-4 px-4">We Don't Just Talk, We Deliver</h2>
            <div className="w-16 md:w-24 h-1 bg-orange-500 mx-auto rounded"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {TESTIMONIALS.map((video) => (
              <div key={video.id} className="group relative rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all aspect-[3/4]">
                {/* Thumbnail Image */}
                <img 
                  src={video.thumbnail} 
                  alt={`Student Testimonial ${video.id}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Play Button Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                  <PlayCircle size={48} className="text-white drop-shadow-md" />
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Footer */}
      <footer className="bg-blue-950 text-blue-200 py-10 md:py-12 px-4 border-t-8 border-orange-500">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-3 md:mb-4">Dreaming of studying abroad?</h2>
            <p className="mb-6 text-sm md:text-base">Danny's Connect links Zambian students to universities across India, Europe, China, and more.</p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <input 
                type="email" 
                placeholder="example@gmail.com" 
                className="px-4 py-3 rounded text-blue-900 w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded transition-colors w-full sm:w-auto">
                Subscribe
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm md:text-base font-medium pt-6 md:pt-0 border-t md:border-t-0 border-blue-800">
            <div className="flex flex-col gap-3">
              <a href="/about-us" className="hover:text-yellow-400 transition-colors">About Us</a>
              <a href="/for-students" className="hover:text-yellow-400 transition-colors">For Students</a>
              <a href="/for-universities" className="hover:text-yellow-400 transition-colors">For Universities</a>
              <a href="/blog" className="hover:text-yellow-400 transition-colors">Blog</a>
            </div>
            <div className="flex flex-col gap-3">
              <a href="/privacy-policy" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-orange-400 transition-colors">Terms</a>
              <a href="/conditions" className="hover:text-orange-400 transition-colors">Conditions</a>
              <a href="/help" className="hover:text-orange-400 transition-colors">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}