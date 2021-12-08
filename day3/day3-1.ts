import * as fs from 'fs';
import * as path from 'path';

const testInput = ['00100','11110','10110','10111','10101','01111','00111','11100','10000','11001','00010','01010'];
const input = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString().split("\n");

/**
 * Conver the binary number  string to an array of digits
 */
 function binNumberToArray(binNumber: string): number[] {
    return binNumber.split('').map(x => parseInt(x, 10));
}

function calcPowerConsumption(binNumberArray: number[][]): number {
    const arrayLength = binNumberArray.length;
    /*
     * Add each each bit in the bitnumberArray to the cooresponding bit in the gammaBitNumber array
     */
    const binNumberArraySums = Array(binNumberArray[0].length).fill(0).map((binNumber, index) => {
        return binNumberArray.reduce((acc, currentBinNumber) => {
            return acc + currentBinNumber[index];
        }, 0);
    });

    const gammaBitNumber = binNumberArraySums.map(x => x > (arrayLength / 2) ? 1 : 0);
    const epsilonBitNumber = binNumberArraySums.map(x => x > (arrayLength / 2) ? 0 : 1);
    return parseInt(gammaBitNumber.join(''), 2) * parseInt(epsilonBitNumber.join(''), 2);
}

const binNumberArray = input.map(binNumberToArray);
console.log(calcPowerConsumption(binNumberArray));