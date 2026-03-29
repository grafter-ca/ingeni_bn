import { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useCartSummary } from "../../hooks/useCartSummary";
import { navLinks } from "../../constants";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCartSummary();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = useCallback(
    (path: string) =>
      location.pathname === path
        ? "text-white"
        : "text-gray-400 hover:text-white",
    [location.pathname]
  );

  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  return (
    <nav className="font-poppins bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl tracking-widest text-white uppercase">
          Ingeni
        </Link>

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
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="text-gray-400 hover:text-white transition-colors relative flex items-center gap-1"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="text-xs -mt-6 w-6 h-6 border border-gray-500 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Hi, {user.name}</span>
              <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <Button label="Register" onClick={() => navigate("/register")} />
            </div>
          )}
        </div>

        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleMenuClose}
              className={`text-sm capitalize tracking-widest transition-colors ${isActive(link.path)}`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/cart" onClick={handleMenuClose} className="text-sm capitalize tracking-widest text-gray-400 hover:text-white">
            Cart {totalItems > 0 && `(${totalItems})`}
          </Link>
          {user ? (
            <button
              onClick={() => { logout(); handleMenuClose(); }}
              className="text-left text-sm capitalize tracking-widest w-28 text-gray-400 hover:text-white"
            >
              Logout
            </button>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link to="/login" onClick={handleMenuClose} className="text-sm capitalize tracking-widest text-gray-400 hover:text-white">
                Login
              </Link>
              <Button label="Register" className="w-28" onClick={() => { navigate("/register"); handleMenuClose(); }} />
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;