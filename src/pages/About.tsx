// pages/About.tsx
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { ShieldCheck, Sparkles, Globe, HeartHandshake } from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Quality",
    description: "Every product on Ingeni is carefully vetted to meet the highest standards of quality and reliability.",
  },
  {
    icon: Sparkles,
    title: "Premium Curation",
    description: "We don't sell everything — we sell the right things. Each item is handpicked to elevate your lifestyle.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "From local gems to international brands, Ingeni connects you to the world's finest products.",
  },
  {
    icon: HeartHandshake,
    title: "Customer First",
    description: "Your satisfaction is our priority. We're here before, during, and after every purchase.",
  },
];

const reasons = [
  { stat: "10K+",  label: "Happy Customers"    },
  { stat: "500+",  label: "Premium Products"   },
  { stat: "50+",   label: "Global Brands"      },
  { stat: "24/7",  label: "Customer Support"   },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="font-poppins bg-gray-900 text-white min-h-screen">

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 border-b border-gray-800">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
          Who We Are
        </p>
        <h1 className="font-bold text-5xl md:text-7xl tracking-wide text-white max-w-3xl leading-tight">
          Built for Those Who Expect More
        </h1>
        <p className="text-gray-400 font-light text-lg mt-6 max-w-xl leading-relaxed">
          Ingeni is more than a store. It's a curated experience designed around quality, taste, and the belief that great products change everyday life.
        </p>
      </section>

      {/* ── Our Story ── */}
      <section className="max-w-3xl mx-auto px-6 py-20 border-b border-gray-800">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Our Story</p>
        <h2 className="font-semibold text-3xl md:text-4xl text-white mb-6 leading-snug">
          A Store Born from a Simple Idea
        </h2>
        <p className="text-gray-400 font-light leading-relaxed mb-4">
          Ingeni started with a frustration we all share — too many choices, too little quality. We set out to fix that by building a store where every product earns its place.
        </p>
        <p className="text-gray-400 font-light leading-relaxed">
          From our first product to our five-hundredth, our promise has never changed: bring you the best, cut out the rest. Ingeni is where intentional shopping begins.
        </p>
      </section>

      {/* ── Our Mission ── */}
      <section className="bg-gray-800 px-6 py-20 border-b border-gray-700">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Our Mission</p>
          <h2 className="font-semibold text-3xl md:text-4xl text-white mb-6">
            To Make Excellence Accessible
          </h2>
          <p className="text-gray-400 font-light text-lg leading-relaxed">
            We believe premium shouldn't mean unattainable. Our mission is to make the world's finest products available to anyone who values quality — wherever they are, whatever they need.
          </p>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="px-6 py-20 border-b border-gray-800">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 text-center">Our Values</p>
          <h2 className="font-semibold text-3xl md:text-4xl text-white mb-12 text-center">
            What Drives Everything We Do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 p-6 bg-gray-800 rounded-lg">
                <div className="mt-1">
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 font-light text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="bg-gray-800 px-6 py-20 border-b border-gray-700">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 text-center">Why Choose Us</p>
          <h2 className="font-semibold text-3xl md:text-4xl text-white mb-12 text-center">
            Numbers That Speak for Themselves
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {reasons.map(({ stat, label }) => (
              <div key={label} className="flex flex-col items-center text-center p-6 bg-gray-900 rounded-lg">
                <span className="font-bold text-4xl text-white mb-2">{stat}</span>
                <span className="text-gray-400 text-sm uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
          Join Ingeni
        </p>
        <h2 className="font-bold text-4xl md:text-5xl text-white max-w-xl leading-tight mb-6">
          Ready to Experience the Difference?
        </h2>
        <p className="text-gray-400 font-light mb-10 max-w-md leading-relaxed">
          Create your free account today and get access to our full collection, exclusive deals, and premium support.
        </p>
        <div className="flex gap-4">
          <Button
            label="Create Account"
            variant="primary"
            onClick={() => navigate("/register")}
          />
          <Button
            label="Explore Collection"
            variant="outline"
            className="border-gray-500 text-gray-300 hover:bg-gray-800"
            onClick={() => navigate("/")}
          />
        </div>
      </section>

    </div>
  );
};

export default About;