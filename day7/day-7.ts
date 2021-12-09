

/**
 * DAY 7
 *
 * 1. Given a set of points in a range, find a position in the range with the minimal distance to all the points
 * 2. Calculate the costs to move all the points to the optimal position
 *
 */
import * as fs from 'fs';
import * as path from 'path';

function getMeanPosition(): number {
  const medianIndex = Math.floor(positions.length / 2);
  return positions[medianIndex - 1];
}

function getAveragePosition(): number {
  const sum = positions.reduce((acc, curr) => acc + curr, 0);
  return Math.floor(sum / positions.length);
}

/**
 * function is based on Gauss sumation formula
 *
 * @link https://letstalkscience.ca/educational-resources/backgrounders/gauss-summation
 */
function getSequenceSum(totalNumbers: number): number {
  return totalNumbers * (totalNumbers + 1) / 2;
}

/**
 * The optimal position with a constant burn rate is the median position
 * The optimal position with a summative burn rate is the average position
 * To be honest, I am not sure why, this was more an educated guess.
 */
function getOptimalFuelAmount(burnRate: 'constant' | 'summative' = 'constant'): number | undefined {
    if (burnRate === 'constant') {
      const medianPosition = getMeanPosition();
      return positions.reduce((acc, curr) => acc + Math.abs(curr - medianPosition), 0);
    }

    if (burnRate === 'summative') {
      const averagePosition = getAveragePosition();
      return positions.reduce((acc, curr) => acc + getSequenceSum(Math.abs(curr - averagePosition)), 0);
    }
}

const data = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString('utf-8');
const positions = data.split(',').map(Number).sort();

console.log('The optimal total amount of fuel burned (at a constant rate is) is ' + getOptimalFuelAmount('constant') + ' units.');
console.log('The optimal total amount of fuel burned (at a summative rate is) is ' + getOptimalFuelAmount('summative') + ' units.');