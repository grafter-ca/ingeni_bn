// src/pages/Cart.tsx
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useCartActions } from "../../hooks/useCartActions";
import { useCartSummary } from "../../hooks/useCartSummary";
import Button from "../../components/ui/Button";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";

const Cart = () => {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { handleClearCart } = useCartActions();
  const { totalItems } = useCartSummary();

  // ── Empty Cart ──
  if (items.length === 0)
    return (
      <section className="min-h-screen bg-gray-50 dark:bg-gray-900 font-poppins flex flex-col items-center justify-center gap-6 px-6 transition-colors duration-200">
        <article className="flex flex-col items-center gap-4 text-center">
          <ShoppingBag size={64} className="text-gray-300 dark:text-gray-700" />
          <h2 className="font-bold text-2xl text-gray-900 dark:text-white">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
            Looks like you haven't added anything yet. Explore our collection and
            find something you love.
          </p>

          <Button
            label="Explore Products"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate("/products")}
          />
        </article>
      </section>
    );

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 font-poppins text-gray-900 dark:text-white transition-colors duration-200">
      <article className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-3xl tracking-wide">Your Cart</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-xs text-gray-500 uppercase tracking-widest hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 font-semibold"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items ── */}
          <CartItem />
          {/* ── Order Summary ── */}
          <OrderSummary />
        </section>
      </article>
    </section>
  );
};

export default Cart;