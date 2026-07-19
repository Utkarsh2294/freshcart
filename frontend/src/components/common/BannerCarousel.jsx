import { useState, useEffect } from 'react';

export default function BannerCarousel({ banners = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative w-full h-40 md:h-64 rounded-2xl overflow-hidden group">
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
            <div className="p-6 md:p-10 text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
              <p className="text-sm md:text-lg opacity-90">{banner.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
      
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'w-6 bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
