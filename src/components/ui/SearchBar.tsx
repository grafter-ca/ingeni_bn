import { Search, X } from "lucide-react";
import { useSearch } from "../../hooks/useSearch";

const SearchBar = () => {
  const { inputValue, handleSearch, handleClear } = useSearch();

  return (
    <div className="relative flex items-center w-full max-w-md">
      <Search
        size={16}
        className="absolute left-3 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search products..."
        className="font-poppins w-full rounded bg-gray-800 border border-gray-700 text-white text-sm pl-9 pr-9 py-2 focus:outline-none focus:border-gray-500 placeholder:text-gray-500"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-gray-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;