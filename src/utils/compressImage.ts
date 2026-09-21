const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.8;

// Comprime una imagen redimensionándola y recodificándola como JPEG en el navegador
export const compressImage = async (file: File): Promise<File> => {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(
    1,
    MAX_DIMENSION / bitmap.width,
    MAX_DIMENSION / bitmap.height
  );
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("No se pudo comprimir la imagen")),
      "image/jpeg",
      JPEG_QUALITY
    );
  });

  const compressedName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], compressedName, { type: "image/jpeg" });
};
