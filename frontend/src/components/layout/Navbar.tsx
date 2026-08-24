import { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut, Store, Home, Package, Store as ShopIcon, User } from "lucide-react";
import Button from "../ui/Button";
import { useCartSummary } from "../../hooks/useCartSummary";
import { navLinks } from "../../constants";
import { useCartActions } from "../../hooks/useCartActions";
import { useAuthActions, useAuthState } from "../../context/AuthContext";
import VendorRequestModal from "../common/VendorRequestModal";
import { motion } from "framer-motion";

const Navbar = () => {
  const { user } = useAuthState();
  const { logout } = useAuthActions();

  const { totalItems } = useCartSummary();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleClearCart } = useCartActions();

  const isActive = useCallback(
    (path: string) =>
      location.pathname === path
        ? "text-blue-500 font-bold"
        : "text-gray-400 hover:text-white",
    [location.pathname]
  );

  const handleLogout = useCallback(() => {
    logout();
    handleClearCart();
    setMenuOpen(false);
  }, [logout, handleClearCart]);

  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* Top Navbar */}
      <header className="font-poppins bg-[#050505] border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-widest text-white uppercase font-mono">
            Ingeni
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`text-xs uppercase tracking-widest transition-colors font-mono ${isActive(link.path)}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-blue-500/20 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 text-xs font-mono uppercase tracking-wider transition cursor-pointer"
            >
              <Store size={14} />
              <span>Sell with Us</span>
            </button>
          </ul>

          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={() => navigate("/cart")}
              className="text-gray-400 hover:text-white transition-colors relative flex items-center gap-1 cursor-pointer"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-mono font-bold shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs font-mono">Hi, {user.name}</span>
                <button 
                  onClick={handleLogout} 
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg bg-white/5 border border-white/5"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors font-mono">
                  Login
                </Link>
                <Button label="Register" onClick={() => navigate("/register")} className="cursor-pointer" />
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors cursor-pointer p-2"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Slide-down Drawer for Extended Options */}
        {menuOpen && (
          <div className="md:hidden bg-[#0b0b0b] border-t border-white/5 px-6 py-6 flex flex-col gap-4 shadow-2xl">
            <button
              onClick={() => { setIsVendorModalOpen(true); handleMenuClose(); }}
              className="flex items-center gap-2 py-2 text-xs font-mono uppercase tracking-wider text-blue-400 text-left cursor-pointer"
            >
              <Store size={16} />
              <span>Sell with Us (Vendor Request)</span>
            </button>

            {user ? (
              <button
                onClick={() => { handleLogout(); handleMenuClose(); }}
                className="text-left text-xs uppercase tracking-widest text-rose-400 hover:text-rose-300 font-mono pt-3 border-t border-white/5 cursor-pointer flex items-center gap-2"
              >
                <LogOut size={16} />
                <span>Logout System</span>
              </button>
            ) : (
              <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
                <Link to="/login" onClick={handleMenuClose} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white font-mono">
                  Login Matrix
                </Link>
                <Button label="Register Node" className="w-full justify-center" onClick={() => { navigate("/register"); handleMenuClose(); }} />
              </div>
            )}
          </div>
        )}
      </header>

      {/* --- ICYUZI-STYLE FLOATING BOTTOM NAVIGATION BAR --- */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0e]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl pb-safe">
        
        {/* Home Tab */}
        <Link
          to="/"
          className="relative flex flex-col items-center justify-center w-16 py-1 cursor-pointer group"
        >
          {location.pathname === "/" ? (
            <motion.div 
              layoutId="icyuziActiveNav"
              className="absolute -top-6 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-[#0c0c0e]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Home size={20} />
            </motion.div>
          ) : (
            <div className="text-gray-400 hover:text-white transition-colors py-1">
              <Home size={20} />
            </div>
          )}
          <span className={`text-[10px] uppercase font-mono tracking-tight mt-5 ${location.pathname === "/" ? "text-blue-500 font-black" : "text-gray-500"}`}>
            Home
          </span>
        </Link>

        {/* Products Tab */}
        <Link
          to="/products"
          className="relative flex flex-col items-center justify-center w-16 py-1 cursor-pointer group"
        >
          {location.pathname.startsWith("/products") ? (
            <motion.div 
              layoutId="icyuziActiveNav"
              className="absolute -top-6 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-[#0c0c0e]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Package size={20} />
            </motion.div>
          ) : (
            <div className="text-gray-400 hover:text-white transition-colors py-1">
              <Package size={20} />
            </div>
          )}
          <span className={`text-[10px] uppercase font-mono tracking-tight mt-5 ${location.pathname.startsWith("/products") ? "text-blue-500 font-black" : "text-gray-500"}`}>
            Products
          </span>
        </Link>

        {/* Shops Tab */}
        <Link
          to="/shops"
          className="relative flex flex-col items-center justify-center w-16 py-1 cursor-pointer group"
        >
          {location.pathname.startsWith("/shops") ? (
            <motion.div 
              layoutId="icyuziActiveNav"
              className="absolute -top-6 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-[#0c0c0e]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <ShopIcon size={20} />
            </motion.div>
          ) : (
            <div className="text-gray-400 hover:text-white transition-colors py-1">
              <ShopIcon size={20} />
            </div>
          )}
          <span className={`text-[10px] uppercase font-mono tracking-tight mt-5 ${location.pathname.startsWith("/shops") ? "text-blue-500 font-black" : "text-gray-500"}`}>
            Shops
          </span>
        </Link>

        {/* Cart Tab */}
        <Link
          to="/cart"
          className="relative flex flex-col items-center justify-center w-16 py-1 cursor-pointer group"
        >
          {location.pathname === "/cart" ? (
            <motion.div 
              layoutId="icyuziActiveNav"
              className="absolute -top-6 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-[#0c0c0e]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </motion.div>
          ) : (
            <div className="relative text-gray-400 hover:text-white transition-colors py-1">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 text-[9px] w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </div>
          )}
          <span className={`text-[10px] uppercase font-mono tracking-tight mt-5 ${location.pathname === "/cart" ? "text-blue-500 font-black" : "text-gray-500"}`}>
            Cart
          </span>
        </Link>

        {/* Profile / Account Tab */}
        <Link
          to={user ? "/profile" : "/login"}
          className="relative flex flex-col items-center justify-center w-16 py-1 cursor-pointer group"
        >
          {location.pathname === "/profile" || location.pathname === "/login" ? (
            <motion.div 
              layoutId="icyuziActiveNav"
              className="absolute -top-6 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-[#0c0c0e]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <User size={20} />
            </motion.div>
          ) : (
            <div className="text-gray-400 hover:text-white transition-colors py-1">
              <User size={20} />
            </div>
          )}
          <span className={`text-[10px] uppercase font-mono tracking-tight mt-5 ${location.pathname === "/profile" || location.pathname === "/login" ? "text-blue-500 font-black" : "text-gray-500"}`}>
            Profile
          </span>
        </Link>

      </nav>

      {/* Render the Vendor Request Modal */}
      <VendorRequestModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
      />
    </>
  );
};

export default Navbar;