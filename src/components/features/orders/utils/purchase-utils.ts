/**
 * Mappings for Backend Integer IDs to Human Readable Strings
 * matching your getStatusBadge and getUrgencyBadge logic.
 */

export const STATUS_MAP: Record<number, string> = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
    3: 'completed',
    4: 'packing',
    5: 'sent'
};

export const REASON_MAP: Record<number, string> = {
    0: 'Low Stock',
    1: 'Urgent',
    2: 'New project',
};

/**
 * Clean Date Formatter
 * Formats: "2025-12-23T..." -> "Dec 23, 2025"
 */
export const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Currency Formatter
 */
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};
/**
 * helper for getting badge depending on dark or light mode
 */

export const getCategoryVariant = (category: string, isDarkMode: boolean): any => {
    const cat = (category || 'Other');

    // 1. BRAND (Purple) -> Office, IT, Management
    const brandCats = ['ComputersPeripherals', 'OfficeSupplies', 'FurnitureFixtures', 'Electronics'];
    if (brandCats.includes(cat)) return isDarkMode ? 'brand' : 'brand-soft';

    // 2. INDIGO (Deep Blue) -> Automotive, Industrial, Machines 
    const indigoCats = ['AutomotiveTools', 'VehicleParts', 'IndustrialEquipment', 'RentalEquipment', 'PowerTools'];
    if (indigoCats.includes(cat)) return isDarkMode ? 'indigo' : 'indigo-soft';

    // 3. INFO (Blue) -> Scientific, Precision, Electric
    const infoCats = ['ElectricalSupplies', 'LightingEquipment', 'MedicalEquipment', 'LaboratoryEquipment', 'MeasuringTools'];
    if (infoCats.includes(cat)) return isDarkMode ? 'info' : 'info-soft';

    // 4. ROSE (Red/Pink) -> Chemicals, Liquids, Paints 
    // Separates "Messy/Chemical" stuff from "Clean/Water" stuff
    const roseCats = ['LubricantsChemicals', 'AdhesivesSealants', 'PaintingSupplies', 'Consumables'];
    if (roseCats.includes(cat)) return isDarkMode ? 'rose' : 'rose-soft';

    // 5. TEAL -> Plumbing, Cleaning (Water based)
    const tealCats = ['PlumbingSupplies', 'PipesFittings', 'CleaningSupplies'];
    if (tealCats.includes(cat)) return isDarkMode ? 'teal' : 'teal-soft';

    // 6. EMERALD (Green) -> Safety, Outdoor
    const emeraldCats = ['SafetyEquipment', 'ProtectiveGear', 'GardeningTools', 'OutdoorEquipment'];
    if (emeraldCats.includes(cat)) return isDarkMode ? 'emerald' : 'emerald-soft';

    // 7. ORANGE/WARNING -> Heavy Materials, Construction
    const warningCats = ['BuildingMaterials', 'ConstructionTools', 'RawMaterials', 'MaterialHandling'];
    if (warningCats.includes(cat)) return isDarkMode ? 'orange' : 'orange-soft';

    // 8. NEUTRAL (Gray) -> Basic Hardware, Metal, catch-all
    return isDarkMode ? 'neutral' : 'neutral-soft';
};