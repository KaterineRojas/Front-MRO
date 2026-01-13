import { AppDispatch } from '../../../../store/store';
import { deleteBin, fetchBins } from '../../../../store/slices/inventorySlice';

interface DeleteBinParams {
  binId: number;
  dispatch: AppDispatch;
  onSuccess: () => void;
  onError: (errorType: 'in-use' | 'error') => void;
}

/**
 * Maneja la lógica de eliminación de un bin
 * @param params - Parámetros necesarios para eliminar el bin
 */
export async function handleDeleteBin({
  binId,
  dispatch,
  onSuccess,
  onError
}: DeleteBinParams): Promise<void> {
  try {
    // Intentar eliminar el bin
    await dispatch(deleteBin(binId)).unwrap();
    
    // Si fue exitoso, recargar la lista de bins
    await dispatch(fetchBins()).unwrap();
    
    // Llamar al callback de éxito
    onSuccess();
    
  } catch (error: any) {
    console.error('Failed to delete bin:', error);
    
    // Determinar el tipo de error
    const errorMessage = error?.message || '';
    
    if (errorMessage.includes('currently in use')) {
      onError('in-use');
    } else {
      onError('error');
    }
  }
}