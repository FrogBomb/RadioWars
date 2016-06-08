function isTwoTupleInArray(twoTuple, arr){
	for(var i=0; i<arr.length; i++){
		var t = arr[i];
		if(t[0] == twoTuple[0] && t[1] == twoTuple[1]){
			return true;
		}
	}
	return false;
}

Handlebars.registerHelper("map", function(mapData, options){
	/*
		mapData
			.startFields[i]
				.x
				.y
				.width
				.height
			.mapGridSize : [x, y]
			.teamNames[i] : str
			.radioGridLoc[i] : [x, y]
	*/
	var startBoxes = [];
	for(var i = 0; i<mapData.startFields.length; i++){
		var sbs = mapData.startFields[i];
		console.log(sbs);
		startBoxes.push(box(sbs.y, sbs.x, sbs.height, sbs.width));
	}
	ret = "<div style=\"width:" +102*mapData.mapGridSize[0] 
				+"px; height:"+ 102*mapData.mapGridSize[1]  +"px\">";
	
	for(var j = 0; j<mapData.mapGridSize[1]; j++){
		for(var i = 0; i<mapData.mapGridSize[0]; i++){	
			var startTeamClass = "";
			var coords = (""+i)+"x"+j;	
			for(var k = 0; k < startBoxes.length; k++){
				if(startBoxes[k].hitsPoint(i, j)){
					startTeamClass += " " + mapData.teamNames[k];
				}
			}
			ret += options.fn({
				teams: mapData.teamNames.map(
					function(team, i){return {	team: team,
											  	teamNum: i,
												groupName: coords}}),
				isRadio: isTwoTupleInArray([i, j], mapData.radioGridLoc),
				startTeamClass: startTeamClass
			});
		}
	}
	ret += "</div>";
	return ret;
});