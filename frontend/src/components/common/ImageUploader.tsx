import { Upload, X, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

type ProductImageUploaderProps = {
  files: File[];
  onUpdate: (files: File[]) => void;
};

export const ProductImageUploader = ({
  files,
  onUpdate,
}: ProductImageUploaderProps) => {
  const [isUploading] = useState(false);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files]
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    onUpdate([...files, ...selectedFiles]);

    // Allow selecting the same file again
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    onUpdate(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
        Product Gallery
      </label>

      <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-500/50 transition-colors bg-black/20">
        {isUploading ? (
          <Loader2 className="animate-spin text-blue-500" />
        ) : (
          <>
            <Upload className="text-gray-600 mb-2" size={24} />

            <span className="text-[10px] text-gray-500 font-bold uppercase">
              Click to Upload Images
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {previews.map(({ url }, index) => (
          <div
            key={index}
            className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group"
          >
            <img
              src={url}
              alt="preview"
              className="w-full h-full object-cover"
            />

            <button
              type="button"
              onClick={() => removeFile(index)}
              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};