export const resizeImage = (
  imageSrc: string,
  width: number,
  height: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return reject('Canvas context is not available');

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = error => reject(error);
  });
};
