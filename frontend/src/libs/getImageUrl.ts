export const getImageUrl = (image: string | { url: string } | undefined): string => {
  if (!image) return 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=120&q=80'; 
  return typeof image === 'string' ? image : image.url;
};