import { motion } from "framer-motion";
import { ArrowUpRight, FolderGit } from "lucide-react";

interface CategoryCardProps {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  itemCount?: number;
  onClick?: () => void;
}

function CategoryCard({
  name,
  description,
  imageUrl,
  itemCount,
  onClick,
}: CategoryCardProps) {
  // Safe Fallback Image
  const displayImage =
    imageUrl ||
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=500&q=80";

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300 overflow-hidden h-full"
    >
      <div>
        {/* ── 1. Thumbnail Container with Gradient Overlay ── */}
        <div className="relative mb-3.5 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 aspect-[16/10] bg-zinc-100 dark:bg-[#121212]">
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Dark Gradient Overlay for Maximum Visual Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Floating Category Icon Badge */}
          <div className="absolute top-2.5 left-2.5 p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-blue-400">
            <FolderGit size={14} />
          </div>

          {/* Item Count Badge (Top-Right) */}
          {itemCount !== undefined && (
            <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              {itemCount} Products
            </span>
          )}
        </div>

        {/* ── 2. Category Title & Direct Link Indicator ── */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {name}
          </h3>

          <div className="p-1 rounded-lg bg-zinc-100 dark:bg-white/5 group-hover:bg-blue-600 group-hover:text-white text-zinc-500 dark:text-gray-400 transition-all shrink-0">
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </div>
        </div>

        {/* ── 3. Description (Clamped for Clean Grid Alignment) ── */}
        {description && (
          <p className="text-zinc-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default CategoryCard;