import React from 'react';
import { Kit } from '../types';
import {InventoryArticle, KitItem} from '../modals/AssembleKitModal'

interface PrintTemplateProps {
    kit: Kit;
    articles: InventoryArticle[];
    quantity: number;
}

export const KitRequestPrintTemplate = React.forwardRef<HTMLDivElement, PrintTemplateProps>(
    ({ kit, articles, quantity }, ref) => {

        const today = new Date().toLocaleDateString();

        return (
            <div ref={ref} style={{
                padding: '32px',
                backgroundColor: 'white',
                color: 'black',
                fontFamily: 'Arial, sans-serif',
                width: '100%',
                minHeight: '100vh'
            }}>

                {/* 1. PRINT HEADER */}
                <div style={{ marginBottom: '32px', borderBottom: '1px solid #000', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Material Request Form
                            </h1>
                            <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                Request ID: #{kit.id} | SKU: {kit.sku}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>{kit.name}</h2>
                            <p style={{ fontSize: '14px', color: '#666' }}>Requested Qty: {quantity}</p>
                        </div>
                    </div>
                </div>

                {/* 2. THE TABLE */}
                <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', marginBottom: '32px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #000' }}>
                            <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                                Item
                            </th>
                            <th style={{ padding: '8px 0', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                                Bin Location
                            </th>
                            <th style={{ padding: '8px 0', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                                Qty Needed
                            </th>
                            <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                                Stock Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {kit.items.map((item: KitItem, idx: number) => {
                            const articleInInventory = articles.find(a => a.id === item.articleId);
                            const currentStock = articleInInventory?.quantityAvailable ?? 0;
                            const required = item.quantity * quantity;
                            const hasStock = currentStock >= required;

                            return (
                                <tr key={idx} style={{ borderBottom: '1px solid #ccc' }}>
                                    <td style={{ padding: '12px 8px 12px 0' }}>
                                        <span style={{ fontWeight: '600', display: 'block' }}>{item.articleName}</span>
                                        <span style={{ fontSize: '12px', color: '#666' }}>{item.articleSku}</span>
                                    </td>
                                    <td style={{ padding: '12px 0', textAlign: 'center', color: '#666', fontFamily: 'monospace' }}>
                                        {kit.binCode || 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px 0', textAlign: 'center', fontWeight: 'bold' }}>
                                        {required}
                                    </td>
                                    <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                        {hasStock ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#16a34a', fontWeight: '500' }}>
                                                ✓ Available ({currentStock})
                                            </span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#dc2626', fontWeight: 'bold' }}>
                                                ⚠ Low Stock ({currentStock})
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* 3. FOOTER & SIGNATURES */}
                <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '2px solid #e5e7eb' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

                        {/* Requested By */}
                        <div>
                            <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '32px' }}>
                                Requested By:
                            </p>
                            <div style={{ borderTop: '1px solid #000', width: '75%' }}></div>
                            <p style={{ marginTop: '8px', fontSize: '14px' }}>Signature</p>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Date: {today}</p>
                        </div>

                        {/* Approved By */}
                        <div>
                            <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '32px' }}>
                                Approved By:
                            </p>
                            <div style={{ borderTop: '1px solid #000', width: '75%' }}></div>
                            <p style={{ marginTop: '8px', fontSize: '14px' }}>Manager Signature</p>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Date: ______________</p>
                        </div>

                    </div>

                    <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '10px', color: '#999' }}>
                        System generated document. Internal use only.
                    </div>
                </div>

            </div>
        );
    }
);