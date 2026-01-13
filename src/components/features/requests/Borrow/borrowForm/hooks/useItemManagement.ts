import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { updateCartItem, removeFromCart } from '../../../store/slices/cartSlice';
import type { CartItem } from '../../../../enginner/types';
import type { LoanFormData, LoanItem, CatalogItem, ItemSearches, FilteredItems, DropdownState } from '../types';
import { createDefaultLoanItem, recomputeFilteredItems } from '../utils';

interface UseItemManagementProps {
  formData: LoanFormData;
  setFormData: React.Dispatch<React.SetStateAction<LoanFormData>>;
  catalogItems: CatalogItem[];
  cartItems: CartItem[];
  cartItemsCount: number;
}

interface UseItemManagementReturn {
  itemSearches: ItemSearches;
  setItemSearches: React.Dispatch<React.SetStateAction<ItemSearches>>;
  filteredItems: FilteredItems;
  setFilteredItems: React.Dispatch<React.SetStateAction<FilteredItems>>;
  dropdownOpen: DropdownState;
  setDropdownOpen: React.Dispatch<React.SetStateAction<DropdownState>>;
  dropdownRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  itemsContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  handleItemSearch: (index: number, value: string) => void;
  selectItem: (index: number, item: CatalogItem) => void;
  toggleDropdown: (index: number) => void;
  addNewItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: string, value: any) => void;
  validateStock: (itemId: string, quantity: number) => boolean;
}

/**
 * Hook for managing item selection and manipulation in the loan form
 */
export function useItemManagement({
  formData,
  setFormData,
  catalogItems,
  cartItems,
  cartItemsCount,
}: UseItemManagementProps): UseItemManagementReturn {
  const dispatch = useDispatch();

  const [itemSearches, setItemSearches] = useState<ItemSearches>(() => {
    const searches: ItemSearches = {};
    cartItems.forEach((item, index) => {
      searches[index] = item.item.name;
    });
    return searches;
  });

  const [filteredItems, setFilteredItems] = useState<FilteredItems>({});
  const [dropdownOpen, setDropdownOpen] = useState<DropdownState>({});

  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownOpen).forEach((key) => {
        const index = parseInt(key);
        if (
          dropdownOpen[index] &&
          dropdownRefs.current[index] &&
          !dropdownRefs.current[index]?.contains(event.target as Node)
        ) {
          setDropdownOpen((prev) => ({ ...prev, [index]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Update filtered items when catalog items change
  useEffect(() => {
    if (catalogItems.length > 0) {
      const newFiltered = recomputeFilteredItems(formData.items, catalogItems);
      setFilteredItems(newFiltered);
    }
  }, [catalogItems, formData.items]);

  const handleItemSearch = useCallback(
    (index: number, value: string) => {
      if (!formData.warehouseId) {
        toast.error('Select a warehouse first.');
        return;
      }

      const selectedItemIds = formData.items
        .map((i) => i.itemId)
        .filter((id) => id !== '');

      setItemSearches((prev) => ({ ...prev, [index]: value }));

      if (value.length >= 2) {
        const filtered = catalogItems
          .filter(
            (item) =>
              item.name.toLowerCase().includes(value.toLowerCase()) ||
              item.description.toLowerCase().includes(value.toLowerCase())
          )
          .filter((item) => !selectedItemIds.includes(item.id));
        setFilteredItems((prev) => ({ ...prev, [index]: filtered }));
      } else {
        const allAvailable = catalogItems.filter(
          (item) => !selectedItemIds.includes(item.id)
        );
        setFilteredItems((prev) => ({ ...prev, [index]: allAvailable }));
      }

      setDropdownOpen((prev) => ({ ...prev, [index]: true }));
    },
    [formData.warehouseId, formData.items, catalogItems]
  );

  const selectItem = useCallback(
    (index: number, item: CatalogItem) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((it, idx) =>
          idx === index ? { ...it, itemId: item.id, itemName: item.name } : it
        ),
      }));

      setItemSearches((prev) => ({ ...prev, [index]: item.name }));
      setDropdownOpen((prev) => ({ ...prev, [index]: false }));
    },
    [setFormData]
  );

  const toggleDropdown = useCallback(
    (index: number) => {
      if (!formData.warehouseId) {
        toast.error('Select a warehouse first.');
        return;
      }

      const currentItem = formData.items[index];
      if (currentItem.itemId) {
        setDropdownOpen((prev) => ({ ...prev, [index]: !prev[index] }));
      } else {
        if (!filteredItems[index]) {
          const selectedIds = formData.items
            .map((i) => i.itemId)
            .filter((id) => id !== '');
          const filtered = catalogItems.filter(
            (ci) => !selectedIds.includes(ci.id)
          );
          setFilteredItems((prev) => ({ ...prev, [index]: filtered }));
        }
        setDropdownOpen((prev) => ({ ...prev, [index]: true }));
      }
    },
    [formData.warehouseId, formData.items, filteredItems, catalogItems]
  );

  const addNewItem = useCallback(() => {
    const newIndex = formData.items.length;
    
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createDefaultLoanItem()],
    }));
    
    setItemSearches((prev) => ({ ...prev, [newIndex]: '' }));
    setDropdownOpen((prev) => ({ ...prev, [newIndex]: false }));

    // Scroll to new item after render
    setTimeout(() => {
      if (itemsContainerRef.current) {
        itemsContainerRef.current.scrollTop =
          itemsContainerRef.current.scrollHeight;
      }
    }, 0);
  }, [formData.items.length, setFormData]);

  const removeItem = useCallback(
    (index: number) => {
      // Sync with Redux cart if this is a cart item
      if (index < cartItemsCount) {
        const cartItem = cartItems[index];
        if (cartItem) {
          dispatch(removeFromCart(cartItem.item.id));
        }
      }

      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));

      setItemSearches((prev) => {
        const newSearches = { ...prev };
        delete newSearches[index];
        return newSearches;
      });

      setFilteredItems((prev) => {
        const newFiltered = { ...prev };
        delete newFiltered[index];
        return newFiltered;
      });
    },
    [cartItemsCount, cartItems, dispatch, setFormData]
  );

  const updateItem = useCallback(
    (index: number, field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      }));

      // Sync with Redux cart if this is a cart item
      if (index < cartItemsCount && field === 'quantity') {
        const cartItem = cartItems[index];
        if (cartItem) {
          dispatch(
            updateCartItem({
              itemId: cartItem.item.id,
              quantity: value,
            })
          );
        }
      }
    },
    [cartItemsCount, cartItems, dispatch, setFormData]
  );

  const validateStock = useCallback(
    (itemId: string, quantity: number): boolean => {
      const item = catalogItems.find((i) => i.id === itemId);
      return item ? quantity <= item.availableQuantity : false;
    },
    [catalogItems]
  );

  return {
    itemSearches,
    setItemSearches,
    filteredItems,
    setFilteredItems,
    dropdownOpen,
    setDropdownOpen,
    dropdownRefs,
    itemsContainerRef,
    handleItemSearch,
    selectItem,
    toggleDropdown,
    addNewItem,
    removeItem,
    updateItem,
    validateStock,
  };
}
