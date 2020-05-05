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
	  if (("" + x).includes(".")) {
		x = "" + Math.round(100 * x) / 100;
		if (x.includes(".")) {
		  x = x.substring(0, Math.min(x.length, x.indexOf(".") + 3));
		}
	  }
	  return "" + x;
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
        this.maxXY = new Point(	this.canvasXLimits[1] - this.canvasXLimits[0],
                                this.canvasYLimits[1] - this.canvasYLimits[0]
                                );
        this.resetXY();
    }
    initialize(ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 300, 150);
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle="#FFFFFF";
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
        var i = this.sortedIndex(p);
        p = this.sorted(i, p);
        q = this.sorted(i, q);
        if (this.enforceCircularSymmetryFlag) {
        var temp = (q[0] + q[q.length - 1]) / 2;
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
        var N = x.length;
        var N4 = Math.round(N / 4);
        var cntr = 0;
        var y = [];
        for (cntr = 0; cntr < N; cntr++) {
        y[cntr] = x[cntr];
        }
        for (cntr = 0; cntr < (N - N4); cntr++) {
        y[cntr + N4] = x[cntr];
        }
        for (cntr = (N - N4); cntr < N; cntr++) {
        y[cntr - (N - N4)] = x[cntr];
        }
        return y;
    }
    sorted(i, p) {
        var N = p.length;
        var q = [];
        var cntr;
        for (cntr = 0; cntr < N; cntr++) {
        q[cntr] = p[i[cntr]];
        }
        return q;
    }
    sortedIndex(p) {
        var N = p.length;
        var i = [];
        var temp = 0;
        var cntr1 = 0;
        var cntr2 = 0;
        for (cntr1 = 0; cntr1 < N; cntr1++) {
        i[cntr1] = cntr1;
        }
        for (cntr1 = 0; cntr1 < (N - 1); cntr1++) {
        for (cntr2 = cntr1 + 1; cntr2 < N; cntr2++) {
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
        var N = this.x.length;
        if (N < 2) {
        return;
        }
        this.initialize(this.ctx);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x[0], this.y[0]);
        for (var cntr = 1; cntr < N; cntr++) {
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
        if (("" + x).includes(".")) {
        x = "" + Math.round(100 * x) / 100;
        if (x.includes(".")) {
            x = x.substring(0, Math.min(x.length, x.indexOf(".") + 3));
        }
        }
        return "" + x;
    }
    setXY(p, q) {
        this.resetXY();
        var length = p.length;
        this.pMin = this.getMin(p);
        this.pMax = this.getMax(p);
        this.qMin = this.getMin(q);
        this.qMax = this.getMax(q);
        var temp = 0;
        for (var cntr = 0; cntr < length; cntr++) {
        this.x[cntr] = this.origin.x +
                        (this.minXY.x + (this.maxXY.x - this.minXY.x) * (p[cntr] - this.pMin) / (this.pMax - this.pMin));
        this.y[cntr] = this.origin.y - 
                        (this.minXY.y + (this.maxXY.y - this.minXY.y) * (q[cntr] - this.qMin) / (this.qMax - this.qMin));
        }
    }
    getMin(x) {
        var min = x[0];
        var length = x.length;
        for (var cntr = 1; cntr < length; cntr++) {
        if (min > x[cntr]) {
            min = x[cntr];
        }
        }
        return min;
    }
    getMax(x) {
        var max = x[0];
        var length = x.length;
        for (var cntr = 1; cntr < length; cntr++) {
        if (max < x[cntr]) {
            max = x[cntr];
        }
        }
        return max;
    }
    trimLength(a) {
        var aLength = a.length;
        if (aLength <= this.maxLength) {
        return a;
        }
        var a_ = [];
        for (var cntr = 0; cntr < this.maxLength; cntr++) {
        a_[cntr] = a[cntr + aLength - this.maxLength];
        }
        a = a_;
        return a;
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

    save() {
		let fullQuality = this.myCanvas.toDataURL("image/gif", 1.0);
    }
}