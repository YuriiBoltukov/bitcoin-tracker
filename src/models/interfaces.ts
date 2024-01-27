/**
 * Represents a crypto currency with relevant information.
 */
export interface CryptoCurrency {
  /**
   * The name of the crypto currency.
   */
  name: string;
  /**
   * The symbol of the crypto currency (e.g., BTC, ETH).
   */
  symbol: CurrencySymbol;
  /**
   * The price of the crypto currency.
   */
  price: number;
  /**
   * The price of the crypto currency in USD as a string.
   */
  price_usd: string;
}

/**
 * Enum representing currency symbols for crypto currencies.
 */
export enum CurrencySymbol {
  USDT = 'USDT',
  BTC = 'BTC',
  ETH = 'ETH',
}
