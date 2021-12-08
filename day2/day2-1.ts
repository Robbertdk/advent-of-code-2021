import * as fs from 'fs';
import * as path from 'path';

const input = fs.readFileSync(path.resolve(__dirname, './data.txt')).toString().split("\n");

const coordinates = {
    x: 0,
    y: 0,
}

function followRoute() {
    input.forEach(input => {
        const [direction, amount] = input.split(' ') as ['forward' | 'down' | 'up', string];
        move(direction, parseInt(amount, 10));
    });
}

function move(direction: 'forward' | 'down' | 'up', amount: number): number {
    if (direction === 'forward') {
        return coordinates.x += amount;
    } else if (direction === 'down') {
        return coordinates.y -= amount;
    }
    return coordinates.y += amount;
}

function getCurrentPosition(): number {
    return coordinates.x * coordinates.y;
}

followRoute();
console.log(getCurrentPosition());