'use client';

import { useCallback, useState, type DragEvent } from 'react';
import { Camera, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FileDropzoneProps {
  preview: string | null;
  onFile: (file: File | null) => void;
  className?: string;
}

export function FileDropzone({ preview, onFile, className }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file && file.type.startsWith('image/')) onFile(file);
    },
    [onFile]
  );

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition',
          dragging
            ? 'border-folha bg-folha/5'
            : 'border-folha-muted/40 bg-white hover:border-folha/40 hover:bg-sol/50'
        )}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Pré-visualização da foto"
            className="h-40 w-full rounded-xl object-cover"
          />
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-folha/10 text-folha">
              <ImagePlus className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-tinta">
              Solte a foto aqui ou toque para escolher
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-tinta-faint">
              <Camera className="h-3.5 w-3.5" /> Câmera ou galeria
            </p>
          </>
        )}
      </label>
      {preview && (
        <button
          type="button"
          onClick={() => onFile(null)}
          className="text-xs font-semibold text-laterita hover:underline"
        >
          Remover foto
        </button>
      )}
    </div>
  );
}
