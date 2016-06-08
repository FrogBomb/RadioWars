function box(top, left, height, width){
	function hitsPoint(x, y){
		var relX = x-left;
		var relY = y-top;
		if(relX <0 || relY <0 || relY >=height || relX >=width){
			return false;
		}
		return true;
	}
	function hitsBox(nTop, nLeft, nHeight, nWidth){
		var nBot = nTop + nHeight;
		var nRight = nLeft + nWidth;
		return hitsPoint(nTop, nLeft)
			|| hitsPoint(nBot, nLeft) 
			|| hitsPoint(nTop, nRight)
			|| hitsPoint(nBot, nRight);
	}
	return {
		hitsPoint: hitsPoint,
		hitsBox: hitsBox
	};
}