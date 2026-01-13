import React from 'react';
import { Kit } from '../types';
import { InventoryArticle, KitItem } from '../modals/AssembleKitModal'

interface PrintTemplateProps {
    kit: Kit;
    articles: InventoryArticle[];
    quantity: number;
}

export const KitRequestPrintTemplate = ({ kit, articles, quantity }: PrintTemplateProps) => {
    const today = new Date().toLocaleDateString();

    return (
        <div>
            {/* HEADER */}
            <div className="header-flex">
                <div>
                    <h1>MATERIAL REQUEST FORM</h1>
                    <p>Request ID: #{kit.id} | SKU: {kit.sku}</p>
                </div>
                <div className="text-right">
                    <h2>{kit.name}</h2>
                    <p>Requested Qty: {quantity}</p>
                </div>
            </div>

            {/* TABLE */}
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th className="text-center">Bin Location</th>
                        <th className="text-center">Qty Needed</th>
                        <th className="text-right">Stock Status</th>
                    </tr>
                </thead>
                <tbody>
                    {kit.items.map((item: any, idx: number) => {
                        const articleInInventory = articles.find(a => a.id === item.articleId);
                        const currentStock = articleInInventory?.quantityAvailable ?? 0;
                        const required = item.quantity * quantity;
                        const hasStock = currentStock >= required;

                        return (
                            <tr key={idx}>
                                <td>
                                    <div className="font-bold">{item.articleName}</div>
                                    <small>{item.articleSku}</small>
                                </td>
                                <td className="text-center">{kit.binCode || 'N/A'}</td>
                                <td className="text-center">{required}</td>
                                <td className="text-right">
                                    {hasStock ? (
                                        <span className="success-badge">✓ Available ({currentStock})</span>
                                    ) : (
                                        <span className="error-badge">⚠ Low Stock ({currentStock})</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* FOOTER */}
            <div className="signatures">
                <div className="signature-block">
                    <p className="font-bold">REQUESTED BY:</p>
                    <div className="signature-line"></div>
                    <p>Signature</p>
                    <small>Date: {today}</small>
                </div>

                <div className="signature-block">
                    <p className="font-bold">APPROVED BY:</p>
                    <div className="signature-line"></div>
                    <p>Manager Signature</p>
                    <small>Date: ______________</small>
                </div>
            </div>
            
            <div className="text-center" style={{ marginTop: '40px', fontSize: '10px', color: '#666' }}>
                System generated document. Internal use only.
            </div>
        </div>
    );
};
