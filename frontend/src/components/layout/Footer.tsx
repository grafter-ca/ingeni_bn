import { Link } from "react-router-dom";
import { useState } from "react";
import { Send, MapPin, Mail, Phone, Sparkles } from "lucide-react";
import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from "react-icons/fi";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <footer className="bg-white dark:bg-[#050505] border-t border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-gray-400 relative overflow-hidden mb-18 md:mb-0 transition-colors">

      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand Section */}
          <div className="flex flex-col gap-6">
            {/* Logo & Brand Image */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10">
                <img 
                  src="/ingeni-logo-2.png" 
                  alt="Ingeni Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold font-serif text-xl -mb-2 tracking-widest text-zinc-900 dark:text-white uppercase font-mono">
                Ingeni Store
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs font-light text-zinc-500 dark:text-gray-400">
              A curated premium marketplace for those who expect quality and precision in every purchase.
            </p>
            <div className="flex gap-3">
              {[FiInstagram, FiTwitter, FiFacebook, FiLinkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="p-2.5 bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all text-zinc-600 dark:text-gray-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white font-poppins flex items-center gap-2">
              <Sparkles size={12} className="text-blue-600 dark:text-blue-400" /> Platform
            </h4>
            <ul className="flex flex-col gap-3">
              {["Home", "About", "Products", "Cart", "Login"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                    className="text-sm font-light hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white font-poppins flex items-center gap-2">
              <MapPin size={12} className="text-blue-600 dark:text-blue-400" /> Contact
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm font-light">
              <li className="flex items-center gap-2.5">
                <div className="p-1.5 bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-blue-600 dark:text-blue-400">
                  <MapPin size={14} />
                </div>
                <span>Kigali, Rwanda</span>
              </li>
              <li>
                <a href="mailto:hello@ingenistore.com" className="flex items-center gap-2.5 hover:text-zinc-900 dark:hover:text-white transition-colors group">
                  <div className="p-1.5 bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-blue-600 dark:text-blue-400 group-hover:border-blue-500/40 transition-colors">
                    <Mail size={14} />
                  </div>
                  <span>hello@ingenistore.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+250786015225" className="flex items-center gap-2.5 hover:text-zinc-900 dark:hover:text-white transition-colors group">
                  <div className="p-1.5 bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-blue-600 dark:text-blue-400 group-hover:border-blue-500/40 transition-colors">
                    <Phone size={14} />
                  </div>
                  <span>+250 786 015 225</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white font-poppins">Newsletter</h4>
            <p className="text-sm font-light">Get exclusive deals and new arrivals.</p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-2.5">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer">
                <Send size={13} /> Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#030303] relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-6 text-[10px] uppercase tracking-widest text-center flex flex-col md:flex-row justify-between gap-4 font-mono text-zinc-500 dark:text-gray-500">
          <span>&copy; {new Date().getFullYear()} Ingenistore. All rights reserved.</span>
          <div className="flex gap-6 justify-center">
            <Link to="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;