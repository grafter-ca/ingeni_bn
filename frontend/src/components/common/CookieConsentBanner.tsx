import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CookieConsentBanner = () => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // Check if the actual cookie exists
    const hasConsented = document.cookie
      .split("; ")
      .some((item) => item.startsWith("ingeni_cookie_consent=true"));

    if (hasConsented) {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    // Set an actual browser cookie that lasts for 1 year
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    document.cookie = `ingeni_cookie_consent=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-6 right-6 md:left-8 md:max-w-md z-[9999] bg-[#0c0c0e] border border-white/15 p-6 rounded-2xl shadow-2xl backdrop-blur-xl font-poppins flex flex-col gap-4">
      <div>
        <h3 className="text-white text-xs font-mono font-bold uppercase tracking-widest">Cookie Protocol Matrix</h3>
        <p className="text-xs text-gray-400 font-light mt-1.5 leading-relaxed">
          We use cookies to enhance your browsing experience, maintain secure authentication nodes, and analyze platform traffic. Read our <Link to="/privacy" className="text-blue-400 underline hover:text-white">Privacy Policy</Link> to learn more.
        </p>
      </div>
      <div>
        <button 
          onClick={handleAccept} 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          Accept All
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;