interface CategoryCardProps {
  name: string;
  description: string;
  imageUrl?: string;
}

function CategoryCard({ name, description, imageUrl }: CategoryCardProps) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl group">
      <div>
        {imageUrl && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 aspect-video">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <h2 className="text-lg font-bold text-white mb-2">{name}</h2>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default CategoryCard;