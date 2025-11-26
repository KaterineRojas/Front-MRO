import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Camera, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: () => void;
  title?: string;
  description?: string;
}

export const PhotoDialog: React.FC<Props> = ({ open, onOpenChange, onCapture, title = 'Take Photo', description = '' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (!open) return;

    const startCamera = async () => {
      try {
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

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setCaptured(null);
      setError(null);
    };
  }, [open]);

  const handleCapture = () => {
    if (!videoRef.current || !cameraActive) return;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCaptured(dataUrl);
      toast.success('Photo captured successfully!');
    } catch (err) {
      toast.error('Failed to capture photo');
    }
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  const handleUsePhoto = () => {
    onCapture();
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
            <div className="w-full h-64 rounded-lg overflow-hidden border border-muted">
              <img src={captured} alt="Captured photo" className="w-full h-full object-contain bg-black" />
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} className="text-black cursor-pointer">
            Cancel
          </Button>
          {!captured ? (
            <Button
              variant="default"
              onClick={handleCapture}
              disabled={!cameraActive || error !== null}
              className="cursor-pointer"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleRetake} className="text-black cursor-pointer">
                Retake
              </Button>
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
