import { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut, Store, Home, Package, User, Heart } from "lucide-react";
import { useCartSummary } from "../../hooks/useCartSummary";
import { useCartActions } from "../../hooks/useCartActions";
import { useAuthActions, useAuthState } from "../../context/AuthContext";
import VendorRequestModal from "../common/VendorRequestModal";
import { UserProfile } from "../common/UserProfile";
import GlobalSearch from "../common/GlobalSearch";
import { motion } from "framer-motion";
import ThemeToggle from "../common/ThemeToggle";

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
        ? "text-blue-600 dark:text-blue-500 font-bold"
        : "text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white",
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
      <header className="font-poppins bg-white/90 dark:bg-[#050505]/95 border-b border-zinc-200 dark:border-white/5 sticky top-0 z-50 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Image */}
          <Link to="/" className="flex items-center justify-center gap-1.5 shrink-0 group">
            <div className="w-10 h-10">
              <img 
                src="/ingeni-logo-2.png" 
                alt="Ingeni Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold font-serif text-xl -mb-2 tracking-widest text-zinc-900 dark:text-white uppercase font-mono">
              Ingeni
            </span>
          </Link>

          {/* Global Search Bar (Center / Flexible) */}
          <div className="hidden md:block flex-1 max-w-sm mx-2">
            <GlobalSearch />
          </div>

          {/* Desktop Actions & User Profile */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <ul className="hidden md:flex items-center gap-3">
              <li>
                <Link
                  to="/"
                  className={`text-xs uppercase tracking-widest transition-colors font-mono ${isActive("/")}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className={`text-xs uppercase tracking-widest transition-colors font-mono ${isActive("/products")}`}
                >
                  Products
                </Link>
              </li>
              {/* Visible only if user is logged in */}
              {user && (
                <li>
                  <Link
                    to="/wishlist"
                    className={`text-xs uppercase tracking-widest transition-colors font-mono ${isActive("/wishlist")}`}
                  >
                    Wishlist
                  </Link>
                </li>
              )}
            </ul>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-xs font-mono uppercase tracking-wider transition cursor-pointer"
            >
              <Store size={14} />
              <span>Sell with Us</span>
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors relative flex items-center gap-1 cursor-pointer p-2"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 text-[10px] w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-mono font-bold shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <UserProfile user={user} onLogout={handleLogout} />
            ) : (
              <Link 
                to="/login" 
                className="border border-green-500/20 bg-green-50 dark:bg-green-600/10 text-zinc-800 dark:text-gray-100 hover:bg-green-100 dark:hover:bg-green-600/20 text-xs font-mono uppercase tracking-wider transition cursor-pointer px-3.5 py-1.5 rounded-lg"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer p-2"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Slide-down Drawer for Extended Options & Search */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0b0b0b] border-t border-zinc-200 dark:border-white/5 px-6 py-6 flex flex-col gap-5 shadow-2xl transition-colors">
            {/* Mobile Search Bar */}
            <div className="w-full">
              <GlobalSearch />
            </div>

            {user && (
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase overflow-hidden">
                  {user.image ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white">{user.name}</p>
                  <p className="text-[10px] font-mono text-zinc-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
            )}

            <ul className="flex flex-col gap-3 pb-3 border-b border-zinc-200 dark:border-white/5">
              <li>
                <Link
                  to="/"
                  onClick={handleMenuClose}
                  className={`text-xs uppercase tracking-widest block font-mono ${isActive("/")}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  onClick={handleMenuClose}
                  className={`text-xs uppercase tracking-widest block font-mono ${isActive("/products")}`}
                >
                  Products
                </Link>
              </li>
              {user && (
                <li>
                  <Link
                    to="/wishlist"
                    onClick={handleMenuClose}
                    className={`text-xs uppercase tracking-widest block font-mono ${isActive("/wishlist")}`}
                  >
                    Wishlist
                  </Link>
                </li>
              )}
            </ul>

             {/* Theme Toggle Button */}
            <ThemeToggle />

            <button
              onClick={() => { setIsVendorModalOpen(true); handleMenuClose(); }}
              className="flex items-center gap-2 py-2 text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 text-left cursor-pointer"
            >
              <Store size={16} />
              <span>Sell with Us (Vendor Request)</span>
            </button>

            {user ? (
              <div className="flex flex-col gap-3 pt-3 border-t border-zinc-200 dark:border-white/5">
                <Link
                  to="/profile"
                  onClick={handleMenuClose}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white"
                >
                  <User size={16} />
                  <span>View Profile Matrix</span>
                </Link>
                <button
                  onClick={() => { handleLogout(); handleMenuClose(); }}
                  className="text-left text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-mono pt-2 cursor-pointer flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Logout System</span>
                </button>
              </div>
            ) : (
                <Link to="/login" onClick={handleMenuClose} className="text-xs border-t-2 pt-2 border-zinc-200 dark:border-white/10 uppercase tracking-widest text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white font-mono text-center cursor-pointer w-full py-2 rounded-lg transition-colors">
                  Sign In
                </Link>
            )}
          </div>
        )}
      </header>

      {/* --- FLOATING BOTTOM NAVIGATION BAR FOR MOBILE --- */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border-t border-zinc-200 dark:border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl pb-safe transition-colors">
        
        {/* Home Tab */}
        <Link
          to="/"
          className="relative flex flex-col items-center justify-center w-14 py-1 cursor-pointer group"
        >
          {location.pathname === "/" ? (
            <motion.div 
              layoutId="icyuziActiveNav"
              className="absolute -top-6 w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-white dark:border-[#0c0c0e]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Home size={18} />
            </motion.div>
          ) : (
            <div className="text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-1">
              <Home size={18} />
            </div>
          )}
          <span className={`text-[9px] uppercase font-mono tracking-tight mt-5 ${location.pathname === "/" ? "text-blue-600 dark:text-blue-500 font-black" : "text-zinc-400 dark:text-gray-500"}`}>
            Home
          </span>
        </Link>

        {/* Products Tab */}
        <Link
          to="/products"
          className="relative flex flex-col items-center justify-center w-14 py-1 cursor-pointer group"
        >
          {location.pathname.startsWith("/products") ? (
            <motion.div 
              layoutId="icyuziActiveNav"
              className="absolute -top-6 w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-white dark:border-[#0c0c0e]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Package size={18} />
            </motion.div>
          ) : (
            <div className="text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-1">
              <Package size={18} />
            </div>
          )}
          <span className={`text-[9px] uppercase font-mono tracking-tight mt-5 ${location.pathname.startsWith("/products") ? "text-blue-600 dark:text-blue-500 font-black" : "text-zinc-400 dark:text-gray-500"}`}>
            Products
          </span>
        </Link>

        {/* Wishlist Tab (Logged-in only) */}
        {user && (
          <Link
            to="/wishlist"
            className="relative flex flex-col items-center justify-center w-14 py-1 cursor-pointer group"
          >
            {location.pathname === "/wishlist" ? (
              <motion.div 
                layoutId="icyuziActiveNav"
                className="absolute -top-6 w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-white dark:border-[#0c0c0e]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Heart size={18} />
              </motion.div>
            ) : (
              <div className="text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-1">
                <Heart size={18} />
              </div>
            )}
            <span className={`text-[9px] uppercase font-mono tracking-tight mt-5 ${location.pathname === "/wishlist" ? "text-blue-600 dark:text-blue-500 font-black" : "text-zinc-400 dark:text-gray-500"}`}>
              Wishlist
            </span>
          </Link>
        )}

        {/* Cart Tab */}
        <Link
          to="/cart"
          className="relative flex flex-col items-center justify-center w-14 py-1 cursor-pointer group"
        >
          {location.pathname === "/cart" ? (
            <motion.div 
              layoutId="icyuziActiveNav"
              className="absolute -top-6 w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-white dark:border-[#0c0c0e]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </motion.div>
          ) : (
            <div className="relative text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-1">
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 text-[9px] w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </div>
          )}
          <span className={`text-[9px] uppercase font-mono tracking-tight mt-5 ${location.pathname === "/cart" ? "text-blue-600 dark:text-blue-500 font-black" : "text-zinc-400 dark:text-gray-500"}`}>
            Cart
          </span>
        </Link>

        {/* Profile / Account Tab */}
        <Link
          to={user ? "/profile" : "/login"}
          className="relative flex flex-col items-center justify-center w-14 py-1 cursor-pointer group"
        >
          {location.pathname === "/profile" || location.pathname === "/login" ? (
            <motion.div 
              layoutId="icyuziActiveNav"
              className="absolute -top-6 w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-white dark:border-[#0c0c0e]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <User size={18} />
            </motion.div>
          ) : (
            <div className="text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-1">
              <User size={18} />
            </div>
          )}
          <span className={`text-[9px] uppercase font-mono tracking-tight mt-5 ${location.pathname === "/profile" || location.pathname === "/login" ? "text-blue-600 dark:text-blue-500 font-black" : "text-zinc-400 dark:text-gray-500"}`}>
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