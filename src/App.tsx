import style                                                                       from './App.module.scss';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import React, { useEffect, useRef, useState }                                      from 'react';
import { getCryptoData }                                        from './service/cryptoService.ts';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { CryptoCurrency, CurrencySymbol } from './models/interfaces.ts';

/**
 * Enum representing the target currency for conversion.
 */
enum CurrencyTarget {
  from = 'from',
  to = 'to',
}

/**
 * Interface representing the state of the currency conversion.
 */
interface CurrencyState {
  [CurrencyTarget.from]: CurrencySymbol;
  [CurrencyTarget.to]: CurrencySymbol;
  fromAmount: number;
  toAmount: number;
}

function App() {
  /**
   * Ref for the input element.
   */
  const inputElement: React.MutableRefObject<HTMLInputElement | null> = useRef(null);

  /**
   * Array of currency symbols we can use in our app.
   */
  const currencySigns: CurrencySymbol[] = [CurrencySymbol.BTC, CurrencySymbol.ETH, CurrencySymbol.USDT];

  /**
   * State for currency conversion.
   */
  const [currencyState, setCurrencyState]: [CurrencyState, React.Dispatch<React.SetStateAction<CurrencyState>>] = useState<CurrencyState>({
    [CurrencyTarget.from]: CurrencySymbol.USDT,
    [CurrencyTarget.to]: CurrencySymbol.BTC,
    fromAmount: 1,
    toAmount: 0,
  });

  /**
   * State for storing crypto currency data.
   */
  const [cryptoData, setCryptoData]:  [CryptoCurrency[], React.Dispatch<React.SetStateAction<CryptoCurrency[]>>] = useState<CryptoCurrency[]>([]);

  /**
   * Function to calculate amounts for currency conversion.
   * @param currentValue - The current value of the currency.
   * @param convertTo - The target currency for conversion.
   */
  function calculateAmounts(currentValue: number, convertTo: CurrencyTarget ): void {
    if ( currentValue < 0 ) return;

    if ( convertTo === CurrencyTarget.from ) {
      const amount = calculateExchangeRate( currentValue, currencyState.to, currencyState.from );
      setCurrencyState( ( prevState: CurrencyState ): CurrencyState => ({
        ...prevState,
        toAmount: currentValue,
        fromAmount: amount,
      }) );
    } else {
      const amount = calculateExchangeRate( currentValue, currencyState.from, currencyState.to );
      setCurrencyState( ( prevState: CurrencyState ): CurrencyState => ({
        ...prevState,
        fromAmount: currentValue,
        toAmount: amount,
      }) );
    }
  }

  /**
   * Function to handle changes in the input amount.
   * @param targetValue - The new value of the input.
   * @param convertTo - The target currency for conversion.
   */
  function handleAmountChange(targetValue: string, convertTo: CurrencyTarget): void{
    if(!targetValue) {
      setCurrencyState((prevState: CurrencyState): CurrencyState => ({
        ...prevState,
        fromAmount: 0,
        toAmount: 0,
      }));

      return;
    }

    const currentValue: number = parseFloat(targetValue);

    calculateAmounts(currentValue, convertTo);
  }

  /**
   * Function to handle changes in the selected currency.
   * @param newCurrency - The newly selected currency.
   * @param targetCurrency - The target currency.
   */
  function handleCurrencyChange(newCurrency: string, targetCurrency: CurrencyTarget): void {
    //todo rename
    const otherCurrency: CurrencySymbol = currencyState[targetCurrency === CurrencyTarget.from ? CurrencyTarget.to : CurrencyTarget.from];

    if(newCurrency === otherCurrency) {
      setCurrencyState((prevState: CurrencyState): CurrencyState => {
         return  {
           ...prevState,
           [targetCurrency]: newCurrency,
           [targetCurrency === CurrencyTarget.from ? CurrencyTarget.to : CurrencyTarget.from]: prevState[targetCurrency],
           fromAmount: prevState['toAmount'],
           toAmount: prevState['fromAmount']
         }
      })
    } else {
      setCurrencyState((prevState: CurrencyState): CurrencyState => {
        return {
          ...prevState,
          [targetCurrency]: newCurrency,
        };
      })
    }
 }

  /**
   * Function to find a currency by its symbol.
   * @param symbol - The symbol of the currency.
   * @returns The corresponding CryptoCurrency object.
   */
  function findCurrencyBySymbol(symbol: CurrencySymbol): CryptoCurrency | undefined {
    return cryptoData?.find((currency: CryptoCurrency): boolean => currency.symbol === symbol);
  }

  /**
   * Function to draw options for the currency selector.
   * @returns React nodes representing currency options.
   */
  function drawOptions(): React.ReactNode {
    return currencySigns.map((symbol: CurrencySymbol, index: number) => (
      <MenuItem key={index} value={symbol}>
        {symbol}
      </MenuItem>
    ));
  }

  /**
   * Async function to fetch crypto currency data.
   */
  async function fetchData(): Promise<void> {
    try {
      const cryptoCurrenciesRes: CryptoCurrency[] = await getCryptoData();
      const filteredCryptoCurrencies: CryptoCurrency[] = cryptoCurrenciesRes.filter((currency: CryptoCurrency) => {
        return currencySigns.includes( currency.symbol );
      })

      setCryptoData(filteredCryptoCurrencies);
    } catch (error) {
      console.error('Ошибка при запросе данных с сервера:', error);
    }
  }

  /**
   * Async function to initialize currencies and set initial exchange rates.
   */
  async function initCurrencies(): Promise<void> {
    const toAmount: number = calculateExchangeRate(currencyState.fromAmount, currencyState.from, currencyState.to);

    if (toAmount == -1) {
      console.error( 'Выбранной валюты нет в списке валют.' );
      return;
    }

    setCurrencyState((prevState: CurrencyState): CurrencyState => ({
      ...prevState,
      toAmount,
    }));
  }

  /**
   * Function to calculate exchange rates between two currencies.
   * @param fromAmount - The amount to convert from.
   * @param fromCurrencySymbol - The symbol of the currency to convert from.
   * @param toCurrencySymbol - The symbol of the currency to convert to.
   * @returns The calculated amount in the target currency.
   */
  function calculateExchangeRate(
    fromAmount: CurrencyState['fromAmount'],
    fromCurrencySymbol: CurrencySymbol,
    toCurrencySymbol: CurrencySymbol
  ): number {
    const fromCurrency: CryptoCurrency | undefined = findCurrencyBySymbol(fromCurrencySymbol);
    const toCurrency: CryptoCurrency | undefined = findCurrencyBySymbol(toCurrencySymbol);

    if(!fromCurrency || !toCurrency) return -1;

    return (fromAmount / parseFloat(fromCurrency.price_usd)) * parseFloat(toCurrency.price_usd);
  }

  /**
   * Effect hook to fetch data on component mount.
   */
  useEffect((): void => {
    fetchData();

    if(inputElement.current) {
      inputElement.current.focus()
    }
  }, []);

  /**
   * Effect hook to initialize currencies when crypto data changes.
   */
  useEffect((): void => {
    if(cryptoData.length) {
      initCurrencies();
    }
  }, [cryptoData])

  /**
   * Effect hook to recalculate amounts when the "from" currency changes.
   */
  useEffect((): void => {
    if(cryptoData.length) {
      calculateAmounts( currencyState['fromAmount'], CurrencyTarget.to );
    }
  }, [currencyState[CurrencyTarget.from]]);

  /**
   * Effect hook to recalculate amounts when the "to" currency changes.
   */
  useEffect((): void => {
    if(cryptoData.length) {
      calculateAmounts( currencyState['toAmount'], CurrencyTarget.from );
    }
  }, [currencyState[CurrencyTarget.to]])

  return (
    <>
      <div className={style.app}>
        <div className={style.app_wrapper}>
          <TextField
            id="outlined-basic"
            inputRef={inputElement}
            type={'number'}
            label="Amount"
            variant="outlined"
            value={currencyState.fromAmount}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleAmountChange(event.target.value, CurrencyTarget.to)}
          />
          <FormControl fullWidth>
            <InputLabel id="fromCurrency">Currency exchange</InputLabel>
            <Select
              labelId="fromCurrency"
              id="fromCurrency"
              label="Currency exchange"
              value={currencyState.from}
              onChange={(event: SelectChangeEvent<CurrencySymbol>) => {
                handleCurrencyChange(event.target.value, CurrencyTarget.from );
              }}
            >
              {drawOptions()}
            </Select>
          </FormControl>
        </div>
        <SyncAltIcon color="action" fontSize="large" />
        <div className={style.app_wrapper}>
          <TextField
            id="outlined-basic"
            type={'number'}
            label="Amount"
            variant="outlined"
            value={isNaN(currencyState.toAmount) ? '' : currencyState.toAmount}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleAmountChange(event.target.value, CurrencyTarget.from)}
          />
          <FormControl fullWidth>
            <InputLabel id="toCurrency">Currency get</InputLabel>
            <Select
              labelId="toCurrency"
              id="toCurrency"
              label="Currency get"
              value={currencyState.to}
              onChange={(event: SelectChangeEvent<CurrencySymbol>) => handleCurrencyChange(event.target.value, CurrencyTarget.to)}
            >
              {drawOptions()}
            </Select>
          </FormControl>
        </div>
      </div>
      <div className={style.exchangeRate}>
        {currencyState  && (
          <p>Курс обмена: 1 {currencyState.from} = {calculateExchangeRate(1, currencyState.from, currencyState.to)} {currencyState.to}</p>
        )}
      </div>
    </>
  );
}

export default App;
