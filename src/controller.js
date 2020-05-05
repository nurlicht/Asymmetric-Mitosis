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