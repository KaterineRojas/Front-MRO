# Inventory Management Feature Module

This directory contains the complete Inventory Management feature, organized following a feature-based architecture pattern.

## Structure

```
inventory/
├── README.md                    # This file
├── index.ts                     # Main exports
├── types.ts                     # TypeScript interfaces and types
├── constants.ts                 # Constants, categories, and mock data
├── InventoryManager.tsx         # Main component (630 lines, reduced from 4,700)
├── components/                  # Reusable components
│   └── BinSelector.tsx          # Bin selection component
├── modals/                      # Modal dialogs
│   ├── CreateItemModal.tsx      # Create/Edit item modal
│   └── RecordMovementModal.tsx  # Record movement modal
└── tabs/                        # Tab content components
    ├── ItemsTab.tsx             # Items inventory tab
    ├── KitsTab.tsx              # Kits inventory tab
    ├── TemplatesTab.tsx         # Templates tab
    ├── BinsTab.tsx              # Bins management tab
    └── TransactionsTab.tsx      # Transactions tab
```

## Components

### Main Component
- **InventoryManager**: Orchestrates all inventory management functionality with Redux and React Router integration

### Tabs
- **ItemsTab**: Displays and manages inventory items
- **KitsTab**: Manages equipment kits
- **TemplatesTab**: Wrapper for TemplateManager component
- **BinsTab**: Wrapper for BinManager component
- **TransactionsTab**: Wrapper for InventoryMovements component

### Modals
- **CreateItemModal**: Create and edit inventory items
- **RecordMovementModal**: Record stock movements (entry/exit/relocation)

### Components
- **BinSelector**: Searchable bin selection dropdown

## Usage

```tsx
import { InventoryManager } from './components/features/inventory';

function App() {
  return <InventoryManager />;
}
```

## State Management

This module uses local React state for inventory management. Future enhancements could include:
- Redux integration for global inventory state
- API integration for persistent storage
- Real-time inventory updates

## Features

- **Item Management**: Create, edit, and delete inventory items
- **Kit Management**: Manage equipment kits with multiple items
- **Template System**: Create kits from predefined templates
- **Bin Management**: Organize items by storage location
- **Movement Tracking**: Record stock entries, exits, and relocations
- **Multi-bin Support**: Track same SKU across multiple bins
- **Stock Alerts**: Low stock and out-of-stock notifications

## Dependencies

- React
- shadcn/ui components (Button, Dialog, Table, etc.)
- Lucide React icons
- TypeScript

## Related Components

External components used by this module (located in `/components/`):
- `BinManager.tsx` - Bin management component
- `TemplateManager.tsx` - Template management component  
- `InventoryMovements.tsx` - Transaction history component
- `CreateKitPage.tsx` - Full-page kit creation view
- `EditTemplatePage.tsx` - Full-page template editing view

## Code Reduction

This modular restructure reduced the main InventoryManager from **4,700 lines to 630 lines** (86.6% reduction) through:
- Separation of concerns
- Component extraction
- Modal extraction
- Tab componentization
