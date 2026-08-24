import { Search, X } from "lucide-react";
import { useSearch } from "../../hooks/useSearch";

const SearchBar = () => {
  const { inputValue, handleSearch, handleClear } = useSearch();

  return (
    <div className="relative flex items-center w-full max-w-md">
      <Search
        size={16}
        className="absolute left-3 text-zinc-400 dark:text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search products..."
        className="font-poppins w-full rounded bg-zinc-100 dark:bg-gray-800 border border-zinc-300 dark:border-gray-700 text-zinc-900 dark:text-white text-sm pl-9 pr-9 py-2 focus:outline-none focus:border-zinc-500 dark:focus:border-gray-500 placeholder:text-zinc-400 dark:placeholder:text-gray-500 transition-colors"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-zinc-400 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;