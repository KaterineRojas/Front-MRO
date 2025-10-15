# Inventory Management - Modular Structure

## Overview
The Inventory Management feature has been completely modularized to improve code organization, maintainability, and scalability.

## Architecture

### Main Component
- **InventoryManagerModular.tsx**: Main container component that manages global state and orchestrates all tabs

### Tabs (Modular Components)
Located in `/components/features/inventory/tabs/`:

1. **ItemsTab.tsx** - Individual item management
   - Create, edit, delete items
   - Search and filter by category
   - Main table: Item, Description, Category, Type, Stock, Min Stock
   - Expandable rows with Storage Locations table (BIN Code, Quantity, Type)
   - Supports up to 3 bins per item with different types
   - Auto-generated SKU on creation
   - Image upload support

2. **KitsTab.tsx** - Kit management
   - Create kits from scratch or templates
   - Edit and delete kits
   - Expandable rows showing kit items in table format (Image, BIN Code, Name, Quantity)
   - Category filtering
   - Visual item display matching template format

3. **TemplatesTab.tsx** - Template management
   - Wrapper for TemplateManager component
   - Create and edit templates
   - Use templates to create kits

4. **BinsTab.tsx** - Bin management
   - Create, edit and delete bins
   - Article count per bin
   - Delete protection (disabled when bin has items)
   - Type badges (Good Condition, On Revision, Scrap)

5. **TransactionsTab.tsx** - Movement history
   - Wrapper for InventoryMovements component
   - View transaction history
   - Record new movements

## State Management
- Global state is centralized in `InventoryManagerModular`
- Each tab receives state and callbacks through props
- Clean separation of concerns

## Data Flow
```
InventoryManagerModular
├── State Management (articles, kits, activeTab)
├── Handler Functions (CRUD operations)
└── Props Distribution to Tabs
    ├── ItemsTab (articles, handlers)
    ├── KitsTab (kits, handlers)
    ├── TemplatesTab (callbacks)
    ├── BinsTab (standalone)
    └── TransactionsTab (standalone)
```

## Features

### Items Management
- **Auto SKU Generation**: SKUs are automatically generated (SKU-001, SKU-002, etc.)
- **Simplified Form**: Removed SKU, Unit Cost, and Supplier from creation form
- **BIN Code Selector**: Integrated dropdown with search
- **Stock Status**: Visual indicators for stock levels
- **Min Stock Display**: Shown in main table and detail view
- **Description Column**: Added to main table for quick reference
- **Multi-Bin Support**: Up to 3 bins per item, each with different type (no duplicate types)
- **Type Icons**: Visual differentiation between consumable/non-consumable items

### Kits Management
- **Template Integration**: Create kits from predefined templates
- **Item Contents**: View all items included in each kit
- **Category Organization**: Filter by category

### Navigation
- **Tab-based UI**: Easy switching between different views
- **Record Movement Button**: Opens modal for recording inventory transactions
- **Special Views**: Dedicated pages for kit creation and template editing

### Modals
Three modals are available in `/components/features/inventory/modals/`:

#### AddItemModal
- **Add/Edit Items**: Create new items or edit existing ones
- **Auto SKU Generation**: Automatically generates sequential SKU codes
- **Image Upload**: Support for article images with preview
- **Validation**: Prevents duplicate SKUs

#### CreateBinModal  
- **Add/Edit Bins**: Create new bins or edit existing ones
- **Type Selection**: Good Condition, On Revision, or Scrap
- **Validation**: Prevents duplicate BIN codes

#### RecordMovementModal
- **Comprehensive Form**: Record entries, exits, and relocations
- **Item Type Selection**: Support for both items and kits
- **Smart Article Selection**: Search by SKU or name
- **BIN Code Selection**: Choose specific bins for exit/relocation
- **Stock Validation**: Prevents over-withdrawal from inventory
- **Location Management**: Set new locations for entries and relocations

## Integration

### Usage in App.tsx
```typescript
import { InventoryManagerModular } from './components/features/inventory/InventoryManagerModular';

// In render:
case 'articles':
  return <InventoryManagerModular />;
```

## File Structure
```
/components/features/inventory/
├── InventoryManagerModular.tsx  # Main container
├── tabs/
│   ├── ItemsTab.tsx            # Items management
│   ├── KitsTab.tsx             # Kits management
│   ├── TemplatesTab.tsx        # Templates wrapper
│   ├── BinsTab.tsx             # Bins wrapper
│   └── TransactionsTab.tsx     # Transactions wrapper
├── modals/
│   └── RecordMovementModal.tsx # Record Movement modal
└── README.md                    # This file
```

## Benefits of Modularization

1. **Maintainability**: Each tab is self-contained and easier to maintain
2. **Scalability**: Easy to add new features or tabs
3. **Reusability**: Tabs can be reused in different contexts
4. **Testing**: Individual components can be tested in isolation
5. **Performance**: Reduced bundle size per component
6. **Developer Experience**: Easier to navigate and understand the codebase

## Migration Notes

The original `InventoryManager.tsx` file has been replaced with this modular structure:
- **Before**: Single 1000+ line file
- **After**: Multiple focused files (~200-400 lines each)
- **Code Reduction**: Improved organization without sacrificing functionality

## Future Enhancements

Potential improvements for future versions:
- Context API or Redux for state management
- TypeScript interfaces in separate files
- Custom hooks for common operations
- More granular component splitting
- Unit tests for each module
