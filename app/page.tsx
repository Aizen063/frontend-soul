import Link from 'next/link';
import { Music, Users, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cyber-black selection:bg-neon-pink selection:text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-1/4 w-72 h-72 md:w-96 md:h-96 bg-neon-purple/20 rounded-full blur-[90px] md:blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/2 translate-x-1/2 md:translate-x-0 md:right-1/4 w-72 h-72 md:w-96 md:h-96 bg-neon-blue/20 rounded-full blur-[90px] md:blur-[100px] animate-pulse delay-700"></div>

        <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue drop-shadow-[0_0_10px_rgba(157,78,221,0.5)]">
              SOUL
            </span>
            <span className="text-white ml-1.5 sm:ml-2">SOUND</span>
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Link
              href="/login"
              className="px-2 sm:px-4 md:px-6 py-2 text-sm sm:text-base text-slate-300 hover:text-white transition-colors font-medium hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-lg sm:rounded-xl font-semibold shadow-[0_0_15px_rgba(157,78,221,0.4)] hover:shadow-[0_0_25px_rgba(157,78,221,0.6)] hover:scale-105 transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28 lg:py-32 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 sm:mb-8 tracking-tight leading-tight">
            Music for Your
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue drop-shadow-[0_0_20px_rgba(157,78,221,0.3)] animate-gradient-x">
              Soul
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            dive into a <span className="text-neon-cyan">sonic universe</span>. Stream in high fidelity, curate your vibe, and experience music like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 justify-center items-center w-full max-w-xl mx-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-black text-base sm:text-lg font-bold rounded-full hover:bg-neon-green hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,245,160,0.5)]"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 glass text-white text-base sm:text-lg font-semibold rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Explore Library
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28 lg:py-32">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-10 sm:mb-14 md:mb-20 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
          Why Choose <span className="text-neon-purple">Soul Sound?</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          <div className="glass p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl group hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-neon-purple/30">
            <div className="w-16 h-16 bg-neon-purple/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-neon-purple/20 transition-colors shadow-[0_0_15px_rgba(157,78,221,0.1)]">
              <Music className="text-neon-purple group-hover:drop-shadow-[0_0_10px_rgba(157,78,221,0.8)] transition-all" size={32} />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Endless Music</h4>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Access a vast library of songs across all genres. From retro classics to future hits.
            </p>
          </div>

          <div className="glass p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl group hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-neon-blue/30">
            <div className="w-16 h-16 bg-neon-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-neon-blue/20 transition-colors shadow-[0_0_15px_rgba(0,191,255,0.1)]">
              <Users className="text-neon-blue group-hover:drop-shadow-[0_0_10px_rgba(0,191,255,0.8)] transition-all" size={32} />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Discover Artists</h4>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Follow your favorite artists and discover new sounds tailored to your cyber-psyche.
            </p>
          </div>

          <div className="glass p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl group hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-neon-pink/30 sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 bg-neon-pink/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-neon-pink/20 transition-colors shadow-[0_0_15px_rgba(255,46,99,0.1)]">
              <Sparkles className="text-neon-pink group-hover:drop-shadow-[0_0_10px_rgba(255,46,99,0.8)] transition-all" size={32} />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Personalized</h4>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              AI-driven recommendations that adapt to your mood and listening history in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28 lg:py-32 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 blur-[100px] -z-10"></div>
        <h3 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 sm:mb-8 tracking-tight leading-tight">
          Ready to Start Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">
            Musical Journey?
          </span>
        </h3>
        <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-10 md:mb-12">
          Join the future of music streaming today.
        </p>
        <Link
          href="/register"
          className="inline-block w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-5 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-base sm:text-xl font-bold rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(157,78,221,0.5)] hover:shadow-[0_0_50px_rgba(157,78,221,0.7)]"
        >
          Sign Up Now
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 sm:py-10 md:py-12 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center text-slate-500 text-sm sm:text-base">
          <p className="hover:text-neon-purple transition-colors cursor-default">&copy; 2026 Soul Sound. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
