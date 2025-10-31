// src/components/RecordMovementModal/KitMovementForm.tsx
import React, { useState } from 'react';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Textarea } from '../../../../ui/textarea';
import { Button } from '../../../../ui/button';
import { Badge } from '../../../../ui/badge';
import { RelocationFields } from './MovementFields/RelocationFields';

import type { Article, Kit } from '../../types';
import type { MovementData } from '../RecordMovement/types';

interface KitMovementFormProps {
  movementData: MovementData;
  setMovementData: React.Dispatch<React.SetStateAction<MovementData>>;
  kits: Kit[];
  articles: Article[];
  onRecordMovement: (movementData: MovementData) => void;
}

export function KitMovementForm({ 
  movementData, 
  setMovementData, 
  kits, 
  articles, 
  onRecordMovement 
}: KitMovementFormProps) {
  const [kitSearchTermMovement, setKitSearchTermMovement] = useState('');

  // Lógica de filtrado de kits
  const filteredKitsForMovement = kits.filter(kit =>
    kit.binCode.toLowerCase().includes(kitSearchTermMovement.toLowerCase()) ||
    kit.name.toLowerCase().includes(kitSearchTermMovement.toLowerCase())
  );
  
  const selectedKitForMovement = kits.find(kit => kit.binCode === movementData.kitBinCode);

  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación específica para kits (solo reubicación)
    if (movementData.movementType !== 'relocation') {
      alert("Error: Kits can only be relocated.");
      return;
    }
    
    console.log('📦 Submitting Kit Movement:', movementData);
    onRecordMovement(movementData);
  };

  return (
    <form onSubmit={handleRecordMovement} className="space-y-5">
      
      {/* Kit Selection */}
      <div>
        <Label>Select Kit *</Label>
        <Select 
          value={movementData.kitBinCode} 
          onValueChange={(value: any) => {
            console.log('📦 Kit Selected:', value);
            setMovementData(prev => ({ 
              ...prev, 
              kitBinCode: value, 
              newLocationBinId: 0 // ✅ Resetear newLocationBinId al cambiar kit
            }));
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
                onChange={(e) => {
                  e.stopPropagation();
                  setKitSearchTermMovement(e.target.value);
                }}
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
      </div>

      {/* Kit Content Card */}
      {selectedKitForMovement && (
        <div className="mt-3 p-4 bg-muted rounded-lg border">
          <p className="font-medium mb-3">Kit: {selectedKitForMovement.name}</p>
          <p className="text-sm mb-2 block text-muted-foreground">
            Current Location: <strong>{selectedKitForMovement.binCode}</strong>
          </p>
          <Label className="text-sm mb-2 block">
            Items in this Kit ({selectedKitForMovement.items.length})
          </Label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {selectedKitForMovement.items.map((item, index) => {
              // ✅ CORREGIDO: Buscar artículo por ID en lugar de binCode
              const article = articles.find(a => a.id === item.articleId);
              
              return (
                <div key={index} className="flex items-center space-x-3 p-2 bg-card rounded border">
                  <img 
                    src={article?.imageUrl || item.imageUrl || 'https://via.placeholder.com/50'} 
                    alt={item.articleName} 
                    className="w-12 h-12 object-cover rounded" 
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.articleName}</p>
                    <p className="text-xs text-muted-foreground">{item.articleSku}</p>
                  </div>
                  <Badge variant="outline">x{item.quantity}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONDITIONAL FIELDS (Relocation only for Kits) */}
      {selectedKitForMovement ? (
        <RelocationFields 
          movementData={movementData} 
          setMovementData={setMovementData} 
          selectedItem={null} // Es un Kit, no un Article
        />
      ) : (
        <div className="p-4 text-center text-sm text-muted-foreground border rounded-lg">
          Please select a kit to continue.
        </div>
      )}

      {/* Notes */}
      <div>
        <Label>Notes (optional)</Label>
        <Textarea
          value={movementData.notes}
          onChange={(e) => setMovementData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes about this relocation..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit">Record Relocation</Button>
      </div>
    </form>
  );
}