enyo.kind({
	name:"RavenBrowser.DocumentPicker",
	kind:"FittableRows",
	classes:"onyx",
	published:{
		tenantId:null,
		documentIds:null,
		disabled:false
	},
	events:{
		onErrorReceived:"",
		onDocumentIdSelected:"",
	},
	components:[
		{kind:"onyx.Toolbar", components:[
			{content:"Documents"},
		]},
		{name:"loadingDrawer", kind:"Drawer", open:false, components:[
			{name:"loadingDescription", style:"text-align:center; font-size:0.75em;", content:"0 of 0"},
			{name:"loadingBar", barClasses:"onyx-dark", kind:"onyx.ProgressBar", animateStripes:true},
		]},
		{name:"documentIdList", onSelect:"selectDocumentId", kind:"List", style:"min-width:320px", fit:true, onSetupItem:"renderDocumentId", components:[
			{kind:"onyx.Item", components:[
				{name:"documentId"},
			]},
		]},
		{kind:"onyx.Toolbar", components:[
			{kind:"FittableColumns", style:"width:100%", components:[
				{name:"reloadButton", kind:"onyx.Button", content:"Reload", ontap:"reloadDocuments"},
				{fit:true},
				{name:"newButton", kind:"onyx.Button", content:"New", classes:"onyx-affirmative"}
			]},
		]},
	],
	create:function() {
		this.inherited(arguments);
		this.setDisabled(!this.getTenantId());
		this.setDocumentIds([]);
	},
	tenantIdChanged:function(){
		var tenantId = this.getTenantId();
		if(tenantId)
			this.loadDocuments(0);
		this.setDisabled(!tenantId);
	},
	loadDocuments:function(start) {
		if(this.ajax)
		{
			this.ajax.xhr.abort();
			delete this.ajax;
		}

		if(!start)
		{
			this.setDocumentIds(new Array());
			this.$.loadingBar.setProgress(0);
		}

		this.ajax = new enyo.Ajax({
			url:"/raven/databases/"+this.getTenantId()+"/indexes/Raven/DocumentsByEntityName"
		});
		this.ajax.go({
			fetch:"__document_id",
			sort:"__document_id",
			start:start,
			pageSize:1024
		});
		this.ajax.response(this,function(sender,response) {
			this.gotResponse(response);
			delete this.ajax;
		});
		this.ajax.error(this,function(sender,errorCode) {
			this.gotError(JSON.parse(sender.xhrResponse.body));
			delete this.ajax;
		});
	},
	reloadDocuments:function(sender,event) {
		this.loadDocuments(0)
	},
	gotResponse:function(response) {
		var ids = this.getDocumentIds();

		for(var i = 0; i < response.Results.length; i++)
			ids.push(response.Results[i].__document_id);

		this.$.loadingDescription.setContent(ids.length+" of "+response.TotalResults);

		var percent = ids.length*100/response.TotalResults;
		this.$.loadingBar.animateProgressTo(percent);
		if(percent < 100)
		{
			this.loadDocuments(ids.length);
			this.$.loadingDrawer.setOpen(true);
		}
		else
		{
			this.documentIdsChanged();
			this.$.loadingDrawer.setOpen(false);
		}
	},
	gotError:function(response) {
		this.doErrorReceived({error:response.Error});
	},
	documentIdsChanged:function() {
		this.$.documentIdList.setCount(this.getDocumentIds().length);
		this.$.documentIdList.refresh();
	},
	renderDocumentId:function(sender,event) {
		this.$.documentId.setContent(this.getDocumentIds()[event.index]);
		this.$.item.addRemoveClass("selected",sender.isSelected(event.index));
		return true;
	},
	selectDocumentId:function(sender,event) {
		this.doDocumentIdSelected({documentId:this.getDocumentIds()[event.index]});
	},
	disabledChanged:function() {
		var d = this.getDisabled();
		var cmps = ["newButton", "reloadButton"];
		for(var item in cmps)
			this.$[cmps[item]].setDisabled(d);
	},
});
