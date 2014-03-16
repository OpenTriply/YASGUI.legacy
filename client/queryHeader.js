
var QueryHeader = function(parent, tabSettings) {
	var queryHeader = $("<ul class='queryHeader'></ul>");
	parent.append(queryHeader);
	var init = function() {
		
		Yasgui.widgets.QueryIcon(addListItem(), tabSettings);
		Yasgui.widgets.BookmarkManager(addListItem(), tabSettings);
		Yasgui.widgets.EndpointComboBox(addListItem(), tabSettings);
		Yasgui.widgets.SearchEndpoints(addListItem(), tabSettings);
		Yasgui.widgets.RequestConfigMenu(addListItem(), tabSettings);
		Yasgui.widgets.YasguiConfigMenu(addListItem(true), tabSettings);
	};
	
	var addListItem = function(rightAligned) {
		var listItem = $("<li></li>");
		if (rightAligned) listItem.addClass("rightAlignQueryHeader");
		queryHeader.append(listItem);
		return listItem;
	};
	var positionElement = function(){
		var extraOffset = 12; //need to adjust to overflow of query icon
		//position header itself
		queryHeader.css("top", ( $("#tabs").outerHeight(true) + extraOffset) + "px");
		//redraw background div, otherwise the query content will appear under our query header
		$("#queryHeaderBackground").height($("#tabs").outerHeight(true) + extraOffset + queryHeader.outerHeight(true));
	};
	init();
	
	return {
		get: function(){return queryHeader;},
		positionElement: positionElement
//		cm: codemirror,
//		check: checkSyntax
	};
};
Yasgui.objs.QueryHeader = QueryHeader;