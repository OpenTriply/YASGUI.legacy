
var QueryHeader = function(parent, tabSettings) {
	var queryHeader = $("<div class='queryHeader'></div>");
	var queryIcon;
	parent.append(queryHeader);
	var init = function() {
		drawQueryIcon();
		Yasgui.widgets.EndpointComboBox(queryHeader, tabSettings);
		Yasgui.widgets.RequestConfigMenu(queryHeader, tabSettings);
//		appendEndpointSelector();
		
		
		
	};
	
	var drawQueryIcon = function() {
//		queryIcon = $("<a class='queryIcon' href='#'><img src='" + Yasgui.constants.imgs.playSquare + "'></a>");
		queryIcon = $("<div class='centerize'><a class='queryIcon' href='#'><img src='" + Yasgui.constants.imgs.playSquare + "'></a></div>");
		queryHeader.append(queryIcon);
		
		Deps.autorun(function() {
			var queryStatus = Session.get("queryStatus");
			if (queryStatus == "busy") {
				queryIcon.off("click").click(function(){
					Session.set("queryStatus", "query");
					Yasgui.sparql.cancel();
					return false;
				}).children().attr("src",  Yasgui.constants.imgs.loading);
			} else if (queryStatus == "error") {
				queryIcon.off("click").click(function(){
					console.log("query");
					Yasgui.sparql.query();
					return false;
				}).children().attr("src",  Yasgui.constants.imgs.playSquareError);
		//		Session.set("oldest", oldest.name);
			} else if (queryStatus == undefined || queryStatus == "query") {
				queryIcon.off("click").click(function(){
					Yasgui.sparql.query();
					return false;
				}).children().attr("src",  Yasgui.constants.imgs.playSquare);
			} else {
				console.log("unrecognized query status in session: " + queryStatus);
			}
		});
	};
	init();
	
	return {
//		cm: codemirror,
//		check: checkSyntax
	};
};
Yasgui.objs.QueryHeader = QueryHeader;
