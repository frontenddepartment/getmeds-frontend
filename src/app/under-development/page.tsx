import type { Metadata } from 'next';

// under-development.html: a static page with the site's navbar and footer.
// The original <body> carried "bg-gray-50 text-gray-800 antialiased flex
// flex-col min-h-screen"; the root layout owns <body>, so the page ground and
// text colour are set on this wrapper instead.
export const metadata: Metadata = {
  title: { absolute: 'Under Development - Getmeds' },
  description: 'This page is currently under development. Please check back soon.',
  robots: { index: false, follow: true },
};

export default function UnderDevelopmentPage() {
  return (
    <div className="bg-gray-50 text-gray-800 antialiased flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16 relative overflow-hidden">
        {/* v3's bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] is
            bg-radial-[circle_at_center] in Tailwind v4. */}
        <div className="absolute inset-0 z-0 bg-blue-100 opacity-20 bg-radial-[circle_at_center] from-blue-200 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center">
          <img
            src="/assets/under_dev.png"
            alt="Under Development Illustration"
            className="w-full max-w-[500px] mb-8 drop-shadow-lg rounded-3xl object-cover mix-blend-multiply"
          />
          <div className="bg-white px-8 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-primary mb-6 flex items-center uppercase tracking-widest">
            <i className="fa-solid fa-person-digging mr-2 text-lg"></i> Construction in Progress
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-4 tracking-tight leading-tight">
            Page
            Under<br />Development
          </h1>
          <p className="text-gray-500 mb-10 max-w-lg text-lg">
            We&apos;re currently working hard to build this section of
            Getmeds. It will be available very soon, check back later!
          </p>
          <a
            href="/"
            className="bg-primary hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-full transition duration-300 shadow-xl shadow-blue-500/30 text-lg flex items-center space-x-2"
          >
            <i className="fa-solid fa-arrow-left"></i> <span>Go Back Home</span>
          </a>
        </div>
      </main>
    </div>
  );
}
