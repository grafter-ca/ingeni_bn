import { Upload, X } from "lucide-react";
import { useEffect, useMemo } from "react";

type Props = {
  existingImages: string[];
  newFiles: File[];
  onUpdate: (existing: string[], newFiles: File[]) => void;
};

export const ProductImageUploader = ({ existingImages, newFiles, onUpdate }: Props) => {
  const previews = useMemo(() => newFiles.map(file => URL.createObjectURL(file)), [newFiles]);

  // Memory management: Revoke URLs to prevent memory leaks
  useEffect(() => () => previews.forEach(url => URL.revokeObjectURL(url)), [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpdate(existingImages, [...newFiles, ...Array.from(e.target.files)]);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Product Gallery</label>
      <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center bg-black/20 hover:border-blue-500/50 transition-colors">
        <Upload className="text-gray-600 mb-2" size={24} />
        <span className="text-[10px] text-gray-500 font-bold uppercase">Click to Upload Images</span>
        <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
      </div>

      <div className="flex flex-wrap gap-3">
        {existingImages.map((url, i) => (
          <div key={`old-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group">
            <img src={url} className="w-full h-full object-cover" />
            <button type="button" onClick={() => onUpdate(existingImages.filter((_, idx) => idx !== i), newFiles)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100"><X size={16} /></button>
          </div>
        ))}
        {previews.map((url, i) => (
          <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group">
            <img src={url} className="w-full h-full object-cover" />
            <button type="button" onClick={() => onUpdate(existingImages, newFiles.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100"><X size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};