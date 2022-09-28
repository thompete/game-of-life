class Cell {
    constructor(x, y, value, highlighted = false) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.highlighted = highlighted;
    }

    render(ctx, { gridVisibility }, { gridColor, cellColor }) {
        ctx.strokeStyle = gridColor;
        ctx.fillStyle = cellColor;

        if (this.value) {
            ctx.fillRect(this.x, this.y, this.size, this.size);
        } else if (gridVisibility) {
            ctx.strokeRect(this.x, this.y, this.size, this.size);
        }

        if (this.highlighted) {
            ctx.strokeStyle = 'rgb(150, 150, 150)';
            ctx.strokeRect(this.x, this.y, this.size, this.size);
        }
    }
}

export default Cell;