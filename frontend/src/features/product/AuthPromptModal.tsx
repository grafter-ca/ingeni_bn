import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthPromptModalProps {
  delaySeconds?: number; // e.g., 10 or 15 seconds
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void; // Optional callback to trigger it automatically via timer
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ 
  delaySeconds = 15, 
  isOpen, 
  onClose,
  onOpen 
}) => {
  const navigate = useNavigate();

  // Handle the automatic popup timer when the component mounts
  useEffect(() => {
    // If already open or no trigger callback provided, skip timer setup
    if (isOpen || !onOpen) return;

    const timer = setTimeout(() => {
      onOpen();
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds, isOpen, onOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-800 relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          ✕
        </button>

        {/* Modal Content */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✨
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Enjoying what you see?
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Sign in or create an account to save items to your wishlist, track orders, and unlock exclusive local vendor perks.
          </p>

          <div className="pt-4 space-y-3">
            <button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Sign In / Register Now
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};