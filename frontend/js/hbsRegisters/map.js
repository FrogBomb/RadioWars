function isTwoTupleInArray(twoTuple, arr){
	for(var t in arr){
		if(t[0] == twoTuple[0] && t[1] == twoTuple[1]){
			return true;
		}
	}
	return false;
}

Handlebars.RegisterHelper("map", function(mapData, options){
	var startBoxes = [];
	for(var sbs in mapData.startFields){
		startBoxes.push(box(sbs.x, sbs.y, sbs.width, sbs.height));
	}
	ret = "";
	for(var i = 0; i<mapData.mapGridSize[0]; i++){
		for(var j = 0; j<mapData.mapGridSize[1]; j++){
			var startTeamClass = "";
			var coords = (""+i)+"x"+j;
			for(var k = 0; k < startBoxes.length; k++){
				if(startBoxes[k].hitsPoint(i, j)){
					startTeamClass += " " + teamNames[i];
				}
			}
			ret += options.fn({
				teams: mapData.teamNames.map(
					function(team){return {	team: team,
											groupName: coords}}),
				isRadio: isTwoTupleInArray([i, j], mapData.radioGridLoc),
				coords: coords,
				startTeamClass: startTeamClass
			});
		}
	}
	return ret;
});