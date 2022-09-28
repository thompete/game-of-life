class Array2D {
    constructor(cols, rows, fill) {
        this._matrix = [];
        for (let i = 0; i < rows; i++) {
            this._matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                this._matrix[i][j] = fill;
            }
        }
    }

    get width() {
        return this._matrix[0] ? this._matrix[0].length : 0;
    }

    get height() {
        return this._matrix.length;
    }

    get(i, j) {
        return this._matrix[i] && this._matrix[i][j];
    }

    set(i, j, val) {
        return this._matrix[i] && (this._matrix[i][j] = val);
    }

    forEach(fn) {
        this._matrix.forEach((row, i) => row.forEach((cell, j) => fn(cell, i, j)));
    }

    map(fn) {
        const result = new Array2D(this.width, this.height);
        this.forEach((cell, i, j) => result.set(i, j, fn(cell, i, j)));
        return result;
    }

    getAdjacentCells(i, j) {
        return [
            this.get(i - 1, j - 1),
            this.get(i - 1, j),
            this.get(i - 1, j + 1),
            this.get(i, j - 1),
            this.get(i, j + 1),
            this.get(i + 1, j - 1),
            this.get(i + 1, j),
            this.get(i + 1, j + 1)
        ];
    }
}

export default Array2D;