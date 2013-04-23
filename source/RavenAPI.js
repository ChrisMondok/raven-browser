enyo.kind({
	name:"RavenApi",
	tag:undefined,
	published:{
		ravenHost: "mds-d77gds1",
		ravenPort: 8080,
		timeout:3000
	},
	events:{
		onConnectionChanged:"",
	},
	getTenants:function(callback, errorCallback) {
		var tenants = [];
		var ajax = new enyo.Ajax({url:this.getRavenUrl()+"databases", timeout:this.getTimeout()});
		ajax.go()
		ajax.response(this,function(sender,response) {
			callback(response);
		});
		if(errorCallback)
			ajax.error(errorCallback);
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
		var ajax = new enyo.Ajax({
			url:this.getRavenUrl()+"databases/"+tenantId+"/docs/"+documentId
		});
		ajax.go();
		ajax.response(callback);
		if(errorCallback)
			ajax.error(errorCallback);
	},
	saveDocument:function(tenantId, documentId, value, callback, errorCallback) {
		var ajax = new enyo.Ajax({
			method:"PUT",
			url:this.getRavenUrl()+"databases/"+tenantId+"/docs/"+documentId,
			contentType:"application/json",
			cacheBust:false,
			postBody:value
		});
		ajax.go();
		if(callback)
			ajax.response(callback);
		if(errorCallback)
			ajax.error(errorCallback);
	},
	loadInMultipleRequests:function(url,params,callback,progressCallback,errorCallback) {
		var loader = {
			ajax:null,
			results:[],
			loadNextBatch:enyo.bind(this,function() {
				loader.ajax = new enyo.Ajax({url:url});
				loader.ajax.go(enyo.mixin({start:loader.results.length, pageSize:1024},params));

				loader.ajax.response(this,function(sender,response){
						for(var i = 0; i < response.Results.length; i++)
							loader.results.push(response.Results[i]);

						if(loader.results.length == response.TotalResults)
							callback(loader.results);
						else
							loader.loadNextBatch();

						if(progressCallback)
							progressCallback({loaded:loader.results.length, total:response.TotalResults});

					});

				if(errorCallback)
					loader.ajax.error(this,errorCallback);

				if(progressCallback)
					loader.ajax.response(this,function(sender,response) {
						progressCallback({loaded:loader.results.length, total:response.TotalResults});
					});
			}),
			abort:function() {
				alert("ABORT");
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
