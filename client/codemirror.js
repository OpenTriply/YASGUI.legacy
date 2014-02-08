Yasgui.Codemirror = {};

Yasgui.Codemirror.deleteLines = function(cm) {
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


Yasgui.Codemirror.commentLines = function(cm) {
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

Yasgui.Codemirror.copyLineUp = function(cm) {
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
};
Yasgui.Codemirror.copyLineDown = function(cm) {
	Yasgui.Codemirror.copyLineUp(cm);
	//Make sure cursor goes one down (we are copying downwards)
	var cursor = cm.getCursor();
	cursor.line++;
	cm.setCursor(cursor);
};
Yasgui.Codemirror.doAutoFormat = function(cm) {
	if (cm.somethingSelected()) {
		var to = {line: cm.getCursor(false).line, ch: cm.getSelection().length};
		cm.autoFormatRange(cm.getCursor(true), to);
	} else {
		var totalLines = cm.lineCount();
		var totalChars = cm.getTextArea().value.length;
		cm.autoFormatRange({line:0, ch:0}, {line:totalLines, ch:totalChars});
	}
	
};
Yasgui.Codemirror.indentTab = function(cm) {
	var indentSpaces = Array(cm.getOption("indentUnit") + 1).join(" ");
	if (cm.somethingSelected()) {
		for (var i = cm.getCursor(true).line; i <= cm.getCursor(false).line; i++) {
			cm.replaceRange(indentSpaces, {
				line : i,
				ch : 0
			});
		}
	} else {
	    cm.replaceSelection(indentSpaces, "end", "+input");
	}
	
};
Yasgui.Codemirror.unindentTab = function(cm) {
	for (var i = cm.getCursor(true).line; i <= cm.getCursor(false).line; i++) {
		var line = cm.getLine(i);
		if (/^\t/.test(line)) {
			console.log("tab!");
			line = line.replace(/^\t(.*)/, "$1");
		} else if (/^ /.test(line)) {
			var re = new RegExp("^ {1," + cm.getOption("indentUnit") + "}(.*)","");
			line = line.replace(re, "$1");
		}
		cm.setLine(i, line);
	}
	
};


Yasgui.Codemirror.autoComplete = function(cm) {
	if (cm.somethingSelected()) {
		//do nothing
	} else {
		CodeMirror.showHint(cm, CodeMirror.AutocompletionBase, {completeSingle: false, closeOnUnfocus: false,async: true,closeCharacters: /(?=a)b/});
	}
};
Yasgui.Codemirror.prefixHint = function(cm) {
	// Find the token at the cursor
	var cur = cm.getCursor(), token = cm.getTokenAt(cur);

	includePreviousTokens = function(token, cur) {
		var prevToken = cm.getTokenAt({
			line : cur.line,
			ch : token.start
		});
		if (prevToken.className == "sp-punct"
				|| prevToken.className == "sp-keyword") {
			token.start = prevToken.start;
			cur.ch = prevToken.start;
			token.string = prevToken.string + token.string;
			return includePreviousTokens(token, cur);// recursively,
			// might have
			// multiple tokens
			// which it should
			// include
		} else {
			return token;
		}
	};

	// not at end of line
	if (cm.getLine(cur.line).length > cur.ch)
		return;

	if (token.className != "sp-ws") {
		// we want to complete token, e.g. when the prefix starts with an a
		// (treated as a token in itself..)
		// but we to avoid including the PREFIX tag. So when we have just
		// typed a space after the prefix tag, don't get the complete token
		token = getCompleteToken(cm);
	}
	// we shouldnt be at the uri part the prefix declaration
	// also check whether current token isnt 'a' (that makes codemirror
	// thing a namespace is a possiblecurrent
	if (!token.string.startsWith("a")
			&& $.inArray("PNAME_NS", token.state.possibleCurrent) == -1)
		return;

	// First token of line needs to be PREFIX,
	// there should be no trailing text (otherwise, text is wrongly inserted
	// in between)
	firstToken = getNextNonWsToken(cm, cur.line);
	if (firstToken == null || firstToken.string.toUpperCase() != "PREFIX")
		return;

	// If this is a whitespace, and token is just after PREFIX, proceed
	// using empty string as token
	if (/\s*/.test(token.string) && cm.getTokenAt({
		line : cur.line,
		ch : token.start
	}).string.toUpperCase() == "PREFIX") {
		token = {
			start : cur.ch,
			end : cur.ch,
			string : "",
			state : token.state
		};
	} else {
		// We know we are in a PREFIX line. Now check whether the string
		// starts with a punct or keyword
		// Good example is 'a', which is a valid punct in our grammar.
		// This is parsed as separate token which messes up the token for
		// autocompletion (the part after 'a' is used as separate token)
		// If previous token is in keywords or keywords, prepend this token
		// to current token
		token = includePreviousTokens(token, cur);
	}

	return {
		list : Yasgui.prefixes.complete(token.string),
		from : {
			line : cur.line,
			ch : token.start
		},
		to : {
			line : cur.line,
			ch : token.end
		}
	};
};

/**
 * Check whether typed prefix is declared. If not, automatically add declaration
 * using list from prefix.cc
 * 
 * @param cm
 */
Yasgui.Codemirror.appendPrefixIfNeeded = function(cm) {
	var cur = cm.getCursor();
	var token = cm.getTokenAt(cur);
	if (token.className == "sp-prefixed") {
		var colonIndex = token.string.indexOf(":");
		if (colonIndex !== -1) {
			// check first token isnt PREFIX, and previous token isnt a '<'
			// (i.e. we are in a uri)
			var firstTokenString = getNextNonWsToken(cm, cur.line).string
					.toUpperCase();
			var previousToken = cm.getTokenAt({
				line : cur.line,
				ch : token.start
			});// needs to be null (beginning of line), or whitespace
			if (firstTokenString != "PREFIX"
					&& (previousToken.className == "sp-ws" || previousToken.className == null)) {
				// check whether it isnt defined already (saves us from looping
				// through the array)
				var currentPrefix = token.string.substring(0, colonIndex + 1);
				var queryPrefixes = getPrefixesFromQuery(cm);
				if (queryPrefixes[currentPrefix] == null) {
					// ok, so it isnt added yet!
					var completions = Yasgui.prefixes.complete(currentPrefix);
					if (completions.length > 0) {
						appendToPrefixes(cm, completions[0]);
					}
				}
			}
		}
	}
};


/**
 * Get defined prefixes from query as array, in format {"prefix:" "uri"}
 * 
 * @param cm
 * @returns {Array}
 */
var getPrefixesFromQuery = function(cm) {
	var queryPrefixes = {};
	var numLines = cm.lineCount();
	for ( var i = 0; i < numLines; i++) {
		var firstToken = getNextNonWsToken(cm, i);
		if (firstToken != null && firstToken.string.toUpperCase() == "PREFIX") {
			var prefix = getNextNonWsToken(cm, i, firstToken.end + 1);
			var uri = getNextNonWsToken(cm, i, prefix.end + 1);
			if (prefix != null && prefix.string.length > 0 && uri != null
					&& uri.string.length > 0) {
				uriString = uri.string;
				if (uriString.startsWith("<"))
					uriString = uriString.substring(1);
				if (uriString.endsWith(">"))
					uriString = uriString.substring(0, uriString.length - 1);
				queryPrefixes[prefix.string] = uriString;
			}
		}
	}
	return queryPrefixes;
};

/**
 * Append prefix declaration to list of prefixes in query window.
 * 
 * @param cm
 * @param prefix
 */
var appendToPrefixes = function(cm, prefix) {
	var lastPrefix = null;
	var lastPrefixLine = 0;
	var numLines = cm.lineCount();
	for ( var i = 0; i < numLines; i++) {
		var firstToken = getNextNonWsToken(cm, i);
		if (firstToken != null
				&& (firstToken.string == "PREFIX" || firstToken.string == "BASE")) {
			lastPrefix = firstToken;
			lastPrefixLine = i;
		}
	}

	if (lastPrefix == null) {
		cm.replaceRange("PREFIX " + prefix + "\n", {
			line : 0,
			ch : 0
		});
	} else {
		var previousIndent = getIndentFromLine(cm, lastPrefixLine);
		cm.replaceRange("\n" + previousIndent + "PREFIX " + prefix, {
			line : lastPrefixLine
		});
	}
};

/**
 * Get the used indentation for a certain line
 * 
 * @param cm
 * @param line
 * @param charNumber
 * @returns
 */
var getIndentFromLine = function(cm, line, charNumber) {
	if (charNumber == undefined)
		charNumber = 1;
	var token = cm.getTokenAt({
		line : line,
		ch : charNumber
	});
	if (token == null || token == undefined || token.className != "sp-ws") {
		return "";
	} else {
		return token.string + getIndentFromLine(cm, line, token.end + 1);
	}
	;
};

var getCompleteToken = function(editor, token, cur) {
	if (cur == null) {
		cur = editor.getCursor();
	}
	if (token == null) {
		token = editor.getTokenAt(cur);
	}
	// we cannot use token.string alone (e.g. http://bla results in 2
	// tokens: http: and //bla)

	var prevToken = editor.getTokenAt({
		line : cur.line,
		ch : token.start
	});
	if (prevToken.className != null && prevToken.className != "sp-ws") {
		token.start = prevToken.start;
		token.string = prevToken.string + token.string;
		return getCompleteToken(editor, token, {
			line : cur.line,
			ch : prevToken.start
		});// recursively, might have multiple tokens which it should
		// include
	} else {
		return token;
	}
};

var getNextNonWsToken = function(cm, lineNumber, charNumber) {
	if (charNumber == undefined)
		charNumber = 1;
	var token = cm.getTokenAt({
		line : lineNumber,
		ch : charNumber
	});
	if (token == null || token == undefined || token.end < charNumber) {
		return null;
	}
	if (token.className == "sp-ws") {
		return getNextNonWsToken(cm, lineNumber, token.end + 1);
	}
	return token;
};

//var getPrefixSuggestions = function(token) {
//	// the keywords should contain the prefixes
//	// Start: end of string being typed
//	var found = [], start = token.string;
//	function maybeAdd(str) {
//		if (str.indexOf(start) == 0 && !arrayContains(found, str))
//			found.push(str + "\n"); // append linebreak! Otherwise we stay
//		// on the same line, and after adding
//		// the popup with autocompletions is
//		// still firing..
//	}
//	forEach(prefixes, maybeAdd);
//	return found;
//};
