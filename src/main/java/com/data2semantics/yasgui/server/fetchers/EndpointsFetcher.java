package com.data2semantics.yasgui.server.fetchers;

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

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.data2semantics.yasgui.server.Helper;
import com.data2semantics.yasgui.server.SparqlService;
import com.data2semantics.yasgui.shared.Endpoints;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.RDFNode;

public class EndpointsFetcher {
	
	private static String ENDPOINT_MONDECA = "http://labs.mondeca.com/endpoint/ends";
	private static String ENDPOINT_CKAN = "http://semantic.ckan.net/sparql";
	private static String CACHE_FILENAME = "endpoints.json";
	private static int CACHE_EXPIRES_DAYS = 300; //that should be more than enough
	
	public static String fetch(boolean forceUpdate, File cacheDir) throws JSONException, IOException {
		String result = "";
		if (!cacheDir.exists()) {
			cacheDir.mkdir();
			forceUpdate = true;
		}
		File cacheFile = new File(cacheDir + "/" + CACHE_FILENAME);
		
		if (forceUpdate || Helper.needUpdating(cacheFile, CACHE_EXPIRES_DAYS)) {
			try {
				result = getEndpointsAsJsonArrayString(ENDPOINT_CKAN, getCkanQuery());
				if (result.length() > 0) {
					cacheFile.createNewFile();
					Helper.writeFile(cacheFile, result);
				} else {
					result = getEndpointsAsJsonArrayString(ENDPOINT_MONDECA, getMondecaQuery());
					if (result.length() > 0) {
						cacheFile.createNewFile();
						Helper.writeFile(cacheFile, result);
					}
				}
			} catch (Exception e) {
				//probably endpoints problems with ckan or mondeca... just use our cached version (even if forceupdate is set or file is stale...)
				if (cacheFile.exists()) {
					result = Helper.readFile(cacheFile);
				}
			}
			
		} else {
			try {
				result = Helper.readFile(cacheFile);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return result;
	}
	
	
	/**
	 * Query CKAN for endpoints, add them to json array object, and serialize as string (for caching on server)
	 * 
	 * @return
	 * @throws JSONException
	 */
	private static String getEndpointsAsJsonArrayString(String endpoint, String query) throws JSONException {
		JSONArray endpoints = new JSONArray();
		ResultSet resultSet = SparqlService.query(endpoint, query);
		while (resultSet.hasNext()) {
			JSONObject endpointObject = new JSONObject();
			
			QuerySolution querySolution = resultSet.next();
			Iterator<String> varNames = querySolution.varNames();
			while (varNames.hasNext()) {
				String varName = varNames.next();
				endpointObject.put(varName, getBindingValueAsString(querySolution.get(varName)));
			}
			endpoints.put(endpointObject);
		}
		
		
		return endpoints.toString();
	}
	
	
	private static String getBindingValueAsString(RDFNode node) {
		if (node.isLiteral()) {
			return node.asLiteral().getString();
		} else if (node.isURIResource()) {
			return node.asResource().getURI();
		} else {
			return node.toString();
		}
	}
	
	private static String getMondecaQuery() {
		return "PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>\n" + 
				"PREFIX dcterms:<http://purl.org/dc/terms/>\n" + 
				"PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n" + 
				"PREFIX ends:<http://labs.mondeca.com/vocab/endpointStatus#>\n" + 
				"PREFIX void:<http://rdfs.org/ns/void#>\n" + 
				"\n" + 
				"SELECT DISTINCT ?" + Endpoints.KEY_DATASETURI + " ?"  + Endpoints.KEY_TITLE + " ?" + Endpoints.KEY_DESCRIPTION + " ?" + Endpoints.KEY_ENDPOINT + " \n" + 
				"WHERE{\n" + 
				"	?" + Endpoints.KEY_DATASETURI + " void:sparqlEndpoint ?" + Endpoints.KEY_ENDPOINT + ".\n" + 
				"	?" + Endpoints.KEY_DATASETURI + " ends:status ?status.\n" + 
				"	?status ends:statusIsAvailable \"true\"^^xsd:boolean.\n" + 
				"  	?" + Endpoints.KEY_DATASETURI + " dcterms:title ?" + Endpoints.KEY_DESCRIPTION + ".\n" + 
				"BIND(?" + Endpoints.KEY_DESCRIPTION + " AS ?" + Endpoints.KEY_TITLE + ")" +
				//"  		dcterms:identifier ?" + Endpoints.KEY_TITLE + ".\n" + 
				"} \n";

	}
	
	private static String getCkanQuery() {
		return "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" 
				+ "		PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
				+ "		PREFIX dcat: <http://www.w3.org/ns/dcat#>\n" 
				+ "		PREFIX dcterms: <http://purl.org/dc/terms/>\n" + "\n"
				+ "		SELECT DISTINCT ?"	+ Endpoints.KEY_DATASETURI	+ " ?" + Endpoints.KEY_TITLE + " ?"	+ Endpoints.KEY_DESCRIPTION + " ?" + Endpoints.KEY_ENDPOINT	+ "  {\n"
				+ "		  ?" + Endpoints.KEY_DATASETURI	+ " dcat:distribution ?distribution.\n"
				+ "		?distribution dcterms:format ?format.\n"
				+ "		?format rdf:value 'api/sparql'.\n"
				+ "		?distribution dcat:accessURL ?"	+ Endpoints.KEY_ENDPOINT + ".\n"
				+ "		?" + Endpoints.KEY_DATASETURI + " dcterms:title ?" + Endpoints.KEY_TITLE + ";\n"
				+ "			dcterms:description ?" + Endpoints.KEY_DESCRIPTION + ".\n" +
				"		} ORDER BY ?" + Endpoints.KEY_TITLE;
	}
}
