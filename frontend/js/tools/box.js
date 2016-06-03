function box(top, left, height, width){
	function hitsPoint(x, y){
		x -= left;
		y -= top;
		if(x<0 || y<0 || y>=height || x>=width){
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