// ImageUploader.tsx
export const ImageUploader = ({ images, onUpdate }: { images: string[], onUpdate: (urls: string[]) => void }) => {
  const handleAddUrl = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const url = e.currentTarget.value;
      if (url) {
        onUpdate([...images, url]);
        e.currentTarget.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Image URLs (Press Enter to add)</label>
      <input 
        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
        placeholder="https://example.com/image.jpg"
        onKeyDown={handleAddUrl}
      />
      <div className="flex gap-2 flex-wrap mt-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-16 h-16 bg-gray-700 rounded overflow-hidden">
            <img src={url} className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={() => onUpdate(images.filter((_, index) => index !== i))}
              className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1"
              >X</button>
          </div>
        ))}
      </div>
    </div>
  );
};