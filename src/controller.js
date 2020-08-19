class ControllerConstants {
    static EXCESS_PARTICLES_MAX = 0.5;
    static EXCESS_PARTICLES_MIN = - 0.5;
    static EXCESS_PARTICLES_STEP = 0.02;
    static ALPHA_MT = 0.2;
    static ALPHA_EB = 1.0;
    static RED_COLOR = "#FF3300";
    static BLUE_COLOR = "#00BBFF";
    static SECOND_IN_MILLISECONDS = 1000;
    static NUMBER_OF_TRACKS = 'number-of-tracks';
    static EXCESS_PARTICLES_LEFT_TO_RIGHT = 'excess-particles-left-to-right';
    static ASYMMETRY_PARTICLE_INDEX = 2;
}

class AnimatorBase {
    view;
    spindle;
    timeID;

    constructor(view) {
        this.view = view;
    }
}

class ControllerBase {
    geometry;
    update;
    positionStep;
    sizeStep;

    constructor(geometry, update) {
        this.geometry = geometry;
        this.update = update;
    }
}

class Controller extends ControllerBase {
    constructor(geometry, update) {
        super(geometry, update);
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

    incFractionEBs() {
        this.geometry.setExcessParticles(Math.min(
            ControllerConstants.EXCESS_PARTICLES_MAX,
            this.geometry.getExcessParticles() + ControllerConstants.EXCESS_PARTICLES_STEP
        ));
        this.update();
    }

    decFractionEBs() {
        this.geometry.setExcessParticles(Math.max(
            ControllerConstants.EXCESS_PARTICLES_MIN,
            this.geometry.getExcessParticles() - ControllerConstants.EXCESS_PARTICLES_STEP
        ));
        this.update();
    }
}

class SpindleRenderer {
    static render(ctx, spindle) {
        spindle.arcArray.forEach(arc=> TrackMTRenderer.render(ctx, arc));
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
        const alphaMT = ControllerConstants.ALPHA_MT;
        const alphaEB = ControllerConstants.ALPHA_EB;
        this.renderMT(ctx, alphaMT);
        const strokeStyleOriginal = ctx.strokeStyle;
        const ebs = this.trackMT.ebs;
        const nEBs = this.trackMT.nEBs;
        for (let cntr = 0; cntr < nEBs; cntr++) {
            ctx.strokeStyle = this.getColor(ebs.direction[cntr]);
            this.renderEB(ctx, ebs.t1[cntr], ebs.t2[cntr], alphaEB);
        }
        ctx.strokeStyle = strokeStyleOriginal;
    }

    getColor(directionSign) {
        return (directionSign > 0)?
            ControllerConstants.RED_COLOR:
            ControllerConstants.BLUE_COLOR
        ;
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
    }
    
    renderMT(ctx, alpha) {
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(this.trackMT.Points[0].x, this.trackMT.Points[0].y);
        ctx.quadraticCurveTo(this.trackMT.Points[1].x, this.trackMT.Points[1].y, this.trackMT.Points[2].x, this.trackMT.Points[2].y);
        ctx.stroke();
    }
}

class Animator extends AnimatorBase {
    constructor(geometry, view) {
        super(view);
        this.reset(geometry);
    }

    reset(geometry) {
        if(this.timerID) clearInterval(this.timerID);
        this.view.reset();
        this.spindle = this.getSpindle(geometry);
        this.showValues(geometry);
        SpindleRenderer.render(this.view.getMitosisCanvasContext(), this.spindle);
        this.timerID = this.getTimerID(this.view.getMitosisCanvasContext(), this.view.plot, geometry);
    }

    getTimerID(ctx, plot, geometry) {
        const callback = this.drawAll.bind(this, this);
        return setInterval(callback, ControllerConstants.SECOND_IN_MILLISECONDS / geometry.fps);
    }

    getSpindle(geometry) {
        return new Spindle(geometry.N, geometry.nEBs, geometry);
    }


    showValues(geometry) {
        Utilities.d$V(ControllerConstants.NUMBER_OF_TRACKS, geometry.N);
        Utilities.d$V(
            ControllerConstants.EXCESS_PARTICLES_LEFT_TO_RIGHT,
            Utilities.limitDP(geometry.getExcessParticles())
        );
    }

    drawAll(instance) {
        instance.view.initialize();
        instance.spindle.update();
        SpindleRenderer.render(instance.view.getMitosisCanvasContext(), instance.spindle);
        instance.view.plot.draw(instance.spindle.orientations, instance.spindle.nOrientations);
    }

    static createController() {
        const geometry = new Geometry();
        const animator = new Animator(geometry, new View());
        const update = ()=> animator.reset(geometry);
        return new Controller(geometry, update);
    }
}
