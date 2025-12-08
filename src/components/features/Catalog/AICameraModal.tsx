import React, { useRef, useState, useEffect } from 'react';
import { Camera, Scan, Upload } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner';
import { searchItemsByImage } from './aiSearchService';
import type { AISearchResult } from './aiSearchService';
import type { CatalogItem } from './catalogService';
import { handleError } from '../enginner/services/errorHandler';

interface AICameraModalProps {
  open: boolean;
  onClose: () => void;
  onAddToCart: (item: CatalogItem, quantity: number) => void;
  onError: (error: any) => void;
}

export function AICameraModal({ open, onClose, onAddToCart, onError }: AICameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (open) {
      openCamera();
    } else {
      closeCamera();
    }
  }, [open]);

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      // Don't show error, just allow file upload
      console.log('Camera not available, using file upload only');
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setScanProgress(0);
    setShowAiResults(false);
    setAiResults([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Capture image from video
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
    }
    const imageData = canvas.toDataURL('image/jpeg');

    processImage(imageData);
  };

  const processImage = async (imageData: string) => {
    setIsScanning(true);
    setScanProgress(0);

    toast.info('Processing image with AI...');

    // Simulate AI processing with progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      // Call AI search service
      const response = await searchItemsByImage(imageData);
      clearInterval(interval);
      setScanProgress(100);

      setTimeout(() => {
        setAiResults(response.results);
        setShowAiResults(true);
        setIsScanning(false);
        toast.success(`Found ${response.results.length} matches!`);
      }, 500);
    } catch (error: any) {
      clearInterval(interval);
      setIsScanning(false);
      const appError = handleError(error);
      onError(appError);
    }
  };

  const handleSelectAiResult = (result: AISearchResult) => {
    onAddToCart(result.item, 1);
    onClose();
  };

  const handleClose = () => {
    closeCamera();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>AI Camera Search</DialogTitle>
          <DialogDescription>
            Take a photo of an item to search across all warehouses using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {!showAiResults ? (
            <div className="space-y-4">
              {stream ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-96 bg-black rounded-lg object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <div className="text-center space-y-4">
                        <Scan className="h-16 w-16 text-white mx-auto animate-pulse" />
                        <div className="text-white">
                          <p>AI Processing...</p>
                          <p className="text-sm">{scanProgress}%</p>
                        </div>
                        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                    {isScanning ? (
                      <div className="text-center space-y-4">
                        <Scan className="h-16 w-16 mx-auto animate-pulse text-primary" />
                        <div>
                          <p>AI Processing...</p>
                          <p className="text-sm text-muted-foreground">{scanProgress}%</p>
                        </div>
                        <div className="w-64 h-2 bg-background rounded-full overflow-hidden mx-auto">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Camera not available</p>
                        <p className="text-sm text-muted-foreground">Upload a photo instead</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="bg-accent border border-border rounded-lg p-4">
                <h4 className="text-sm">How AI Camera Works:</h4>
                <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                  <li>Take a photo with camera or upload an image</li>
                  <li>Click "Scan with AI" to analyze the image</li>
                  <li>AI analyzes visual features and identifies equipment type</li>
                  <li>System searches inventory across all warehouses</li>
                  <li>Results show matches from different warehouses with confidence scores</li>
                </ol>
              </div>
              <div className="flex gap-2">
                {stream && (
                  <Button onClick={captureImage} className="flex-1" disabled={isScanning}>
                    <Scan className="h-4 w-4 mr-2" />
                    Scan with AI
                  </Button>
                )}
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant={stream ? "outline" : "default"}
                  className={!stream ? "flex-1" : ""}
                  disabled={isScanning}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button onClick={handleClose} variant="outline" disabled={isScanning}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-2">
                <h3 className="text-lg">AI Search Results</h3>
                <Button variant="outline" size="sm" onClick={() => setShowAiResults(false)}>
                  Scan Again
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {aiResults.map((result, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      <ImageWithFallback
                        src={result.item.imageUrl}
                        alt={result.item.itemName}
                        className="w-full sm:w-24 h-24 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium">{result.item.itemName}</h4>
                            <p className="text-xs text-muted-foreground">{result.item.itemSku}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.item.itemDescription}</p>
                          </div>
                          <div className="flex sm:flex-col gap-2 sm:items-end flex-wrap">
                            <Badge
                              variant={result.confidence > 80 ? 'default' : result.confidence > 60 ? 'secondary' : 'outline'}
                            >
                              {result.confidence}% match
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.item.warehouseName}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm whitespace-nowrap">
                            Available: <span className="font-medium">{result.item.totalQuantity}</span>
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleSelectAiResult(result)}
                            disabled={(result.item.totalQuantity || 0) === 0}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {aiResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No matches found. Try scanning again.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}