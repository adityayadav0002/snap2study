const MAX_DIMENSION = 2200;
const TARGET_MAX_BYTES = 3.5 * 1024 * 1024;
const MIN_JPEG_QUALITY = 0.72;
const MAX_JPEG_QUALITY = 0.92;

type OptimizeResult = {
  dataUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  finalSize: number;
  format: "image/jpeg" | "image/png";
};

function loadImage(
  file: Blob
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error("The selected image could not be read.")
      );
    };
    img.src = url;
  });
}

function calculateDimensions(
  width: number,
  height: number
) {
  const largestSide = Math.max(
    width,
    height
  );
  if (largestSide <= MAX_DIMENSION) {
    return {
      width,
      height,
    };
  }

  const scale = MAX_DIMENSION / largestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function dataUrlToBytes(
  dataUrl: string
): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil(
    (base64.length * 3) / 4
  );
}

function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  quality: number
): string {
  return canvas.toDataURL(
    "image/jpeg",
    quality
  );
}

export async function optimizeImage(
  file: File
): Promise<OptimizeResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  const img = await loadImage(file);
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;
  if (
    !originalWidth ||
    !originalHeight
  ) {
    throw new Error("The image dimensions could not be detected.");
  }

  const dimensions =
    calculateDimensions(
      originalWidth,
      originalHeight
    );

  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const ctx =
    canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: false,
    });

  if (!ctx) {
    throw new Error("Your browser could not prepare the image.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.drawImage(
    img,
    0,
    0,
    dimensions.width,
    dimensions.height
  );

  let quality = MAX_JPEG_QUALITY;
  let dataUrl =
    canvasToDataUrl(
      canvas,
      quality
    );
  let finalSize = dataUrlToBytes(dataUrl);

  while (
    finalSize > TARGET_MAX_BYTES &&
    quality > MIN_JPEG_QUALITY
  ) {
    quality -= 0.04;
    dataUrl =
      canvasToDataUrl(
        canvas,
        quality
      );
    finalSize = dataUrlToBytes(dataUrl);
  }

  if (
    finalSize > TARGET_MAX_BYTES
  ) {
    const scale = Math.sqrt(
      TARGET_MAX_BYTES /
        finalSize
    );
    const reducedWidth =
      Math.max(
        900,
        Math.round(
          canvas.width * scale
        )
      );
    const reducedHeight =
      Math.max(
        900,
        Math.round(
          canvas.height * scale
        )
      );
    canvas.width = reducedWidth;
    canvas.height = reducedHeight;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.drawImage(
      img,
      0,
      0,
      reducedWidth,
      reducedHeight
    );

    dataUrl =
      canvasToDataUrl(
        canvas,
        MIN_JPEG_QUALITY
      );

    finalSize = dataUrlToBytes(dataUrl);
  }

  return {
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    originalWidth,
    originalHeight,
    originalSize: file.size,
    finalSize,
    format: "image/jpeg",
  };
}