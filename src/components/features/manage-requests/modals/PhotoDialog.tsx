import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Camera, X, Upload } from 'lucide-react'; // Importar 'Upload'
import { toast } from 'react-hot-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageDataUrl: string) => void; // Modificar para recibir la URL de la imagen
  title?: string;
  description?: string;
}

export const PhotoDialog: React.FC<Props> = ({ open, onOpenChange, onCapture, title = 'Take Photo', description = '' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Referencia al input de archivo
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isPhotoSelected, setIsPhotoSelected] = useState(false); // Nuevo estado para rastrear si es de la cámara o de la galería

  // --- Lógica de la Cámara (Mantenida) ---

  useEffect(() => {
    if (!open) return;

    // Solo iniciar la cámara si no se ha capturado o seleccionado una foto todavía
    if (!captured) {
        const startCamera = async () => {
            try {
                // ... (Lógica para obtener la cámara)
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false,
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setCameraActive(true);
                }
                setError(null);
            } catch (err: any) {
                const errorMsg = err?.message || 'Unable to access camera. Please check permissions.';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        };

        startCamera();
    }

    return () => {
      // ... (Lógica para detener la cámara)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setCaptured(null);
      setError(null);
      setIsPhotoSelected(false);
    };
  }, [open]);

  const handleCapture = () => {
    if (!videoRef.current || !cameraActive) return;
    try {
      // ... (Lógica para capturar de la cámara)
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      setCaptured(dataUrl);
      setIsPhotoSelected(false); // Es una foto capturada
      
      // Detener la cámara para ahorrar batería
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);

      toast.success('Photo captured successfully!');
    } catch (err) {
      toast.error('Failed to capture photo');
    }
  };
  
  // --- Nueva Lógica de Selección de Archivo ---
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed.');
        return;
      }

      // Detener la cámara si está activa
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setCameraActive(false);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCaptured(reader.result as string);
        setIsPhotoSelected(true); // Es una foto seleccionada
        toast.success('Photo selected successfully!');
      };
      reader.readAsDataURL(file);
    }
    // Restablecer el valor del input para que el mismo archivo pueda ser seleccionado de nuevo
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const handleUploadClick = () => {
    // Simular clic en el input de tipo 'file' oculto
    fileInputRef.current?.click();
  };

  // --- Lógica Común ---

  const handleRetake = () => {
    setCaptured(null);
    setIsPhotoSelected(false);
    // Vuelve a abrir la cámara para 'Retake'
    onOpenChange(true); 
  };

  const handleUsePhoto = () => {
    if (captured) {
        onCapture(captured); // Pasar la URL de la imagen
    }
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          {!captured && (
            // Contenedor para la vista previa de la cámara/estado
            <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center overflow-hidden relative">
              {error ? (
                <div className="text-center text-sm text-red-500 px-4">{error}</div>
              ) : cameraActive ? (
                <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Accessing camera...</p>
                </div>
              )}
            </div>
          )}

          {captured && (
            // Contenedor para la imagen capturada/seleccionada
            <div className="w-full h-64 rounded-lg overflow-hidden border border-muted">
              <img src={captured} alt="Captured or selected photo" className="w-full h-full object-contain bg-black" />
            </div>
          )}

          {/* Input de archivo oculto */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <DialogFooter className="flex gap-2">
          {/* Botón de Cancelar/Cerrar */}
          <Button variant="outline" onClick={handleClose} className="text-black cursor-pointer">
            Cancel
          </Button>

          {/* Opciones antes de Capturar/Seleccionar */}
          {!captured && (
            <>
              {/* Botón para Abrir la Galería */}
              <Button
                variant="outline"
                onClick={handleUploadClick}
                className="cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Photo
              </Button>
              {/* Botón para Capturar (Cámara) */}
              <Button
                variant="default"
                onClick={handleCapture}
                className="cursor-pointer"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            </>
          )}

          {/* Opciones después de Capturar/Seleccionar */}
          {captured && (
            <>
              {/* Botón para Retomar/Seleccionar de Nuevo */}
              <Button variant="outline" onClick={handleRetake} className="text-black cursor-pointer">
                {isPhotoSelected ? 'Select Again' : 'Retake'}
              </Button>
              {/* Botón para Usar la Foto */}
              <Button variant="default" onClick={handleUsePhoto} className="cursor-pointer">
                Use Photo
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoDialog;