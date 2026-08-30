"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { optimizeImage } from "@/lib/optimizeImage";

type UploadBoxProps = {
  onImageSelected?: (file: File) => void;
  onContinue?: (file: File) => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ANALYSIS_TIMEOUT_MS = 60_000;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function UploadBox({
  onImageSelected,
  onContinue,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  /* =====================================================
     CLEAN OBJECT URL
  ===================================================== */

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* =====================================================
     VALIDATE
  ===================================================== */

  const validateFile = useCallback(
    (selectedFile: File): string | null => {
      if (!selectedFile.type) {
        return "Unable to determine image type.";
      }

      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        return "Please select a JPG, PNG, or WEBP image.";
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        return "Image must be smaller than 10MB.";
      }

      return null;
    },
    []
  );

  /* =====================================================
     SELECT
  ===================================================== */

  const selectFile = useCallback(
    (selectedFile: File) => {
      if (processing) return;

      setError("");

      const validationError =
        validateFile(selectedFile);

      if (validationError) {
        setError(validationError);
        return;
      }

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      const imageUrl =
        URL.createObjectURL(selectedFile);

      setFile(selectedFile);
      setPreview(imageUrl);

      onImageSelected?.(selectedFile);
    },
    [
      processing,
      preview,
      validateFile,
      onImageSelected,
    ]
  );

  /* =====================================================
     INPUT
  ===================================================== */

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (selectedFile) {
      selectFile(selectedFile);
    }
  };

  /* =====================================================
     DROP
  ===================================================== */

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    setDragging(false);

    if (processing) return;

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (droppedFile) {
      selectFile(droppedFile);
    }
  };

  /* =====================================================
     REMOVE
  ===================================================== */

  const removeFile = () => {
    if (processing) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  /* =====================================================
     READ DATA URL
  ===================================================== */

  const readFileAsDataUrl = async (
    selectedFile: File | Blob | string
  ): Promise<string> => {
    if (typeof selectedFile === "string") {
      if (
        selectedFile.startsWith("data:image/")
      ) {
        return selectedFile;
      }

      throw new Error(
        "Invalid optimized image data."
      );
    }

    if (
      !selectedFile ||
      typeof selectedFile.arrayBuffer !==
        "function"
    ) {
      throw new Error(
        "Invalid image file."
      );
    }

    const buffer =
      await selectedFile.arrayBuffer();

    const normalizedBlob =
      new Blob([buffer], {
        type:
          selectedFile.type ||
          "image/jpeg",
      });

    return new Promise<string>(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          if (
            typeof reader.result ===
            "string"
          ) {
            resolve(reader.result);
          } else {
            reject(
              new Error(
                "Could not read image."
              )
            );
          }
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Could not read image."
            )
          );
        };

        reader.onabort = () => {
          reject(
            new Error(
              "Image reading was cancelled."
            )
          );
        };

        reader.readAsDataURL(
          normalizedBlob
        );
      }
    );
  };

  /* =====================================================
     CONTINUE
  ===================================================== */

  const handleContinue = async () => {
    if (!file || processing) return;

    setProcessing(true);
    setError("");

    try {
      let imageData: string;

      try {
        const optimized =
          await optimizeImage(file);

        imageData = optimized.dataUrl;
      } catch (optimizationError) {
        console.warn(
          "[Snap2Study] Image optimization failed:",
          optimizationError
        );

        imageData =
          await readFileAsDataUrl(file);
      }

      if (
        !imageData ||
        !imageData.startsWith("data:image/")
      ) {
        throw new Error(
          "Could not prepare the image."
        );
      }

      const controller = new AbortController();

const timeoutId = window.setTimeout(() => {
  controller.abort();
}, ANALYSIS_TIMEOUT_MS);

let response: Response;

try {
  response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageData,
    }),
    signal: controller.signal,
  });
} catch (error) {
  if (
    error instanceof DOMException &&
    error.name === "AbortError"
  ) {
    throw new Error(
      "Analysis took too long. Please try again."
    );
  }

  throw new Error(
    "Unable to connect to Snap2Study. Please check your internet connection."
  );
} finally {
  window.clearTimeout(timeoutId);
}

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
  if (response.status === 429) {
    throw new Error(
      data?.error ||
        "You've reached the analysis limit. Please try again later."
    );
  }

  if (response.status === 400) {
    throw new Error(
      data?.error ||
        "The uploaded image could not be processed."
    );
  }

  if (response.status === 413) {
    throw new Error(
      "The image is too large to process."
    );
  }

  if (response.status >= 500) {
    throw new Error(
      "Snap2Study is having trouble processing this request. Please try again."
    );
  }

  throw new Error(
    data?.error ||
      `Analysis failed (${response.status}).`
  );
}

      if (
        !data ||
        typeof data !== "object"
      ) {
        throw new Error(
          "The AI returned an invalid result."
        );
      }

      if (
        typeof data.answer !== "string"
      ) {
        throw new Error(
          "The AI returned an incomplete answer."
        );
      }

      sessionStorage.setItem(
        "snap2study_result",
        JSON.stringify(data)
      );

      sessionStorage.setItem(
        "snap2study_image",
        imageData
      );

      onContinue?.(file);

      window.location.href =
        "/result";
    } catch (error) {
      console.error(
        "[Snap2Study] Analysis error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the image."
      );
    } finally {
      setProcessing(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="w-full">

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {!preview ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a question image"
          onClick={() =>
            inputRef.current?.click()
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();

            if (!processing) {
              setDragging(true);
            }
          }}
          onDragLeave={() => {
            setDragging(false);
          }}
          onDrop={handleDrop}
          className={`
            group relative cursor-pointer
            overflow-hidden
            border-2 border-black
            p-6
            transition-all duration-300
            sm:p-8

            ${
              dragging
                ? `
                  -translate-x-1
                  -translate-y-1
                  bg-(--yellow)
                  shadow-[7px_7px_0_var(--black)]
                `
                : `
                  bg-(--paper)
                  hover:-translate-x-1
                  hover:-translate-y-1
                  hover:shadow-[7px_7px_0_var(--black)]
                `
            }
          `}
        >

          {/* CORNER LABEL */}

          <div className="mono absolute right-4 top-4 text-[8px] font-bold uppercase tracking-[0.15em] text-black/35">
            IMG / 01
          </div>

          {/* UPLOAD ICON */}

          <div
            className={`
              mx-auto flex h-20 w-20
              items-center justify-center
              border-2 border-black
              bg-(--yellow)
              text-4xl
              transition-all duration-300
              ${
                dragging
                  ? "rotate-3 scale-105"
                  : "group-hover:rotate-3"
              }
            `}
          >
            +
          </div>

          <div className="mt-6 text-center">

            <h3 className="serif text-3xl leading-none">
              {dragging
                ? "Drop it here."
                : "Drop your question."}
            </h3>

            <p className="mt-3 text-sm leading-6 text-black/50">
              {dragging
                ? "Release to upload your image"
                : "Upload an image or drag it here"}
            </p>

          </div>

          {/* FORMAT ROW */}

          <div className="mono mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[8px] font-bold uppercase tracking-[0.14em] text-black/40">
            <span>JPG</span>
            <span>PNG</span>
            <span>WEBP</span>
            <span>MAX 10MB</span>
          </div>

          {/* BOTTOM HINT */}

          <div className="mt-7 border-t border-black/10 pt-4 text-center">
            <span className="mono text-[8px] uppercase tracking-[0.12em] text-black/30">
              Click anywhere to browse
            </span>
          </div>

        </div>
      ) : (

        /* =================================================
           PREVIEW
        ================================================= */

        <div
          className="
            overflow-hidden
            border-2 border-black
            bg-(--paper)
            shadow-[7px_7px_0_var(--black)]
          "
        >

          {/* HEADER */}

          <div className="flex items-center justify-between border-b-2 border-black px-5 py-4">

            <div>
              <p className="mono text-[9px] font-bold uppercase tracking-[0.15em]">
                QUESTION / PREVIEW
              </p>

              <p className="mono mt-1 text-[8px] uppercase tracking-wider text-black/35">
                IMAGE READY
              </p>
            </div>

            <button
              type="button"
              onClick={removeFile}
              disabled={processing}
              className="
                mono
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                underline
                underline-offset-4
                transition-opacity
                hover:opacity-50
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              Remove
            </button>

          </div>

          {/* IMAGE */}

          <div className="p-4 sm:p-5">

            <div className="relative overflow-hidden border-2 border-black bg-white">

              <img
                src={preview}
                alt="Selected question"
                className="
                  block
                  max-h-[420px]
                  w-full
                  object-contain
                  sm:max-h-[500px]
                "
              />

              {processing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                  <div className="border-2 border-black bg-(--yellow) px-5 py-4 shadow-[5px_5px_0_var(--black)]">
                    <p className="mono text-[9px] font-bold uppercase tracking-[0.15em]">
                      Analyzing
                    </p>

                    <div className="mt-3 flex gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* FOOTER */}

          <div
            className="
              flex flex-col gap-4
              border-t-2 border-black
              px-5 py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            {file ? (
  <div className="min-w-0">
    <p className="truncate text-sm font-bold">
      {file.name}
    </p>

    <p className="mono mt-1 text-[8px] uppercase tracking-wider text-black/40">
      {(file.size / 1024 / 1024).toFixed(2)} MB
      {" · "}
      Ready to analyze
    </p>
  </div>
) : null}

            <button
              type="button"
              onClick={handleContinue}
              disabled={processing}
              className="
                brutal-border
                group
                flex
                min-w-[150px]
                shrink-0
                items-center
                justify-center
                gap-3
                bg-(--black)
                px-5
                py-3
                text-[10px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-(--cream)
                shadow-[3px_3px_0_var(--coral)]
                transition-all duration-200
                hover:-translate-x-0.5
                hover:-translate-y-0.5
                hover:shadow-[5px_5px_0_var(--coral)]
                active:translate-x-0
                active:translate-y-0
                active:shadow-none
                disabled:cursor-wait
                disabled:opacity-60
              "
            >
              {processing ? (
                <>
                  Analyzing
                  <span className="animate-pulse">
                    ...
                  </span>
                </>
              ) : (
                <>
                  Continue
                  <span className="text-base transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>

          </div>

        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-4 border-2 border-black bg-(--coral) px-4 py-3 shadow-[4px_4px_0_var(--black)]">
          <p className="mono text-[9px] font-bold uppercase tracking-[0.08em]">
            Error: {error}
          </p>
        </div>
      )}

    </div>
  );
}