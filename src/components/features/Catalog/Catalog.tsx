import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, ShoppingCart, Package, Plus, Minus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

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

const styles: { [key: string]: React.CSSProperties } = {
container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
    },

   header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '24px'
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '4px'
    },

   subtitle: {
        fontSize: '0.875rem',
        color: '#6b7280' // muted-foreground
    },
    warehouseSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px'
    },
   searchBar: {
        display: 'flex',
        gap: '8px',
        marginBottom: '24px'
    },
    searchInputContainer: {
        position: 'relative',
        flexGrow: 1
    },

    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '16px',
        width: '16px',
        color: '#6b7280'
    },

   inputStyle: {
        paddingLeft: '40px'
    },
    // Grid para las tarjetas - USANDO CSS GRID PURO
    itemsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', // Responsivo: mínimo 180px por columna
        gap: '16px'
    },

    // Estilos para cada tarjeta de producto

    cardWrapper: {
        height: '100%'
    },
    card: {
        // Tipificación para corregir el error de TypeScript
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid #e5e7eb', // border
        borderRadius: '8px', // rounded-md
    } as React.CSSProperties, // <--- Tipo agregado aquí para resolver el error TS

imageContainer: {
        position: 'relative',
        width: '100%',
        // AJUSTE CLAVE: Hacer el contenedor CUADRADO (1:1)
        aspectRatio: '1 / 1', 
        // Reducir el padding general para darle más espacio al contenido
        padding: '8px', 
        boxSizing: 'border-box',
        // Reducir padding inferior para acercar al título
        paddingBottom: '0px' // Ensure no extra space below the image
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'contain'
    },
badgeAvailable: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        padding: '4px 8px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: '#d1fae5', // green-100
        color: '#065f46' // green-800
    },
badgeOutOfStock: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        padding: '4px 8px', // Aumento de padding
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: '#fee2e2', // red-100
        color: '#991b1b' // red-800
    },

    cardHeader: {
        padding: '12px',
        // Ajustado para acercar al contenedor de imagen (padding: 4px)
        paddingTop: '0px', // Remove space above itemName
        paddingBottom: '0px' // Remove space below itemName
    },
    cardTitle: {
        fontSize: '0.875rem',
        fontWeight: '600',
        lineHeight: '1.25',
        marginBottom: '4px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        minHeight: '32px' // Para evitar saltos si el título es de una o dos líneas
    },

    cardDescription: {
        fontSize: '0.75rem',
        color: '#6b7280', // muted-foreground
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        // Reducir margen inferior para acercar a la Categoría/Unidad
        marginBottom: '0px' // Remove space below description
    },
    cardContent: {
        padding: '12px',
        paddingTop: '0'
    },

    priceUnitContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        // Reducido de 12px a 8px para compactar antes del botón
        marginBottom: '8px',
        marginTop: '0px' // Ensure no extra space above category/unit
    },
    categoryText: {
        color: '#6b7280', // muted-foreground
        fontWeight: 'bold',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    unitText: {
        fontWeight: 'bold',
        fontSize: '0.875rem',
        color: '#16a34a' // primary color similar
    },cartControls: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px'
    },
    quantityDisplay: {
        fontSize: '0.875rem',
        fontWeight: '500',
        width: '32px',
        textAlign: 'center'
    }
};

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
            warehouseName: selectedWarehouseObj?.name || ''
          };
          dispatch(addToCart(cartItem));
          toast.success(`${item.itemName} added to cart`);
        }
      });
      return;
    }

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
        quantity,
        warehouseId: selectedWarehouse,
        warehouseName: selectedWarehouseObj?.name || ''
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
    setCartOpen(false);
    sessionStorage.setItem('openBorrowForm', 'true');
    navigate('/engineer/requests');
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
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Inventory Catalog</h1>
            <p style={styles.subtitle}>
              Search and select items to borrow
            </p>
          </div>
          <Button
            onClick={() => setCartOpen(true)}
            variant="outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ShoppingCart className="h-4 w-4" />
            Cart {totalCartItems > 0 && `(${totalCartItems})`}
          </Button>
        </div>

        {/* Warehouse Selector */}
        <div style={styles.warehouseSelector}>
          <Package className="h-4 w-4" style={{ color: '#6b7280' }} />
          <span style={{ fontSize: '0.875rem' }}>Warehouse:</span>
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger style={{ width: '200px' }}>
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
        <div style={styles.searchBar}>
          <div style={styles.searchInputContainer}>
            <Search style={styles.searchIcon} />
            <Input
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.inputStyle}
            />
          </div>
          <Button onClick={() => setCameraOpen(true)} variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

        {/* Items Grid - APLICANDO ESTILOS EN LÍNEA */}
        <div style={styles.itemsGrid}>
          {filteredItems.map((item) => {
            const cartQty = getItemCartQuantity(item.itemId);
            const totalQty = item.totalQuantity || 0;
            const isAvailable = totalQty > 0;
            const badgeStyle = isAvailable ? styles.badgeAvailable : styles.badgeOutOfStock;

            return (
              <div key={item.itemId} style={styles.cardWrapper}>
                <Card style={styles.card}>

                  {/* Imagen y Badge de Disponibilidad */}
                  <div style={styles.imageContainer}>
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.itemName}
                      style={styles.image}
                    />
                    {/* CÓDIGO MODIFICADO AQUÍ ⬇️ */}
                    <div style={badgeStyle}>
                      {isAvailable ? `Available: ${totalQty}` : 'Out of Stock'}
                    </div>
                    {/* CÓDIGO MODIFICADO AQUÍ ⬆️ */}
                  </div>

                  {/* Contenido de la Tarjeta - Nombres y Nuevos Mapeos */}
                  <CardHeader style={{ ...styles.cardHeader, paddingTop: '0', marginTop: '0' }}>
                    <div>
                      <CardTitle style={styles.cardTitle}>
                        {item.itemName}
                      </CardTitle>
                      {/* DESCRIPCIÓN */}
                      <p style={styles.cardDescription}>
                        {item.itemDescription || item.itemSku}
                      </p>
                    </div>
                  </CardHeader>

                  {/* Mapeos de Categoria/Unidad y Controles de Carrito */}
                  <CardContent style={styles.cardContent}>
                    {/* Categoria y Unidad (como Precio Original y Final) */}
                    <div style={styles.priceUnitContainer}>
                      <span style={styles.categoryText} title={item.itemCategory}>
                        **{item.itemCategory}**
                      </span>
                      <span style={styles.unitText} title={item.itemUnit}>
                        {item.itemUnit}
                      </span>
                    </div>

                    {/* CANTIDAD DISPONIBLE: ELIMINADA AQUÍ */}
                    {/* Antes estaba:
                                        <div style={styles.availableText}>
                                            <span>
                                                Available: <span style={styles.availableQuantity}>{item.totalQuantity || 0}</span>
                                            </span>
                                        </div>
                                        */}

                    {/* Controles de Carrito */}
                    {cartQty === 0 ? (
                      <Button
                        onClick={() => handleAddToCart(item, 1)}
                        disabled={!isAvailable}
                        style={{ width: '100%', height: '32px', fontSize: '0.875rem' }}
                      >
                        {!isAvailable ? 'Not Available' : 'Add to Cart'}
                      </Button>
                    ) : (
                      <div style={styles.cartControls}>
                        <Button
                          onClick={() => handleDecreaseQuantity(item)}
                          variant="ghost"
                          size="sm"
                          style={{ height: '28px', width: '28px', padding: '0' }}
                        >
                          <Minus style={{ height: '16px', width: '16px' }} />
                        </Button>
                        <span style={styles.quantityDisplay}>{cartQty}</span>
                        <Button
                          onClick={() => handleIncreaseQuantity(item)}
                          variant="ghost"
                          size="sm"
                          style={{ height: '28px', width: '28px', padding: '0' }}
                          disabled={cartQty >= totalQty}
                        >
                          <Plus style={{ height: '16px', width: '16px' }} />
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
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={styles.subtitle}>
                No items found in this warehouse
              </p>
            </div>
          )
        }
      </div>
    </>
  );
}