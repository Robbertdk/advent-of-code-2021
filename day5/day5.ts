/**
 * Determine the number of points where at least two lines overlap
 * Lines are defined by their start and end coordinates
 */
import * as fs from 'fs';
import * as path from 'path';

class Field {

    private lines: Line[];

    constructor(data: string) {
        this.lines = data.split('\n').map(lineString => new Line(lineString));
    }

    /**
     * Return the number of coordinates where at least X lines overlap
     */
    public getCountPointsXLinesOverlap( amount = 2, {acceptDiagonal = false}: {acceptDiagonal?: boolean} = {}) : number {
        const countMap = this.createCountHashTable({acceptDiagonal});
        const countArray: number[] = Object.values(countMap);
        return countArray.filter(val => val >= amount).length;
    }

    /**
     * Create a hashtable of coordinates, with the value being the number of times they appear
     * e.g. {'12,42': 2, '12,43': 1, '12,44': 1}
     */
    private createCountHashTable({acceptDiagonal = false}: {acceptDiagonal?: boolean} = {} ): {[key: string]: number} {
        const coordinatesCountMap: {[key: string]: number} = {};
        const coordinatesList = this.getAllFilledCoordinates({acceptDiagonal});
        coordinatesList.forEach(val => {
            coordinatesCountMap[val] = (coordinatesCountMap[val] || 0) + 1
        })
        return coordinatesCountMap;
    }

    /**
     * Return an array of coordinates, in which each is a string of two numbers
     * e.g. ['12,42', '12,43', '12,44']
     */
    private getAllFilledCoordinates({acceptDiagonal = false}: {acceptDiagonal?: boolean} = {}) : string[]{
        const lines = acceptDiagonal ? this.lines : this.lines.filter(line => line.isStraight);
        const coordinatesList: string[][] = lines.map(line => line.getCoordinates().map(coordinate => coordinate.join(',')));
        return  coordinatesList.flat();
    }
}

/**
 * Each line is a set of coordinates
 * defined by given start and end position of the line
 */
class Line {

    private start: number[];
    private end: number[];
    private coordinates: number[][] = [];
    public isStraight: boolean;

    constructor(lineString: string) {
        const [startString, endString] = lineString.split(' -> ');
        this.start = startString ? startString.split(',').map(coor => Number(coor)) : [];
        this.end = endString ? endString.split(',').map(coor => Number(coor)) : [];
        this.isStraight = this.setIsStraight();
        this.fillLine();
    }

    /**
     * Fill the line with coordinates, based on the start and end coordinates
     */
    private fillLine() {
        const deltaX = Math.abs(this.start[0] - this.end[0]);
        const deltaY = Math.abs(this.start[1] - this.end[1]);

        /**
         * We need to move down if the starting position is higher than the ending position
         * therefore we multiply each step with the direction to move in the correct direction
         */
        const directionX = this.start[0] < this.end[0] ? 1 : -1;
        const directionY = this.start[1] < this.end[1] ? 1 : -1;

        for (let x = 0; x <= deltaX; x++) {

            // If the line is diagonal at 45 degrees, each step for X and Y will be the same
            if (!this.isStraight) {

                const positionX = this.start[0] + x * directionX;
                const positionY = this.start[1] + x * directionY;
                this.coordinates.push([positionX, positionY]);
            } else {
                for (let y = 0; y <= deltaY; y++) {
                    const positionX = this.start[0] + x * directionX;
                    const positionY = this.start[1] + y * directionY;
                    this.coordinates.push([positionX, positionY]);
                }
            }
        }
    }

    private setIsStraight() {
        return this.start[0] === this.end[0] || this.start[1] === this.end[1];
    }

    public getCoordinates() {
        return this.coordinates;
    }

}

const data = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString('utf-8');
const field  = new Field(data);
console.log( 'There are '  + field.getCountPointsXLinesOverlap(2) + ' coordinates where two lines overlap, without taking diagonal lines into account');
console.log( 'There are '  + field.getCountPointsXLinesOverlap(2, {acceptDiagonal: true}) + ' coordinates where two lines overlap, taking diagonal lines intro account');