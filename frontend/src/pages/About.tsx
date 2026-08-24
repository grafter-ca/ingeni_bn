// pages/About.tsx
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { ShieldCheck, Sparkles, MapPin, Store, Terminal, Cpu } from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Verified Quality",
    description: "Every merchant and inventory listing on Ingeni is rigorously checked to guarantee product reliability and authentic specifications.",
  },
  {
    icon: Sparkles,
    title: "Precision Curation",
    description: "From structural components to everyday essentials, we organize items into clear, accessible catalogs tailored to your needs.",
  },
  {
    icon: MapPin,
    title: "Localized Reach",
    description: "Connecting buyers and vendors seamlessly across regions and districts, making local sourcing faster and transparent.",
  },
  {
    icon: Store,
    title: "Vendor Empowerment",
    description: "We provide local businesses and merchants with the digital infrastructure they need to display inventory and scale online.",
  },
];

const reasons = [
  { stat: "10K+",  label: "Active Buyers"      },
  { stat: "500+",  label: "Listed Products"    },
  { stat: "50+",   label: "Verified Vendors"   },
  { stat: "24/7",  label: "System Telemetry"   },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="font-sans bg-[#050505] text-gray-100 min-h-screen selection:bg-blue-500/30 relative overflow-hidden">

      {/* Ambient Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 border-b border-white/5 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-6 backdrop-blur-md">
          <Terminal size={12} className="text-blue-400" />
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-gray-300 font-semibold">
            System Overview // Who We Are
          </span>
        </div>
        <h1 className="font-black text-4xl md:text-6xl tracking-tight text-white max-w-4xl uppercase font-mono leading-tight">
          Engineering the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">Commerce & Sourcing</span>
        </h1>
        <p className="text-gray-400 font-light text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
          Ingeni is a multi-vendor digital marketplace built to bridge the gap between quality merchants and modern consumers. We centralize local hardware, agriculture, and retail inventories into a single streamlined platform.
        </p>
      </section>

      {/* ── Our Story ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-b border-white/5 relative z-10">
        <div className="p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-blue-500/10 pointer-events-none">
            <Cpu size={120} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-gray-400 font-bold">Architecture & Genesis</p>
          </div>
          <h2 className="font-black text-2xl md:text-3xl text-white mb-6 uppercase font-mono tracking-tight">
            Built to Solve Fragmentation in Local Supply Chains
          </h2>
          <p className="text-gray-400 font-light leading-relaxed mb-4 text-sm md:text-base">
            Finding reliable products across fragmented local stores shouldn't be complicated. Ingeni was created to give independent vendors a high-performance storefront while offering buyers an intuitive, filter-rich inventory matrix.
          </p>
          <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
            Whether you are sourcing structural building materials, agricultural supplies, or consumer goods, Ingeni guarantees transparency, fast discovery, and direct vendor connectivity.
          </p>
        </div>
      </section>

      {/* ── Our Mission ── */}
      <section className="bg-white/[0.01] px-6 py-20 border-b border-white/5 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 backdrop-blur-md">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-blue-400 font-bold">Core Directive</span>
          </div>
          <h2 className="font-black text-2xl md:text-3xl text-white mb-6 uppercase font-mono">
            Empowering Commerce Through Technology
          </h2>
          <p className="text-gray-400 font-light text-base md:text-lg leading-relaxed">
            Our mission is to digitize regional trade networks. We provide a robust technological framework that empowers local vendors to scale their operations while making high-grade products instantly accessible to every customer.
          </p>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="px-6 py-20 border-b border-white/5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-gray-500 mb-4 text-center font-bold">System Values</p>
          <h2 className="font-black text-2xl md:text-3xl text-white mb-12 text-center uppercase font-mono tracking-tight">
            What Drives Our Network
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-5 p-6 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-blue-500/40 transition-all duration-300 group">
                <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl h-fit group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-400 shadow-md">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2 uppercase font-mono text-sm tracking-wide">{title}</h3>
                  <p className="text-gray-400 font-light text-xs md:text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us (Metrics) ── */}
      <section className="bg-white/[0.01] px-6 py-20 border-b border-white/5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-gray-500 mb-4 text-center font-bold">Performance Metrics</p>
          <h2 className="font-black text-2xl md:text-3xl text-white mb-12 text-center uppercase font-mono tracking-tight">
            Network Scale & Impact
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {reasons.map(({ stat, label }) => (
              <div key={label} className="flex flex-col items-center text-center p-6 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-blue-500/30 transition-all">
                <span className="font-black text-3xl md:text-4xl text-white mb-2 font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">{stat}</span>
                <span className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold font-mono">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-4 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-gray-300 font-bold">
            Initialization
          </p>
        </div>
        <h2 className="font-black text-3xl md:text-4xl text-white max-w-xl uppercase font-mono tracking-tight mb-6">
          Ready to Access the Inventory Matrix?
        </h2>
        <p className="text-gray-400 font-light mb-10 max-w-md text-sm md:text-base leading-relaxed">
          Create your account today to start exploring curated catalogs, managing orders, and connecting with verified local vendors.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button
            label="Create Account"
            variant="primary"
            onClick={() => navigate("/register")}
          />
          <Button
            label="Explore Inventory"
            variant="outline"
            className="border-white/10 text-gray-300 hover:bg-white/5"
            onClick={() => navigate("/products")}
          />
        </div>
      </section>

    </div>
  );
};

export default About;