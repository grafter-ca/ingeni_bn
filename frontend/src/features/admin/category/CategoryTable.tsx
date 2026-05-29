import { Edit3, Trash2 } from "lucide-react";
import type { Category } from "../../../libs/categoryApi";


interface CategoryTableProps {
  categories: Category[];
  setIsEditing: (category: Category) => void;
  setFormData: (data: { name: string; image: string }) => void;
  handleDelete: (id: string) => void;
}

function CategoryTable({categories,setIsEditing,setFormData,handleDelete}: CategoryTableProps) {
  return (
    <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Preview</th>
              <th className="p-4">Name</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <img src={cat.image} className="w-12 h-12 object-cover rounded-md" alt={cat.name} />
                </td>
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4 text-right flex justify-end gap-3">
                  <button 
                    onClick={() => { setIsEditing(cat); setFormData({ name: cat.name, image: cat.image }); }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  )
}

export default CategoryTable