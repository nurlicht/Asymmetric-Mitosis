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