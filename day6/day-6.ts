/**
 * Deterrmin the amount of fishes after a given day in the breed program
 * > Initial fishes birth after 7 days
 * > New fishes birth after 9 days
 * > Fishes don't die
 */
 import * as fs from 'fs';
 import * as path from 'path';


 /**
  * Instead of keeping track of the birth of each fish in an array,
  * we can keep track of the number of fish sorted bythe amount of days they will give birth
  *
  * So the amount at key 0 are birthing today
  *
  * A population at any given day can look like this:
  * {
  *  0: 10,
  *  1: 4,
  *  2: 12
  *  etc... until day 8
  * }
  */
class FishBreedProgram {
    private populationInDays: {[key:string]: number} = {}
    private daysPassed = 0;

    constructor(data: string) {
        const fishes = data.split(',').map(Number)
        fishes.forEach(fish => {
            this.populationInDays[fish] = fish in this.populationInDays ? this.populationInDays[fish] + 1 : 1;
        });
    }

    private passDay() {
        const populationNewDay: {[key:string]: number} = {6:0}

        for (const key in this.populationInDays) {
            const amount = this.populationInDays[key];

            /**
             * If the fish births today it will be able to reproduce in sevens days
             * The newly created fish will reproduce in nine days
             */
            if (key === '0') {
                populationNewDay['6'] = populationNewDay['6'] + amount;
                populationNewDay['8'] = amount;
                continue;
            }

            /**
             * Check if there is already an amount set for the sixt day due to birth
             */
            if (key === '7') {
                populationNewDay['6'] = populationNewDay['6'] + amount;
                continue;
            }

            // Othewise just move the amoun to the new day
            const prevKey = Number(key) - 1;
            populationNewDay[prevKey.toString()] = amount
        }

        this.populationInDays = populationNewDay;
    }

    public passDays(numberOfDays: number) {
        for (let i = 0; i < numberOfDays; i++) {
            this.daysPassed++;
            this.passDay();
        }
    }

    public getTotalPopulation(): number {
        return Object.values(this.populationInDays).reduce((acc, val) => acc + val, 0);
    }

    public getDaysPassed(): number {
        return this.daysPassed;
    }
}

const data = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString('utf-8');
const fishBreedProgram = new FishBreedProgram(data);
fishBreedProgram.passDays(256);
console.log(`The total amount of fishes at day ${fishBreedProgram.getDaysPassed()} of the program is ${fishBreedProgram.getTotalPopulation()}`);