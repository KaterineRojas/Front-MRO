import React, { useState, useMemo } from 'react';
import {
    Plus,
    X,
    ShoppingCart,
    FileText,
    Info,
    CheckCircle2,
    ShieldAlert,
    PlusCircle,
    Trash,
    ChevronDown
} from 'lucide-react';

// =================================================================================
// --- DATOS DE REFERENCIA (MOCK DATA PARA WO CASCADA) ---
// =================================================================================

const WO_DATA = {
  companies: [
    { id: 'C1', name: 'Global Tech Industries' },
    { id: 'C2', name: 'Energy Solutions Corp' }
  ],
  customers: {
    'C1': [{ id: 'CU1', name: 'AeroJet Systems' }, { id: 'CU2', name: 'NanoChip Co' }],
    'C2': [{ id: 'CU3', name: 'SolarGrid West' }]
  },
  projects: {
    'CU1': [{ id: 'P1', name: 'Turbine Overhaul 2025' }],
    'CU2': [{ id: 'P2', name: 'CleanRoom Expansion' }, { id: 'P3', name: 'R&D Lab Setup' }],
    'CU3': [{ id: 'P4', name: 'Solar Farm Alpha' }]
  },
  workOrders: {
    'P1': ['WO-AJ-101', 'WO-AJ-102'],
    'P2': ['WO-NC-505'],
    'P3': ['WO-RD-990', 'WO-RD-991'],
    'P4': ['WO-SG-001', 'WO-SG-002', 'WO-SG-003']
  }
};

// =================================================================================
// --- COMPONENTES DE UI ---
// =================================================================================

const Button = ({ children, className = '', variant = 'default', size = 'default', onClick, disabled, type = 'button' }) => {
  let baseClasses = 'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95';
  let sizeClasses = size === 'icon' ? 'h-9 w-9 p-0' : size === 'sm' ? 'h-9 px-3 text-xs' : 'px-5 py-2.5 h-11';
  let variantClasses = 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'; 
  if (variant === 'outline') variantClasses = 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm';
  if (variant === 'ghost') variantClasses = 'hover:bg-gray-100 text-gray-700 shadow-none';
  if (variant === 'destructive') variantClasses = 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-100';
  if (variant === 'secondary') variantClasses = 'bg-slate-100 text-slate-800 hover:bg-slate-200 shadow-sm';
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => <div className={`bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h2 className={`text-xl font-bold text-slate-800 tracking-tight ${className}`}>{children}</h2>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Input = ({ id, value, onChange, placeholder, type = 'text', required, className = '', min, step }) => (
  <input
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    type={type}
    required={required}
    min={min}
    step={step}
    className={`flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-slate-300 ${className}`}
  />
);

const Label = ({ children, className = "" }) => (
  <label className={`text-[11px] font-black mb-1.5 block text-slate-500 uppercase tracking-[0.15em] ${className}`}>
    {children}
  </label>
);

const Select = ({ children, value, onValueChange, className = "", disabled = false }) => {
    return (
        <div className={`relative ${className}`}>
            <select 
                value={value}
                disabled={disabled}
                onChange={(e) => onValueChange(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {children}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
            </div>
        </div>
    );
};

const Badge = ({ children, className = '', variant = 'default' }) => {
    let baseClasses = 'inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-colors';
    if (variant === 'warning') baseClasses += ' bg-amber-50 text-amber-700 border border-amber-200';
    else if (variant === 'destructive') baseClasses += ' bg-red-50 text-red-700 border border-red-200';
    else if (variant === 'success') baseClasses += ' bg-emerald-50 text-emerald-700 border border-emerald-200';
    else baseClasses += ' bg-slate-100 text-slate-600 border border-slate-200';
    return <div className={`${baseClasses} ${className}`}>{children}</div>;
};

// =================================================================================
// --- MODULO DE COMPRAS (FORMULARIO B MEJORADO) ---
// =================================================================================

export function FormPurchase({ onBack }) {
    const [requests, setRequests] = useState([
        { id: 'REQ-882', itemsCount: 3, tool: 'Kit de Herramientas Eléctricas...', reason: 'Nuevo proyecto', wo: 'WO-AJ-101', cost: 1450.50, status: 'Aprobado', applicant: 'Ing. García', date: '2025-12-20' },
        { id: 'REQ-901', itemsCount: 1, tool: 'Taladro Percutor Industrial', reason: 'Urgente', wo: 'WO-NC-505', cost: 3500.00, status: 'Pendiente (Escalado)', applicant: 'Ing. Smith', date: '2025-12-28' }
    ]);
    const [showForm, setShowForm] = useState(false);
    const handleClose = () => {
        setShowForm(false);
        if (typeof onBack === 'function') {
            onBack();
        }
    };
    
    // Estado de jerarquía de selección
    const [selection, setSelection] = useState({
        company: '',
        customer: '',
        project: '',
        wo: ''
    });

    const [formData, setFormData] = useState({
        reason: 'Stock bajo',
        deliveryDate: '',
        isBillable: 'N',
        observations: '',
        items: [{ id: Date.now(), name: '', qty: 1, unitPrice: '', isConsumable: 'N' }]
    });

    // Filtros de cascada
    const availableCustomers = selection.company ? WO_DATA.customers[selection.company] || [] : [];
    const availableProjects = selection.customer ? WO_DATA.projects[selection.customer] || [] : [];
    const availableWOs = selection.project ? WO_DATA.workOrders[selection.project] || [] : [];

    // Limpiar niveles inferiores al cambiar uno superior
    const handleCompanyChange = (val) => setSelection({ company: val, customer: '', project: '', wo: '' });
    const handleCustomerChange = (val) => setSelection({ ...selection, customer: val, project: '', wo: '' });
    const handleProjectChange = (val) => setSelection({ ...selection, project: val, wo: '' });

    const totalCost = useMemo(() => {
        return formData.items.reduce((sum, item) => {
            const price = parseFloat(item.unitPrice) || 0;
            return sum + (price * item.qty);
        }, 0);
    }, [formData.items]);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { id: Date.now(), name: '', qty: 1, unitPrice: '', isConsumable: 'N' }]
        });
    };

    const handleRemoveItem = (id) => {
        if (formData.items.length === 1) return;
        setFormData({
            ...formData,
            items: formData.items.filter(item => item.id !== id)
        });
    };

    const updateItem = (id, field, value) => {
        setFormData({
            ...formData,
            items: formData.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newRequest = {
            id: `REQ-${Math.floor(Math.random() * 900) + 100}`,
            tool: formData.items[0].name + (formData.items.length > 1 ? ` (+${formData.items.length - 1} items)` : ''),
            itemsCount: formData.items.length,
            reason: formData.reason,
            wo: selection.wo || 'N/A',
            cost: totalCost,
            status: totalCost > 3000 ? 'Pendiente (Escalado >$3k)' : 'Pendiente',
            applicant: 'Ing. Principal',
            date: new Date().toISOString().split('T')[0]
        };
        setRequests([newRequest, ...requests]);
        setShowForm(false);
        if (typeof onBack === 'function') {
            onBack();
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="border-b bg-slate-50/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center">
                                <ShoppingCart className="mr-3 text-indigo-600 h-6 w-6" />
                                Solicitudes de Compra Local
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Registro de Formulario B (Multi-Item)</p>
                        </div>
                        <Button onClick={() => setShowForm(true)} className="bg-indigo-600">
                            <Plus className="w-5 h-5 mr-2" /> Nueva Solicitud
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-y">
                                <tr>
                                    <th className="p-4">Folio / Fecha</th>
                                    <th className="p-4">Resumen de Items</th>
                                    <th className="p-4">Referencia WO</th>
                                    <th className="p-4 text-right">Total Est.</th>
                                    <th className="p-4 text-center">Estado</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.map((req) => (
                                    <tr key={req.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-mono text-indigo-600 font-black">{req.id}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{req.date}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{req.tool}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="default">{req.reason}</Badge>
                                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase">
                                                    {req.itemsCount} {req.itemsCount === 1 ? 'ARTÍCULO' : 'ARTÍCULOS'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-slate-500">{req.wo}</td>
                                        <td className="p-4 text-right font-black text-slate-900">
                                            ${req.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Badge variant={req.status.includes('Escalado') ? 'warning' : 'success'}>
                                                {req.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="icon" className="text-slate-400">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Formulario B Multi-Item con Cascada */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4 backdrop-blur-md transition-all">
                    <Card className="max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b bg-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                    <ShoppingCart className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Nueva Solicitud de Compra</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="default">FORMULARIO B</Badge>
                                        <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Procedimiento MRO Standard</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Cuerpo Scrolleable */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/50">
                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                
                                {/* 1. Referencia de Cascada WO (Empresa -> Cliente -> Proyecto -> WO) */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-1 bg-indigo-600 rounded-full"></div>
                                        <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">Referencia de Proyecto y WO</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <div>
                                            <Label>1. Empresa (Company)</Label>
                                            <Select value={selection.company} onValueChange={handleCompanyChange}>
                                                <option value="">Seleccione...</option>
                                                {WO_DATA.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>2. Cliente (Customer)</Label>
                                            <Select 
                                                disabled={!selection.company} 
                                                value={selection.customer} 
                                                onValueChange={handleCustomerChange}
                                            >
                                                <option value="">Seleccione...</option>
                                                {availableCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>3. Proyecto (Project)</Label>
                                            <Select 
                                                disabled={!selection.customer} 
                                                value={selection.project} 
                                                onValueChange={handleProjectChange}
                                            >
                                                <option value="">Seleccione...</option>
                                                {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>4. Orden (WO#) *</Label>
                                            <Select 
                                                disabled={!selection.project} 
                                                value={selection.wo} 
                                                onValueChange={val => setSelection({...selection, wo: val})}
                                            >
                                                <option value="">Seleccione WO...</option>
                                                {availableWOs.map(wo => <option key={wo} value={wo}>{wo}</option>)}
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Datos de Solicitud */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label>Motivo de Compra *</Label>
                                        <Select value={formData.reason} onValueChange={v => setFormData({...formData, reason: v})}>
                                            <option value="Stock bajo">Stock bajo / Reorden</option>
                                            <option value="Urgente">Urgente / Crítico</option>
                                            <option value="Nuevo proyecto">Nuevo proyecto</option>
                                            <option value="Reemplazo">Reemplazo por daño</option>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Fecha Estimada de Entrega *</Label>
                                        <Input type="date" required value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                                    </div>
                                    <div>
                                        <Label>¿Facturable al Cliente?</Label>
                                        <div className="flex bg-slate-100 p-1 rounded-xl">
                                            <button type="button" onClick={() => setFormData({...formData, isBillable: 'Y'})} className={`flex-1 px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${formData.isBillable === 'Y' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>SÍ</button>
                                            <button type="button" onClick={() => setFormData({...formData, isBillable: 'N'})} className={`flex-1 px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${formData.isBillable === 'N' ? 'bg-white text-slate-500 shadow-sm' : 'text-slate-400'}`}>NO</button>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Listado de Items con Consumible Indiv. */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-1 bg-indigo-600 rounded-full"></div>
                                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Artículos en esta solicitud</h4>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={handleAddItem} className="h-8 text-indigo-600 border-indigo-200">
                                            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Agregar Item
                                        </Button>
                                    </div>
                                    
                                    <div className="p-0">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50/50 text-[9px] text-slate-400 font-black uppercase tracking-widest border-b">
                                                <tr>
                                                    <th className="p-4 text-left">Descripción del Artículo</th>
                                                    <th className="p-4 text-center w-24">Consumible</th>
                                                    <th className="p-4 text-center w-20">Cant.</th>
                                                    <th className="p-4 text-center w-36">P. Unit (USD)</th>
                                                    <th className="p-4 text-right w-36">Subtotal</th>
                                                    <th className="p-4 text-center w-12"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {formData.items.map((item) => (
                                                    <tr key={item.id} className="group hover:bg-slate-50/30">
                                                        <td className="p-4">
                                                            <Input 
                                                                placeholder="Nombre de la herramienta o material" 
                                                                className="h-9 text-xs bg-transparent border-transparent focus:bg-white focus:border-slate-200"
                                                                value={item.name} 
                                                                onChange={e => updateItem(item.id, 'name', e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <select 
                                                                value={item.isConsumable}
                                                                onChange={e => updateItem(item.id, 'isConsumable', e.target.value)}
                                                                className={`w-full text-[10px] font-black p-1.5 rounded-lg border-transparent focus:ring-0 cursor-pointer ${item.isConsumable === 'Y' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}
                                                            >
                                                                <option value="N">NO (Activo)</option>
                                                                <option value="Y">SÍ (Gasto)</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <Input 
                                                                type="number" 
                                                                min="1" 
                                                                className="h-9 text-center text-xs bg-transparent border-transparent focus:bg-white focus:border-slate-200"
                                                                value={item.qty} 
                                                                onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                                                                required
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <Input 
                                                                type="number" 
                                                                step="0.01" 
                                                                placeholder="0.00"
                                                                className="h-9 text-center text-xs bg-transparent border-transparent focus:bg-white focus:border-slate-200"
                                                                value={item.unitPrice} 
                                                                onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td className="p-4 text-right font-black text-slate-600">
                                                            ${((parseFloat(item.unitPrice) || 0) * item.qty).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                disabled={formData.items.length === 1}
                                                                className="text-slate-300 hover:text-red-500 disabled:opacity-0 transition-all"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Resumen Final */}
                                    <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                        <div className="flex gap-10">
                                            <div>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Total Items</p>
                                                <p className="text-xl font-black">{formData.items.length}</p>
                                            </div>
                                            {totalCost > 3000 && (
                                                <div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
                                                    <ShieldAlert className="h-5 w-5 text-red-500" />
                                                    <div>
                                                        <p className="text-[9px] text-red-500 font-black uppercase tracking-widest leading-none mb-1">Escalamiento Nivel 2</p>
                                                        <p className="text-[10px] text-red-100 font-medium">Monto mayor a $3,000 USD</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Inversión Total</p>
                                            <p className="text-3xl font-black text-indigo-400">
                                                ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500 ml-1">USD</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Observaciones */}
                                <div className="space-y-4">
                                    <Label>Observaciones / Justificación adicional</Label>
                                    <textarea 
                                        className="w-full h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                        placeholder="Detalles sobre urgencia, proveedores específicos o justificación técnica..."
                                        value={formData.observations}
                                        onChange={e => setFormData({...formData, observations: e.target.value})}
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white border-t flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Info className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Firma digital de Ing. Principal se adjuntará al envío</span>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={handleClose}>Descartar</Button>
                                <Button onClick={handleSubmit} disabled={!selection.wo} className="px-12 bg-indigo-600">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Generar Solicitud
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default FormPurchase;

