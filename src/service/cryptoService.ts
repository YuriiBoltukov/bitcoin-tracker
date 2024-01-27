import axios from 'axios';
import { CryptoCurrency } from '../models/interfaces.ts';

const API_URL = `https://api.coinlore.net/api/tickers/`;

/**
 * Fetches crypto currency data from the Coinlore API.
 * @returns A Promise that resolves to an array of CryptoCurrency objects.
 * @throws If an error occurs during the API request, an empty array is returned.
 */
export const getCryptoData = async (): Promise<CryptoCurrency[]> => {
  try {
    const {data: {data: response}} = await axios.get(API_URL);

    return response;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
};