import * as fs from 'fs';
import * as path from 'path';

const inputs: number[] = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString().split("\n").map(x => parseInt(x));

const increasedInputs = inputs.filter(isLargerThanPrev);

function isLargerThanPrev(input: number, index: number): boolean {
  if (index === 0) {
    return false;
  }

  const prevInput = inputs[index - 1];
  return input > prevInput;
}

console.log('The answer is ' + increasedInputs.length)