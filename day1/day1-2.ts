import * as fs from 'fs';
import * as path from 'path';

const inputs: number[] = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString().split("\n").map(x => parseInt(x));

/**
 * The input window is the sum of the input + the upcoming 2 inputs
 */
 function getInputWindowSum(input: number, index: number, arr: number[]) : number {
  const onePlus = arr[index + 1] || 0;
  const twoPlus = arr[index + 2] || 0;
  return input + onePlus + twoPlus;
}

function isLargerThanPrev(input: number, index: number, arr: number[]): boolean {
  if (index === 0) {
    return false;
  }

  const prevInput = arr[index - 1];
  return input > prevInput;
}

const increasedInputs = inputs.map(getInputWindowSum).filter(isLargerThanPrev);

console.log('The answer is ' + increasedInputs.length);