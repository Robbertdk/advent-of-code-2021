import * as fs from 'fs';
import * as path from 'path';

const input = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString().split("\n");

const coordinates = {
    x: 0,
    y: 0,
    aim: 0,
}

function followRoute() {
    input.forEach(input => {
        const [direction, amount] = input.split(' ') as ['forward' | 'down' | 'up', string];
        move(direction, parseInt(amount, 10));
    });
}

function move(direction: 'forward' | 'down' | 'up', amount: number): void {
    if (direction === 'forward') {
        coordinates.x += amount;
        coordinates.y -= amount * coordinates.aim;
        return;
    }
    if (direction === 'down') {
        coordinates.aim += amount;
        return;
    }
    coordinates.aim -= amount;
}

function getCurrentPosition(): number {
    return coordinates.x * coordinates.y;
}

followRoute();
console.log(getCurrentPosition());