import React, { useState } from 'react';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Textarea } from '../../../../ui/textarea';
import { Button } from '../../../../ui/button';
import { Badge } from '../../../../ui/badge';
import { EntryFields } from './MovementFields/EntryFields';
import { ExitFields } from './MovementFields/ExitFields';
import { RelocationFields } from './MovementFields/RelocationFields';
import { AdjustmentFields } from './MovementFields/AdjustmentFields';
import type { Article } from '../../types';
import type { MovementData } from './types';
import { Package, Search, Edit, Trash2, Plus, ChevronDown, ChevronRight, TrendingDown, RotateCcw } from 'lucide-react';

interface ItemMovementFormProps {
    movementData: MovementData;
    setMovementData: React.Dispatch<React.SetStateAction<MovementData>>;
    articles: Article[];
    onRecordMovement: (movementData: MovementData) => void;
    //priceOption: string;
    //setPriceOption: React.Dispatch<React.SetStateAction<string>>;
}

const getBinPurposeBadgeClass = (purpose: string) => {
    switch (purpose) {
        case 'GoodCondition': return 'bg-green-600';
        case 'OnRevision': return 'bg-yellow-600';
        case 'Scrap': return 'bg-red-600';
        case 'Reception': return 'bg-gray-600';
        default: return 'bg-gray-400';
    }
};

const getBinPurposeLabel = (purpose: string) => {
    switch (purpose) {
        case 'GoodCondition': return 'Good Condition';
        case 'OnRevision': return 'On Revision';
        case 'Scrap': return 'Scrap';
        case 'Reception': return 'Reception';
        default: return purpose;
    }
};

export function ItemMovementForm({
    movementData,
    setMovementData,
    articles,
    onRecordMovement,
    //priceOption,
    //setPriceOption
}: ItemMovementFormProps) {
    const [articleSearchTerm, setArticleSearchTerm] = useState('');

    // ✅ Buscar artículo seleccionado por ID
    const selectedArticle = articles.find(article => article.id === movementData.articleId);

    // ✅ Filtrar artículos únicos por SKU
    const uniqueArticles = articles.filter((article, index, self) =>
        index === self.findIndex((t) => t.sku === article.sku)
    );

    const filteredArticles = uniqueArticles.filter(article =>
        article.sku.toLowerCase().includes(articleSearchTerm.toLowerCase()) ||
        article.name.toLowerCase().includes(articleSearchTerm.toLowerCase())
    );

    const handleRecordMovement = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('📤 Submitting Item Movement:', movementData);
        onRecordMovement(movementData);
    };

    const renderMovementFields = () => {
        if (!selectedArticle) {
            return <p className="text-sm text-muted-foreground text-center p-4 border rounded-lg">Please select an article to continue.</p>;
        }

        if (movementData.movementType !== 'entry' && movementData.articleBinId === 0) {
            return <p className="text-sm text-muted-foreground text-center p-4 border rounded-lg">Please select a BIN to continue.</p>;
        }

        switch (movementData.movementType) {
            case 'entry':
                return <EntryFields
                    movementData={movementData}
                    setMovementData={setMovementData}
                    selectedArticle={selectedArticle}
                   // priceOption={priceOption}
                    //setPriceOption={setPriceOption}
                />;
            case 'exit':
                return <ExitFields
                    movementData={movementData}
                    setMovementData={setMovementData}
                    selectedArticle={selectedArticle}
                />;
            case 'relocation':
                return <RelocationFields
                    movementData={movementData}
                    setMovementData={setMovementData}
                    selectedItem={selectedArticle}
                />;
            case 'adjustment':
                return <AdjustmentFields
                    movementData={movementData}
                    setMovementData={setMovementData}
                    selectedArticle={selectedArticle}
                />;
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleRecordMovement} className="space-y-5">
            {/* Article Selection */}
            <div>
                <Label>Select Article *</Label>
                <Select
                    value={movementData.articleId > 0 ? movementData.articleId.toString() : ''}
                    onValueChange={(value: string) => {
                        const articleId = parseInt(value);
                        const article = articles.find(a => a.id === articleId);
                        console.log('🟢 Article Selected:', { articleId, article });
                        setMovementData(prev => ({
                            ...prev,
                            articleId: articleId,
                            articleBinId: 0,
                            newLocationBinId: 0
                        }));
                    }}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Search and select an article" />
                    </SelectTrigger>
                    <SelectContent>
                        <div className="p-2 sticky top-0 bg-background z-10">
                            <Input
                                placeholder="Search by SKU or name..."
                                value={articleSearchTerm}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    setArticleSearchTerm(e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="mb-2"
                            />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {filteredArticles.map((article) => (
                                <SelectItem key={article.id} value={article.id.toString()}>
                                    <div className="flex items-center space-x-3 py-1">
                                        {article.imageUrl ? (
                                            <img
                                                src={article.imageUrl}
                                                alt={article.name}
                                                className="w-10 h-10 object-cover rounded"
                                                onError={(e) => {
                                                    // Si la imagen falla al cargar, ocultar y mostrar fallback
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-10 h-10 bg-muted rounded flex items-center justify-center"
                                            style={{ display: article.imageUrl ? 'none' : 'flex' }}
                                        >
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{article.sku}</p>
                                            <p className="text-sm text-muted-foreground">{article.name}</p>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                            {filteredArticles.length === 0 && (
                                <div className="p-2 text-sm text-muted-foreground text-center">No articles found</div>
                            )}
                        </div>
                    </SelectContent>
                </Select>
            </div>

            {/* BIN Selection (Para Exit, Relocation, Adjustment) */}
            {movementData.articleId > 0 && movementData.movementType !== 'entry' && selectedArticle && (
                <div>
                    <Label>Select BIN Code *</Label>
                    <Select
                        value={movementData.articleBinId > 0 ? movementData.articleBinId.toString() : ''}
                        onValueChange={(value: string) => {
                            const binId = parseInt(value);
                            console.log('🔵 BIN Selected:', binId);
                            setMovementData(prev => ({ ...prev, articleBinId: binId, newLocationBinId: 0 }));
                        }}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select which BIN to use" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedArticle.bins && selectedArticle.bins.length > 0 ? (
                                selectedArticle.bins.map((bin) => (
                                    <SelectItem key={bin.binId} value={bin.binId.toString()}>
                                        <div className="flex items-center justify-between space-x-4 py-1">
                                            <span className="font-mono">{bin.binCode}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {bin.quantity} {selectedArticle.unit}
                                                </span>
                                                <Badge className={getBinPurposeBadgeClass(bin.binPurpose)}>
                                                    {getBinPurposeLabel(bin.binPurpose)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                    No bins available for this item
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Article Details Card */}
            {selectedArticle && (



                <div className="p-4 bg-muted rounded-lg border">
                    <div className="flex items-center space-x-3 mb-3">
                        {selectedArticle.imageUrl ? (
                            <img
                                src={selectedArticle.imageUrl}
                                alt={selectedArticle.name}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="w-16 h-16 bg-muted rounded flex items-center justify-center"
                            style={{ display: selectedArticle.imageUrl ? 'none' : 'flex' }}
                        >
                            <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{selectedArticle.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedArticle.description}</p>
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">SKU:</span>
                            <span className="ml-2 font-medium">{selectedArticle.sku}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Total Physical:</span>
                            <span className="ml-2 font-medium">{selectedArticle.totalPhysical} {selectedArticle.unit}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Available:</span>
                            <span className="ml-2 font-medium">{selectedArticle.quantityAvailable} {selectedArticle.unit}</span>
                        </div>
                        {movementData.articleBinId > 0 && (() => {
                            const selectedBin = selectedArticle.bins?.find(b => b.binId === movementData.articleBinId);
                            return selectedBin ? (
                                <div>
                                    <span className="text-muted-foreground">Selected BIN:</span>
                                    <span className="ml-2 font-medium">{selectedBin.binCode} ({selectedBin.quantity} {selectedArticle.unit})</span>
                                </div>
                            ) : null;
                        })()}
                    </div>
                </div>
            )}

            {/* CONDITIONAL FIELDS */}
            <div className="space-y-5">
                {renderMovementFields()}
            </div>

            {/* Notes */}
            <div>
                <Label>Notes (optional)</Label>
                <Textarea
                    value={movementData.notes}
                    onChange={(e) => setMovementData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this movement..."
                    rows={3}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="submit">Record Movement</Button>
            </div>
        </form>
    );
}