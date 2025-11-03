import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { BinSelector } from '../components/BinSelector';

interface Article {
  id: number;
  imageUrl?: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  type: 'consumable' | 'non-consumable' | 'pending-purchase';
  currentStock: number;
  cost: number;
  binCode: string;
  unit: string;
  supplier: string;
  minStock: number;
  location: string;
  status: string;
  createdAt: string;
}

interface KitItem {
  articleId: number;
  articleBinCode: string;
  articleName: string;
  quantity: number;
}

interface Kit {
  id: number;
  binCode: string;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  imageUrl?: string;
  status: string;
  createdAt: string;
}

interface RecordMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articles: Article[];
  kits: Kit[];
  onMovementRecorded: (movementData: any) => void;
}

export function RecordMovementModal({
  open,
  onOpenChange,
  articles,
  kits,
  onMovementRecorded
}: RecordMovementModalProps) {
  const [movementData, setMovementData] = useState({
    itemType: 'item' as 'item' | 'kit',
    movementType: 'entry' as 'entry' | 'exit' | 'relocation',
    articleSKU: '',
    articleBinCode: '',
    kitBinCode: '',
    quantity: '',
    unitPrice: '',
    status: 'good-condition' as Article['status'],
    newLocation: '',
    notes: ''
  });
  const [priceOption, setPriceOption] = useState('');
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  const [kitSearchTermMovement, setKitSearchTermMovement] = useState('');

  const resetMovementForm = () => {
    setMovementData({
      itemType: 'item',
      movementType: 'entry',
      articleSKU: '',
      articleBinCode: '',
      kitBinCode: '',
      quantity: '',
      unitPrice: '',
      status: 'good-condition',
      newLocation: '',
      notes: ''
    });
    setPriceOption('');
    setArticleSearchTerm('');
    setKitSearchTermMovement('');
  };

  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    onMovementRecorded(movementData);
    onOpenChange(false);
    resetMovementForm();
  };

  // For entry mode, find article by SKU, for exit/relocation find by bin code
  const selectedArticle = movementData.movementType === 'entry' 
    ? articles.find(article => article.sku === movementData.articleSKU)
    : articles.find(article => article.binCode === movementData.articleBinCode);
  
  const selectedKitForMovement = kits.find(kit => kit.binCode === movementData.kitBinCode);
  
  const filteredArticlesForMovement = articles.filter(article => 
    article.sku?.toLowerCase().includes(articleSearchTerm.toLowerCase()) ||
    article.binCode?.toLowerCase().includes(articleSearchTerm.toLowerCase()) ||
    article.name?.toLowerCase().includes(articleSearchTerm.toLowerCase())
  );
  
  const filteredKitsForMovement = kits.filter(kit =>
    kit.binCode?.toLowerCase().includes(kitSearchTermMovement.toLowerCase()) ||
    kit.name?.toLowerCase().includes(kitSearchTermMovement.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Inventory Movement</DialogTitle>
          <DialogDescription>
            Record stock movements for items or kits in your inventory
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRecordMovement} className="space-y-5">
          {/* Item Type Selection */}
          <div>
            <Label>Select Type *</Label>
            <Select 
              value={movementData.itemType} 
              onValueChange={(value: 'item' | 'kit') => {
                setMovementData({
                  ...movementData, 
                  itemType: value,
                  movementType: value === 'kit' ? 'relocation' : movementData.movementType,
                  articleSKU: '',
                  articleBinCode: '',
                  kitBinCode: ''
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="item">Item</SelectItem>
                <SelectItem value="kit">Kit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Movement Type */}
          <div>
            <Label>Movement Type *</Label>
            <Select 
              value={movementData.movementType} 
              onValueChange={(value: 'entry' | 'exit' | 'relocation') => setMovementData({...movementData, movementType: value, articleSKU: '', articleBinCode: ''})}
              disabled={movementData.itemType === 'kit'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Stock Entry</SelectItem>
                <SelectItem value="exit">Stock Exit</SelectItem>
                <SelectItem value="relocation">Relocation</SelectItem>
              </SelectContent>
            </Select>
            {movementData.itemType === 'kit' && (
              <p className="text-xs text-muted-foreground mt-1">Kits can only be relocated</p>
            )}
          </div>

          {/* Article or Kit Selection */}
          {movementData.itemType === 'item' ? (
            <>
              {/* For Stock Entry, show SKU selector */}
              {movementData.movementType === 'entry' ? (
                <div>
                  <Label>Select Article *</Label>
                  <Select 
                    value={movementData.articleSKU} 
                    onValueChange={(value) => {
                      setMovementData({...movementData, articleSKU: value});
                      setArticleSearchTerm('');
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
                          onChange={(e) => setArticleSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="mb-2"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {filteredArticlesForMovement.length > 0 ? (
                          filteredArticlesForMovement.map((article) => (
                            <SelectItem key={article.id} value={article.sku}>
                              <div className="flex items-center space-x-3 py-1">
                                <img 
                                  src={article.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50'}
                                  alt={article.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium">{article.sku}</p>
                                  <p className="text-sm text-muted-foreground">{article.name}</p>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No articles found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>

                  {selectedArticle && (
                    <div className="mt-3 p-4 bg-muted rounded-lg border">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src={selectedArticle.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100'}
                          alt={selectedArticle.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{selectedArticle.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedArticle.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current Stock:</span>
                          <span className="ml-2 font-medium">{selectedArticle.currentStock} {selectedArticle.unit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <span className="ml-2 font-medium">{selectedArticle.location}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* For Stock Exit or Relocation, show SKU selector first, then BIN selector */
                <>
                  <div>
                    <Label>Select Article *</Label>
                    <Select 
                      value={movementData.articleSKU} 
                      onValueChange={(value) => {
                        setMovementData({...movementData, articleSKU: value, articleBinCode: ''});
                        setArticleSearchTerm('');
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
                            onChange={(e) => setArticleSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mb-2"
                          />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {filteredArticlesForMovement.length > 0 ? (
                            filteredArticlesForMovement.map((article) => (
                              <SelectItem key={article.id} value={article.sku}>
                                <div className="flex items-center space-x-3 py-1">
                                  <img 
                                    src={article.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50'}
                                    alt={article.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                  <div>
                                    <p className="font-medium">{article.sku}</p>
                                    <p className="text-sm text-muted-foreground">{article.name}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No articles found
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* BIN Selector - only show if article is selected */}
                  {movementData.articleSKU && (
                    <div>
                      <Label>Select BIN Code *</Label>
                      <Select 
                        value={movementData.articleBinCode} 
                        onValueChange={(value) => {
                          setMovementData({...movementData, articleBinCode: value});
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select which BIN to use" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Mock bins for the selected SKU */}
                          {articles.filter(a => a.sku === movementData.articleSKU).map((article) => (
                            <SelectItem key={article.id} value={article.binCode}>
                              <div className="flex items-center justify-between space-x-4 py-1">
                                <span className="font-mono">{article.binCode}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-muted-foreground">{article.currentStock} {article.unit}</span>
                                  <Badge className="bg-green-600">Good Condition</Badge>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                          {/* Mock additional bins for the same SKU */}
                          <SelectItem value="BIN-STORAGE-001">
                            <div className="flex items-center justify-between space-x-4 py-1">
                              <span className="font-mono">BIN-STORAGE-001</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">500 units</span>
                                <Badge className="bg-green-600">Good Condition</Badge>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="BIN-BACKUP-002">
                            <div className="flex items-center justify-between space-x-4 py-1">
                              <span className="font-mono">BIN-BACKUP-002</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">250 units</span>
                                <Badge className="bg-green-600">Good Condition</Badge>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="BIN-C-001">
                            <div className="flex items-center justify-between space-x-4 py-1">
                              <span className="font-mono">BIN-C-001</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">75 units</span>
                                <Badge className="bg-yellow-600">On Revision</Badge>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedArticle && (
                    <div className="mt-3 p-4 bg-muted rounded-lg border">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src={selectedArticle.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100'}
                          alt={selectedArticle.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{selectedArticle.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedArticle.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current Stock:</span>
                          <span className="ml-2 font-medium">{selectedArticle.currentStock} {selectedArticle.unit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <span className="ml-2 font-medium">{selectedArticle.location}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div>
              <Label>Select Kit *</Label>
              <Select 
                value={movementData.kitBinCode} 
                onValueChange={(value) => {
                  setMovementData({...movementData, kitBinCode: value});
                  setKitSearchTermMovement('');
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Search and select a kit" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 sticky top-0 bg-background z-10">
                    <Input
                      placeholder="Search by BIN code or name..."
                      value={kitSearchTermMovement}
                      onChange={(e) => setKitSearchTermMovement(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="mb-2"
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredKitsForMovement.length > 0 ? (
                      filteredKitsForMovement.map((kit) => (
                        <SelectItem key={kit.id} value={kit.binCode}>
                          <div className="flex flex-col py-1">
                            <p className="font-medium">{kit.binCode}</p>
                            <p className="text-sm text-muted-foreground">{kit.name}</p>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No kits found
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>

              {selectedKitForMovement && (
                <div className="mt-3 p-4 bg-muted rounded-lg border">
                  <p className="font-medium mb-3">{selectedKitForMovement.name}</p>
                  <Label className="text-sm mb-2 block">Items in this Kit ({selectedKitForMovement.items.length})</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedKitForMovement.items.map((item, index) => {
                      // Find the article to get the image
                      const article = articles.find(a => a.binCode === item.articleBinCode);
                      return (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-card rounded border">
                          <img 
                            src={article?.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50'}
                            alt={item.articleName}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.articleName}</p>
                            <p className="text-xs text-muted-foreground">{item.articleBinCode}</p>
                          </div>
                          <Badge variant="outline">x{item.quantity}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity - Only for Items, not for Kits */}
          {movementData.itemType === 'item' && (
            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                min="1"
                max={selectedArticle && (movementData.movementType === 'exit' || movementData.movementType === 'relocation') ? selectedArticle.currentStock : undefined}
                value={movementData.quantity}
                onChange={(e) => setMovementData({...movementData, quantity: e.target.value})}
                placeholder="Enter quantity"
                required
              />
              {selectedArticle && (movementData.movementType === 'exit' || movementData.movementType === 'relocation') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {selectedArticle.currentStock} {selectedArticle.unit}
                </p>
              )}
            </div>
          )}

          {/* Unit Price - Only for Stock Entry */}
          {movementData.itemType === 'item' && movementData.movementType === 'entry' && selectedArticle && (
            <div>
              <Label>Unit Price *</Label>
              <Select
                value={priceOption}
                onValueChange={(value) => {
                  setPriceOption(value);
                  if (value === 'custom') {
                    setMovementData({...movementData, unitPrice: ''});
                  } else {
                    const price = value.split('-')[2];
                    setMovementData({...movementData, unitPrice: price});
                  }
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select or enter unit price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={`price-current-${selectedArticle.cost}`}>
                    ${selectedArticle.cost.toFixed(2)} (Current Price)
                  </SelectItem>
                  <SelectItem value={`price-discount10-${(selectedArticle.cost * 0.9).toFixed(4)}`}>
                    ${(selectedArticle.cost * 0.9).toFixed(2)} (10% Discount)
                  </SelectItem>
                  <SelectItem value={`price-discount15-${(selectedArticle.cost * 0.85).toFixed(4)}`}>
                    ${(selectedArticle.cost * 0.85).toFixed(2)} (15% Discount)
                  </SelectItem>
                  <SelectItem value={`price-increase10-${(selectedArticle.cost * 1.1).toFixed(4)}`}>
                    ${(selectedArticle.cost * 1.1).toFixed(2)} (10% Increase)
                  </SelectItem>
                  <SelectItem value="custom">Custom Price</SelectItem>
                </SelectContent>
              </Select>
              {priceOption === 'custom' && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={movementData.unitPrice}
                  onChange={(e) => setMovementData({...movementData, unitPrice: e.target.value})}
                  placeholder="Enter custom unit price"
                  className="mt-2"
                  required
                />
              )}
              {movementData.unitPrice && movementData.quantity && !isNaN(parseFloat(movementData.unitPrice)) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Total: ${(parseFloat(movementData.unitPrice) * parseInt(movementData.quantity)).toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* New Location (for entry and relocation) */}
          {(movementData.movementType === 'entry' || movementData.movementType === 'relocation') && (
            <div>
              <Label>New Location *</Label>
              <BinSelector
                value={movementData.newLocation}
                onValueChange={(value) => setMovementData({...movementData, newLocation: value})}
                placeholder="Select new location"
                currentBin={selectedArticle?.binCode}
                required
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={movementData.notes}
              onChange={(e) => setMovementData({...movementData, notes: e.target.value})}
              placeholder="Additional notes about this movement..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Record Movement</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
