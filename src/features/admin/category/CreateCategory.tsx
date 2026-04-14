import { X, Plus, Edit3 } from 'lucide-react';

interface CategoryFormProps {
  formData: { name: string; image: string };
  // Using a specific function type to match the state setter
  setFormData: (data: { name: string; image: string }) => void;
  isEditing: any; // Can be Category | null
  setIsEditing: (val: any) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void> | void;
}

export const CategoryForm = ({ 
  formData, 
  setFormData, 
  isEditing, 
  setIsEditing, 
  handleSubmit 
}: CategoryFormProps) => {
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Name Input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category Name</label>
          <input
            className="border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            placeholder="e.g., Traditional Baskets"
            value={formData.name}
            // Update only the name while preserving other fields
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Image URL Input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Image URL</label>
          <input
            className="border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            placeholder="https://res.cloudinary.com/..."
            value={formData.image}
            // Update only the image while preserving other fields
            onChange={e => setFormData({ ...formData, image: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button 
          type="submit" 
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all shadow-sm ${
            isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isEditing ? <Edit3 size={18} /> : <Plus size={18} />}
          {isEditing ? 'Update Category' : 'Save Category'}
        </button>
        
        {isEditing && (
          <button 
            type="button" 
            onClick={() => {
              setIsEditing(null);
              setFormData({ name: '', image: '' });
            }} 
            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all"
          >
            <X size={18} /> Cancel
          </button>
        )}
      </div>
    </form>
  );
};