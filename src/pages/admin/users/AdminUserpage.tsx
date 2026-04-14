import { useEffect, useState } from "react";
import { ShieldCheck, LayoutDashboard, Users, Settings, Activity } from "lucide-react";
import UserManagementPage from "../../../features/admin/user/UserManagement";
import AdminOverview from "./AdminOverview";
import GlobalConfig from "./GlobalConfig";
import SystemLogs from "./SystemLogs";
import { useAuthActions } from "../../../context/AuthContext";

const AdminUserPage = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState("overview");
  // Production Telemetry State
  const { admin } = useAuthActions();
  const [registryStats, setRegistryStats] = useState({
    total: 0,
    loading: true
  });

  // Fetch real-time total from Better-Auth admin service
  useEffect(() => {
    const syncTelemetry = async () => {
      try {
        // limit: 1 is a performance trick to get the 'total' without downloading all users
        const res = await admin.listUsers({ limit: 1 }); 
        setRegistryStats({
          total: res.total || 0,
          loading: false
        });
      } catch (err) {
        console.error("Telemetry link failed:", err);
        setRegistryStats(prev => ({ ...prev, loading: false }));
      }
    };
    
    syncTelemetry();
  }, [admin]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505] rounded-4xl p-4">
      
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-72 mt-2 bg-[#0a0a0a] md:rounded-r-[2.5rem] border-r border-white/5 p-8 flex flex-col space-y-10">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <ShieldCheck size={24} />
            <h2 className="font-black uppercase tracking-[0.3em] text-xs">Admin.Core</h2>
          </div>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Internal Control System</p>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Overview" 
            active={activeTab === "overview"} 
            onClick={() => setActiveTab("overview")} 
          />
          <NavItem 
            icon={<Users size={18} />} 
            label="User Registry" 
            active={activeTab === "registry"} 
            onClick={() => setActiveTab("registry")} 
          />
          <NavItem 
            icon={<Activity size={18} />} 
            label="System Logs" 
            active={activeTab === "logs"} 
            onClick={() => setActiveTab("logs")} 
          />
          <div className="pt-4 mt-4 border-t border-white/5">
            <NavItem 
              icon={<Settings size={18} />} 
              label="Global Config" 
              active={activeTab === "config"} 
              onClick={() => setActiveTab("config")} 
            />
          </div>
        </nav>
      </aside>

      {/* Main Content Node - Switcher */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen custom-scrollbar relative">
        {activeTab === "overview" && (
          <AdminOverview 
            totalUsers={registryStats.total} 
            isLoading={registryStats.loading} 
          />
        )}
        
        {activeTab === "registry" && (
          <UserManagementPage />
        )}

        {activeTab === "logs" && (
          <SystemLogs />
        )}

        {activeTab === "config" && (
          <GlobalConfig />
        )}
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active = false, onClick }: NavItemProps) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
      ${active 
        ? "bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/5" 
        : "text-gray-500 hover:bg-white/5 hover:text-white border border-transparent"}
    `}
  >
    <span className={`${active ? "text-blue-400" : "text-gray-600 group-hover:text-blue-400"} transition-colors`}>
      {icon}
    </span>
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default AdminUserPage;