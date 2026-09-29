import type { Metadata } from 'next';
import './not-found.css';
import { NOT_FOUND_METADATA } from '@/lib/notFoundMetadata';

// Port of 404.html.
export const metadata: Metadata = NOT_FOUND_METADATA;

export default function NotFound() {
  return (
    <div
      data-theme="notfound"
      data-page="404"
      className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden"
    >
      {/* Abstract Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>

      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
        {/* 404 Animated Typography */}
        <div className="relative mb-4">
          <h1 className="text-[120px] md:text-[160px] font-black leading-none gradient-text tracking-tighter select-none">
            404
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-dark text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
            Oops! Error
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-4 mt-6">Page Not Found</h2>
        <p className="text-gray-500 mb-10 text-base md:text-lg leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily
          unavailable.
        </p>

        {/* Interactive Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <a
            href="/"
            className="bg-gradient-to-r from-secondary to-primary hover:opacity-95 text-white font-bold py-3.5 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base flex items-center justify-center space-x-2"
          >
            <i className="fa-solid fa-house"></i> <span>Back to Home</span>
          </a>
          <a
            href="/cancer-medicines"
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3.5 px-8 rounded-full transition-all duration-300 custom-glow hover:-translate-y-0.5 text-base flex items-center justify-center space-x-2"
          >
            <i className="fa-solid fa-magnifying-glass text-primary"></i> <span>Search Medicines</span>
          </a>
        </div>
      </div>
    </div>
  );
}
