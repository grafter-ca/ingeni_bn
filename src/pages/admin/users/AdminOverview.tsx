import { Users, ShieldCheck, Zap, Server } from "lucide-react";

const AdminOverview = ({ totalUsers,isLoading }: { totalUsers: number,isLoading:boolean }) => {

    if (isLoading){
        return(
            <div className="m-auto  text-4xl text-white/70">Loaging...</div>
        )
    }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Registered Entities" 
          value={totalUsers.toLocaleString()} 
          icon={<Users className="text-blue-500" />} 
          sub="Verified DB Records"
        />
        <StatCard 
          label="Auth Protocol" 
          value="v1.0.2" 
          icon={<ShieldCheck className="text-purple-500" />} 
          sub="Better-Auth Production"
        />
        <StatCard 
          label="System Latency" 
          value="24ms" 
          icon={<Zap className="text-amber-500" />} 
          sub="Edge Node: Kigali"
        />
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5"><Server size={200} /></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8">Infrastructure Health</h3>
        <div className="space-y-6 max-w-md">
          <HealthBar label="Database Connection" percent={100} color="bg-green-500" />
          <HealthBar label="Authentication API" percent={98} color="bg-blue-500" />
          <HealthBar label="File Storage (S3)" percent={100} color="bg-purple-500" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, sub }: any) => (
  <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-4xl shadow-2xl">
    <div className="mb-4">{icon}</div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">{label}</p>
    <p className="text-3xl font-mono font-bold text-white mt-1">{value}</p>
    <p className="text-[9px] font-medium text-gray-700 mt-2 uppercase tracking-widest">{sub}</p>
  </div>
);

const HealthBar = ({ label, percent, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);


export default AdminOverview;
