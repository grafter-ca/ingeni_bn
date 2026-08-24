import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-poppins py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-blue-500">Security & Protocol</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white uppercase font-mono mt-2">Privacy Policy</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">Last updated: August 2026</p>
        </div>

        <div className="space-y-6 text-sm font-light leading-relaxed border-t border-white/10 pt-8">
          <section className="space-y-3">
            <h2 className="text-white font-mono uppercase text-sm tracking-wider font-semibold">1. Information We Collect</h2>
            <p>
              We collect information you provide directly when creating an account, updating your profile, submitting vendor requests, or communicating with our support channels. This may include your name, email address, phone number, and delivery locations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-mono uppercase text-sm tracking-wider font-semibold">2. Use of Collected Data</h2>
            <p>
              Your data is utilized to process transactions, manage your cart items, maintain secure authentication sessions, and send critical updates regarding your orders or platform announcements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-mono uppercase text-sm tracking-wider font-semibold">3. Data Protection</h2>
            <p>
              We implement industry-standard security protocols, encrypted connections, and robust database storage practices to protect your personal information from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-mono uppercase text-sm tracking-wider font-semibold">4. Contact Regarding Privacy</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices, you can reach out directly via email at <span className="text-white font-mono">hello@ingenistore.com</span>.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-white/10">
          <Link to="/" className="text-xs font-mono uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
            ← Return to Home Node
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;