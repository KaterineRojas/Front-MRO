import { useState, useMemo } from 'react';
import type { Bin, BinFormData } from './types';

export function UseBinForm(
  bins: Bin[],
  setBins: React.Dispatch<React.SetStateAction<Bin[]>>,
  editingBin: Bin | null,
  setEditingBin: React.Dispatch<React.SetStateAction<Bin | null>>,
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [formData, setFormData] = useState<BinFormData>({
    binCode: '',
    type: 'good-condition',
    description: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredBins = useMemo(() => {
    return bins.filter((bin) => {
      const matchesSearch =
        bin.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bin.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || bin.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [bins, searchTerm, typeFilter]);

  const resetForm = () => {
    setFormData({
      binCode: '',
      type: 'good-condition',
      description: '',
    });
    setEditingBin(null);
    setDialogOpen(false);
  };

  const handleEdit = (bin: Bin) => {
    setEditingBin(bin);
    setFormData({
      binCode: bin.binCode,
      type: bin.type,
      description: bin.description,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate bin code
    const isDuplicate = bins.some(
      (bin) =>
        bin.binCode.toLowerCase() === formData.binCode.toLowerCase() && bin.id !== editingBin?.id
    );

    if (isDuplicate) {
      alert(`Error: BIN Code "${formData.binCode}" already exists. Please use a different code.`);
      return;
    }

    if (editingBin) {
      // Update existing bin
      setBins(bins.map((bin) => (bin.id === editingBin.id ? { ...bin, ...formData } : bin)));
    } else {
      // Create new bin
      const newBin: Bin = {
        id: Math.max(...bins.map((b) => b.id), 0) + 1,
        ...formData,
      };
      setBins([...bins, newBin]);
    }

    resetForm();
  };

  const deleteBin = (id: number) => {
    setBins(bins.filter((bin) => bin.id !== id));
  };

  return {
    formData,
    setFormData,
    filteredBins,
    handleEdit,
    handleSubmit,
    deleteBin,
    resetForm,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
  };
}
