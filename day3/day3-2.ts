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

/**
 * The oxygen generator rating is the number that has the most common value in each bit of the bit array
 *
 * @returns number - The oxygen generator rating as decimal number
 */
function getOxygenGeneratorRating(binNumberArray: number[][]) : number {
    return getRating(binNumberArray, findMostCommonBit);
}

/**
 * The CO2 Scrubber generator rating is the number that has the least common value in each bit of the bit array
 *
 * @returns number - The CO2 Scrubber generator rating as decimal number
 */
function getCO2ScrubberRating(binNumberArray: number[][]) : number {
    return getRating(binNumberArray, findLeastCommonBit);
}

/**
 * Life support rating is the multiplication of the oxygen generator rating and the CO2 scrubber rating
 *
 */
function getLifeSupportRating() {
    const inputArray = input.map(binNumberToArray);
    const oxygenGeneratorRating = getOxygenGeneratorRating(inputArray);
    const CO2ScrubberRating = getCO2ScrubberRating(inputArray);
    return oxygenGeneratorRating * CO2ScrubberRating;
}

/**
 * Find the bit number that matches the criteria for each bit
 *
 * @param {array} binNumberArray - Array of binary numbers split into arrays of digits
 * @param {function} matchCriteriaFunc  - Function that takes an array of binary numbers and returns 0 or 1 as match criteria
 * @returns number - The bitNumber that matches the criteria for each bit as decimal number
 */
function getRating(binNumberArray: number[][], matchCriteriaFunc: Function) : number {
    let currentBitPosition = 0;
    let ratingNumber: null | false | number[] = null;
    let possibleMatches = [...binNumberArray];

    // Walk through each bit until only one number is left
    while (ratingNumber === null) {
        // Get the criteria for the current bit, 1 or 0
        const critaria = matchCriteriaFunc(possibleMatches, currentBitPosition);
        // Filter out all numbers that don't match the criteria
        possibleMatches = possibleMatches.filter(bitArray => bitArray[currentBitPosition] === critaria);

        // Break loop if one match is left
        if ( possibleMatches.length === 1 ) {
            ratingNumber = possibleMatches[0];
        }
        // Abort if there are no matches left
        if ( !possibleMatches.length ) {
            ratingNumber = false;
        }
        currentBitPosition++;
    }
    return ratingNumber ? parseInt(ratingNumber.join(''), 2) : 0
}

/**
 * Get the most common number for the current bitIndex
 */
function findMostCommonBit(numberArray: string[][], bitIndex: number): 0 | 1 {
    const sum = numberArray.reduce((acc, curr) => acc + parseInt(curr[bitIndex], 10), 0);
    return sum >= (numberArray.length / 2) ? 1 : 0;
}

/**
 * Get the least common number for the current bitIndex
 */
function findLeastCommonBit(numberArray: string[][], bitIndex: number): 0 | 1 {
    const sum = numberArray.reduce((acc, curr) => acc + parseInt(curr[bitIndex], 10), 0);
    return sum >= (numberArray.length / 2) ? 0 : 1;
}

console.log('The answer is ' + getLifeSupportRating());