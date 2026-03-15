import Link from 'next/link';
import { Music, Users, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cyber-black selection:bg-neon-pink selection:text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue drop-shadow-[0_0_10px_rgba(157,78,221,0.5)]">
              SOUL
            </span>
            <span className="text-white ml-2">SOUND</span>
          </h1>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="px-6 py-2 text-slate-300 hover:text-white transition-colors font-medium hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl font-semibold shadow-[0_0_15px_rgba(157,78,221,0.4)] hover:shadow-[0_0_25px_rgba(157,78,221,0.6)] hover:scale-105 transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-32 text-center">
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight">
            Music for Your
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue drop-shadow-[0_0_20px_rgba(157,78,221,0.3)] animate-gradient-x">
              Soul
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            dive into a <span className="text-neon-cyan">sonic universe</span>. Stream in high fidelity, curate your vibe, and experience music like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/register"
              className="px-10 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-neon-green hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,245,160,0.5)]"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 glass text-white text-lg font-semibold rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Explore Library
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-8 py-32">
        <h3 className="text-4xl md:text-5xl font-bold text-white text-center mb-20 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
          Why Choose <span className="text-neon-purple">Soul Sound?</span>
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-3xl group hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-neon-purple/30">
            <div className="w-16 h-16 bg-neon-purple/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-neon-purple/20 transition-colors shadow-[0_0_15px_rgba(157,78,221,0.1)]">
              <Music className="text-neon-purple group-hover:drop-shadow-[0_0_10px_rgba(157,78,221,0.8)] transition-all" size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-4">Endless Music</h4>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Access a vast library of songs across all genres. From retro classics to future hits.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl group hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-neon-blue/30">
            <div className="w-16 h-16 bg-neon-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-neon-blue/20 transition-colors shadow-[0_0_15px_rgba(0,191,255,0.1)]">
              <Users className="text-neon-blue group-hover:drop-shadow-[0_0_10px_rgba(0,191,255,0.8)] transition-all" size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-4">Discover Artists</h4>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Follow your favorite artists and discover new sounds tailored to your cyber-psyche.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl group hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-neon-pink/30">
            <div className="w-16 h-16 bg-neon-pink/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-neon-pink/20 transition-colors shadow-[0_0_15px_rgba(255,46,99,0.1)]">
              <Sparkles className="text-neon-pink group-hover:drop-shadow-[0_0_10px_rgba(255,46,99,0.8)] transition-all" size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-4">Personalized</h4>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              AI-driven recommendations that adapt to your mood and listening history in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-8 py-32 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 blur-[100px] -z-10"></div>
        <h3 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">
          Ready to Start Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">
            Musical Journey?
          </span>
        </h3>
        <p className="text-xl text-slate-300 mb-12">
          Join the future of music streaming today.
        </p>
        <Link
          href="/register"
          className="inline-block px-12 py-5 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-xl font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(157,78,221,0.5)] hover:shadow-[0_0_50px_rgba(157,78,221,0.7)]"
        >
          Sign Up Now
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-8 text-center text-slate-500">
          <p className="hover:text-neon-purple transition-colors cursor-default">&copy; 2026 Soul Sound. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
