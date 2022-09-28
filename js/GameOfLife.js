import Array2D from './Array2D.js';
import Cell from './Cell.js';

class GameOfLife {
    constructor({
                    resolution = 7,
                    density = 1.4,
                    speed = 20,
                    cellColor = 'white',
                    bgColor = 'black',
                    gridColor = 'rgba(255, 255, 255, .3)',
                    gridVisibility = false
                }) {
        this._elements = {
            canvas: document.getElementById('canvas'),
            displaySpeed: document.getElementById('display-speed'),
            controlSpeed: document.getElementById('control-speed'),
            controlPlayState: document.getElementById('control-play-state')
        }

        this._elements.canvas.width = document.documentElement.clientWidth;
        this._elements.canvas.height = document.documentElement.clientHeight - 30;

        this._canvasWidth = this._elements.canvas.width;
        this._canvasHeight = this._elements.canvas.height;

        this._ctx = this._elements.canvas.getContext('2d');

        this._settings = {
            resolution,
            density,
            speed,
            cellColor,
            bgColor,
            gridColor,
            gridVisibility
        };

        this._state = {
            paused: true,
            speed,
            gridVisibility,
            mousePosition: {
                x: null,
                y: null
            },
            mouseDown: false,
            stepTimeout: null
        }

        Cell.prototype.size = resolution;

        const cols = Math.floor(this._canvasWidth / resolution);
        const rows = Math.floor(this._canvasHeight / resolution);

        this._grid = new Array2D(cols, rows);

        this._init();

        console.log(this);
    }

    _addEventListeners() {
        document.addEventListener('contextmenu', (event) => event.preventDefault());
        this._elements.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
        this._elements.canvas.addEventListener('mousedown', this._handleMousedown.bind(this));
        this._elements.canvas.addEventListener('mouseup', this._handleMouseUp.bind(this));
        this._elements.controlSpeed.addEventListener('input', this._changeSpeed.bind(this));
        this._elements.controlPlayState.addEventListener('click', this._changePlayState.bind(this));
        document.getElementById('restart').addEventListener('click', this.restart.bind(this));
        document.getElementById('random-fill').addEventListener('click', this._randomFill.bind(this));
        document.getElementById('show-grid').addEventListener('click', this._changeGridVisibility.bind(this));
    }

    _init() {
        this._addEventListeners();
        this._reset();
        this._step();
    }

    _randomFill() {
        this._grid.forEach(cell => {
            cell.value = Math.floor(Math.random() * this._settings.density);
        });
        this._renderGrid();
    }

    _initCells(value) {
        this._grid.forEach((cell, i, j) => {
            if (typeof cell === 'object') return cell.value = value;
            const cellSize = Cell.prototype.size;
            this._grid.set(i, j, new Cell(j * cellSize, i * cellSize, value));
        });
    }

    _reset() {
        this.pause();
        this._initCells(0);
        this._renderGrid();
    }

    _clearCanvas() {
        this._ctx.fillStyle = this._settings.bgColor;
        this._ctx.fillRect(0, 0, this._canvasWidth, this._canvasHeight);
    }

    _renderGrid() {
        this._clearCanvas();
        this._grid.forEach(cell => cell.render(this._ctx, this._state, this._settings));
    }

    _refreshGUI() {
        const { controlSpeed, displaySpeed, controlPlayState } = this._elements;
        const speed = this._state.speed;
        controlSpeed.value = speed;
        displaySpeed.textContent = this._scaleSpeed(speed);
        controlPlayState.textContent = this._state.paused ? 'Play' : 'Pause';
    }

    _countAliveNeighbors(i, j) {
        return this._grid.getAdjacentCells(i, j)
            .map(cell => cell ? cell.value : 0)
            .reduce((acc, cur) => acc + cur, 0);
    }

    _getNextCellState(cell, i, j) {
        const aliveNeighbors = this._countAliveNeighbors(i, j);
        const { x, y, value, highlighted } = cell;

        if (value === 0) {
            if (aliveNeighbors === 3) return new Cell(x, y, 1, highlighted);
            else return new Cell(x, y, 0, highlighted);
        } else if (value === 1) {
            if (aliveNeighbors === 2 || aliveNeighbors === 3) return new Cell(x, y, 1, highlighted);
            else return new Cell(x, y, 0, highlighted);
        }
    }

    _step(fromPause) {
        if (this._state.paused) return;
        this._state.stepTimeout = setTimeout(() => {
            this._grid = this._grid.map(this._getNextCellState.bind(this));
            this._renderGrid();
            requestAnimationFrame(this._step.bind(this, false));
        }, fromPause ? 0 : this._state.speed);
    }

    _handleMousedown(event) {
        this._state.mouseDown = true;
        this._ifMouseInsideCell(cell => this._paintCell(event, cell));
        this._renderGrid();
    }

    _handleMouseUp() {
        this._state.mouseDown = false;
    }

    _handleMouseMove(event) {
        this._trackMousePosition(event);
        this._ifMouseInsideCell(
            cell => {
                if (this._state.mouseDown) this._paintCell(event, cell);
                cell.highlighted = true;
            },
            cell => cell.highlighted = false
        );
        this._renderGrid();
    }

    _trackMousePosition(event) {
        const c = this._elements.canvas;
        this._state.mousePosition.x = event.clientX - c.offsetLeft;
        this._state.mousePosition.y = event.clientY - c.offsetTop;
    }

    _isPointInsideRect(pX, pY, rectX, rectY, rectW, rectH) {
        return pX > rectX && pX <= rectX + rectW &&
            pY > rectY && pY <= rectY + rectH
    }

    _ifMouseInsideCell(fn, elseFn) {
        const { x: mouseX, y: mouseY } = this._state.mousePosition;

        this._grid.forEach((cell, i, j) => {
            const isMouseInsideCell = this._isPointInsideRect(mouseX, mouseY, cell.x, cell.y, cell.size, cell.size);

            if (isMouseInsideCell) fn(cell, i, j);
            else if (elseFn) elseFn(cell, i, j);
        });
    }

    _paintCell(event, cell) {
        if (event.which === 1) cell.value = 1;
        else if (event.which === 3) cell.value = 0;
    }

    _changeGridVisibility() {
        this._state.gridVisibility = !this._state.gridVisibility;
        this._renderGrid();
    }

    _changePlayState() {
        this._state.paused ? this.play() : this.pause();
    }

    _changeSpeed(event) {
        this._state.speed = +event.target.value;
        this._refreshGUI();
    }

    _scaleSpeed(speed) {
        return (1000 / (speed + 16.66667)).toFixed(2);
    }

    restart() {
        this._state.speed = this._settings.speed;
        this._reset();
    }

    pause() {
        this._state.paused = true;
        this._refreshGUI();
        if (typeof this._state.stepTimeout === 'number') {
            clearTimeout(this._state.stepTimeout);
        }
    }

    play() {
        this._state.paused = false;
        this._refreshGUI();
        this._step(true);
    }
}

export default GameOfLife;