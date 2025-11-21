import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, Scan, ShoppingCart, Package, Upload, Plus, Minus } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Badge } from '../../../../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { ImageWithFallback } from '../../../../figma/ImageWithFallback';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addToCart, updateCartItem, clearCart } from '../../store/slices/cartSlice';
import { selectCartItems } from '../../store/selectors';
import { getWarehouses, getCatalogItemsByWarehouse, searchItemsByImage } from '../../services';
import type { Warehouse, CatalogItem, AISearchResult } from '../../services';
import { CartSidebar } from '../../CartSidebar';
import { ConfirmModal, useConfirmModal } from '../../../../ui/confirm-modal';
import { handleError, setupConnectionListener } from '../../services/errorHandler';
import type { AppError } from '../../services/errorHandler';

export function Catalog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector(selectCartItems);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentError, setCurrentError] = useState<AppError | null>(null);
  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();

  // Setup connection listener
  useEffect(() => {
    const cleanup = setupConnectionListener(
      () => {
        setIsOnline(true);
        toast.success('Internet connection restored');
      },
      () => {
        setIsOnline(false);
        showConfirm({
          title: 'No Internet Connection',
          description: 'Please check your network connection. The app will retry automatically when connection is restored.',
          type: 'network',
          confirmText: 'OK',
          showCancel: false
        });
      }
    );
    return cleanup;
  }, []);

  // Load warehouses on mount
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const data = await getWarehouses();
        setWarehouses(data);
        if (data.length > 0) {
          setSelectedWarehouse(data[0].id);
        }
      } catch (error: any) {
        const appError = handleError(error);
        setCurrentError(appError);
        showConfirm({
          title: appError.type === 'NETWORK_ERROR' ? 'Connection Error' : 'Error Loading Data',
          description: appError.message,
          type: appError.type === 'NETWORK_ERROR' ? 'network' : 'error',
          confirmText: 'Retry',
          cancelText: 'Cancel',
          retryable: appError.retryable,
          onConfirm: () => {
            hideModal();
            loadWarehouses();
          }
        });
      }
    };
    loadWarehouses();
  }, []);

  // Load items when warehouse changes
  useEffect(() => {
    const loadItems = async () => {
      if (selectedWarehouse) {
        try {
          const data = await getCatalogItemsByWarehouse(selectedWarehouse);
          setCatalogItems(data);
          setFilteredItems(data);
        } catch (error: any) {
          const appError = handleError(error);
          setCurrentError(appError);
          showConfirm({
            title: appError.type === 'NETWORK_ERROR' ? 'Connection Error' : 'Error Loading Items',
            description: appError.message,
            type: appError.type === 'NETWORK_ERROR' ? 'network' : 'error',
            confirmText: 'Retry',
            cancelText: 'Cancel',
            retryable: appError.retryable,
            onConfirm: () => {
              hideModal();
              loadItems();
            }
          });
        }
      }
    };
    loadItems();
  }, [selectedWarehouse]);

  // Filter items by search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = catalogItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(catalogItems);
    }
  }, [searchTerm, catalogItems]);

  const handleAddToCart = (item: CatalogItem, quantity: number) => {
    const existingItem = cartItems.find(ci => ci.item.id === item.id.toString());

    if (existingItem) {
      dispatch(updateCartItem({ itemId: item.id.toString(), quantity: existingItem.quantity + quantity }));
    } else {
      const cartItem = {
        item: {
          id: item.id.toString(),
          name: item.name,
          code: item.sku,
          description: item.description,
          image: item.imageUrl,
          availableQuantity: item.availableQuantity || 0,
          totalQuantity: item.availableQuantity || 0,
          category: item.category
        },
        quantity
      };
      dispatch(addToCart(cartItem));
    }
    toast.success(`${item.name} added to cart`);
  };

  const getItemCartQuantity = (itemId: number): number => {
    const cartItem = cartItems.find(ci => ci.item.id === itemId.toString());
    return cartItem ? cartItem.quantity : 0;
  };

  const handleIncreaseQuantity = (item: CatalogItem) => {
    const currentQty = getItemCartQuantity(item.id);
    if (currentQty < (item.availableQuantity || 0)) {
      handleAddToCart(item, 1);
    }
  };

  const handleDecreaseQuantity = (item: CatalogItem) => {
    const currentQty = getItemCartQuantity(item.id);
    if (currentQty > 0) {
      dispatch(updateCartItem({ itemId: item.id.toString(), quantity: currentQty - 1 }));
      if (currentQty === 1) {
        toast.success(`${item.name} removed from cart`);
      }
    }
  };

  const handleUpdateCartItem = (itemId: string, quantity: number) => {
    dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const onNavigateToRequest = () => {
    navigate('/borrow');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCamera = async () => {
    setCameraOpen(true);
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
    setCameraOpen(false);
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
      showConfirm({
        title: 'AI Search Failed',
        description: appError.message,
        type: appError.type === 'NETWORK_ERROR' ? 'network' : 'error',
        confirmText: 'Retry',
        cancelText: 'Close',
        retryable: appError.retryable,
        onConfirm: () => {
          hideModal();
          processImage(imageData);
        }
      });
    }
  };

  const handleSelectAiResult = (result: AISearchResult) => {
    handleAddToCart(result.item, 1);
    closeCamera();
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <ConfirmModal
        open={modalState.open}
        onOpenChange={setModalOpen}
        title={modalState.title}
        description={modalState.description}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        showCancel={modalState.showCancel}
        retryable={modalState.retryable}
      />
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1>Inventory Catalog</h1>
            <p className="text-muted-foreground">
              Search and select items to borrow
            </p>
          </div>
          <Button
            onClick={() => setCartOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart {totalCartItems > 0 && `(${totalCartItems})`}
          </Button>
        </div>

        {/* Warehouse Selector */}
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Warehouse:</span>
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openCamera} variant="outline" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            AI Camera
          </Button>
        </div>

        {/* Camera Modal */}
        <Dialog open={cameraOpen} onOpenChange={closeCamera}>
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
                    <Button onClick={closeCamera} variant="outline" disabled={isScanning}>
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
                            alt={result.item.name}
                            className="w-full sm:w-24 h-24 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium">{result.item.name}</h4>
                                <p className="text-xs text-muted-foreground">{result.item.sku}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.item.description}</p>
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
                                Available: <span className="font-medium">{result.item.availableQuantity}</span>
                              </span>
                              <Button
                                size="sm"
                                onClick={() => handleSelectAiResult(result)}
                                disabled={(result.item.availableQuantity || 0) === 0}
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

        {/* Cart Sidebar */}
        <CartSidebar
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartItem}
          onClearCart={handleClearCart}
          onProceed={onNavigateToRequest}
        />

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => {
            const cartQty = getItemCartQuantity(item.id);
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    className={`absolute top-2 right-2 ${(item.availableQuantity || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {(item.availableQuantity || 0) > 0 ? 'Available' : 'Out of Stock'}
                  </Badge>
                </div>
                <CardHeader className="p-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.sku}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    <Badge variant="secondary" className="mt-2 inline-block">{item.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm">
                      Available: <span className="font-medium">{item.availableQuantity || 0}</span>
                    </span>
                  </div>

                  {cartQty === 0 ? (
                    <Button
                      onClick={() => handleAddToCart(item, 1)}
                      disabled={(item.availableQuantity || 0) === 0}
                      className="w-full"
                    >
                      {(item.availableQuantity || 0) === 0 ? 'Not Available' : 'Add to Cart'}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 border rounded-md p-1">
                      <Button
                        onClick={() => handleDecreaseQuantity(item)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">{cartQty}</span>
                      <Button
                        onClick={() => handleIncreaseQuantity(item)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={cartQty >= (item.availableQuantity || 0)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No items found in this warehouse
            </p>
          </div>
        )}
      </div>
    </>
  );
}