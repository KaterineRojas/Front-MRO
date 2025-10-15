import { Article } from '@/types/inventory';

const API_URL = 'https://tuservidor/api';

export async function getItems(): Promise<Article[]> {
  const response = await fetch(`${API_URL}/items`);
  if (!response.ok) {
    throw new Error('Error al obtener los artículos');
  }
  return await response.json();
}
