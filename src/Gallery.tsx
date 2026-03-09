import { useState, useEffect } from 'react';
import { 
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  X,
  ZoomIn,
  Image as ImageIcon
} from 'lucide-react';

// --- Types ---
interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

// --- Mock API Data ---
// In a real application, this would come from your backend database
const mockApiImages: GalleryImage[] = [
  { id: '1', url: '/grads.jpg', title: 'Graduation Day', category: 'Education' },
  { id: '2', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800', title: 'University Campus', category: 'University' },
  { id: '3', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800', title: 'Flight Departures', category: 'Travel' },
  { id: '4', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800', title: 'Paid Internships', category: 'Work' },
  { id: '5', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800', title: 'Student Collaboration', category: 'Education' },
  { id: '6', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800', title: 'Exploring New Cities', category: 'Travel' },
  { id: '7', url: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=800', title: 'Study Abroad Experience', category: 'Education' },
  { id: '8', url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800', title: 'Global Connections', category: 'Work' },
  { id: '9', url: 'https://images.unsplash.com/photo-1569098644584-210bcd375b59?auto=format&fit=crop&q=80&w=800', title: 'Campus Libraries', category: 'University' },
];

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Fetch images from API on component mount
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        // Replace this block with your actual API call
        // const response = await fetch('https://your-api.com/api/gallery');
        // const data = await response.json();
        // setImages(data);
        
        // Simulating network delay for stylish loading state
        setTimeout(() => {
          setImages(mockApiImages);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Failed to fetch images", error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Filter categories dynamically based on fetched data
  const categories = ['All', ...Array.from(new Set(images.map(img => img.category)))];

  const filteredImages = activeFilter === 'All' 
    ? images 
    : images.filter(img => img.category === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      {/* Navigation (Matched to AboutUs) */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Danny's Connect Logo" 
                className="w-60 h-15 object-contain"
              />
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</a>
              <a href="/about-us" className="text-gray-600 hover:text-blue-600 font-medium">About Us</a>
              <a href="/gallery" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Gallery</a>
              <div className="flex items-center space-x-4 ml-4">
                <a href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</a>
                <a href="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition">Sign Up</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pb-24">
        {/* Header */}
        <div className="bg-blue-600 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Our Gallery</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Glimpses of success, travel, and global education from the students we've partnered with around the world.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          
          {/* Filters */}
          {!loading && images.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter === category 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Gallery Grid */}
          {loading ? (
            // Loading Skeletons
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((skeleton) => (
                <div key={skeleton} className="aspect-[4/3] bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              ))}
            </div>
          ) : (
            // Actual Images
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image) => (
                <div 
                  key={image.id} 
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-200"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={image.url} 
                    alt={image.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{image.title}</h3>
                    <div className="flex items-center justify-between mt-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      <span className="text-blue-300 text-sm font-medium uppercase tracking-wider">{image.category}</span>
                      <ZoomIn className="text-white w-6 h-6 opacity-75 hover:opacity-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredImages.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-xl font-medium">No images found for this category.</p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl w-full">
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title} 
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="text-center mt-6">
              <h3 className="text-2xl font-bold text-white mb-1">{selectedImage.title}</h3>
              <p className="text-blue-400 font-medium">{selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer (Matched to AboutUs) */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-xl font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">For Students</a></li>
                <li><a href="#" className="hover:text-white transition">For Universities</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Help</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Socials</h4>
              <p className="text-gray-400 mb-4">Follow us and get in touch with us on the following Social Media Platform</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Subscribe</h4>
              <p className="text-gray-400 mb-4 text-sm">Join our team by subscribing to our newsletter so you get updates every time we have new opportunities.</p>
              <form className="flex flex-col space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Danny's Connect. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>for Global Education</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}