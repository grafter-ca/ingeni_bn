// Home feature components
import Hero from "../features/home/Hero";
import CategoryShowcase from "../features/home/CategoryShowcase";
import FeaturedProducts from "../features/home/FeaturedProducts";
import HowItWorks from "../features/home/HowItWorks";
import CallToAction from "../features/home/CallToAction";

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-background text-zinc-900 dark:text-white font-poppins transition-colors">

      {/* ── 1. Hero ── */}
      <Hero />

      {/* ── 2. Category Showcase ── */}
      <CategoryShowcase />

      {/* ── 3. Featured Products ── */}
      <FeaturedProducts />

      {/* ── 4. How It Works ── */}
      <HowItWorks />

      {/* ── 5. Call To Action ── */}
      <CallToAction />

    </div>
  );
};

export default Home;