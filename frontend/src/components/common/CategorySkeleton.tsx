// components/category/CategorySkeleton.tsx
export default function CategorySkeleton() {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl animate-pulse">
      <div>
        {/* Image Placeholder */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/5 aspect-video bg-white/[0.04]" />
        
        {/* Title Placeholder */}
        <div className="h-6 bg-white/[0.04] rounded-lg w-3/4 mb-3" />
        
        {/* Description Placeholder */}
        <div className="space-y-2">
          <div className="h-4 bg-white/[0.03] rounded-md w-full" />
          <div className="h-4 bg-white/[0.03] rounded-md w-5/6" />
        </div>
      </div>
    </div>
  );
}