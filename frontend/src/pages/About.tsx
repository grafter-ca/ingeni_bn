// pages/About.tsx
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { ShieldCheck, MapPin, Store, Terminal, Cpu, DollarSign, TrendingUp, BarChart3, PackageCheck } from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Verified Quality & Origin",
    description: "Every merchant, commodity, and household product listed from Rwandan markets is rigorously verified to guarantee authenticity, safety, and reliability.",
  },
  {
    icon: PackageCheck,
    title: "Everyday Community Access",
    description: "From local fresh goods to essential household supplies, we bridge the gap between Rwandan households and neighborhood merchants.",
  },
  {
    icon: MapPin,
    title: "Localized Regional Reach",
    description: "Connecting buyers and independent vendors seamlessly across districts and local trading centers for rapid, transparent sourcing.",
  },
  {
    icon: Store,
    title: "Vendor Autonomy & Control",
    description: "Empowering Rwandan merchants with robust digital command tools to independently manage store assets, catalog stock, and revenue metrics.",
  },
];

const reasons = [
  { stat: "100%", label: "Independent Vendor Revenue Control" },
  { stat: "24/7",  label: "Real-Time Business Telemetry"     },
  { stat: "50+",   label: "Verified Rwandan Merchants"       },
  { stat: "Live",  label: "Asset & Inventory Tracking"       },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="font-sans bg-[#050505] text-gray-100 min-h-screen selection:bg-blue-500/30 relative overflow-hidden">

      {/* Solid Backdrop Glow Effect (No Gradients) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-600/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-blue-600/[0.02] rounded-full blur-[150px] pointer-events-none" />

      {/* ── Hero (With proper top spacing) ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-10 border-b border-white/10 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 mb-6 backdrop-blur-md shadow-inner">
          <Terminal size={14} className="text-blue-400" />
          <span className="text-[11px] uppercase font-mono tracking-widest text-gray-300">
            Platform Manifesto // Rwandan Commerce
          </span>
        </div>
        <h1 className="font-poppins font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white max-w-4xl leading-tight">
          Empowering Rwandan Communities & <span className="text-blue-400">Vendor Independence</span>
        </h1>
        <p className="text-gray-400 font-light text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
          Inspired by local market dynamics, our multi-vendor platform connects Rwandan households with everyday essential goods while equipping independent merchants with direct control over their assets and revenue.
        </p>
      </section>

      {/* ── Our Story / Genesis (Addressing Local Needs & Vendor Revenue) ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-b border-white/10 relative z-10">
        <div className="p-8 md:p-12 rounded-3xl bg-[#0c0c0e] border border-white/10 backdrop-blur-md relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 text-blue-500/10 pointer-events-none">
            <Cpu size={120} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-[11px] uppercase font-mono tracking-widest text-gray-400 font-semibold">Platform Genesis</p>
          </div>
          <h2 className="font-poppins font-bold text-2xl md:text-3xl text-white mb-6 tracking-tight">
            Built for Rwandan Shoppers & Merchant Financial Freedom
          </h2>
          <p className="text-gray-400 font-light leading-relaxed mb-4 text-sm md:text-base">
            Finding daily household essentials and supporting local neighborhood vendors should be direct and transparent. Our platform was engineered to give Rwandan shoppers a reliable digital marketplace for everyday commodities.
          </p>
          <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
            More than just a storefront, our infrastructure ensures that every participating vendor retains absolute oversight of their business operations — enabling merchants to track inventory assets, monitor live revenue, and independently drive their growth.
          </p>
        </div>
      </section>

      {/* ── Vendor Financial Command Section ── */}
      <section className="bg-white/[0.01] px-6 py-20 border-b border-white/10 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 backdrop-blur-md">
              <BarChart3 size={14} className="text-blue-400" />
              <span className="text-[11px] uppercase font-mono tracking-widest text-blue-400 font-semibold">Vendor Telemetry</span>
            </div>
            <h2 className="font-poppins font-bold text-2xl md:text-4xl text-white mb-6 tracking-tight">
              Total Transparency & Revenue Control for Every Merchant
            </h2>
            <p className="text-gray-400 font-light text-sm md:text-base leading-relaxed mb-6">
              We believe local merchants deserve enterprise-grade tools without the complexity. Our system provides dedicated vendor portals where business owners can audit daily transactions, track asset status, and review real-time revenue performance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0c0c0e] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 mb-2 font-mono text-xs font-semibold">
                  <DollarSign size={16} /> Revenue Tracking
                </div>
                <p className="text-xs text-gray-400 font-light leading-relaxed">Vendors directly monitor earnings and sales flow in real time.</p>
              </div>
              <div className="p-4 bg-[#0c0c0e] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 mb-2 font-mono text-xs font-semibold">
                  <TrendingUp size={16} /> Asset Management
                </div>
                <p className="text-xs text-gray-400 font-light leading-relaxed">Seamless stock updates, item positioning, and store governance.</p>
              </div>
            </div>
          </div>
          <div className="p-8 bg-[#0c0c0e] border border-white/10 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-mono text-xs text-gray-400">System Node // Rwanda</span>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px]">Active</span>
            </div>
            <div className="space-y-3 font-mono text-xs text-gray-300">
              <div className="flex justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span>Active Vendor Portals:</span>
                <span className="text-blue-400 font-bold">Online</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span>Daily Market Sync:</span>
                <span className="text-emerald-400 font-bold">Synchronized</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span>Revenue Telemetry:</span>
                <span className="text-blue-400 font-bold">Secured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="px-6 py-20 border-b border-white/10 relative z-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase font-mono tracking-widest text-gray-400 mb-4 text-center font-semibold">Platform Pillars</p>
          <h2 className="font-poppins font-bold text-2xl md:text-3xl text-white mb-12 text-center tracking-tight">
            What Drives Our Community Network
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-5 p-6 bg-[#0c0c0e] border border-white/10 rounded-2xl hover:border-blue-500/40 transition-all duration-300 group shadow-lg">
                <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl h-fit group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-400 shadow-md">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-white mb-2 text-sm tracking-wide">{title}</h3>
                  <p className="text-gray-400 font-light text-xs md:text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Performance Metrics ── */}
      <section className="bg-white/[0.01] px-6 py-20 border-b border-white/10 relative z-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase font-mono tracking-widest text-gray-400 mb-4 text-center font-semibold">Ecosystem Metrics</p>
          <h2 className="font-poppins font-bold text-2xl md:text-3xl text-white mb-12 text-center tracking-tight">
            Empowering Local Commerce
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {reasons.map(({ stat, label }) => (
              <div key={label} className="flex flex-col items-center text-center p-6 bg-[#0c0c0e] border border-white/10 rounded-2xl hover:border-blue-500/30 transition-all shadow-lg">
                <span className="font-poppins font-bold text-2xl md:text-3xl text-white mb-2 text-blue-400">{stat}</span>
                <span className="text-gray-400 text-[10px] uppercase tracking-wider font-mono">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 mb-4 backdrop-blur-md shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <p className="text-[11px] uppercase font-mono tracking-widest text-gray-300 font-semibold">
            Get Started Today
          </p>
        </div>
        <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white max-w-xl tracking-tight mb-6">
          Ready to Explore Rwandan Essentials or Register Your Store?
        </h2>
        <p className="text-gray-400 font-light mb-10 max-w-md text-sm md:text-base leading-relaxed">
          Join our growing multi-vendor ecosystem today as a buyer discovering everyday items or as a merchant managing your products and revenue.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button
            label="Explore Products"
            variant="primary"
            onClick={() => navigate("/products")}
            className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-3 px-6 rounded-xl transition shadow-lg shadow-blue-600/25 cursor-pointer"
          />
          <Button
            label="Become a Vendor"
            variant="outline"
            className="border-white/20 text-gray-300 hover:bg-white/5 font-mono text-xs py-3 px-6 rounded-xl transition cursor-pointer"
            onClick={() => navigate("/vendor/register")}
          />
        </div>
      </section>

    </div>
  );
};

export default About;

