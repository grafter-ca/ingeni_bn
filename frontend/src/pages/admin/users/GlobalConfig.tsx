import { ShieldAlert, Globe, Bell, RefreshCcw } from "lucide-react";

const GlobalConfig = () => {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tighter text-white">SYSTEM CONFIGURATION</h2>
        <p className="text-gray-500 text-sm">Manage global variables and security overrides.</p>
      </div>

      <div className="space-y-4">
        <ConfigItem 
          title="Maintenance Override" 
          desc="Redirect all incoming traffic to the maintenance cluster."
          icon={<ShieldAlert size={18}/>}
          active={false}
        />
        <ConfigItem 
          title="New Registrations" 
          desc="Allow external entities to create new accounts."
          icon={<Globe size={18}/>}
          active={true}
        />
        <ConfigItem 
          title="System Notifications" 
          desc="Push security alerts to administrative devices."
          icon={<Bell size={18}/>}
          active={true}
        />
      </div>

      <div className="pt-8 border-t border-white/5 flex gap-4">
        <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
          <RefreshCcw size={14} /> Commit Changes
        </button>
      </div>
    </div>
  );
};

const ConfigItem = ({ title, desc, icon, active }: any) => (
  <div className="flex items-center justify-between p-6 bg-[#0a0a0a] border border-white/5 rounded-4xl hover:border-white/10 transition-colors">
    <div className="flex items-center gap-5">
      <div className="p-4 bg-white/20 rounded-2xl text-gray-500">{icon}</div>
      <div>
        <p className="text-sm font-bold text-white uppercase tracking-tight">{title}</p>
        <p className="text-xs text-gray-600 font-medium">{desc}</p>
      </div>
    </div>
    <div className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer border ${active ? 'bg-blue-600 border-blue-400' : 'bg-gray-900 border-white/5'}`}>
      <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default GlobalConfig;