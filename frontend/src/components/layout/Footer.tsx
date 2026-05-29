import { Link } from "react-router-dom";
import { useState } from "react";
import { Send, MapPin, Mail, Phone } from "lucide-react";
import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from "react-icons/fi";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <footer className="bg-[#050505] border-t border-white/10 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Section */}
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Ingenistore</h3>
            <p className="text-sm leading-relaxed max-w-xs">
              A curated premium marketplace for those who expect quality and precision in every purchase.
            </p>
            <div className="flex gap-4">
              {[FiInstagram, FiTwitter, FiFacebook, FiLinkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Platform</h4>
            <ul className="flex flex-col gap-3">
              {["Home", "About", "Products", "Cart", "Login"].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`} className="text-sm hover:text-blue-500 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Contact</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2"><MapPin size={16} className="text-blue-500" /> Kigali, Rwanda</li>
              <li><a href="mailto:hello@ingenistore.com" className="flex items-center gap-2 hover:text-blue-500"><Mail size={16} className="text-blue-500" /> hello@ingenistore.com</a></li>
              <li><a href="tel:+250786015225" className="flex items-center gap-2 hover:text-blue-500"><Phone size={16} className="text-blue-500" /> +250 786 015 225</a></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Newsletter</h4>
            <p className="text-sm">Get exclusive deals and new arrivals.</p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 rounded-xl transition-all">
                <Send size={14} /> Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 py-6 text-[10px] uppercase tracking-widest text-center flex flex-col md:flex-row justify-between gap-4">
          <span>© {new Date().getFullYear()} Ingenistore. All rights reserved.</span>
          <div className="flex gap-6 justify-center">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;