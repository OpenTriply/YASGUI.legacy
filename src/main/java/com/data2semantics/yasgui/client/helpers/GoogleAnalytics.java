package com.data2semantics.yasgui.client.helpers;

/*
 * #%L
 * YASGUI
 * %%
 * Copyright (C) 2013 Laurens Rietveld
 * %%
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * #L%
 */

import java.util.ArrayList;

import com.google.gwt.dom.client.Document;
import com.google.gwt.dom.client.Element;
import com.google.gwt.dom.client.ScriptElement;
import com.google.gwt.user.client.Window;

/**
 * Default {@link GoogleAnalytics} implementation that uses JSNI to expose Google Analytics javascript methods.
 * 
 * @author Christian Goudreau
 */
public class GoogleAnalytics {
	
	public static void init(String userAccount) {

		Element firstScript = Document.get().getElementsByTagName("script").getItem(0);

		ScriptElement config = Document.get().createScriptElement(
				"var _gaq = _gaq || [];_gaq.push(['_setAccount', '" + userAccount + "']);_gaq.push(['_trackPageview']);");

		firstScript.getParentNode().insertBefore(config, firstScript);

		ScriptElement script = Document.get().createScriptElement();

		// Add the google analytics script.
		script.setSrc(("https:".equals(Window.Location.getProtocol()) ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js");
		script.setType("text/javascript");
		script.setAttribute("async", "true");

		firstScript.getParentNode().insertBefore(script, firstScript);
	}

	public static native void addAccount(String trackerName, String userAccount) /*-{
		$wnd._gaq.push([ '" + trackerName + "._setAccount',
				'" + userAccount + "' ]);
	}-*/;

	public static native void trackPageview(String pageName) /*-{
		if (!pageName.match("^/") == "/") {
			pageName = "/" + pageName;
		}

		$wnd._gaq.push([ '_trackPageview', pageName ]);
	}-*/;

	public static native void trackPageview() /*-{
		$wnd._gaq.push([ '_trackPageview' ]);
	}-*/;

	public static native void trackPageview(String trackerName, String pageName) /*-{
		if (!pageName.match("^/") == "/") {
			pageName = "/" + pageName;
		}

		$wnd._gaq.push([ '" + trackerName + "._trackPageview', pageName ]);
	}-*/;
	
	public static void trackEvents(GoogleAnalyticsEvent... events) throws IllegalArgumentException {
		if (events != null && events.length > 0) {
			ArrayList<String> categories = new ArrayList<String>();
			ArrayList<String> actions = new ArrayList<String>();
			ArrayList<String> optLabels = new ArrayList<String>();
			ArrayList<Integer> optValues = new ArrayList<Integer>();
			for (GoogleAnalyticsEvent event: events) {
				if (event == null || event.getCategory() == null || event.getAction() == null) {
					//at least require this
					throw new IllegalArgumentException("No category or action passed for google analytics event");
				}
				categories.add(event.getCategory());
				actions.add(event.getAction());
				optLabels.add(event.getOptLabel());
				optValues.add(event.getOptValue());
			}
			try {
				trackEvents(categories.toArray(new String[categories.size()]), actions.toArray(new String[actions.size()]), optLabels.toArray(new String[optLabels.size()]), optValues.toArray(new Integer[optValues.size()]));
			} catch (Exception e) {
				//do nothing, just happens sometimes (e.g. first page load in dev mode, or with ga blockers
			}
		}
	}

	private static native void trackEvent(String category, String action) /*-{
		$wnd._gaq.push([ '_trackEvent', category, action ]);
	}-*/;

	private static native void trackEvent(String category, String action, String optLabel) /*-{
		$wnd._gaq.push([ '_trackEvent', category, action, optLabel ]);
	}-*/;

	private static native void trackEvent(String category, String action, String optLabel, int optValue) /*-{
		
		$wnd._gaq.push([ '_trackEvent', category, action, optLabel, optValue ]);
	}-*/;

	private static native void trackEvent(String category, String action, String optLabel, int optValue, boolean optNonInteraction) /*-{
		$wnd._gaq.push([ '_trackEvent', category, action, optLabel, optValue,
				optNonInteraction ]);
	}-*/;
	
	
	private static native void trackEvents(String[] category, String[] action, String[] optLabel, Integer[] optValue) /*-{
		if (category.length == action.length && action.length == optLabel.length && optLabel.length == optValue.length) {
			commands = [];
			for (i = 0; i < category.length; i++) {
				if (optValue[i] != null && optValue[i] != 0) {
					commands.push([ '_trackEvent', category[i], action[i], optLabel[i], optValue[i] ]);
				} else if (optLabel[i] != null && optLabel[i] != "") {
					commands.push([ '_trackEvent', category[i], action[i], optLabel[i] ]);
				} else {
					commands.push([ '_trackEvent', category[i], action[i] ]);
				}
				commands.push([ '_trackEvent', category[i], action[i], optLabel[i], optValue[i] ]);
			}
			if ($wnd._gaq != null) {
				$wnd._gaq.push.apply($wnd._gaq.push, commands);
			} else {
				throw new Error("No google analyitics found to push results to");
			}
		} else {
			throw new Error("Unequal set of arguments for tracking events: " + category.length + " - " + action.length + " - " + optLabel.length + " - " + optValue.length);
		}
	}-*/;
	

	private static native void trackEventWithTracker(String trackerName, String category, String action) /*-{
		$wnd._gaq.push([ '" + trackerName + "._trackEvent', category, action ]);
	}-*/;

	private static native void trackEventWithTracker(String trackerName, String category, String action, String optLabel) /*-{
		$wnd._gaq.push([ '" + trackerName + "._trackEvent', category, action,
				optLabel ]);
	}-*/;

	private static native void trackEventWithTracker(String trackerName, String category, String action, String optLabel, int optValue) /*-{
		$wnd._gaq.push([ '" + trackerName + "._trackEvent', category, action,
				optLabel, optValue ]);
	}-*/;

	private static native void trackEventWithTracker(String trackerName, String category, String action, String optLabel, int optValue,
			boolean optNonInteraction) /*-{
										$wnd._gaq.push([ '" + trackerName + "._trackEvent', category, action, optLabel, optValue, optNonInteraction ]);
										}-*/;
}
