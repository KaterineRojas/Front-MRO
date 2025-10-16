import { Article } from '../components/features/inventory/types/inventory';

const URL = 'http://localhost:5000/api';



// --- Función Auxiliar para Obtener el Token ---
const getAuthToken = (): string | null => {
 //verificar
  return localStorage.getItem('authToken'); 

};

export async function getItems(): Promise<Article[]> {
  const response = await fetch(`${URL}/items`);
  if (!response.ok) {
    throw new Error('Error al obtener los artículos');
  }
  return await response.json();
}

//save items
interface ItemPayload {
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  consumible: boolean;
  urlImage: string;
}
export async function saveItems(items: Article[]): Promise<any> {
  
  console.log(' JSON ', items);
 
  const authToken = getAuthToken();

  if (!authToken) {
  
    throw new Error('No se encontró el token de autenticación. Inicie sesión.');
  }

console.log(' JSON de artículos recibido en saveItems:', items);

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

      'Authorization': `Bearer ${authToken}`, 
    },
    body: JSON.stringify(items), 
  };

  const response = await fetch(`${URL}/Items`, requestOptions); 

  if (!response.ok) {
  
    const errorBody = await response.text(); 
    throw new Error(`Error ${response.status} al guardar artículos: ${errorBody || response.statusText}`);
  }

  return await response.json(); 
}
