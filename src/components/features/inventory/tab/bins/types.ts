export interface Bin {
  id: number;
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}

export interface BinFormData {
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}

export interface BinFormProps {
  formData: BinFormData;
  setFormData: React.Dispatch<React.SetStateAction<BinFormData>>;
  handleSubmit: (e: React.FormEvent) => void;
  editingBin: Bin | null;
  onCancel: () => void;
}

export interface BinTableProps {
  bins: Bin[];
  onEdit: (bin: Bin) => void;
  onDelete: (id: number) => void;
}
