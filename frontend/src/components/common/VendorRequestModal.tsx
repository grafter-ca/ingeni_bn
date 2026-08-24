import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { X, Store, Lock } from "lucide-react";
import { useAuthState } from "../../context/AuthContext"; // Path to your AuthProvider file
import { useVendorStore } from "../../store/vendorStore";   // Path to your vendor store file

interface VendorRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VendorRequestModal({ isOpen, onClose }: VendorRequestModalProps) {
  const navigate = useNavigate();
  const user = useAuthState(); // Pulls user session context directly from your AuthProvider
  const requestOnboarding = useVendorStore((state) => state.requestOnboarding);

  const [businessDescription, setBusinessDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Calls your vendor store method which points to backend vendorService
      await requestOnboarding(businessDescription);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
        >
          <X size={18} />
        </button>

        {/* CASE 1: USER IS NOT LOGGED IN */}
        {!user?.user?.id ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
              <Lock size={22} />
            </div>
            <h2 className="text-xl font-bold font-mono text-white mb-2 uppercase">Authentication Required</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              You must sign in or register an account before submitting a vendor onboarding request.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                label="Sign In"
                variant="primary"
                onClick={() => {
                  onClose();
                  navigate("/login");
                }}
              />
              <Button
                label="Create Account"
                variant="outline"
                className="border-white/10 text-gray-300 hover:bg-white/5"
                onClick={() => {
                  onClose();
                  navigate("/register");
                }}
              />
            </div>
          </div>
        ) : submitted ? (
          /* CASE 2: SUCCESS STATE */
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Store size={22} />
            </div>
            <h2 className="text-xl font-bold font-mono text-white mb-2 uppercase">Request Dispatched</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your application has been successfully transmitted to the admin team. We will review your inventory scope and follow up via email.
            </p>
            <Button
              label="Close Window"
              variant="primary"
              className="w-full"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
            />
          </div>
        ) : (
          /* CASE 3: LOGGED IN - SHOW FORM */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Store size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold font-mono text-white uppercase">Request Vendor Account</h2>
                <p className="text-xs text-gray-400">Logged in as <span className="text-gray-200">{user.user.email}</span></p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">
                  Business Description & Inventory Scope
                </label>
                <textarea
                  rows={4}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Detail what type of products you sell, your business registration name, or catalog background..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
              <Button
                label={loading ? "Transmitting..." : "Submit Vendor Application"}
                variant="primary"
                className="w-full"
              />
            </form>
          </div>
        )}

      </div>
    </div>
  );
}