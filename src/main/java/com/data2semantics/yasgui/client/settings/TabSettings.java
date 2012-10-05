package com.data2semantics.yasgui.client.settings;

import java.util.Set;

import com.data2semantics.yasgui.shared.Output;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONParser;
import com.google.gwt.json.client.JSONString;

public class TabSettings extends JSONObject {

	/**
	 * KEYS
	 */
	private static String ENDPOINT = "endpoint";
	private static String QUERY_STRING = "queryFormat";
	private static String TAB_TITLE = "tabTitle";
	private static String OUTPUT_FORMAT = "outputFormat";

	/**
	 * DEFAULTS
	 */
	private static String DEFAULT_QUERY = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" + 
			"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
			+ "SELECT * {?sub ?pred ?obj} LIMIT 10";

	private static String DEFAULT_ENDPOINT = "http://dbpedia.org/sparql";
	private static String DEFAULT_TAB_TITLE = "Query";
	
	public TabSettings() {
		setEndpoint(DEFAULT_ENDPOINT);
		setQueryString(DEFAULT_QUERY);
		setTabTitle(DEFAULT_TAB_TITLE);
		setOutputFormat(Output.OUTPUT_RAW_RESPONSE);
	}

	public TabSettings(JSONObject jsonObject) {
		Set<String> keys = jsonObject.keySet();
		for (String key : keys) {
			put(key, jsonObject.get(key));
		}

	}

	public String getEndpoint() {
		return get(ENDPOINT).isString().stringValue();
	}

	public void setEndpoint(String endpoint) {
		put(ENDPOINT, new JSONString(endpoint));
	}

	public String getQueryString() {
		return get(QUERY_STRING).isString().stringValue();
	}

	public void setQueryString(String queryString) {
		put(QUERY_STRING, new JSONString(queryString));
	}

	public void setTabTitle(String tabTitle) {
		put(TAB_TITLE, new JSONString(tabTitle));
	}

	public String getTabTitle() {
		return get(TAB_TITLE).isString().stringValue();
	}
	public void setOutputFormat(String outputFormat) {
		put(OUTPUT_FORMAT, new JSONString(outputFormat));
	}
	
	public String getOutputFormat() {
		return get(OUTPUT_FORMAT).isString().stringValue();
	}

	public TabSettings clone() {
		//GWT and cloning is difficult. Use the simple solution: serialize to json, and parse into new settings object
		return new TabSettings(JSONParser.parseStrict(this.toString()).isObject());
	}
}