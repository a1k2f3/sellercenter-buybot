import React from "react";

export default function HomePagePreview() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 overflow-hidden px-4">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-purple-400/30 blur-3xl rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400/30 blur-3xl rounded-full -z-10" />

      {/* Heading */}
      <h1 className="text-[60px] md:text-[100px] font-extrabold font-sans text-gray-900 drop-shadow-xl tracking-tight animate-fadeInUp">
        Welcome to the Home Page
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-lg md:text-2xl text-gray-700 max-w-xl leading-relaxed animate-fadeIn delay-150">
        This is the main landing page of the application.
      </p>

      {/* Buttons */}
      <div className="flex gap-6 mt-10 flex-col sm:flex-row animate-fadeIn delay-300">
        <a
          href="/auth/login"
          className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          Go to Login
        </a>

        <a
          href="#"
          className="px-8 py-4 rounded-2xl border border-gray-500 text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-700 hover:scale-105 transition-all duration-300"
        >
          Explore More
        </a>
      </div>
    </div>
  );
}
