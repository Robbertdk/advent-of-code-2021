
/**
 * DAY 9
 *
 * TASK 1 Find the low points
 * the locations that are lower than any of its adjacent locations.
 * Most locations have four adjacent locations (up, down, left, and right);
 * locations on the edge or corner of the map have three or two adjacent locations, respectively. (Diagonal locations do not count as adjacent.)
 *
 * TASK 2 Find the high points
 * Next, you need to find the largest basins so you know what areas are most important to avoid.
 * A basin is all locations that eventually flow downward to a single low point.
 * Therefore, every low point has a basin, although some basins are very small.
 * Locations of height 9 do not count as being in any basin, and all other locations will always be part of exactly one basin.
 * The size of a basin is the number of locations within the basin, including the low point.
 *
 */
import * as fs from 'fs';
import * as path from 'path';

const BASIN_EDGDE_HEIGHT = 9;

class Point {

    public height: number;
    public adjacentPoints: Point[] = [];
    public x: number;
    public y: number;

    constructor(value: string, x: number, y: number) {
        this.height = Number(value);
        this.x = x;
        this.y = y;
    }

    /**
     * Adjecent points are the points on the same row or column, not diagonal
     */
    public setAdjacentPoints(points: Point[][]) {

        const adjacentPoints: Point[] = [];

        if (this.x > 0) {
            adjacentPoints.push(points[this.y][this.x - 1]);
        }

        if (this.x < points[0].length - 1) {
            adjacentPoints.push(points[this.y][this.x + 1]);
        }

        if (this.y > 0) {
            adjacentPoints.push(points[this.y - 1][this.x]);
        }

        if (this.y < points.length - 1) {
            adjacentPoints.push(points[this.y + 1][this.x]);
        }

        this.adjacentPoints = adjacentPoints;
    }

    /**
     * The point is a low point if it's value is less than the value of the adjacent points
     */
    public isLowest() {
        return this.adjacentPoints.every(adjacentPoint => adjacentPoint.height > this.height);
    }

    /*
     * The risk level of a low point is 1 plus its height
     */
    public getRiskLevel() {
        return this.height + 1;
    }
}

/**
 * A bassin is a group of points that are all connected and lower than the basin edge heigt
 * Bassins always start from a lowest point
 */
class Bassin {
    private pointIds = new Set<string>();

    constructor(startingPoint: Point) {
        this.getPointsInBasin(startingPoint);
    }

    /**
     * Loop through each point in the basin.
     * If the adjacent points are in the basin, add then
     * and check their adjacent points recursively until the basin is complete
     */
    public getPointsInBasin(startingPoint: Point) {
        const queue: Point[] = [startingPoint];
        while (queue.length > 0) {
            const point = queue.shift();
            if (!point) {
                continue;
            }
            // Create an identifier for the point, so we can check if it's already been added
            this.pointIds.add(point.x + '-' + point.y);
            const adjacentPointsInBasin = this.findNewBasinPoints(point);
            if (adjacentPointsInBasin.length > 0) {
                queue.push(...adjacentPointsInBasin);
            }
        }
    }

    /**
     * Get all the adjacent points that are lower that the edge height and not already placed in the basin
     */
    private findNewBasinPoints(point: Point): Point[] {
        return point.adjacentPoints.filter(adjacentPoint => {
            const adjacentPointID = adjacentPoint.x + '-' + adjacentPoint.y;
            return adjacentPoint.height !== BASIN_EDGDE_HEIGHT && !this.pointIds.has(adjacentPointID);
        });
    }

    public getSize() {
        return this.pointIds.size;
    }
}

class Map {
    private points: Point[][];
    private bassins: Bassin[] = [];

    constructor(points: Point[][]) {
        this.points = points;
        this.points.forEach(row => row.forEach(point => point.setAdjacentPoints(this.points)));

        // Each bassin start at a lowest point
        this.bassins = this.getLowestPoints().map(point => new Bassin(point));
    }

    /**
     * The lowest points are the points that are lower than any of its adjacent points
     */
    private getLowestPoints(): Point[] {
        return this.points.flatMap(row => row.filter((point: Point) => point.isLowest()).map(point => point));
    }

    /**
     * Risk level is the sum of the risk levels of the lowest points
     */
      public getTotalRiskLevel(): number {
        return this.getLowestPoints().reduce((acc, point) => acc + point.getRiskLevel(), 0);
    }

    /**
     * Get all the basins sizes sorted by size
     */
     public getBassinsSizes(): number[] {
        return this.bassins.map(bassin => bassin.getSize()).sort((a, b) => b - a);
    }
}

const data = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString('utf-8');
const points: Point[][] = data.split('\n').map((row, rowIndex) => row.split('').map((point, pointIndex) => new Point(point, pointIndex, rowIndex)));
const map = new Map(points);

console.log(`Total risk level of the map is: ${map.getTotalRiskLevel()}`);

const cummulativeProduct3LargestBassinsSizes = map.getBassinsSizes().slice(0,3).reduce((acc, size) => acc * size, 1);
console.log(`The multiplication of the sizes of the three largest basins is: ${cummulativeProduct3LargestBassinsSizes}`);