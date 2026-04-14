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
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-gray-50/50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500">Global state-managed category system.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {isEditing ? (
            <Edit3 size={20} className="text-blue-600" />
          ) : (
            <Plus size={20} className="text-green-600" />
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-2" size={40} />
            <p>Syncing with server...</p>
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
  );
}
