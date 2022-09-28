import GameOfLife from './GameOfLife.js';

const gol = new GameOfLife({
    resolution: 7,
    density: 1.4,
    speed: 20,
    cellColor: 'white',
    bgColor: 'black',
    gridColor: 'rgba(255, 255, 255, .3)',
    gridVisibility: false
});
