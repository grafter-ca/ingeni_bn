import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-poppins py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-blue-500">Legal Matrix</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white uppercase font-mono mt-2">Terms of Service</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">Last updated: August 2026</p>
        </div>

        <div className="space-y-6 text-sm font-light leading-relaxed border-t border-white/10 pt-8">
          <section className="space-y-3">
            <h2 className="text-white font-mono uppercase text-sm tracking-wider font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing and utilizing Ingeni Store, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-mono uppercase text-sm tracking-wider font-semibold">2. User Accounts & Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials, password, and for restricting access to your computer or system node. You accept full responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-mono uppercase text-sm tracking-wider font-semibold">3. Marketplace Transactions & Vendors</h2>
            <p>
              Ingeni Store acts as a curated marketplace connecting buyers and independent vendors. Transactions conducted through the platform are subject to vendor policies, stock availability, and accurate pricing parameters at checkout.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-mono uppercase text-sm tracking-wider font-semibold">4. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of Rwanda, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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

export default Terms;