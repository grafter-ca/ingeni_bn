import { Edit3, Trash2 } from "lucide-react";
import type { Category } from "../../../libs/categoryApi";

interface CategoryTableProps {
  categories: Category[];
  setIsEditing: (category: Category) => void;
  setFormData: (data: { name: string; image: string | File }) => void;
  handleDelete: (id: string) => void;
}

function CategoryTable({
  categories,
  setIsEditing,
  setFormData,
  handleDelete,
}: CategoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-white/5 bg-[#0a0a0a]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider bg-white/[0.02]">
            <th className="p-4 pl-6">Preview</th>
            <th className="p-4">Name</th>
            <th className="p-4 pr-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-8 text-center text-gray-500 text-sm">
                No categories found.
              </td>
            </tr>
          ) : (
            categories.map((cat) => (
              <tr
                key={cat.id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="p-4 pl-6">
                  <img
                    src={cat.image}
                    className="w-12 h-12 object-cover rounded-xl border border-white/10"
                    alt={cat.name}
                  />
                </td>
                <td className="p-4 font-semibold text-white">{cat.name}</td>
                <td className="p-4 pr-6 text-right flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(cat);
                      setFormData({ name: cat.name, image: cat.image });
                    }}
                    className="p-2 rounded-xl bg-white/5 text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                    title="Edit Category"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-xl bg-white/5 text-red-400 hover:bg-red-600 hover:text-white transition-all"
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTable;