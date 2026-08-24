import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Shield, LogOut, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthState, useAuthActions } from "../../context/AuthContext";
import { useCartActions } from "../../hooks/useCartActions";

interface UserProfileProps {
  align?: "left" | "right";
  className?: string;
  user?: {
    name: string;
    email: string;
    image?: string | null | undefined; 
    role?: string;                     
  };
   onLogout?: () => void;
}

export const UserProfile = ({
  align = "right",
  className = "",
}: UserProfileProps) => {
  const { user } = useAuthState();
  const { logout } = useAuthActions();
  const { handleClearCart } = useCartActions();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    handleClearCart();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button / Avatar */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 py-1 px-2.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 hover:border-blue-500/40 transition-all cursor-pointer group"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-inner uppercase overflow-hidden shrink-0">
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <span className="text-zinc-700 dark:text-gray-300 text-xs font-mono group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
          {user.name.split(" ")[0]}
        </span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute mt-3 w-64 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl py-3 z-50 backdrop-blur-xl ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {/* User Info Header */}
            <div className="px-4 pb-3 border-b border-zinc-100 dark:border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold uppercase overflow-hidden shrink-0 shadow-md">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate font-mono">{user.name}</p>
                <p className="text-[11px] text-zinc-500 dark:text-gray-400 truncate font-mono">{user.email}</p>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="py-2 px-2 flex flex-col gap-1">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-zinc-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User size={15} className="text-blue-500 dark:text-blue-400" />
                  <span>Account Matrix</span>
                </div>
                <ChevronRight size={14} className="text-zinc-400 dark:text-gray-600" />
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-zinc-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield size={15} className="text-amber-500 dark:text-amber-400" />
                    <span>Admin Console</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-400 dark:text-gray-600" />
                </Link>
              )}
            </div>

            {/* Logout Action */}
            <div className="pt-2 mt-1 border-t border-zinc-100 dark:border-white/5 px-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};