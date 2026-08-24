// src/components/forms/ChechoutForm.tsx
import { useState, useEffect } from "react";
import {
  CreditCard,
  Loader2,
  Smartphone,
  Upload,
} from "lucide-react";
import type { PaymentMethod } from "../../types/api";

type CheckoutFormProps = {
  onSubmit: (data: {
    shippingAddress: string;
    phoneNumber: string;
    paymentMethod: PaymentMethod;
    paymentProofFile?: File;
  }) => Promise<void>;

  loading?: boolean;
  error?: string | null;
  totalAmount: number;

  // External synchronized payment state props
  selectedPayment?: PaymentMethod;
  onPaymentMethodChange?: (method: PaymentMethod) => void;

  defaultValues?: {
    shippingAddress: string;
    phoneNumber: string;
    paymentMethod: PaymentMethod;
  };
};

const CheckoutForm = ({
  onSubmit,
  loading: externalLoading = false,
  error: externalError = null,
  totalAmount,
  selectedPayment,
  onPaymentMethodChange,
  defaultValues = {
    shippingAddress: "",
    phoneNumber: "",
    paymentMethod: "MOBILE_MONEY",
  },
}: CheckoutFormProps) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Track selected payment method locally with fallback to props or default values
  const [internalMethod, setInternalMethod] = useState<PaymentMethod>(
    selectedPayment || defaultValues.paymentMethod
  );

  // Sync internal state if external `selectedPayment` prop updates
  useEffect(() => {
    if (selectedPayment) {
      setInternalMethod(selectedPayment);
    }
  }, [selectedPayment]);

  const handleMethodChange = (newMethod: PaymentMethod) => {
    setInternalMethod(newMethod);
    if (onPaymentMethodChange) {
      onPaymentMethodChange(newMethod);
    }
  };

  const loading = externalLoading || localLoading;
  const error = externalError || localError;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLocalLoading(true);
    setLocalError(null);

    try {
      const formData = new FormData(e.currentTarget);

      const shippingAddress = String(
        formData.get("shippingAddress") || ""
      ).trim();

      const phoneNumber = String(
        formData.get("phoneNumber") || ""
      ).trim();

      const paymentMethod = String(
        formData.get("paymentMethod") || internalMethod
      ) as PaymentMethod;

      if (shippingAddress.length < 5) {
        throw new Error("Please enter a valid delivery address.");
      }

      if (phoneNumber.length < 9) {
        throw new Error("Please enter a valid phone number.");
      }

      // Grab file directly from input if present
      const paymentProofFile = formData.get("paymentProof") as File;

      if (paymentMethod === "MOBILE_MONEY" && (!paymentProofFile || paymentProofFile.size === 0)) {
        throw new Error("Please upload a payment proof screenshot for Mobile Money transfer.");
      }

      // Pass raw file payload directly to the parent onSubmit handler
      await onSubmit({
        shippingAddress,
        phoneNumber,
        paymentMethod,
        paymentProofFile: paymentProofFile && paymentProofFile.size > 0 ? paymentProofFile : undefined,
      });
    } catch (err: any) {
      console.error(err);
      setLocalError(
        err?.message || "Checkout failed. Please try again."
      );
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form
      id="checkout-form"
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-3xl p-8 space-y-6 shadow-sm transition-colors duration-200"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delivery & Payment</h2>

        <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm font-medium">
          <Smartphone size={18} />
          MoMo Supported
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border text-center border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
          Shipping Address
        </label>

        <input
          name="shippingAddress"
          required
          disabled={loading}
          defaultValue={defaultValues.shippingAddress}
          placeholder="KG 11 Ave, Kigali"
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
        />
      </div>

      <div>
        <label className="block mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
          Phone Number
        </label>

        <input
          name="phoneNumber"
          type="tel"
          required
          disabled={loading}
          defaultValue={defaultValues.phoneNumber}
          placeholder="07XXXXXXXX"
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
        />
      </div>

      <div>
        <label className="block mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
          Payment Method
        </label>

        <select
          name="paymentMethod"
          required
          value={internalMethod}
          onChange={(e) => handleMethodChange(e.target.value as PaymentMethod)}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
        >
          <option value="MOBILE_MONEY">Mobile Money (MoMo)</option>
          <option value="CREDIT_CARD">Credit Card</option>
          <option value="CASH_ON_DELIVERY">Cash On Delivery</option>
        </select>
      </div>

      {/* Conditional Mobile Money Instructions and Screenshot Upload Section */}
      {internalMethod === "MOBILE_MONEY" && (
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black border border-yellow-500/30 space-y-3 transition-colors">
          <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            <Smartphone size={16} />
            Mobile Money Transfer Instructions
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5 transition-colors">
            <p>Store Name: <strong className="text-gray-900 dark:text-white">Ingeni Store</strong></p>
            <p>MoMo Account Name: <strong className="text-gray-900 dark:text-white">Caleb's Admin</strong></p>
            <p>MoMo Number: <strong className="text-yellow-600 dark:text-yellow-400 font-mono text-sm">1005404</strong></p>
            <p>Amount to Transfer: <strong className="text-gray-900 dark:text-white font-mono">RF {totalAmount.toLocaleString()}</strong></p>
          </div>

          <div>
            <label className="block mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-2">
              <Upload size={14} /> Upload Payment Screenshot Proof
            </label>
            <input
              type="file"
              name="paymentProof"
              accept="image/*"
              disabled={loading}
              className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
          Total Amount
        </label>

        <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 font-mono text-lg font-bold text-blue-600 dark:text-blue-400 transition-colors">
          RF {totalAmount.toLocaleString()}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider text-white shadow-lg shadow-blue-600/20"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Confirm & Pay
            <CreditCard size={18} />
          </>
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;