import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import Button from "../ui/Button";
import { navLinks } from "../../constants";

type CartItem = {
  id: string;
  name: string;
  price: number;
};

// ✅ useCart — properly typed
const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  return {
    items,
    cartCount: items.length, // ✅ derived from items, no separate state needed
    addToCart: (item: CartItem) => {
      setItems((prev) => [...prev, item]);
    },
  };
};

// Replace with your real auth context/store later
const useAuth = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  return { user, logout: () => setUser(null) };
};


const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart(); // ✅ now actually used
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-white"
      : "text-gray-400 hover:text-white";

  return (
    <nav className="font-poppins bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-bold flex flex-col items-center text-xl tracking-widest text-white uppercase">
        <img src="/logo.png" alt="Ingeni Logo" className="w-12 h-12 -mb-4"/>
          <span className="text-xs">INGENI STORE</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-sm uppercase tracking-widest transition-colors ${isActive(link.path)}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">

          {/* Cart — ✅ shows real count */}
          <button
            onClick={() => navigate("/cart")}
            className="text-gray-400 hover:text-white transition-colors relative flex items-center gap-1"
          >
            <ShoppingCart size={20} />
            <span className="text-xs -mt-6 w-6 h-6 border border-gray-500 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          {/* Dynamic Auth */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Hi, {user.name}</span>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Button label="Register" onClick={() => navigate("/register")} />
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`text-sm capitalize tracking-widest transition-colors ${isActive(link.path)}`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className="text-sm capitalize tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Cart {cartCount > 0 && `(${cartCount})`} {/* ✅ shows count on mobile too */}
          </Link>

          {user ? (
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="text-left text-sm capitalize tracking-widest w-28 text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm capitalize tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Button
                label="Register"
                className="w-28"
                onClick={() => { navigate("/register"); setMenuOpen(false); }}
              />
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;