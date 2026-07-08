
interface CategoryCardProps {
  name: string;
  description: string;
  imageUrl?: string;
}


function CategoryCard({ name, description, imageUrl }: CategoryCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">{name}</h2>
      <p className="text-gray-600">{description}</p>
      {imageUrl && (
        <img src={imageUrl} alt={name} className="w-full h-auto mt-2" />
      )}
    </div>
  )
}

export default CategoryCard