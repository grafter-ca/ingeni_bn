// src/components/ui/QuantityButton.tsx
import { Minus, Plus } from "lucide-react";

interface QuantityButtonProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export const QuantityButton = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max,
}: QuantityButtonProps) => {
  const isMin = quantity <= min;
  const isMax = max !== undefined && quantity >= max;

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-[#050505] border border-zinc-200 dark:border-white/10 p-1.5 rounded-2xl shadow-sm transition-colors">
      <button
        type="button"
        onClick={onDecrease}
        disabled={isMin}
        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
          isMin
            ? "opacity-40 cursor-not-allowed bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-gray-600"
            : "bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-gray-200"
        }`}
        title="Decrease quantity"
      >
        <Minus size={16} />
      </button>

      <span className="text-sm font-bold w-8 text-center text-zinc-900 dark:text-white font-mono">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={isMax}
        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
          isMax
            ? "opacity-40 cursor-not-allowed bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-gray-600"
            : "bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-gray-200"
        }`}
        title="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default QuantityButton;