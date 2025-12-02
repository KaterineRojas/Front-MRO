import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, ShoppingCart, Package, Plus, Minus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner';
import { useAppSelector } from '../enginner/store/hooks';
import { addToCart, updateCartItem, clearCart } from '../enginner/store/actions';
import { selectCartItems } from '../enginner/store/selectors';
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
  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();



  // Load warehouses on mount
  useEffect(() => {
    const loadWarehouses = async () => {
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
      }
    };
    loadWarehouses();
  }, []);

  // Load items when warehouse changes
  useEffect(() => {
    const loadItems = async () => {
      if (selectedWarehouse) {
        try {
          const rawData: SharedCatalogItem[] = await getCatalogItemsByWarehouse(selectedWarehouse);
          // Convert from sharedServices format to catalogService format
          const data: CatalogItem[] = rawData.map(item => ({
            itemId: parseInt(item.id),
            itemSku: item.sku,
            itemName: item.name,
            itemDescription: item.description,
            itemCategory: item.category,
            itemUnit: 'units',
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
        }
      }
    };
    loadItems();
  }, [selectedWarehouse]);

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

    if (existingItem) {
      dispatch(updateCartItem({ itemId: item.itemId.toString(), quantity: existingItem.quantity + quantity }));
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
        quantity
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
    if (currentQty < (item.totalQuantity || 0)) {
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
    navigate('/borrow');
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
          <Button onClick={() => setCameraOpen(true)} variant="outline" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            AI Camera
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
        />

        {/* Items Grid */}
        <div className="
  grid
  grid-cols-1
  sm:grid-cols-3
  md:grid-cols-5
  lg:grid-cols-5
  xl:grid-cols-6
  2xl:grid-cols-6
  gap-4
">
          {filteredItems.map((item) => {
            const cartQty = getItemCartQuantity(item.itemId);
            return (
              <div key={item.itemId} className="h-full">
                <Card className="overflow-hidden h-full">


                  <div className="aspect-square relative">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${(item.totalQuantity || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {(item.totalQuantity || 0) > 0 ? 'Available' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <CardHeader className="p-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{item.itemName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.itemSku}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.itemDescription}</p>
                      <Badge variant="secondary" className="mt-2 inline-block">{item.itemCategory}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm">
                        Available: <span className="font-medium">{item.totalQuantity || 0}</span>
                      </span>
                    </div>

                    {cartQty === 0 ? (
                      <Button
                        onClick={() => handleAddToCart(item, 1)}
                        disabled={(item.totalQuantity || 0) === 0}
                        className="w-full"
                      >
                        {(item.totalQuantity || 0) === 0 ? 'Not Available' : 'Add to Cart'}
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
                          disabled={cartQty >= (item.totalQuantity || 0)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {
          filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No items found in this warehouse
              </p>
            </div>
          )
        }
      </div>
    </>
  );
}
