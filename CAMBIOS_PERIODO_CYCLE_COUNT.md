## Ciclo Count: Campo "Período" Agregado

### Cambios Realizados

Se ha agregado el campo "período" a los tres lugares solicitados en el módulo Cycle Count. Este campo se calcula automáticamente basado en el tipo de conteo y la fecha.

#### **Lógica del Período:**

- **Annual (Anual):** Muestra el año (ej: `2026`)
- **Biannual (Semestral):** 
  - Primera mitad del año (enero-junio): `1-2026`
  - Segunda mitad del año (julio-diciembre): `2-2026`
- **Spot Check:** No muestra período (campo vacío)

---

### **1. Cycle Count Audit Report (Reporte de Auditoría)**

**Archivos modificados:**
- `src/components/features/cycle-count/components/AuditHeader.tsx`
  - Agregado prop `periodo?: string`
  - Se muestra en la sección "Audit Header" si existe

- `src/components/features/cycle-count/pages/CycleCountDetailView.tsx`
  - Importado `calculatePeriod` 
  - Se calcula el período al cargar datos desde la API
  - Se pasa al componente `AuditHeader`

---

### **2. Cycle Count History (Historial de Conteos)**

**Archivos modificados:**
- `src/components/features/cycle-count/pages/CycleCount.tsx`
  - Agregada columna "Period" en la tabla de histórico
  - Actualizado colSpan en filas de carga y vacías (de 9 a 10)

- `src/components/features/cycle-count/components/HistoryTableRow.tsx`
  - Agregada celda con `record.periodo || '-'` 
  - Se muestra entre la columna "Zone" y "Status"

- `src/components/features/cycle-count/hooks/useCycleCountHistory.ts`
  - Importado `calculatePeriod`
  - Actualizado `CycleCountRecord` interface para incluir `periodo?: string`
  - Función `mapApiRecordToUI` calcula el período automáticamente

---

### **3. Physical Inventory Count (Conteo de Inventario Físico)**

**Archivos modificados:**
- `src/components/features/cycle-count/utils/excelUtils.ts`
  - Se agregó fila "Period:" en la sección AUDIT HEADER del reporte Excel
  - Muestra el valor del período o "-" si no existe

- `src/components/features/cycle-count/utils/reportGenerator.ts`
  - Actualizado interface `CycleCountRecord` con `periodo?: string`
  - En función `generatePrintReport`: Se agrega fila de período en HTML
  - En función `generatePrintAllHistory`: Se agrega período para cada reporte
  - En función `generateExcelReport`: Se agrega período en datos del header

---

### **Archivo Utilitario Nuevo:**

**`src/components/features/cycle-count/utils/periodUtils.ts`**
- Función `calculatePeriod(countType, dateString)` que:
  - Parsea la fecha
  - Determina el mes
  - Retorna el formato correcto según el tipo de conteo

---

### **Tipos Actualizados:**

1. **`CycleCountDetailData`** (tipos/index.ts)
   - Agregado: `periodo?: string`

2. **`CycleCountRecord`** (hooks/useCycleCountHistory.ts)
   - Agregado: `periodo?: string`

3. **`MappedCycleCountRecord`** (services/cycleCountService.ts)
   - Agregado: `periodo?: string`

---

### **Flujo de Cálculo:**

1. **En Historial:** Se calcula automáticamente al mapear registros desde la API
2. **En Reporte:** Se calcula cuando se completa un conteo o al cargar desde la API
3. **En Exportación:** Se incluye en archivos Excel y reportes impresos

---

### **Testing:**

Puedes probar la funcionalidad:

1. Crear un conteo **Annual** → Verás el año (ej: `2026`)
2. Crear un conteo **Biannual** en enero-junio → Verás `1-2026`
3. Crear un conteo **Biannual** en julio-diciembre → Verás `2-2026`
4. Crear un conteo **Spot Check** → No verás período (vacío)

El período aparecerá en:
- Tabla de histórico
- Reporte de auditoría
- Reportes impresos (HTML)
- Archivos Excel descargados
