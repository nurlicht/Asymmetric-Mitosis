class Utilities {
    d$V(x, v) {
        this.d$(x).innerHTML = v;
    }

    d$(x) {
        return document.getElementById(x);
    }

    Log(x) {
        this.d$V("Log", x + "<br />" + this.d$("Log").innerHTML);
    }

    limitDP(x) {
        if (x.toString().includes(".")) {
            x = (Math.round(100 * x) / 100).toString();
            if (x.includes(".")) x = x.substring(0, Math.min(x.length, x.indexOf(".") + 3));
        }
        return x.toString();
      }
    }

class Plot {
    constructor(canvasPlot) {
        this.enforceCircularSymmetryFlag = true;
        this.shiftQuarterFlag = false;
        this.originOffset = 10;
        this.ctx = canvasPlot.getContext("2d");
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
        this.BLACK_COLOR = "#000000";
        this.WHITE_COLOR = "#FFFFFF";
    }

    initialize(ctx) {
        ctx.fillStyle = this.BLACK_COLOR;
        ctx.fillRect(0, 0, 300, 150);
        ctx.fillStyle = this.WHITE_COLOR;
        ctx.strokeStyle=this.WHITE_COLOR;
    }

    resetXY() {
        this.x = [];
        this.y = [];
        this.pMin = 0;
        this.pMax = 0;
        this.qMin = 0;
        this.qMax = 0;
        this.maxLength = 1000;
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
        this.initialize(this.ctx);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x[0], this.y[0]);
        for (let cntr = 1; cntr < N; cntr++) {
            this.ctx.lineTo(this.x[cntr], this.y[cntr]);
        }
        this.addLimits();
        this.ctx.stroke();
    }

    addLimits() {
        this.ctx.font = "15px Arial";
        this.ctx.fillStyle = "#88FFFF";
        this.ctx.fillText("Orientation Histogram", 90, 15);
        this.ctx.font = "10px Arial";
        this.ctx.fillStyle = "#FFCC66";
        this.ctx.fillText(this.limitDP(this.pMin), this.origin.x + this.originOffset, this.origin.y + 1 * this.originOffset);
        this.ctx.fillText(this.limitDP(this.pMax), this.canvasXLimits[1] - 2 * this.originOffset, this.origin.y + 1 * this.originOffset);
        this.ctx.fillText(this.limitDP(this.qMin), this.origin.x - this.originOffset, this.origin.y - this.originOffset);
        this.ctx.fillText(this.limitDP(this.qMax), this.origin.x - this.originOffset, this.canvasYLimits[0] + 1 * this.originOffset);
    }

    limitDP(x) {
        const xString = x.toString();
        if (!xString.includes(".")) return xString;
        x = (Math.round(100 * x) / 100).toString();
        if (x.includes(".")) {
            x = x.substring(0, Math.min(x.length, x.indexOf(".") + 3));
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
    constructor() {
        const utilities = new Utilities();
        this.myCanvas = utilities.d$("myCanvas");
        this.ctx = this.myCanvas.getContext("2d");
        this.ctx.lineWidth = 2;

        const cPlot = utilities.d$("plotCanvas");
        this.plot = new Plot(cPlot);
    }

    reset() {
        this.plot.resetXY();
        this.initialize(this.plot.ctx);
        this.initialize(this.ctx);
    }

    initialize(ctx) {
        this.plot.initialize(ctx? ctx:this.ctx);
    }
}