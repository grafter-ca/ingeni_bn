import { LogOut, Loader2 } from "lucide-react";
import { useAuthActions } from "../../context/AuthContext";
import { useState } from "react";

export default function Logout() {
  const { logout } = useAuthActions();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error("Logout Failed", error);
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleLogout}
      className="w-full group flex items-center justify-between px-4 py-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/10 rounded-xl group-hover:scale-105 transition-transform">
          <LogOut size={18} className="text-rose-400" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">
          {loading ? "Signing out..." : "Logout"}
        </span>
      </div>

      {loading && (
        <Loader2 size={16} className="animate-spin text-rose-400" />
      )}
    </button>
  );
}