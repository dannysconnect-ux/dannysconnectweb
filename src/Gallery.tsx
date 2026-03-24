import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { 
  X, ZoomIn, Image as ImageIcon 
} from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  useEffect(() => {
    // Live query to Firestore
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedImages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryImage[];
      
      setImages(fetchedImages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['All', ...Array.from(new Set(images.map(img => img.category)))];

  const filteredImages = activeFilter === 'All' 
    ? images 
    : images.filter(img => img.category === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="Danny's Connect" className="w-20 h-auto" />
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</a>
              <a href="/about-us" className="text-gray-600 hover:text-blue-600 font-medium">About Us</a>
              <a href="/gallery" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Gallery</a>
              <a href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium">Login</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pb-24">
        <div className="bg-blue-600 text-white py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Our Gallery</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto px-4">
            Glimpses of success and global education journeys.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {/* Filters */}
          {!loading && (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
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

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              ))
            ) : filteredImages.length > 0 ? (
              filteredImages.map((image) => (
                <div 
                  key={image.id} 
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-200"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={image.url} 
                    alt={image.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-xl">{image.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">{image.category}</span>
                      <ZoomIn className="text-white w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-xl">No images found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white"><X size={32}/></button>
          <div className="max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            <div className="text-center mt-6">
              <h3 className="text-2xl font-bold text-white mb-1">{selectedImage.title}</h3>
              <p className="text-blue-400 font-medium">{selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer (Simplified) */}
      <footer className="bg-gray-900 text-white py-12 text-center">
         <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Danny's Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}