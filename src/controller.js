class Controller {
    constructor(geometry, update) {
        this.geometry = geometry;
		this.update = update;
    }
	
    incN() {
	  ++this.geometry.N;
	  this.update();
	}
	decN() {
	  if (this.geometry.N > 2) {
	    --this.geometry.N;
	    this.update();
	  }
	}
	incSize() {
	  this.geometry.X1 -= 5;
	  this.geometry.X2 += 5;
	  this.geometry.Size = this.geometry.X2 - this.geometry.X1 + 1;
	  this.update();
	}
	decSize() {
	  this.geometry.X1 += 5;
	  this.geometry.X2 -= 5;
	  if (this.geometry.X1 > this.geometry.X2) {
	    this.geometry.X1 += 5;
		this.geometry.X2 -= 5;
		return;
	  }
	  this.geometry.Size = this.geometry.X2 - this.geometry.X1 + 1;
	  this.update();
	}
	incX1() {
	  this.geometry.X1 += 10;
	  this.update();
	}
	decX1() {
	  geomrtry.X1 -= 10;
	  this.update();
	}
	incY1() {
	  this.geometry.Y1 += 10;
	  this.update();
	}
	decY1() {
	  this.geometry.Y1 -= 10;
	  this.update();
	}
	incX2() {
	  this.geometry.X2 += 10;
	  this.update();
	}
	decX2() {
	  this.geometry.X2 -= 10;
	  this.update();
	}
	incY2() {
	  this.geometry.Y2 += 10;
	  this.update();
	}
	decY2() {
	  this.geometry.Y2 -= 10;
	  this.update();
	}
	incNEBs() {
	  ++this.geometry.nEBs;
	  this.update();
	}
	decNEBs() {
	  --this.geometry.nEBs;
	  this.update();
	}
	incFPS() {
	  ++this.geometry.fps;
	  this.update();
	}
	decFPS() {
	  --this.geometry.fps;
	  this.update();
	}
	incFractionEBs() {
	  this.geometry.Asymmetry[2] = Math.min(0.5, this.geometry.Asymmetry[2] + 0.02);
	  this.update();
	}
	decFractionEBs() {
	  this.geometry.Asymmetry[2] = Math.max(-0.5, this.geometry.Asymmetry[2] - 0.02);
	  this.update();
	}
}

class SpindleRenderer {
	static render(ctx, spindle) {
		spindle.arcArray.forEach(arc=>ctx = TrackMTRenderer.render(ctx, arc));
		return ctx;
	}
}

class TrackMTRenderer {
	constructor(trackMT) {
		this.trackMT = trackMT;
	}

	static render(ctx, trackMT) {
		return new TrackMTRenderer(trackMT).render(ctx);
	}

	render(ctx) {
		const alphaMT = 0.2;
		const alphaEB = 1.0;
		ctx = this.renderMT(ctx, alphaMT);
		const strokeStyleOriginal = ctx.strokeStyle;
		for (let cntr = 0; cntr < this.trackMT.nEBs; cntr++) {
			ctx.strokeStyle = (this.trackMT.ebs.direction[cntr] > 0)? "#FF3300":"#00BBFF";
			ctx = this.renderEB(ctx, this.trackMT.ebs.t1[cntr], this.trackMT.ebs.t2[cntr], alphaEB);
		}
		ctx.strokeStyle = strokeStyleOriginal;
		return ctx;
	}
	
	renderEB(ctx, t1, t2, alpha) {
		const q1 = this.trackMT.getP(t1);
		const q2 = this.trackMT.getP(t2);
		const qM = this.trackMT.getP((t1 + t2) / 2);
		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.moveTo(q1.x, q1.y);
		ctx.quadraticCurveTo(qM.x, qM.y, q2.x, q2.y);
		ctx.stroke();
		return ctx;
	}
	
	renderMT(ctx, alpha) {
		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.moveTo(this.trackMT.Points[0].x, this.trackMT.Points[0].y);
		ctx.quadraticCurveTo(this.trackMT.Points[1].x, this.trackMT.Points[1].y, this.trackMT.Points[2].x, this.trackMT.Points[2].y);
		ctx.stroke();
		return ctx;
	}
}

class Animator {
    constructor(geometry, view) {
        this.view = view;
        this.reset(geometry);
    }

    reset(geometry) {
        if(this.timerID) clearInterval(this.timerID);
        this.view.reset();
        this.spindle = this.getSpindle(geometry);
        this.showValues(geometry);
        this.view.ctx = SpindleRenderer.render(this.view.ctx, this.spindle);
        this.timerID = this.getTimerID(this.view.ctx, this.view.plot, geometry);
    }

    getTimerID(ctx, plot, geometry) {
        const callback = this.drawAll.bind(this, this);
        return setInterval(callback, 1000 / geometry.fps);
    }

    getSpindle(geometry) {
        return new Spindle(geometry.N, geometry.nEBs, geometry);
    }

    showValues(geometry) {
        let utilities = new Utilities();
        utilities.d$V("nMT", geometry.N);
        utilities.d$V("FractionEBs", utilities.limitDP(geometry.Asymmetry[2]));
    }

    drawAll(instance) {
        instance.view.initialize();
        instance.spindle.update();
        instance.view.ctx = SpindleRenderer.render(instance.view.ctx, instance.spindle);
        instance.view.plot.draw(instance.spindle.orientations, instance.spindle.nOrientations);
    }

    static create() {
        const geometry = new Geometry();
        const animator = new Animator(geometry, new View());
        const update = ()=> animator.reset(geometry);
        animator.controller = new Controller(geometry, update);
        return animator;
    }
}
