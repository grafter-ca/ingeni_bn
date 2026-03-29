import { Link } from "react-router-dom";
import { useState } from "react";
import { Send } from "lucide-react";
import { FiFacebook, FiInstagram, FiTwitter,FiLinkedin } from "react-icons/fi";

const quickLinks = [
  { label: "Home",     path: "/"         },
  { label: "About",    path: "/about"    },
  { label: "Products", path: "/products" },
  { label: "Cart",     path: "/cart"     },
  { label: "Login",    path: "/login"    },
];

const socials = [
  { icon: FiInstagram, href: "#", label: "Instagram" },
  { icon: FiTwitter,   href: "#", label: "Twitter"   },
  { icon: FiFacebook,  href: "#", label: "Facebook"  },
  { icon: FiLinkedin,  href: "#", label: "LinkedIn"  },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };
  return (
    <footer className="font-poppins bg-gray-900 border-t border-gray-800 text-gray-400">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-xl tracking-widest text-white uppercase">Ingeni</h3>
          <p className="text-sm leading-relaxed">
            A curated premium store built for those who expect more from every purchase.
          </p>
          {/* Socials */}
          <div className="flex gap-4 mt-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="hover:text-white transition-colors"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white">
            Quick Links
          </h4>
          <ul className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white">
            Contact Us
          </h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li>📍 Kigali, Rwanda</li>
            <li>
              <a href="mailto:hello@ingeni.com" className="hover:text-white transition-colors">
                hello@ingeni.com
              </a>
            </li>
            <li>
              <a href="tel:+250780000000" className="hover:text-white transition-colors">
                +250 780 000 000
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white">
            Newsletter
          </h4>
          <p className="text-sm leading-relaxed">
            Get exclusive deals and new arrivals straight to your inbox.
          </p>
          <form onSubmit={handleNewsletter} className="flex gap-2 mt-1">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 border w-full md:w-87.5 rounded border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-gray-500 placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="flex rounded -ml-3 items-center justify-center gap-2 bg-white text-gray-900 text-sm uppercase tracking-widest px-4 py-3 hover:bg-gray-200 transition-colors"
            >
              <Send size={14} />
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 px-6 py-5 text-center text-xs uppercase tracking-widest">
        © {new Date().getFullYear()} Ingeni. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;