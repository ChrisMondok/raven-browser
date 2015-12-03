enyo.kind({
	name:"RavenBrowser.BatchLoader",
	kind:"Async",

	published:{
		url:null,
		results:null,
		params:null
	},

	progressHandlers:null,
	ajax:null,

	constructor:function(params) {
		enyo.mixin(this,params);
		if(!this.params)
			this.params = {};
		this.progressHandlers = [];
		this.results = [];
		this.inherited(arguments);
	},

	go:function(params) {
		enyo.mixin(this.params,params);
		this.loadNextBlock();
		return this;
	},

	loadNextBlock:function() {
		//var params = this.getParams();
		enyo.mixin(this.params,{start:this.results.length});
		this.ajax = new enyo.Ajax({
			url:this.getUrl()
		})
			//.go(params)
			.go(this.params)
			.response(this,"gotResults")
			.error(this,"gotError");
	},

	gotResults:function(ajax,response) {
		var results = this.getResults();

		for(var i = 0; i < response.Results.length; i++)
			results.push(response.Results[i]);

		this.gotProgress(response);

		if(results.length == response.TotalResults || response.Results.length == 0) {
			this.respond(results);
			this.ajax = null;
		} else {
			this.loadNextBlock();
		}
	},

	gotProgress:function(response) {
		for(var i = 0; i < this.progressHandlers.length; i++)
			this.progressHandlers[i].call(this,this,{loaded:this.results.length, total:response.TotalResults});
	},

	gotError:function(async,error) {
		this.fail(error);
	},

	abort:function() {
		if(this.ajax) {
			this.ajax.fail(0)
			this.ajax = null;
		}
	},
});
