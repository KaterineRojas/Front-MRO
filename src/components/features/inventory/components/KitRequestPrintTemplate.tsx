import React from 'react';
import { Kit } from '../types';
import { InventoryArticle } from '../modals/AssembleKitModal';


interface PrintTemplateProps {
    kit: Kit;
    articles: InventoryArticle[];
    quantity: number;
}

export const KitRequestPrintTemplate = ({ kit, articles, quantity }: PrintTemplateProps) => {
    const today = new Date().toLocaleDateString();

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#000' }}>
            {/* HEADER */}
            <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>MATERIAL REQUEST FORM</h1>
                    <p style={{ margin: '5px 0 0 0' }}>Request ID: #{kit.id} | SKU: {kit.sku}</p>
                </div>
                <div className="text-right" style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>{kit.name}</h2>
                    <p style={{ margin: '5px 0 0 0' }}>Requested Qty: {quantity}</p>
                </div>
            </div>

            {/* TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                        <th className="text-center" style={{ padding: '8px', textAlign: 'center' }}>Bin Location</th>
                        <th className="text-center" style={{ padding: '8px', textAlign: 'center' }}>Qty Needed</th>
                        <th className="text-right" style={{ padding: '8px', textAlign: 'right' }}>Stock Status</th>
                        {/* ✅ MOVED: Checkbox Column Header to Last Position */}
                        <th style={{ padding: '8px', textAlign: 'center', width: '60px' }}>Picked</th>
                    </tr>
                </thead>
                <tbody>
                    {kit.items.map((item: any, idx: number) => {
                        const articleInInventory = articles.find(a => a.id === item.articleId);
                        const currentStock = articleInInventory?.quantityAvailable ?? 0;
                        const required = item.quantity * quantity;
                        const hasStock = currentStock >= required;

                        return (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}>
                                    <div className="font-bold">{item.articleName}</div>
                                    <small style={{ color: '#666' }}>{item.articleSku}</small>
                                </td>
                                <td className="text-center" style={{ padding: '8px', textAlign: 'center' }}>{kit.binCode || 'N/A'}</td>
                                <td className="text-center" style={{ padding: '8px', textAlign: 'center' }}>{required}</td>
                                <td className="text-right" style={{ padding: '8px', textAlign: 'right' }}>
                                    {hasStock ? (
                                        <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Available ({currentStock})</span>
                                    ) : (
                                        <span style={{ color: 'red', fontWeight: 'bold' }}>⚠ Low Stock ({currentStock})</span>
                                    )}
                                </td>
                                
                                {/* ✅ MOVED: Checkbox Square to Last Position */}
                                <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                                    <div style={{ 
                                        width: '24px', 
                                        height: '24px', 
                                        border: '2px solid #000', // Made slightly thicker for better visibility
                                        borderRadius: '4px',
                                        margin: '0 auto',
                                        backgroundColor: '#fff' 
                                    }}></div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* FOOTER */}
            <div className="signatures" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
                <div className="signature-block" style={{ width: '40%' }}>
                    <p className="font-bold" style={{ marginBottom: '40px' }}>REQUESTED BY:</p>
                    <div className="signature-line" style={{ borderTop: '1px solid #000', marginBottom: '5px' }}></div>
                    <p style={{ margin: 0 }}>Signature</p>
                    <small>Date: {today}</small>
                </div>

                <div className="signature-block" style={{ width: '40%' }}>
                    <p className="font-bold" style={{ marginBottom: '40px' }}>APPROVED BY:</p>
                    <div className="signature-line" style={{ borderTop: '1px solid #000', marginBottom: '5px' }}></div>
                    <p style={{ margin: 0 }}>Manager Signature</p>
                    <small>Date: ______________</small>
                </div>
            </div>
            
            <div className="text-center" style={{ marginTop: '40px', fontSize: '10px', color: '#666', textAlign: 'center' }}>
                System generated document. Internal use only.
            </div>
        </div>
    );
};