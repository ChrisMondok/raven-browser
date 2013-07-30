enyo.kind({
	name:"RavenApi",
	tag:undefined,
	published:{
		ravenHost: "mds-d77gds1",
		ravenPort: 8080,
		timeout: 30000,
		pageSize: 1024
	},
	events:{
		onConnectionChanged:"",
	},
	getTenants:function(callback, errorCallback) {
		var tenants = [];
		new enyo.Ajax({url:this.getRavenUrl()+"databases", timeout:this.getTimeout()})
			.go()
			.response(this,function(sender,response) {
				callback(response);
			})
			.error(errorCallback);
	},
	ensureStartup:function(tenantId, callback, errorCallback) {
		return new enyo.Ajax({url:this.getRavenUrl()+"databases/"+tenantId+"/silverlight/ensureStartup"})
			.go()
			.response(callback)
			.error(errorCallback);
	},
	getDocuments:function(tenantId, callback, progressCallback, errorCallback) {
		return this.loadInMultipleRequests(
			this.getRavenUrl()+"databases/"+tenantId+"/indexes/Raven/DocumentsByEntityName",
			{fetch:"__document_id", sort:"__document_id", timeout:this.getTimeout()},
			callback,
			progressCallback,
			errorCallback
		);
	},
	loadDocument:function(tenantId, documentId, callback, errorCallback) {
		new enyo.Ajax({ url:this.getRavenUrl()+"databases/"+tenantId+"/indexes/Raven/DocumentsByEntityName" })
			.go({query:"__document_id:"+documentId})
			.response(function(ajax,response) {
				if(response.Results.length != 1)
					return errorCallback({error:"Got "+response.Results.length+" results."});
				callback(ajax,response.Results[0]);	
			})
			.error(errorCallback);
	},
	saveDocument:function(tenantId, documentId, value, callback, errorCallback) {
		if(value.hasOwnProperty('@metadata') && value['@metadata']['Raven-Entity-Name'])
			headers = {'Raven-Entity-Name':value['@metadata']['Raven-Entity-Name']};
		else
			headers = {};

		new enyo.Ajax({
			method:"PUT",
			url:this.getRavenUrl()+"databases/"+tenantId+"/docs/"+documentId,
			contentType:"application/json",
			cacheBust:false,
			postBody:value,
			headers:headers
		}).go().response(callback).error(errorCallback);
	},
	deleteDocument:function(tenantId, documentId, callback, errorCallback) {
		new enyo.Ajax({
			method:"DELETE",
			url:this.getRavenUrl()+"databases/"+tenantId+"/docs/"+documentId,
			cacheBust:false,
		}).go().response(callback).error(errorCallback);
	},
	loadInMultipleRequests:function(url,params,callback,progressCallback,errorCallback) {
		var loader = {
			ajax:null,
			results:[],
			loadNextBatch:enyo.bind(this,function() {
				loader.ajax = new enyo.Ajax({url:url});
				loader.ajax.go(enyo.mixin({start:loader.results.length, pageSize:this.getPageSize()},params));

				loader.ajax.response(this,function(sender,response){
						for(var i = 0; i < response.Results.length; i++)
							loader.results.push(response.Results[i]);

						if(loader.results.length == (response.TotalResults - response.SkippedResults) || response.Results.length == 0)
							callback(loader.results);
						else
							loader.loadNextBatch();

						if(progressCallback)
							progressCallback({loaded:loader.results.length, total:response.TotalResults - response.SkippedResults});

					});

				if(errorCallback)
					loader.ajax.error(this,errorCallback);

				if(progressCallback)
					loader.ajax.response(this,function(sender,response) {
						progressCallback({loaded:loader.results.length, total:response.TotalResults});
					});
			}),
			abort:function() {
				if(this.ajax)
					this.ajax.fail(0);
			}
		};

		loader.loadNextBatch();

		return loader;
	},
	getRavenUrl:function() {
		return "http://"+this.getRavenHost()+":"+this.getRavenPort()+"/";
	},
	ravenHostChanged:function() {
		this.doConnectionChanged();
	},
	ravenPortChanged:function() {
		this.doConnectionChanged();
	}

});
