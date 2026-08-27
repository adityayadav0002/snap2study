"use client";

import { useRef, useState } from "react";

type UploadBoxProps = {
  onImageSelected?: (file: File) => void;
};

export default function UploadBox({
  onImageSelected,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const selectFile = (selectedFile: File) => {
    setError("");

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imageUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreview(imageUrl);

    onImageSelected?.(selectedFile);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      selectFile(selectedFile);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      selectFile(droppedFile);
    }
  };

  const removeFile = () => {
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

  const handleContinue = () => {
    if (!file) return;

    setProcessing(true);

    /*
      OCR functionality will be connected here later.

      Future flow:

      Image
        ↓
      OCR
        ↓
      Extracted Question
        ↓
      Study Workspace
    */

    setTimeout(() => {
      setProcessing(false);
      console.log("Ready for OCR:", file);
    }, 1200);
  };

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
        /* =====================================
           EMPTY STATE
        ===================================== */

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => {
            setDragging(false);
          }}
          onDrop={handleDrop}
          className={`
            group
            relative
            cursor-pointer
            border-2
            border-dashed
            border-black
            p-8
            transition-all
            duration-200
            sm:p-10
            ${
              dragging
                ? "bg-(--yellow) shadow-[6px_6px_0_var(--black)] -translate-x-1 -translate-y-1"
                : "bg-(--paper) hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--black)]"
            }
          `}
        >

          {/* Corner number */}

          <div
            className="
              mono
              absolute
              right-4
              top-4
              text-[9px]
              font-bold
              tracking-wider
              text-black/40
            "
          >
            IMG / 01
          </div>


          {/* Icon */}

          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              border-2
              border-black
              bg-(--yellow)
              text-3xl
              transition-transform
              duration-200
              group-hover:rotate-3
            "
          >
            +
          </div>


          {/* Text */}

          <div className="mt-7 text-center">

            <h3 className="serif text-3xl">
              Drop your question.
            </h3>

            <p className="mt-2 text-sm text-black/55">
              Upload an image or drag it here
            </p>

          </div>


          {/* Bottom metadata */}

          <div
            className="
              mono
              mt-8
              flex
              flex-wrap
              justify-center
              gap-x-5
              gap-y-2
              text-[9px]
              uppercase
              tracking-wider
              text-black/45
            "
          >
            <span>JPG</span>
            <span>PNG</span>
            <span>WEBP</span>
            <span>MAX 10MB</span>
          </div>

        </div>
      ) : (
        /* =====================================
           PREVIEW STATE
        ===================================== */

        <div
          className="
            border-2
            border-black
            bg-(--paper)
            shadow-[6px_6px_0_var(--black)]
          "
        >

          {/* Header */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b-2
              border-black
              px-5
              py-4
            "
          >

            <div
              className="
                mono
                text-[9px]
                font-bold
                uppercase
                tracking-wider
              "
            >
              QUESTION / PREVIEW
            </div>

            <button
              onClick={removeFile}
              className="
                mono
                text-[9px]
                uppercase
                tracking-wider
                underline
                underline-offset-4
                transition-opacity
                hover:opacity-50
              "
            >
              Remove
            </button>

          </div>


          {/* Image */}

          <div className="p-4">

            <div className="relative overflow-hidden border-2 border-black">

              <img
                src={preview}
                alt="Selected question"
                className="
                  block
                  max-h-80
                  w-full
                  object-contain
                  bg-white
                "
              />

            </div>

          </div>


          {/* File information */}

          <div
            className="
              flex
              flex-col
              gap-2
              border-t-2
              border-black
              px-5
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <p className="truncate text-sm font-bold">
                {file?.name}
              </p>

              <p className="mono mt-1 text-[9px] text-black/45">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : ""}
              </p>

            </div>


            <button
              onClick={handleContinue}
              disabled={processing}
              className="
                brutal-border
                flex
                items-center
                justify-center
                gap-3
                bg-(--black)
                px-5
                py-3
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-(--cream)
                transition-all
                duration-200
                hover:-translate-x-0.5
                hover:-translate-y-0.5
                hover:shadow-[4px_4px_0_var(--coral)]
                disabled:cursor-wait
                disabled:opacity-60
              "
            >

              {processing ? (
                <>
                  Reading
                  <span className="animate-pulse">
                    ...
                  </span>
                </>
              ) : (
                <>
                  Continue
                  <span>→</span>
                </>
              )}

            </button>

          </div>

        </div>
      )}


      {/* Error */}

      {error && (
        <p
          className="
            mono
            mt-3
            text-[10px]
            uppercase
            tracking-wide
            text-(--coral)
          "
        >
          Error: {error}
        </p>
      )}

    </div>
  );
}