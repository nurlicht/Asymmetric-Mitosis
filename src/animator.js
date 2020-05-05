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
        this.view.ctx = this.spindle.render(this.view.ctx);
        this.timerID = this.getTimerID(this.view.ctx, this.view.plot, geometry);
    }

    getTimerID(ctx, plot, geometry) {
        const callback = this.drawAll.bind(this, this);
        return setInterval(callback, 1000 / geometry.fps);
    }

    getSpindle(geometry) {
        return new Spindle(new Point(geometry.X1, geometry.Y1), new Point(geometry.X2, geometry.Y2), geometry.minAngleD, geometry.maxAngleD, geometry.N, geometry.nEBs, geometry);
    }

    showValues(geometry) {
        let utilities = new Utilities();
        utilities.d$V("nMT", geometry.N);
        utilities.d$V("FractionEBs", utilities.limitDP(geometry.Asymmetry[2]));
    }

    drawAll(instance) {
        instance.view.initialize();
        instance.spindle.update();
        instance.view.ctx = instance.spindle.render(instance.view.ctx);
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
