import { useEffect } from "react";
import { useCategoryStore } from "../../../store/categoryStore";
import { Edit3, Plus, Loader2 } from "lucide-react";
import CategoryTable from "../../../features/admin/category/CategoryTable";
import { CategoryForm } from "../../../features/admin/category/CreateCategory";

export default function AdminCategories() {
  const {
    categories,
    loading,
    isEditing,
    formData,
    fetchCategories,
    saveCategory,
    deleteCategory,
    setIsEditing,
    setFormData,
  } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCategory();
    } catch (error) {
      alert("Error saving category.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteCategory(id);
      } catch (error) {
        alert("Delete failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide">Categories</h1>
          <p className="text-sm text-gray-400 mt-1">
            Global state-managed category system.
          </p>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
            {isEditing ? (
              <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400">
                <Edit3 size={20} />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-green-600/10 text-green-400">
                <Plus size={20} />
              </div>
            )}
            {isEditing ? "Edit Existing Category" : "Create New Category"}
          </h2>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSubmit={handleSubmit}
          />
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="animate-spin mb-3 text-blue-500" size={40} />
              <p className="text-sm uppercase tracking-wider">Syncing with server...</p>
            </div>
          ) : (
            <CategoryTable
              categories={categories}
              handleDelete={handleDelete}
              setIsEditing={setIsEditing}
              setFormData={setFormData}
            />
          )}
        </div>

      </div>
    </div>
  );
}