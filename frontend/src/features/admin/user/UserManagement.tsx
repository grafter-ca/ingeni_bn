import { useState, useEffect } from "react";
import { UserCog, Search, RefreshCw } from "lucide-react";
import { useAuthActions } from "../../../context/AuthContext";
import UserTable from "../user/UserTable";
import Pagination from "../../../components/common/Pagination";

const UserManagementPage = () => {
  const { admin } = useAuthActions();
  
  // --- Pagination & Query Constants ---
  const ITEMS_PER_PAGE = 10;
  
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Local state for the human-readable page number
  const [currentPage, setCurrentPage] = useState(1);

  const [query, setQuery] = useState({ 
    limit: ITEMS_PER_PAGE, 
    offset: 0, 
    searchField: "name" as const, 
    searchValue: "" 
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await admin.listUsers(query);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Critical Registry Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch
  useEffect(() => {
    const delayDebounce = setTimeout(() => loadUsers(), 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  // --- Pagination Handler ---
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Convert human page to machine offset: (1-1)*10 = 0, (2-1)*10 = 10
    setQuery(prev => ({ 
      ...prev, 
      offset: (page - 1) * ITEMS_PER_PAGE 
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Cluster */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <UserCog size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Protocol</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white uppercase">User Registry</h1>
          <p className="text-gray-500 text-sm mt-1">Management of global identities and authentication nodes.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/5 p-2 rounded-2xl shadow-inner">
            <div className="px-4 py-2 border-r border-white/5">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Population</p>
                <p className="text-xl font-mono font-bold text-blue-500">{total}</p>
            </div>
            <button 
              onClick={loadUsers} 
              className="p-4 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </header>

      {/* Control Interface */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            placeholder={`Filter by ${query.searchField}...`}
            className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm focus:border-blue-500/30 outline-none text-white transition-all shadow-sm"
            onChange={(e) => {
              setCurrentPage(1); // Reset to page 1 on search
              setQuery({ ...query, offset: 0, searchValue: e.target.value });
            }}
          />
        </div>
        <select 
          className="bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-gray-500 outline-none focus:border-blue-500/30 appearance-none cursor-pointer"
          onChange={(e) => setQuery({ ...query, searchField: (e.target.value as "name") || "name" })}
        >
          <option value="name">Identity Name</option>
          <option value="email">Electronic Mail</option>
        </select>
      </section>

      {/* Main Table Container */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <UserTable users={users} loading={loading} refresh={loadUsers} />
        
        {/* Pagination Integration */}
        <Pagination 
          totalItems={total} 
          itemsPerPage={ITEMS_PER_PAGE} 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default UserManagementPage;