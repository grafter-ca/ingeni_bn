import { useState } from "react";
import { CreditCard, Smartphone, Loader2 } from "lucide-react";

type CheckoutFormProps = {
  onSubmit: (data: { address: string; phone: string }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  totalAmount: number; 
};

const CheckoutForm = ({
  onSubmit,
  loading: externalLoading = false,
  error: externalError = null,
  totalAmount,
}: CheckoutFormProps) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const loading = externalLoading || localLoading;
  const error = externalError || localError;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(null);

    const formData = new FormData(e.currentTarget);
    const address = (formData.get("address") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    // Basic validation
    if (!address || address.length < 5) {
      setLocalError("Please enter a valid shipping address.");
      setLocalLoading(false);
      return;
    }

    if (!phone || phone.length < 9) {
      setLocalError("Please enter a valid Momo phone number.");
      setLocalLoading(false);
      return;
    }

    try {
      await onSubmit({ address, phone });
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setLocalError(err?.message || "Checkout failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Delivery & Payment</h2>
        <div className="flex gap-2">
          <Smartphone className="text-green-500" size={20} />
          <span className="text-xs text-gray-500 self-center">Momo Supported</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 ml-1 mb-1 block uppercase tracking-wider">
            Shipping Address
          </label>
          <input
            name="address"
            placeholder="e.g. KN 20 Ave, Kigali"
            required
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 ml-1 mb-1 block uppercase tracking-wider">
            Momo Phone Number
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="07XXXXXXXX"
            required
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 ml-1 mb-1 block uppercase tracking-wider">
            Total Amount
          </label>
          <input
            value={`$${totalAmount.toLocaleString()}`}
            readOnly
            disabled
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white cursor-not-allowed"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing...
          </>
        ) : (
          <>
            Confirm & Pay via Momo
            <CreditCard size={20} />
          </>
        )}
      </button>

      <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest">
        By clicking pay, you agree to our terms.
      </p>
    </form>
  );
};

export default CheckoutForm;