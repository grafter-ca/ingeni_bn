import { useEffect } from "react";
import { useAuthState } from "../../context/AuthContext";
import { Link } from "react-router-dom";

type PaymentSecurityGateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
};

export function PaymentSecurityGateModal({
  isOpen,
  onClose,
  onProceedToPayment,
}: PaymentSecurityGateModalProps) {
  const { user } = useAuthState();

  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Appends the current checkout path to the login/register links for automatic return loops
  const getAuthRedirectPath = (targetPage : string) => {
    const currentPath = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    return `/${targetPage}?redirect=${currentPath}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-gate-title"
    >
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="w-full max-w-md p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close safety gate"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition p-2 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Security Shield Visual Anchor */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
          <svg
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h3
          id="security-gate-title"
          className="text-2xl font-bold text-white text-center mb-2 tracking-tight"
        >
          {user ? "Secure Checkout Authorization" : "Authentication Required"}
        </h3>

        <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">
          {user
            ? `Verified account detected (${user.email}). Click below to finalize billing routes and transfer your funds to centralized escrow pools.`
            : "You must be logged in to securely lock inventory allocations, claim multi-vendor cart profiles, and authorize node payments safely."}
        </p>

        <div className="space-y-3">
          {user ? (
            /* FLOW A: USER IS AUTHENTICATED -> TRIGGER RESOLUTION CALLBACK */
            <button
              onClick={onProceedToPayment}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl tracking-wide transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              Confirm & Complete Payment
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          ) : (
            /* FLOW B: USER IS GUEST -> REDIRECT TO EXTERNALLY HANDLED PAGES */
            <>
              <Link
                to={getAuthRedirectPath("login")}
                className="w-full py-4 bg-blue-600 ..."
              >
                Sign In to Existing Account
              </Link>
              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-slate-800"></div>
                <span className="shrink mx-4 text-slate-500 text-xs uppercase tracking-widest font-medium">
                  or
                </span>
                <div className="grow border-t border-slate-800"></div>
              </div>
              <a
                href={getAuthRedirectPath("register")}
                className="w-full py-4 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded-xl tracking-wide transition-all flex items-center justify-center"
              >
                Create a Security Account
              </a>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-sm text-slate-400 hover:text-slate-200 transition font-medium text-center block pt-2"
          >
            Cancel and Review Order
          </button>
        </div>
      </div>
    </div>
  );
}
