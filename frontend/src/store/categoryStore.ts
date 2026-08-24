import { create } from 'zustand';
import { categoryApi, type Category } from '../libs/categoryApi';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  isEditing: Category | null;
  formData: { name: string; image: string | File };
  
  // Actions
  setFormData: (data: { name: string; image: string | File }) => void;
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
      // If your API accepts multipart/form-data for file uploads, wrap it here:
      const payload = new FormData();
      payload.append("name", formData.name);
      
      if (formData.image instanceof File) {
        payload.append("image", formData.image);
      } else if (typeof formData.image === "string") {
        payload.append("image", formData.image);
      }

      if (isEditing) {
        await categoryApi.update(isEditing.id, payload as any);
      } else {
        await categoryApi.create(payload as any);
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