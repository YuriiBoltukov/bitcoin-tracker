export function formatNumber(num: number) {
  let result: string = '';
  if (num >= 1) {
    return Number(num.toFixed(2));
  } else {
    const arr: string[] = num.toString().split('');
    for (let i: number = 0; i < arr.length; i++) {
      if (+arr[i] === 0 || arr[i] === '.') {
        result += arr[i];
      } else {
        result += arr[i] + arr[i + 1];
        break;
      }
    }
    return Number(result);
  }
}