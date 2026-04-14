import { LogOut } from "lucide-react";
import { useAuthActions } from "../../context/AuthContext";
import { useState } from "react";

export default function Logout() {

    const { logout  } = useAuthActions()
    const [loading , setLoading] = useState(false);

    const handleLogout = async ()=>{
        try {
            setLoading(true)
            await logout()
        } catch (error) {
            console.error("Logout Failed",error)
            setLoading(false)
        }
    }
  return (
    <button disabled={loading} onClick={handleLogout}  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/5 rounded-2xl transition-all">
      <LogOut size={20} />
      <span className="text-sm font-bold">
        {loading ? "Logging out" : "Logout"}
      </span>
    </button>
  );
}
