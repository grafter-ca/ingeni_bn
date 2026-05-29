import { useState } from "react";
import {
  CreditCard,
  Loader2,
  Smartphone,
} from "lucide-react";
import type { PaymentMethod } from "../../types/api";

type CheckoutFormProps = {
  onSubmit: (data: {
    shippingAddress: string;
    phoneNumber: string;
    paymentMethod: PaymentMethod;
  }) => Promise<void>;

  loading?: boolean;
  error?: string | null;
  totalAmount: number;

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
  defaultValues = {
    shippingAddress: "",
    phoneNumber: "",
    paymentMethod: "MOBILE_MONEY",
  },
}: CheckoutFormProps) => {
  const [localLoading, setLocalLoading] =
    useState(false);

  const [localError, setLocalError] =
    useState<string | null>(null);

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
        formData.get("paymentMethod") || ""
      ) as PaymentMethod;

      if (shippingAddress.length < 5) {
        throw new Error(
          "Please enter a valid address."
        );
      }

      if (phoneNumber.length < 9) {
        throw new Error(
          "Please enter a valid phone number."
        );
      }

      await onSubmit({
        shippingAddress,
        phoneNumber,
        paymentMethod,
      });
    } catch (err: any) {
      console.error(err);

      setLocalError(
        err?.message ||
          "Checkout failed. Please try again."
      );
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form
      id="checkout-form"
      onSubmit={handleSubmit}
      className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Delivery & Payment
        </h2>

        <div className="flex items-center gap-2 text-green-500 text-sm">
          <Smartphone size={18} />
          MoMo Supported
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block mb-2 text-xs uppercase tracking-wider text-gray-500">
          Shipping Address
        </label>

        <input
          name="shippingAddress"
          required
          disabled={loading}
          defaultValue={defaultValues.shippingAddress}
          placeholder="KG 11 Ave, Kigali"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-xs uppercase tracking-wider text-gray-500">
          Phone Number
        </label>

        <input
          name="phoneNumber"
          type="tel"
          required
          disabled={loading}
          defaultValue={defaultValues.phoneNumber}
          placeholder="07XXXXXXXX"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-xs uppercase tracking-wider text-gray-500">
          Payment Method
        </label>

        <select
          name="paymentMethod"
          required
          defaultValue={defaultValues.paymentMethod}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500"
        >
          <option value="MOBILE_MONEY">
            Mobile Money
          </option>

          <option value="CREDIT_CARD">
            Credit Card
          </option>

          <option value="CASH_ON_DELIVERY">
            Cash On Delivery
          </option>
        </select>
      </div>

      <div>
        <label className="block mb-2 text-xs uppercase tracking-wider text-gray-500">
          Total Amount
        </label>

        <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-mono">
          RW {totalAmount.toLocaleString()}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2
              size={20}
              className="animate-spin"
            />
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