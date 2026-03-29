import { ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";

export default function Hero() {
  return (
    <section className="App px-8 py-20 flex flex-col items-center justify-center min-h-screen bg-white" role="main" aria-label="Main Application">

      <p className="font-poppins text-sm uppercase tracking-widest text-gray-400 mb-4">
        Curated for the Discerning Few
      </p>

      <h1 className="font-poppins font-bold text-5xl md:text-7xl text-center tracking-wide text-gray-500 leading-tight max-w-4xl">
        Elevate Every Part of Your World
      </h1>

      <p className="font-poppins font-light text-lg md:text-xl text-center text-gray-500 mt-6 max-w-2xl leading-relaxed">
        From timeless essentials to statement pieces  Ingeni brings together the finest products,
        handpicked to match your lifestyle and taste.
      </p>

      <div className="flex gap-4 mt-10">
        <Button label="Explore Collection" variant="primary" onClick={()=> console.log("Our collection")} icon={ArrowRight} />
        <Button label="Our Story" variant="outline" onClick={()=> console.log("Our story")} />
      </div>

      <p className="font-poppins text-xs text-gray-400 mt-8 tracking-wide">
        Free shipping on orders over $150 · Exclusive members-only deals
      </p>

    </section>
  )
}
