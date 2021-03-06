enyo.kind({
	name:"RavenApi",
	tag:undefined,
	published:{
		ravenHost: "mds-d77gds1",
		ravenPort: 8080,
		timeout: 30000,
		pageSize: 1024,
		secure:false
	},
	events:{
		onConnectionChanged:"",
	},
	getTenants:function() {
		return new enyo.Ajax({url:this.getRavenUrl()+"databases", timeout:this.getTimeout()})
			.go({pageSize: 1024});
	},
	ensureStartup:function(tenantId) {
		return new enyo.Ajax({url:this.getRavenUrl()+"databases/"+tenantId+"/silverlight/ensureStartup"})
			.go();
	},
	buildDocumentUrl:function(tenantId, documentId) {
		return this.getRavenUrl()+"databases/"+tenantId+"/docs/"+documentId;
	},
	getDocuments:function(tenantId) {
		return new RavenBrowser.BatchLoader({
			url:this.getRavenUrl()+"databases/"+tenantId+"/indexes/Raven/DocumentsByEntityName",
		}).go({
			fetch:"__document_id",
			sort:"__document_id",
			pageSize:this.getPageSize(),
			timeout:this.getTimeout()
		});
	},
	getDocumentCount:function(tenantId) {
		var async = new enyo.Async();
		new enyo.Ajax({
			url:this.getRavenUrl()+"databases/"+tenantId+"/indexes/Raven/DocumentsByEntityName"
		})
			.go({ pageSize:0 })
			.response(function(sender,response) {
				async.go(response.TotalResults);
			});
		return async;
	},
	loadDocument:function(tenantId, documentId) {
		var async = new enyo.Async();
		new enyo.Ajax({ url:this.getRavenUrl()+"databases/"+tenantId+"/indexes/Raven/DocumentsByEntityName" })
			.go({query:"__document_id:"+documentId})
			.response(function(ajax,response) {
				if(response.Results.length != 1)
					async.fail({error:"Got "+response.Results.length+" results."});
				else
					async.go(response.Results[0]);
			})
			.error(function(response) {
				async.fail(response);
			});
		return async;
	},
	saveDocument:function(tenantId, documentId, value) {
		if(value.hasOwnProperty('@metadata') && value['@metadata']['Raven-Entity-Name'])
			headers = {'Raven-Entity-Name':value['@metadata']['Raven-Entity-Name']};
		else
			headers = {};

		return new enyo.Ajax({
			method:"PUT",
			url:this.buildDocumentUrl(tenantId,documentId),
			contentType:"application/json",
			cacheBust:false,
			postBody:value,
			headers:headers
		}).go();
	},
	deleteDocument:function(tenantId, documentId) {
		return new enyo.Ajax({
			method:"DELETE",
			url:this.buildDocumentUrl(tenantId,documentId)
		}).go();
	},
	bulkDeleteDocuments:function(tenantId, documentIds) {
		return new enyo.Ajax({
			method:"POST",
			url:this.getRavenUrl()+"databases/"+tenantId+"/bulk_docs/",
			postBody:JSON.stringify(
				documentIds.map(function(docId) {
					return {
						Method:"DELETE",
						Key: docId
					};
			}))
		}).go();
	},
	moveDocument:function(fromTenant, fromDocumentId, toTenant, toDocumentId) {
		this.loadDocument(fromTenant, fromDocumentId)
			.response(this,function(request, document) {
				debugger;
			});
	},
	getRavenUrl:function() {
		return [
			this.getSecure() ? "https://" :"http://",
			this.getRavenHost(),
			":",
			this.getRavenPort(),
			"/"].join('');
	},
	ravenHostChanged:function() {
		this.doConnectionChanged();
	},
	ravenPortChanged:function() {
		this.doConnectionChanged();
	},
	secureChanged:function() {
		this.doConnectionChanged();
	}
});
