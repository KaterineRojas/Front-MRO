// src/services/inventarioService.ts
import { Article } from '../components/features/inventory/types/inventory'; 

const API_URL = 'https://tuservidor.com/api';

export async function getItems(): Promise<Article[]> {
  const response = await fetch(`${API_URL}/items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener los artículos');
  }

  return response.json();
}
