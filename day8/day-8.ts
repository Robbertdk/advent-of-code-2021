/**
 * Decode a set of scrambled digits into the original digit message
 * a scrambled string consists of characters delimited by spaces
 * Each character represents a line of the digit
 *
 * A scrambled string can look like 'fbadeg gbe dgcbea gb bcgd bdecgaf agecb cegda cefadg bacef'
 *
 *   0:      1:      2:      3:      4:
 *  aaaa    ....    aaaa    aaaa    ....
 * b    c  .    c  .    c  .    c  b    c
 * b    c  .    c  .    c  .    c  b    c
 *  ....    ....    dddd    dddd    dddd
 * e    f  .    f  e    .  .    f  .    f
 * e    f  .    f  e    .  .    f  .    f
 *  gggg    ....    gggg    gggg    ....
 *
 *   5:      6:      7:      8:      9:
 *  aaaa    aaaa    aaaa    aaaa    aaaa
 * b    .  b    .  .    c  b    c  b    c
 * b    .  b    .  .    c  b    c  b    c
 *  dddd    dddd    ....    dddd    dddd
 * .    f  e    f  .    f  e    f  .    f
 * .    f  e    f  .    f  e    f  .    f
  * gggg    gggg    ....    gggg    gggg
 */

import * as fs from 'fs';
import * as path from 'path';

const data = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString('utf-8');

type numberRange = 0|1|2|3|4|5|6|7|8|9;
type Segment = 'top' | 'topRight' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'topLeft' | 'middle';

class DigitDecoder {

    private allDigits: string[];
    private remainingDigits: string[];
    private outputDigits: string[];
    private digitMap: {[key: string]: string | undefined} = {
        '0': undefined,
        '1': undefined,
        '2': undefined,
        '3': undefined,
        '4': undefined,
        '5': undefined,
        '6': undefined,
        '7': undefined,
        '8': undefined,
        '9': undefined
    }
    private segmentMap: {[key in Segment]: string | undefined}  = {
        top: undefined,
        topRight: undefined,
        bottomRight: undefined,
        bottom: undefined,
        bottomLeft: undefined,
        topLeft: undefined,
        middle: undefined,
    }

    constructor(digitsString: string) {
        // Create an array of scrambled digits
        this.allDigits = digitsString.split(/[^a-z]+/).map((digitString: string) => this.unScrambleOrder(digitString));
        this.remainingDigits = [...this.allDigits]

        // the output digits is the part of the digit string after the pipe delimiter
        this.outputDigits = digitsString.split(/\|\s/)[1].split(/\s/).map((digitString: string) => this.unScrambleOrder(digitString));
    }

    /**
     * All scrambled digits have also a scrambled order
     * Sort all digits by the same sorting function to easily compare them later on
     */
    private unScrambleOrder(digitString: string): string {
        return digitString.split('').sort().join('');
    }

    /**
     * We can decypher the code by deducing each digit and segment
     */
    public decypher() {

        // 1 is the only digit that has 2 segements, so 2 characters
        this.addDigitToMap(1, this.deduceDigitBySegmentSize(2));

        // 4 is the only digit that has 4 segements, so 4 characters
        this.addDigitToMap(4, this.deduceDigitBySegmentSize(4));

        // 7 is the only digit that has 3 segements, so 3 characters
        this.addDigitToMap(7, this.deduceDigitBySegmentSize(3));

        // 8 is the only digit that has 7 segements, so 7 characters
        this.addDigitToMap(8, this.deduceDigitBySegmentSize(7));

        // 9
        // segements.length === 6 = [0,6,9]
        let sixSegementSizeDigits = this.getDigitsBySegementSize(6);
        // [0,6,9] find digit that has all the segements that are also in 4.
        this.addDigitToMap(9, this.deduceDigitByDigitInclusion(this.digitMap['4'], sixSegementSizeDigits));

        // BottomLeft segment
        // 9 - 8
        this.addSegmentToMap('bottomLeft', this.deduceSegmentByDigitDifference(this.digitMap['9'], this.digitMap['8']));

        // 2
        // segements.length === 5 = [2,3,5]
        let fiveSegementSizeDigits = this.getDigitsBySegementSize(5);
        // [2,3,5] find only char with bototmLeft segment
        this.addDigitToMap(2, this.deduceDigitBySegementInclusion(this.segmentMap['bottomLeft'], fiveSegementSizeDigits));

        // 5
        // segements.length === 5 = [2,3,5]
        fiveSegementSizeDigits = this.getDigitsBySegementSize(5);

        // [3,5] find all segements 1
        this.addDigitToMap(3, this.deduceDigitByDigitInclusion(this.digitMap['1'], fiveSegementSizeDigits));

        // 5
        // Only remaing character with 5 segments
        this.addDigitToMap(5, this.getDigitsBySegementSize(5) ? this.getDigitsBySegementSize(5)[0] : undefined);

        // 6
        // 5 + bottomLeft segment
        const fiveWithBottomLeft = this.combineSegments(this.digitMap['5'], this.segmentMap['bottomLeft']);
        this.addDigitToMap(6, this.deduceDigitByDigitInclusion(fiveWithBottomLeft, this.remainingDigits));

        // 0
        // Only remaing character
        this.addDigitToMap(0, this.getDigitsBySegementSize(6) ? this.getDigitsBySegementSize(6)[0] : undefined);

        // for fun

        // Top segment
        // 7 - 1
        this.addSegmentToMap('top', this.deduceSegmentByDigitDifference(this.digitMap['7'], this.digitMap['1']));

        // Middle
        // 8 - 0
        this.addSegmentToMap('middle', this.deduceSegmentByDigitDifference(this.digitMap['8'], this.digitMap['0']));

        // Bottom
        // 3 - 7 - middle
        const sevenWithMiddle = this.combineSegments(this.digitMap['7'], this.segmentMap['middle']);
        this.addSegmentToMap('bottom', this.deduceSegmentByDigitDifference(sevenWithMiddle, this.digitMap['3']));

        // Top right
        // 8 - 6
        this.addSegmentToMap('topRight', this.deduceSegmentByDigitDifference(this.digitMap['8'], this.digitMap['6']));

        // Top left
        // 8 - 3 - bottom left
        const threeWithBottomLeft = this.combineSegments(this.digitMap['3'], this.segmentMap['bottomLeft']);
        this.addSegmentToMap('topLeft', this.deduceSegmentByDigitDifference(threeWithBottomLeft, this.digitMap['8']));

        // Bottom right
        // 1 - top left
        this.addSegmentToMap('bottomRight', this.deduceSegmentByDigitDifference(this.digitMap['1'], this.segmentMap['topLeft']));

    }

    /**
     *
     * 1 is the only digit that has 2 segements, so 2 characters
     * 4 is the only digit that has 4 segements, so 4 characters
     * 7 is the only digit that has 3 segements, so 3 characters
     * 8 is the only digit that has 7 segements, so 7 characters
     */
    private deduceDigitBySegmentSize(segmentSize: number): string | undefined{
        return this.remainingDigits.find(digit => digit.length === segmentSize);
    }

    /*
     * Get a digit from an array which as at least all the segments of anohter digit
     */
    private deduceDigitByDigitInclusion(digitToInclude: string | undefined , digitsToCheck: string[] | undefined): string | undefined {
        if (!digitToInclude || !digitsToCheck) {
            return undefined;
        }
        const segmentsToCheck = digitToInclude.split('');
        return digitsToCheck.find(digit => segmentsToCheck.every(segment => digit.includes(segment)));
    }

    /**
     * find the character that is in one digit string, but not in the other
     */
    private deduceSegmentByDigitDifference(a: string | undefined , b: string | undefined): string | undefined  {
        if(!a || !b) {
            return undefined;
        }
        const [longest, shortest] = a.length > b.length ? [a, b] : [b, a];
        return longest.split('').find(char => !shortest.includes(char));
    }

    private deduceDigitBySegementInclusion(segmentToInclude: string | undefined, digitsToCheck: string[] | undefined): string | undefined {
        if (segmentToInclude === undefined || digitsToCheck === undefined) {
            return undefined;
        }
        return digitsToCheck.find(digit => digit.includes(segmentToInclude));
    }

    private getDigitsBySegementSize(digitLength: number): string[] {
        return this.remainingDigits.filter(digit => digit.length === digitLength);
    }

    private combineSegments(...args: (string | undefined)[]): string | undefined {
        if (args.find(segment => segment === undefined)) {
            return undefined;
        }
        return args.join('');
    }

    private addSegmentToMap(segmentName: Segment, segmentChar: string | undefined | undefined) {
        if (!segmentChar) {
            throw new Error(`Could not find segment char for segment ${segmentName}`);
        }
        this.segmentMap[segmentName] = segmentChar;
    }

    private addDigitToMap(digitNumber: numberRange, digitString: string | undefined | undefined) {
        if (!digitString) {
            throw new Error('Could not find the digit ' + digitNumber +  '. abort');
        }
        this.digitMap[digitNumber.toString()] = digitString;
        this.remainingDigits = this.remainingDigits.filter(digit => digit !== digitString);
    }

    /**
     * Answer to part 1
     *
     * Count all the digits in the output string that are 1, 4, 7 or 8
     *
     * 1 is the only digit that has 2 segements, so 2 characters
     * 4 is the only digit that has 4 segements, so 4 characters
     * 7 is the only digit that has 3 segements, so 3 characters
     * 8 is the only digit that has 7 segements, so 7 characters
     */
    public countOutputDigits1478(): number {
        return this.outputDigits.filter(digit => [2,3,4,7].includes(digit.length)).length
    }

    /**
     * Convert each digitString to a number represented as string
     * Join the strings to create a number.
     */
    public getOutputDigits(): number {
        const digitsArr = Object.values(this.digitMap);
        const outputDigitsArr =  this.outputDigits.map(outputDigit => digitsArr.findIndex(digit => digit === outputDigit).toString());
        return parseInt(outputDigitsArr.join(''), 10);
    }
}

const digitDecorders = data.split('\n').map(line => new DigitDecoder(line));

const firstDigitRecord = data.split('\n').map(line => new DigitDecoder(line))[0];
console.log(`There are in total ${digitDecorders.reduce((acc, line) => line.countOutputDigits1478() + acc, 0)} digits in the output string that are 1, 4, 7 or 8`);
const sumOutputDigits = digitDecorders.reduce((acc, line) => {
    line.decypher();
    return acc + line.getOutputDigits();
}, 0);
console.log('The sum of the all the output digits is ' + sumOutputDigits);
