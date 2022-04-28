export const randomColor = () => {
  let r = (Math.random() * 255).toString();
  let g = (Math.random() * 255).toString();
  let b = (Math.random() * 255).toString();
  let a = '0.8';
  return 'rgba(' + r + ', ' + g + ', ' + b + ',' + a + ')';
}

export const generateFakeData = (maxSop: number, maxValue: number ) => {
  // @ts-expect-error: Unreachable code error
  const randomArray = (length: number, max: number) => Array(length).fill().map(() => Math.round(Math.random() * max));
  let a = randomArray(maxSop, maxValue);
  let cycle_time = a.reduce((a, b) => a + b);
  a.unshift(cycle_time);
  return a;
  // return [cycle_time, step1, step2, step3];
}