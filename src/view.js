class Constants {
    static MITOSIS_CANVAS_ID = 'mitosis-canvas';
    static CANVAS_CONTEXT_ID = '2d';
    static PLOT_CANVAS_ID = 'plot-canvas';
    static PLOT_ORIGIN_OFFSET = 10;
    static PLOT_MAX_LENGTH = 1000;
    static PLOT_TEXT_FONT = '15px Arial';
    static PLOT_TEXT_FILL_STYLE = '#88FFFF';
    static PLOT_TEXT_STRING = 'Orientation Histogram';
    static PLOT_TEXT_POSITION_X = 90; 
    static PLOT_TEXT_POSITION_Y = 15; 
    static PLOT_LABEL_FONT = '10px Arial';
    static PLOT_LABEL_FILL_STYLE = '#FFCC66';
    static CANVAS_WIDTH = 300;
    static CAVAS_HEIGHT = 150;
    static LINE_WIDTH = 2;
    static BLACK_COLOR = '#000000';
    static WHITE_COLOR = '#FFFFFF';
    static LOG_ID = 'Log';
    static NEW_LINE = '<br />';
}

class Utilities {
    static d$V(x, v) {
        Utilities.d$(x).innerHTML = v;
    }

    static d$(x) {
        return document.getElementById(x);
    }

    static Log(x) {
        Utilities.d$V(
            Constants.LOG_ID,
            x + Constants.NEW_LINE + Utilities.d$(Constants.LOG_ID).innerHTML
        );
    }

    static limitDP(x) {
        const dot = '.';
        if (x.toString().includes(dot)) {
            x = (Math.round(100 * x) / 100).toString();
            if (x.includes(dot)) x = x.substring(0, Math.min(x.length, x.indexOf(dot) + 3));
        }
        return x.toString();
    }

    static initializeCanvasContext(ctx) {
        ctx.fillStyle = Constants.BLACK_COLOR;
        ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CAVAS_HEIGHT);
        ctx.fillStyle = Constants.WHITE_COLOR;
        ctx.strokeStyle= Constants.WHITE_COLOR;
    }
}

class Plot {
    constructor(canvasPlot) {
        this.enforceCircularSymmetryFlag = true;
        this.shiftQuarterFlag = false;
        this.originOffset = Constants.PLOT_ORIGIN_OFFSET;
        this.ctx = canvasPlot.getContext(Constants.CANVAS_CONTEXT_ID);
        this.canvasWidth = canvasPlot.width;
        this.canvasHeight = canvasPlot.height;
        this.canvasXLimits = [this.originOffset, this.canvasWidth - 1 - this.originOffset];
        this.canvasYLimits = [this.originOffset, this.canvasHeight - 1 - this.originOffset];
        this.origin = new Point(this.canvasXLimits[0], this.canvasYLimits[1]);
        this.minXY = new Point(0, 0);
        this.maxXY = new Point(
            this.canvasXLimits[1] - this.canvasXLimits[0],
                                this.canvasYLimits[1] - this.canvasYLimits[0]
                                );
        this.setColors();
        this.resetXY();
    }

    setColors() {
    }

    resetXY() {
        this.x = [];
        this.y = [];
        this.pMin = 0;
        this.pMax = 0;
        this.qMin = 0;
        this.qMax = 0;
        this.maxLength = Constants.PLOT_MAX_LENGTH;
    }

    draw(p, q) {
        p = this.trimLength(p);
        q = this.trimLength(q);
        const i = this.sortedIndex(p);
        p = this.sorted(i, p);
        q = this.sorted(i, q);
        if (this.enforceCircularSymmetryFlag) {
            const temp = (q[0] + q[q.length - 1]) / 2;
            q[0] = temp;
            q[q.length - 1] = temp;
        }
        if (this.shiftQuarterFlag) {
            p = this.shiftQuarter(p);
            q = this.shiftQuarter(q);
        }
        this.setXY(p, q);
        this.plotXYL();
    }

    shiftQuarter(x) {
        const N = x.length;
        const N4 = Math.round(N / 4);
        const y = new Array(N);
        for (let cntr = 0; cntr < N; cntr++) {
            y[cntr] = x[cntr];
        }
        for (let cntr = 0; cntr < (N - N4); cntr++) {
            y[cntr + N4] = x[cntr];
        }
        for (let cntr = (N - N4); cntr < N; cntr++) {
            y[cntr - (N - N4)] = x[cntr];
        }
        return y;
    }

    sorted(i, p) {
        return p.map((x, index)=>p[i[index]]);
    }

    sortedIndex(p) {
        const N = p.length;
        const i = new Array(N);
        let temp = 0;
        for (let cntr1 = 0; cntr1 < N; cntr1++) {
            i[cntr1] = cntr1;
        }
        for (let cntr1 = 0; cntr1 < (N - 1); cntr1++) {
            for (let cntr2 = cntr1 + 1; cntr2 < N; cntr2++) {
                if (p[cntr1] > p[cntr2]) {
                    temp = p[cntr1];
                    p[cntr1] = p[cntr2];
                    p[cntr2] = temp;
                    temp = i[cntr1];
                    i[cntr1] = i[cntr2];
                    i[cntr2] = temp;
                }
            }
        }
        return i;
    }

    plotXYL() {
        const N = this.x.length;
        if (N < 2) return;
        Utilities.initializeCanvasContext(this.ctx);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x[0], this.y[0]);
        for (let cntr = 1; cntr < N; cntr++) {
            this.ctx.lineTo(this.x[cntr], this.y[cntr]);
        }
        this.addLimits();
        this.ctx.stroke();
    }

    addLimits() {
        this.ctx.font = Constants.PLOT_TEXT_FONT;
        this.ctx.fillStyle = Constants.PLOT_TEXT_FILL_STYLE;
        this.ctx.fillText(
            Constants.PLOT_TEXT_STRING,
            Constants.PLOT_TEXT_POSITION_X,
            Constants.PLOT_TEXT_POSITION_Y
        );
        this.ctx.font = Constants.PLOT_LABEL_FONT;
        this.ctx.fillStyle = Constants.PLOT_LABEL_FILL_STYLE;
        this.ctx.fillText(this.limitDP(this.pMin), this.origin.x + this.originOffset, this.origin.y + 1 * this.originOffset);
        this.ctx.fillText(this.limitDP(this.pMax), this.canvasXLimits[1] - 2 * this.originOffset, this.origin.y + 1 * this.originOffset);
        this.ctx.fillText(this.limitDP(this.qMin), this.origin.x - this.originOffset, this.origin.y - this.originOffset);
        this.ctx.fillText(this.limitDP(this.qMax), this.origin.x - this.originOffset, this.canvasYLimits[0] + 1 * this.originOffset);
    }

    limitDP(x) {
        const dot = '.';
        const xString = x.toString();
        if (!xString.includes(dot)) return xString;
        x = (Math.round(100 * x) / 100).toString();
        if (x.includes(dot)) {
            x = x.substring(0, Math.min(x.length, x.indexOf(dot) + 3));
        }
        return x;
    }

    setXY(p, q) {
        this.resetXY();
        const length = p.length;
        this.pMin = this.getMin(p);
        this.pMax = this.getMax(p);
        this.qMin = this.getMin(q);
        this.qMax = this.getMax(q);

        const A1 = this.origin.x + this.minXY.x;
        const A2 = (this.maxXY.x - this.minXY.x) / (this.pMax - this.pMin);
        this.x = p.map(v => A1 + A2 * (v - this.pMin));

        const B1 = this.origin.y - this.minXY.y;
        const B2 = (this.maxXY.y - this.minXY.y) / (this.qMax - this.qMin);
        this.y = q.map(v => B1 - B2 * (v - this.qMin));
    }

    getMin(x) {
        let min = x[0];
        x.forEach(p => min = Math.min(min, p));
        return min;
    }

    getMax(x) {
        let max = x[0];
        x.forEach(p => max = Math.max(max, p));
        return max;
    }

    trimLength(a) {
        const offset = a.length - this.maxLength;
        return (offset <= 0)? a:a.map((x,index)=>a[index + offset]);
    }
}

class View {
    plot;
    
    constructor() {
        this.getMitosisCanvasContext().lineWidth = Constants.LINE_WIDTH;
        const plotCanvas = Utilities.d$(Constants.PLOT_CANVAS_ID);
        this.plot = new Plot(plotCanvas);
    }

    getMitosisCanvas() {
        return Utilities.d$(Constants.MITOSIS_CANVAS_ID);
    }

    getMitosisCanvasContext() {
        return this.getMitosisCanvas().getContext(Constants.CANVAS_CONTEXT_ID);
    }

    reset() {
        this.plot.resetXY();
        this.initialize(this.plot.ctx);
        this.initialize();
    }

    initialize(ctx) {
        const ctx2 = ctx? ctx:this.getMitosisCanvasContext();
        Utilities.initializeCanvasContext(ctx2);
    }
}