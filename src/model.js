
	class Geometry {
		constructor() {
			this.N = 5;
			this.X1 = 0;
			this.Y1 = 74;
			this.X2 = 299;
			this.Y2 = 74;
			this.Size = this.X2 - this.X1 + 1;
			this.nEBs = 10;
			this.fps = 8;
			this.Asymmetry = [0, 0, 0.20, 0, 0];
			this.minAngleD = -40;
			this.maxAngleD = 40;
		}
	}

	class Point {
	  constructor(x, y) {
		this.x = x;
		this.y = y;
	  }
	  getDistance (a, b) {
		return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
	  }
	  add(a) {
	    return new Point(this.x + a.x, this.y + a.y);
	  }
	  getAngleDeg(q) {
	    return (180 / Math.PI) * Math.atan2(q.y - this.y, q.x - this.x);
	  }
	}

	class EBs {
	  constructor(geometry) {
		this.resetArrays();
		this.resetParams();
		this.geometry = geometry;
	  }
	  resetArrays() {
		this.t1 = [];
		this.t2 = [];
		this.duration = [];
		this.direction = [];
		this.nEBs = 0;
	  }
	  resetParams() {
		this.offset = 0;
		this.dutyCyle = 0;
		this.length = 0;
		this.gap = 0;
		this.dt1 = 0;
		this.dt2 = 0;
		this.durationMin = 0;
		this.durationMax = 0;
		this.nValidEBs = 0;
		this.Log = "";
	  }
	  append(t1, t2) {
		if ((t1 >= 0) && (t2 <= 1)) {
			this.t1[this.nValidEBs] = t1;
			this.t2[this.nValidEBs] = t2;
			this.duration[this.nValidEBs] = 1;
			this.direction[this.nValidEBs] = (Math.random() > 0.5)? -1:1;
			this.nValidEBs++;
		}
	  }
	  setParams() {
		this.offset = 0.05;
		this.dutyCyle = 0.60;
		this.length = this.dutyCyle / this.nEBs;
		this.gap = (1 - this.dutyCyle) / this.nEBs;

		this.dt1 = 0.01;
		this.dt2 = this.dt1;
		const modFactor = 0.5;
		this.durationMax = (1 / this.dt2 - 1) * 0.6 * (modFactor + (1 - modFactor) * Math.random());
	  }
	  initialize(nEBs) {
		this.resetArrays();
		this.nEBs = nEBs;
		this.setParams();
		let t1 = 0;
		let t2 = 0;
		let t2_ = 0;
		for (let cntr = 0; cntr < nEBs; cntr++) {
		  t1 = t2_ + this.gap * Math.random();
		  t2 = t1 + this.length * Math.random();
		  this.append(t1, t2);
		  t2_ = t2 + this.offset;
		}
		this.nEBs = this.nValidEBs;
	  }
	  update() {
		for (let n = 0; n < this.nEBs; n++) {
		  this.t1[n] += this.dt1 * this.direction[n];
		  this.t2[n] += this.dt2 * this.direction[n];
		  this.duration[n]++;
		  this.enforceDuration(n);
		  const tMaxHalf = 0.5;
		  const shouldChangeFlag = false ||
							((this.direction[n] > 0) && (this.t2[n] > tMaxHalf)) ||
							((this.direction[n] < 0) && (this.t1[n] < tMaxHalf));
		  if (shouldChangeFlag) {
			this.createEB(n);
		  }
		}
	  }
	  enforceDuration(n) {
		const modFactor = 0.5;
		  if (this.duration[n] >  this.durationMax * (modFactor + (1 - modFactor) * Math.random())) {
			this.createEB(n);
		  }
	  }
	  getMinT1() {
		const minT1 = 2;
		for (let n = 0; n < this.nEBs; n++) {
		  if (this.t2[n] >= this.t1[n]) {
			if (minT1 > this.t1[n]) {
			  minT1 = this.t1[n];
			}
		  }
		}
		return minT1;
	  }
	  getMaxT2() {
		let maxT2 = -1;
		this.t2
		  .filter((x, index) => x >= this.t1[index])
		  .forEach(x => maxT2 = Math.max(maxT2, x));
		return maxT2;
	  }
	  createEB(n) {
		this.duration[n] = 1;
		this.direction[n] = ((Math.random() + this.geometry.Asymmetry[2]) > 0.5)? 1:-1;
		const Alpha = 0.8;
		if (this.direction[n] > 0) {
			const minT1 = this.getMinT1();
			this.t1[n] = Alpha * minT1 * Math.random();
			const r = Math.random();
			this.t2[n] = Math.min(this.t1[n] + this.length, r * minT1 + (1 - r) * this.t1[n]);
		} else {
			const maxT2 = this.getMaxT2();
			this.t2[n] = 1 - Alpha * Math.random() * (1 - maxT2);
			const r = Math.random();
			this.t1[n] = Math.max(this.t2[n] - this.length, r * maxT2 + (1 - r) * this.t2[n]);
		}
	  }
	}

	class TrackMT {
	  constructor(P1, P2, thetaDeg, nEBs, geometry) {
		this.Points = [];
		this.Points[0] = P1;
		this.Points[1] = this.getH(P1, P2, thetaDeg);
		this.Points[2] = P2;
		this.ebs = new EBs(geometry);
		this.ebs.initialize(nEBs);
		this.nEBs = this.ebs.nEBs;
	  }
	  update() {
		this.ebs.update();
	  }
	  render(ctx) {
		const alphaMT = 0.2;
		const alphaEB = 1.0;
		ctx = this.renderMT(ctx, alphaMT);
		const strokeStyleOriginal = ctx.strokeStyle;
		for (let cntr = 0; cntr < this.nEBs; cntr++) {
		  ctx.strokeStyle = (this.ebs.direction[cntr] > 0)? "#FF3300":"#00BBFF";
		  ctx = this.renderEB(ctx, this.ebs.t1[cntr], this.ebs.t2[cntr], alphaEB);
		}
		ctx.strokeStyle = strokeStyleOriginal;
		return ctx;
	  }
	  renderEB(ctx, t1, t2, alpha) {
		const q1 = this.getP(t1);
		const q2 = this.getP(t2);
		const qM = this.getP((t1 + t2) / 2);
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
		ctx.moveTo(this.Points[0].x, this.Points[0].y);
		ctx.quadraticCurveTo(this.Points[1].x, this.Points[1].y, this.Points[2].x, this.Points[2].y);
		ctx.stroke();
		return ctx;
	  }
	  getH(P1, P2, thetaDeg) {
		const dH = new Point(0, 0);
		const thetaRad = (Math.PI / 180) * thetaDeg;
		const P2m = (Math.cos(thetaRad) > 0)? P2:this.addPoints(P1 , this.diff(P1, P2));
		const M = this.scalePoint(0.5, this.addPoints(P1, P2m));
		const wP1M = this.vNorm(this.diff(M, P1));
		const wMH = wP1M * Math.tan(thetaRad);
		const MS = new Point(P1.y - P2.y, P2.x - P1.x);
		const MH = this.scalePoint(wMH / this.vNorm(MS), MS);
		return this.addPoints(this.addPoints(M, MH), dH);
	  }
	  getP(t) {
		const c0 = (1 - t) * (1 - t);
		const c1 = 2 * (1 - t) * t;
		const c2 = t * t;
		return new Point(
						c0 * this.Points[0].x + c1 * this.Points[1].x + c2 * this.Points[2].x,
						c0 * this.Points[0].y + c1 * this.Points[1].y + c2 * this.Points[2].y
						);
	  }
	  addPoints(p, q) {
		return new Point(p.x + q.x, p.y + q.y);
	  }
	  scalePoint(k, p) {
		return new Point(k * p.x, k * p.y);
	  }
	  vNorm(p) {
		return Math.sqrt(p.x * p.x + p.y * p.y);
	  }
	  diff(p, q) {
		return this.addPoints(p, this.scalePoint(-1, q));
	  }
	  unitDiff(p, q) {
		const r = this.diff(p, q);
		return this.scalePoint(1 / this.vNorm(r), r);
	  }
	}

	class Spindle {
		constructor(P1, P2, minAngleD, maxAngleD, nAngles, nEBs, geometry) {
			this.nMTs = nAngles;
			this.arcArray = [];
			this.initializeDirectionData(minAngleD, maxAngleD, nAngles);
			for (let cntr = 0; cntr < this.nMTs; cntr++) {
			  this.arcArray[cntr] = new TrackMT(P1, P2, this.orientations[cntr], nEBs, geometry);
			  this.updateDirectionData(cntr);
			}
		}
		update() {
			this.arcArray.forEach((arc, index) => {
				arc.update();
				this.updateDirectionData(index);
			});
		}
		initializeDirectionData(minAngleD, maxAngleD, nAngles) {
			this.angleStep = (maxAngleD - minAngleD) / (nAngles - 1);
			this.nAllOrientations = Math.ceil(360 / this.angleStep);
			this.angleOffset = Math.floor(this.nAllOrientations / 2);
			this.orientations = new Array(this.nAllOrientations);
			this.nOrientations = new Array(this.nAllOrientations);
			for (let cntr = 0; cntr < this.nAllOrientations; cntr++) {
			  this.nOrientations[cntr] = 0;
			  this.orientations[cntr] = minAngleD + cntr * this.angleStep;
			}
		}
		updateDirectionData(trackIndex) {
		  const ebs = this.arcArray[trackIndex].ebs;
		  ebs.duration.forEach((x, ebIndex)=>{
		    if (x == 1) {
			  const offset = (ebs.direction[ebIndex] > 0)? 0:this.angleOffset; 
			  this.nOrientations[trackIndex + offset]++;
			}
		  });
		}
		render(ctx) {
			this.arcArray.forEach(arc=>ctx = arc.render(ctx));
			return ctx;
		}
		getComplementaryAngle(x) {
		  return -x + ((x > 0)? 180:-180);
		}
	}
