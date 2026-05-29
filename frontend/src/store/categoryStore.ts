import { create } from 'zustand';
import { categoryApi, type Category } from '../libs/categoryApi';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  isEditing: Category | null;
  formData: { name: string; image: string };
  
  // Actions
  setFormData: (data: { name: string; image: string }) => void;
  setIsEditing: (category: Category | null) => void;
  
  // Async Actions (Side Effects)
  fetchCategories: () => Promise<void>;
  saveCategory: () => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  isEditing: null,
  formData: { name: "", image: "" },

  setFormData: (data) => set({ formData: data }),
  
  setIsEditing: (category) => set({ 
    isEditing: category, 
    formData: category ? { name: category.name, image: category.image } : { name: "", image: "" } 
  }),

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const data = await categoryApi.findAll();
      set({ categories: data });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      set({ loading: false });
    }
  },

  saveCategory: async () => {
    const { isEditing, formData, fetchCategories } = get();
    try {
      if (isEditing) {
        await categoryApi.update(isEditing.id, formData);
      } else {
        await categoryApi.create(formData);
      }
      set({ isEditing: null, formData: { name: "", image: "" } });
      await fetchCategories(); // Refresh list
    } catch (error) {
      throw error; // Let the component handle the alert
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await categoryApi.delete(id);
      await get().fetchCategories();
    } catch (error) {
       throw error;
    }
  }
}));