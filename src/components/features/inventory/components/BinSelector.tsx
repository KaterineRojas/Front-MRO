import React, { useState, useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { getNewBins } from "../services/inventoryApi"; // ajusta ruta si es necesario

interface Bin {
  id: number;
  binCode: string;
  type: "good-condition" | "on-revision" | "scrap";
  description?: string;
}

interface BinSelectorProps {
  value: string; // el binCode seleccionado
  onValueChange: (bin: { id: number; binCode: string }) => void; // devolvemos ambos
  placeholder?: string;
  required?: boolean;
}

export function BinSelector({
  value,
  onValueChange,
  placeholder = "Select a bin",
  required = false,
}: BinSelectorProps) {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBins() {
      try {
        const response = await getNewBins();
        const goodConditionBins = response.filter(
          (b: Bin) => b.type === "good-condition"
        );
        setBins(goodConditionBins);
      } catch (error) {
        console.error("Error fetching bins:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBins();
  }, []);

  return (
    <Select
      value={value}
      onValueChange={(selectedCode) => {
        // Encontramos el bin seleccionado
        const selectedBin = bins.find((b) => b.binCode === selectedCode);
        if (selectedBin) {
          // ✅ enviamos tanto id como binCode, pero solo se muestra binCode
          onValueChange({
            id: selectedBin.id,
            binCode: selectedBin.binCode,
          });
        }
      }}
      required={required}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading bins..." : placeholder} />
      </SelectTrigger>

      <SelectContent>
        {loading ? (
          <SelectItem disabled value="loading">
            Loading...
          </SelectItem>
        ) : bins.length > 0 ? (
          bins.map((bin) => (
            <SelectItem key={bin.id} value={bin.binCode}>
              {bin.binCode} — {bin.description || "No description"}
            </SelectItem>
          ))
        ) : (
          <SelectItem disabled value="none">
            No bins available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}


/** 
interface Bin {
  id: number;
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description?: string;
}

interface BinSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function BinSelector({
  value,
  onValueChange,
  placeholder = 'Select a bin',
  required = false,
}: BinSelectorProps) {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBins() {
      try {
        const response = await getNewBins(); // ⚡ trae los bins de la API
        // opcional: filtrar solo los bins válidos
        const goodConditionBins = response.filter((b: Bin) => b.type === 'good-condition');
        setBins(goodConditionBins);
      } catch (error) {
        console.error('Error fetching bins:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBins();
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? 'Loading bins...' : placeholder} />
      </SelectTrigger>

      <SelectContent>
        {loading ? (
          <SelectItem disabled value="loading">
            Loading...
          </SelectItem>
        ) : bins.length > 0 ? (
          bins.map((bin) => (
            <SelectItem key={bin.id} value={bin.binCode}>
              {bin.binCode} — {bin.description || 'No description'}
            </SelectItem>
          ))
        ) : (
          <SelectItem disabled value="none">
            No bins available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
*/