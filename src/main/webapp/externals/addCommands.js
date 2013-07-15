CodeMirror.commands.autocomplete = function(cm) {
	CodeMirror.simpleHint(cm, CodeMirror.prefixHint);
};
CodeMirror.commands.executeQuery = function(cm) {
	executeQuery();
};
//Make sure deleteLine also -removes- the line
CodeMirror.commands.deleteLines = function(cm) {
	var startLine = cm.getCursor(true).line;
	var endLine = cm.getCursor(false).line;
	var min = Math.min(startLine, endLine);
	var max = Math.max(startLine, endLine);
	for ( var i = min; i <= max; i++) {
		//Do not remove i, because line counter changes after deleting 1 line. 
		//Therefore, keep on deleting the minimum of the selection
		cm.removeLine(min);
	}
	var cursor = cm.getCursor(true);
	if (cursor.line + 1 <= cm.lineCount() ) {
		cursor.line++;
		cursor.ch = 0;
		cm.setCursor(cursor);
	}
};
CodeMirror.commands.commentLines = function(cm) {
	var startLine = cm.getCursor(true).line;
	var endLine = cm.getCursor(false).line;
	var min = Math.min(startLine, endLine);
	var max = Math.max(startLine, endLine);

	//if all lines start with #, remove this char. Otherwise add this char
	var linesAreCommented = true;
	for ( var i = min; i <= max; i++) {
		var line = cm.getLine(i);
		if (line.length == 0 || line.substring(0, 1) != "#") {
			linesAreCommented = false;
			break;
		}
	}
	for ( var i = min; i <= max; i++) {
		if (linesAreCommented) {
			//lines are commented, so remove comments
			cm.replaceRange("", {
				line : i,
				ch : 0
			}, {
				line : i,
				ch : 1
			});
		} else {
			//Not all lines are commented, so add comments
			cm.replaceRange("#", {
				line : i,
				ch : 0
			});
		}

	}
};

CodeMirror.commands.copyLineUp = function(cm) {
	copyLinesBelow(cm);
};
CodeMirror.commands.copyLineDown = function(cm) {
	console.log("copy down");
	copyLinesBelow(cm);
	//Make sure cursor goes one down (we are copying downwards)
	var cursor = cm.getCursor();
	cursor.line++;
	cm.setCursor(cursor);
};
function copyLinesBelow(cm) {
	var cursor = cm.getCursor();
	var lineCount = cm.lineCount();
	//First create new empty line at end of text
	cm.replaceRange("\n", {
		line : lineCount - 1,
		ch : cm.getLine(lineCount - 1).length
	});
	//Copy all lines to their next line
	for ( var i = lineCount; i > cursor.line; i--) {
		cm.setLine(i, cm.getLine(i - 1));
	}
}
var clearError = function() {};
var prevQueryValid = true;
function checkSyntax(cm, updateQueryButton) {
	var queryValid = true;
	if (clearError != null) {
		clearError();
		clearError = null;
	}
	;
	cm.clearGutter("gutterErrorBar");
	var state = null;
	for ( var l = 0; l < cm.lineCount(); ++l) {
		var precise = false;
		if (!prevQueryValid) {
			//we don't want cached information in this case, otherwise the previous error sign might still show up,
			//even though the syntax error might be gone already
			precise = true;
		}
		state = cm.getTokenAt({
			line : l,
			ch : cm.getLine(l).length
		}, precise).state;
		if (state.OK == false) {
			var error = document.createElement('span');
			error.innerHTML = "&rarr;";
			error.className = "gutterError";
			cm.setGutterMarker(l,"gutterErrorBar", error);
			clearError = function() {
				cm.markText({
					line : l,
					ch : state.errorStartPos
				}, {
					line : l,
					ch : state.errorEndPos
				}, "sp-error");
			};
			queryValid = false;
			break;
		}
	}
	prevQueryValid = queryValid;
	if (updateQueryButton) {
		showPlayButton((queryValid? "1": "0"));
		if (state != null && state.stack != undefined) {
			var stack = state.stack, len = state.stack.length;
			// Because incremental parser doesn't receive end-of-input
			// it can't clear stack, so we have to check that whatever
			// is left on the stack is nillable
			if (len > 1)
				queryValid = false;
			else if (len == 1) {
				if (stack[0] != "solutionModifier" && stack[0] != "?limitOffsetClauses"
						&& stack[0] != "?offsetClause")
					queryValid = false;
			}
		}
	}

	
}

