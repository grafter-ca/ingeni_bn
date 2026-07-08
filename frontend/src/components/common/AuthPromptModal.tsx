import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus } from "lucide-react";
import Button from "../ui/Button";

type Props = { isOpen: boolean; onClose: () => void };

const AuthPromptModal = ({ isOpen, onClose }: Props) => {
  const navigate = useNavigate();

  const handleLogin = useCallback(() => {
    onClose();
    navigate("/login");
  }, [navigate, onClose]);

  const handleRegister = useCallback(() => {
    onClose();
    navigate("/register");
  }, [navigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="bg-gray-800 w-full max-w-md p-8 flex flex-col gap-6 relative rounded-xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-full p-1"
              >
                <X size={20} />
              </button>

              <div className="text-center flex flex-col gap-2">
                <h2 className="font-poppins font-bold text-2xl text-white tracking-wide">
                  Hold on!
                </h2>
                <p className="font-poppins text-gray-400 text-sm leading-relaxed">
                  You need an account to view your cart and checkout. It's free and takes less than a minute.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                className="justify-center bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold"
                  label="Login to my account"
                  icon={LogIn}
                  onClick={handleLogin}
                />
                <Button
                  label="Create free account"
                  icon={UserPlus}
                  variant="outline"
                  className="justify-center py-4 rounded-2xl font-bold"
                  onClick={handleRegister}
                />
              </div>

              <p className="font-poppins text-xs text-gray-500 text-center">
                Your cart items are saved — they'll be here when you get back.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthPromptModal;