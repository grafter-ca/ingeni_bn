import  { useState } from "react";
import { Terminal, Download, Search, Filter } from "lucide-react";

const SystemLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Production Note: These would ideally come from your API
  const logs = [
    { id: 1, time: "2026-04-14 17:42:01", level: "INFO", module: "AUTH", msg: "Admin session initialized via encrypted handshake.", node: "KGL-01" },
    { id: 2, time: "2026-04-14 17:41:55", level: "WARN", module: "DB", msg: "Prisma connection pool reaching 85% capacity.", node: "KGL-01" },
    { id: 3, time: "2026-04-14 17:40:12", level: "ERROR", module: "NIDA", msg: "External API Timeout: Barcode verification failed.", node: "GATEWAY-A" },
    { id: 4, time: "2026-04-14 17:38:22", level: "INFO", module: "USER", msg: "Profile update: UUID_7d4747 updated role to ADMIN.", node: "KGL-01" },
    { id: 5, time: "2026-04-14 17:35:01", level: "INFO", module: "AUTH", msg: "New registration attempt from IP 197.243.34.12.", node: "KGL-02" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter text-white uppercase">System Telemetry</h2>
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Audit Trail & Event Logs</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              type="text"
              placeholder="FILTER LOGS..."
              className="w-full bg-white/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[10px] font-mono text-gray-300 outline-none focus:border-blue-500/30 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
            <Filter size={16} />
          </button>
          <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-gray-500 hover:text-blue-400 transition-all">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-[#050505] border border-white/10 rounded-4xl overflow-hidden shadow-2xl relative">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
          <Terminal size={180} />
        </div>

        {/* Console Header */}
        <div className="bg-white/20 border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
          </div>
          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Live Stream: Active</span>
        </div>

        {/* Log Entries */}
        <div className="p-6 font-mono overflow-x-auto">
          <div className="min-w-200 space-y-1">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="grid grid-cols-12 gap-4 py-2 px-4 rounded-lg hover:bg-white/20 transition-colors border-l border-transparent hover:border-blue-500/30 group"
              >
                <span className="col-span-2 text-gray-600 text-[11px]">{log.time.split(' ')[1]}</span>
                
                <span className={`col-span-1 text-[10px] font-black text-center rounded px-1 h-fit mt-0.5 ${
                  log.level === 'ERROR' ? 'bg-red-500/10 text-red-500' : 
                  log.level === 'WARN' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {log.level}
                </span>

                <span className="col-span-1 text-gray-500 text-[11px] font-bold uppercase tracking-tighter">
                  {log.module}
                </span>

                <span className="col-span-6 text-gray-400 text-[11px] group-hover:text-gray-200 transition-colors">
                  {log.msg}
                </span>

                <span className="col-span-2 text-right text-gray-700 text-[10px] font-bold uppercase italic">
                  {log.node}
                </span>
              </div>
            ))}
          </div>

          {/* Prompt Simulation */}
          <div className="mt-6 flex items-center gap-3 px-4 border-t border-white/5 pt-4">
            <span className="text-blue-500 font-bold text-xs animate-pulse">&gt;</span>
            <div className="h-4 w-1 bg-blue-500 animate-pulse" />
            <span className="text-gray-700 text-[10px] font-black uppercase tracking-[0.3em]">
              Listening for protocol events...
            </span>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white/20 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total Events (24h)</span>
          <span className="text-lg font-mono font-bold text-white">4,829</span>
        </div>
        <div className="flex-1 bg-white/20 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Critical Errors</span>
          <span className="text-lg font-mono font-bold text-red-500">02</span>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;