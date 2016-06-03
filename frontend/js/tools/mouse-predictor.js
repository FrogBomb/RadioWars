	/*	Mouse position predictor.
			This takes existing mouse data and attempts to make a predictor for its position
			using a 2nd degree bezier curve approximation. 
			*/
function mousePredictor(timeDif, curP, prevP, curV, prevV){
	
	var nextV = []; //Assume there is a roughly constant acceleration
	nextV[0] = curV[0] + curV[0] - prevV[0]; 
	nextV[1] = curV[1] + curV[1] - prevV[1];
	
	var nextP = []; //with constant acceleration...
	nextP[0] = curP[0] + (timeDif * (curV[0]+nextV[0]))/2;
	nextP[1] = curP[1] + (timeDif * (curV[1]+nextV[1]))/2;
	
	//Position of mouse at time t (if current time is 0)
	return function(t){
		return [curP[0] + t*curV[0] + (nextP[0] + t*nextV[0] - curP[0] - t*curV[0])*(t/timeDif),
				curP[1] + t*curV[1] + (nextP[1] + t*nextV[1] - curP[1] - t*curV[1])*(t/timeDif)];
	}
}