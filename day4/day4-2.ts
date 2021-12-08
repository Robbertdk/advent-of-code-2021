import * as fs from 'fs';
import * as path from 'path';

class Game {

    public lastWinningBoard: null | Board = null;

    private numbersToDraw: number[];
    private boards: Board[];
    private finishedBoards: Board[] = [];
    private drawnNumbers: number[];

    /**
     *
     * Create an array of the numers to draw
     * Create an array of boards, in which each row is in array of numbers
     */
    constructor(data: string) {
        const parsedData = data.toString().split("\n\n");
        const numbersData = parsedData.shift();
        const boardsData =  parsedData.map(board => board.split("\n").map(row => row.trim().split(/\s+/).map(Number)));

        this.numbersToDraw = numbersData ? numbersData.split("\n")[0].split(",").map(Number) : [],
        // Draw the first four numbers, games can't be won when less than 5 numbers are drawn.
        this.drawnNumbers = this.numbersToDraw.splice(0,4);
        this.boards = boardsData.map((board) => new Board(board));
    }

    public play() {
        while (this.numbersToDraw.length) {
            this.drawNextNumber();
        }
    }

    private drawNextNumber() {
        const number = this.numbersToDraw.shift()
        if (number == undefined) {
            return false;
        }
        this.drawnNumbers.push(number);
        const foundBoards = this.boards.filter(board => board.hasMatchingRowOrColumn(this.drawnNumbers));
        if (foundBoards) {
            this.finishedBoards = this.finishedBoards.concat(foundBoards);
        }
    }

    private getLastWinningBoard() {
        if (!this.finishedBoards.length) {
            return null;
        }
        return this.finishedBoards[this.finishedBoards.length - 1];
    }

    private getScore() {
        const lastWinningBoard = this.getLastWinningBoard();
        if (!lastWinningBoard) {
            return 0;
        }
        return lastWinningBoard.sumUnmarkedNumbers() * lastWinningBoard.getLastWinningNumber();
    }

    public showResult() {
        const lastWinningBoard = this.getLastWinningBoard();

        if (!lastWinningBoard) {
            console.log('No winner: no board has a full row or columns.');
            return;
        }
        console.log('The last winning drawn numbers are ' + lastWinningBoard.getWinningNumbers().join(', ') + '\n');
        console.log('The last winning board\n');
        console.log( lastWinningBoard.getAsString() + '\n') ;
        console.log('The board score is ' + this.getScore());
    }
}

class Board {
    private isCompleted = false;
    private rows: number[][];
    private winningNumbersIndexes: {row: number, column: number}[] = [];
    private winningNumbers: number[] = [];

    constructor(rows: number[][]) {
        this.rows = rows;
    }

    public hasMatchingRowOrColumn(drawnNumbers: number[]): boolean {
        if (this.isCompleted) {
            return false;
        }
        const hasMatch = this.hasMatchingRow(drawnNumbers) || this.hasMatchingColumn(drawnNumbers);
        if (hasMatch) {
            this.winningNumbers = [...drawnNumbers];
            this.isCompleted = true;
        }
        return hasMatch;
    }

    private hasMatchingRow(drawnNumbers: number[]) {
        const winningRowIndex = this.rows.findIndex(row => row.every(number => drawnNumbers.includes(number)));
        if (winningRowIndex === -1) {
            return false;
        }
        this.winningNumbersIndexes = this.rows[winningRowIndex].map((cell: number, index: number) => {
            return {
                row: winningRowIndex,
                column: index
            }
        });
        return true;
    }

    private hasMatchingColumn(drawnNumbers: number[]) {
        let columnIndex = 0;
        const rowLength = this.rows[0].length;
        while (columnIndex < rowLength) {
            let column = this.rows.map(row => row[columnIndex]);
            if (column.every(number => drawnNumbers.includes(number))) {
                this.winningNumbersIndexes = column.map((cell: number, index: number) => {
                    return {
                        row: index,
                        column: columnIndex
                    }
                });
                return true;
            }
            columnIndex++;
        }
        return false;
    }

    public sumUnmarkedNumbers(): number {
        return this.rows.flat().reduce((acc, curr) => {
            if (!this.winningNumbers.includes(curr)) {
                return acc + curr;
            }
            return acc;
        }, 0);
    }

    public getWinningNumbers() {
        return this.winningNumbersIndexes.map(indexMap => {
            return this.rows[indexMap.row][indexMap.column];
        }, 0);
    }

    public getLastWinningNumber() {
        return this.winningNumbers[this.winningNumbers.length - 1];
    }

    /**
     * Create a string representation of the board
     * Winning numbers are green
     *
     * For example:
     *
     *  0 30 70 99 23
     *  2 75 51 10 87
     * 12 91  4 69  8
     * 81 62 26 72 33
     * 31 17 46 73 96
     */
    public getAsString() {
        return this.rows.map((row, rowIndex) => {
            return row.map((number, columnIndex) => {
                const isWinningCell = this.winningNumbersIndexes.find(winningCell => winningCell.row === rowIndex && winningCell.column === columnIndex);
                const paddedNumber = number.toString().padStart(2, ' ');
                if (isWinningCell) {
                    // Set the color to green, output the number and reset the color
                    return `\x1b[32m${paddedNumber}\x1b[0m`;
                }
                return paddedNumber
            }).join(' ');
        }).join('\n');
    }
}

const data = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString('utf-8');
const game = new Game(data);
game.play();
game.showResult();