/*export const CATEGORIES = [
  { value: 'office-supplies', label: 'Office Supplies' },
  { value: 'technology', label: 'Technology' },
  { value: 'tools', label: 'Tools' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'safety-equipment', label: 'Safety Equipment' },
  { value: 'medical-supplies', label: 'Medical Supplies' },
  { value: 'cleaning-supplies', label: 'Cleaning Supplies' },
  { value: 'construction-materials', label: 'Construction Materials' },
  { value: 'laboratory-equipment', label: 'Laboratory Equipment' }
];
*/
export const CATEGORIES = [
  // --- Categorías Originales (Mantenidas) ---
  { value: 'office-supplies', label: 'Office Supplies' },
  { value: 'technology', label: 'Technology' },
  { value: 'tools', label: 'Tools' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'safety-equipment', label: 'Safety Equipment' },
  { value: 'medical-supplies', label: 'Medical Supplies' },
  { value: 'cleaning-supplies', label: 'Cleaning Supplies' },
  { value: 'construction-materials', label: 'Construction Materials' },
  { value: 'laboratory-equipment', label: 'Laboratory Equipment' },

  // --- Nuevas Categorías Añadidas de tu lista detallada ---

  // Agrupando todas las subcategorías de Herramientas (Tools) en una sola línea para no duplicar
  { value: 'hand-tools', label: 'Hand Tools' },
  { value: 'power-tools', label: 'Power Tools' },
  
  // Agrupando materiales eléctricos
  { value: 'electrical-supplies', label: 'Electrical Supplies' },
  
  // Plomería
  { value: 'plumbing-supplies', label: 'Plumbing Supplies' },
  
  // Materiales de Construcción (ya existe 'construction-materials', pero añadimos subgrupos claros)
  { value: 'metalworking-supplies', label: 'Metalworking Supplies' },
  { value: 'concrete-masonry', label: 'Concrete & Masonry' },
  { value: 'woodworking-materials', label: 'Woodworking Materials' },

  // Pintura y Químicos
  { value: 'painting-supplies', label: 'Painting Supplies' },
  { value: 'adhesives-sealants', label: 'Adhesives & Sealants' },
  
  // Jardinería
  { value: 'gardening-outdoor', label: 'Gardening & Outdoor' },
  
  // Mantenimiento y Consumibles
  { value: 'maintenance-equipment', label: 'Maintenance Equipment' },
  { value: 'consumables', label: 'Consumables' }, // Para lubricantes, químicos, etc.
  { value: 'raw-materials', label: 'Raw Materials' },

  // Generales / Otros
  { value: 'industrial-equipment', label: 'Industrial Equipment' },
  { value: 'art-craft-supplies', label: 'Art & Craft Supplies' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
  { value: 'other', label: 'Other' },
];