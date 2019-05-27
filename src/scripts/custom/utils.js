// Add German decimal seperators to number
export function pretty(number) {
  let string = Math.round(number).toString().split('.');
  string = string[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') +
    (string[1] ? `,${string[1]}` : '');

  return string;
}
