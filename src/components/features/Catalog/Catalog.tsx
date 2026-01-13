import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, ShoppingCart, Package, Plus, Minus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner';
import { useAppSelector } from '../requests/store/hooks';
import { addToCart, updateCartItem, clearCart } from '../requests/store/actions';
import { selectCartItems } from '../requests/store/selectors';
import { getCatalogItemsByWarehouse } from '../requests/services/sharedServices';
import { getWarehouses } from '../requests/services/sharedServices';
import type { Warehouse } from '../requests/services/sharedServices';
import type { CatalogItem } from './catalogService';
import type { CatalogItem as SharedCatalogItem } from '../requests/services/sharedServices';
import { CartSidebar } from './CartSidebar';
import { ConfirmModal, useConfirmModal } from '../../ui/confirm-modal';
import { handleError } from '../enginner/services/errorHandler';
import type { AppError } from '../enginner/services/errorHandler';
import { useAppDispatch } from '../../../store';
import { AICameraModal } from './AICameraModal';
import { CatalogSkeleton, CatalogHeaderSkeleton } from './CatalogSkeleton';
import { cn } from '../../ui/utils';

const FALLBACK_IMAGE_SRC = `${import.meta.env.BASE_URL}images/items.png`;

type RequestType = 'borrow' | 'purchase';

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
  const [cartOpen, setCartOpen] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>('borrow');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();

  // Load warehouses on mount
  useEffect(() => {
    const savedRequestType = sessionStorage.getItem('catalogRequestType') as RequestType | null;
    if (savedRequestType === 'borrow' || savedRequestType === 'purchase') {
      setRequestType(savedRequestType);
    }

    const loadWarehouses = async () => {
      setIsLoadingWarehouses(true);
      try {
        const data = await getWarehouses();
        setWarehouses(data as Warehouse[]);
        if (data.length > 0) {
          setSelectedWarehouse(data[0].id);
        }
      } catch (error: any) {
        const appError = handleError(error);
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
      } finally {
        setIsLoadingWarehouses(false);
      }
    };
    loadWarehouses();
  }, []);

  // Load items when warehouse changes
  useEffect(() => {
    const loadItems = async () => {
      if (selectedWarehouse) {
        setIsLoading(true);
        try {
          const includeOutOfStock = requestType === 'purchase';
          const rawData: SharedCatalogItem[] = await getCatalogItemsByWarehouse(selectedWarehouse, includeOutOfStock);
          // Convert from sharedServices format to catalogService format
          const data: CatalogItem[] = rawData.map(item => ({
            itemId: parseInt(item.id),
            itemSku: item.sku,
            itemName: item.name,
            itemDescription: item.description,
            itemCategory: item.category,
            itemUnit: 'units', // Manteniendo el valor 'units' del código original.
            isActive: true,
            consumible: false,
            imageUrl: item.image,
            totalQuantity: item.availableQuantity,
            warehouseId: item.warehouseId,
            warehouseName: item.warehouseName
          }));
          setCatalogItems(data);
          setFilteredItems(data);
        } catch (error: any) {
          const appError = handleError(error);
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
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadItems();
  }, [selectedWarehouse, requestType]);

  // Filter items by search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = catalogItems.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(catalogItems);
    }
  }, [searchTerm, catalogItems]);

  const handleAddToCart = (item: CatalogItem, quantity: number) => {
    const existingItem = cartItems.find(ci => ci.item.id === item.itemId.toString());
    const selectedWarehouseObj = warehouses.find(w => w.id === selectedWarehouse);
    
    // Validar que no haya items de otro warehouse en el carrito
    const cartHasDifferentWarehouse = cartItems.length > 0 && 
      cartItems[0].warehouseName && 
      cartItems[0].warehouseId !== selectedWarehouse;
    
    if (cartHasDifferentWarehouse) {
      showConfirm({
        title: 'Different Warehouse',
        description: `Your cart contains items from "${cartItems[0].warehouseName}". Adding items from a different warehouse will clear your cart. Continue?`,
        type: 'warning',
        confirmText: 'Clear & Continue',
        cancelText: 'Cancel',
        showCancel: true,
        onConfirm: () => {
          hideModal();
          dispatch(clearCart());
          // Add the new item after clearing
          const cartItem = {
            item: {
              id: item.itemId.toString(),
              name: item.itemName,
              code: item.itemSku,
              description: item.itemDescription,
              image: item.imageUrl,
              availableQuantity: item.totalQuantity || 0,
              totalQuantity: item.totalQuantity || 0,
              category: item.itemCategory
            },
            quantity,
            warehouseId: selectedWarehouse,
            warehouseName: selectedWarehouseObj?.name || '',
            skipStockValidation: requestType === 'purchase'
          };
          dispatch(addToCart(cartItem));
          toast.success(`${item.itemName} added to cart`);
        }
      });
      return;
    }

    if (existingItem) {
      dispatch(updateCartItem({ itemId: item.itemId.toString(), quantity: existingItem.quantity + quantity, skipStockValidation: requestType === 'purchase' }));
    } else {
      const cartItem = {
        item: {
          id: item.itemId.toString(),
          name: item.itemName,
          code: item.itemSku,
          description: item.itemDescription,
          image: item.imageUrl,
          availableQuantity: item.totalQuantity || 0,
          totalQuantity: item.totalQuantity || 0,
          category: item.itemCategory
        },
        quantity,
        warehouseId: selectedWarehouse,
        warehouseName: selectedWarehouseObj?.name || '',
        skipStockValidation: requestType === 'purchase'
      };
      dispatch(addToCart(cartItem));
    }
    toast.success(`${item.itemName} added to cart`);
  };

  const getItemCartQuantity = (itemId: number): number => {
    const cartItem = cartItems.find(ci => ci.item.id === itemId.toString());
    return cartItem ? cartItem.quantity : 0;
  };

  const handleIncreaseQuantity = (item: CatalogItem) => {
    const currentQty = getItemCartQuantity(item.itemId);
    // Allow unlimited quantity for purchase requests
    if (requestType === 'purchase' || currentQty < (item.totalQuantity || 0)) {
      handleAddToCart(item, 1);
    }
  };

  const handleDecreaseQuantity = (item: CatalogItem) => {
    const currentQty = getItemCartQuantity(item.itemId);
    if (currentQty > 0) {
      dispatch(updateCartItem({ itemId: item.itemId.toString(), quantity: currentQty - 1 }));
      if (currentQty === 1) {
        toast.success(`${item.itemName} removed from cart`);
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
    setCartOpen(false);

    if (requestType === 'purchase') {
      sessionStorage.setItem('catalogRequestType', 'purchase');
      sessionStorage.setItem('engineerRequestActiveTab', 'purchase');
      sessionStorage.setItem('openPurchaseForm', 'true');
      sessionStorage.removeItem('openBorrowForm');
      sessionStorage.setItem('purchaseCartSnapshot', JSON.stringify({
        items: cartItems,
        warehouseId: selectedWarehouse,
      }));
      navigate('/engineer/requests?tab=purchase');
      return;
    }

    sessionStorage.setItem('catalogRequestType', 'borrow');
    sessionStorage.setItem('engineerRequestActiveTab', 'borrow');
    sessionStorage.setItem('openBorrowForm', 'true');
    sessionStorage.removeItem('openPurchaseForm');
    navigate('/engineer/requests?tab=borrow');
  };

  const handleAICameraError = (error: AppError) => {
    showConfirm({
      title: 'AI Search Failed',
      description: error.message,
      type: error.type === 'NETWORK_ERROR' ? 'network' : 'error',
      confirmText: 'Retry',
      cancelText: 'Close',
      retryable: error.retryable,
      onConfirm: () => {
        hideModal();
      }
    });
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
      
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="sticky top-0 z-10 -mx-4 flex items-start justify-between bg-background/95 px-4 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:-mx-6 md:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory Catalog</h1>
            <p className="text-sm text-muted-foreground">
              Search and select items to {requestType === 'purchase' ? 'purchase' : 'borrow'}
            </p>
          </div>
          <Button
            onClick={() => setCartOpen(true)}
            variant="outline"
            className="relative flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalCartItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {totalCartItems}
              </span>
            )}
          </Button>
        </div>

        {/* Warehouse Selector */}
        {isLoadingWarehouses ? (
          <CatalogHeaderSkeleton />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Warehouse:</span>
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Request type:</span>
              <Select
                value={requestType}
                onValueChange={(value: string) => {
                  const next = value as RequestType;
                  setRequestType(next);
                  sessionStorage.setItem('catalogRequestType', next);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrow">Borrow</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => setCameraOpen(true)} 
            variant="outline" 
            className="flex items-center gap-2 opacity-50 cursor-not-allowed"
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">AI Camera</span>
          </Button>
        </div>

        {/* AI Camera Modal */}
        <AICameraModal
          open={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onAddToCart={handleAddToCart}
          onError={handleAICameraError}
        />

        {/* Cart Sidebar */}
        <CartSidebar
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartItem}
          onClearCart={handleClearCart}
          onProceed={onNavigateToRequest}
          requestType={requestType}
        />

        {/* Items Grid */}
        {isLoading ? (
          <CatalogSkeleton count={12} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredItems.map((item) => {
              const cartQty = getItemCartQuantity(item.itemId);
              const totalQty = item.totalQuantity || 0;
              const isAvailable = totalQty > 0;
              const hasImage = Boolean(item.imageUrl);
              const imageSrc = hasImage ? item.imageUrl : FALLBACK_IMAGE_SRC;

              return (
                <Card 
                  key={item.itemId} 
                  className={cn(
                    "group h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50",
                    cartQty > 0 && "ring-1 ring-gray-300 ring-offset-1"
                  )}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-50 p-2">
                    <ImageWithFallback
                      src={imageSrc}
                      alt={item.itemName}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    {!hasImage && (
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-black/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Image for reference only
                      </span>
                    )}
                    {/* Availability Badge */}
                    <div
                      className={cn(
                        "absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-semibold",
                        isAvailable 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {isAvailable ? `Avail: ${totalQty}` : 'Out of Stock'}
                    </div>
                    {/* Cart indicator */}
                    {cartQty > 0 && (
                      <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                        {cartQty}
                      </div>
                    )}
                  </div>

                  {/* Card Header */}
                  <CardHeader className="px-3 py-1 pb-0">
                    <CardTitle className="line-clamp-2 min-h-[2rem] text-sm font-semibold leading-snug">
                      {item.itemName}
                    </CardTitle>
                    <p className="line-clamp-1 text-xs text-muted-foreground mt-0.5">
                      {item.itemDescription || item.itemSku}
                    </p>
                  </CardHeader>

                  {/* Card Content */}
                  <CardContent className="px-3 py-2 pt-1">
                    {/* Category and Unit */}
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="truncate font-medium text-muted-foreground" title={item.itemCategory}>
                        {item.itemCategory}
                      </span>
                      <span className="font-bold text-green-600" title={item.itemUnit}>
                        {item.itemUnit}
                      </span>
                    </div>

                    {/* Cart Controls */}
                    {cartQty === 0 ? (
                      <Button
                        onClick={() => handleAddToCart(item, 1)}
                        disabled={!isAvailable && requestType !== 'purchase'}
                        className="h-9 w-full text-sm transition-all hover:scale-[1.02]"
                        size="sm"
                      >
                        {!isAvailable && requestType !== 'purchase' ? 'Not Available' : 'Add to Cart'}
                      </Button>
                    ) : (
                      <div className="flex h-9 items-center justify-center gap-1 rounded-md border border-input bg-background">
                        <Button
                          onClick={() => handleDecreaseQuantity(item)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {cartQty}
                        </span>
                        <Button
                          onClick={() => handleIncreaseQuantity(item)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                          disabled={requestType !== 'purchase' && cartQty >= totalQty}
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
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No items found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm 
                ? `No items match "${searchTerm}" in this warehouse` 
                : 'No items available in this warehouse'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}