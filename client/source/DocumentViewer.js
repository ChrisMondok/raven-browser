enyo.kind({
	name:"RavenBrowser.DocumentViewer",
	classes:"onyx",
	kind:"FittableRows",
	connection:null,
	published:{
		tenantId:null,
		documentId:null,
		disabled:false,
	},
	handlers:{
		onSaveDocument:"saveDocument"
	},
	events:{
		onErrorReceived:"",
		onSaveDocument:""
	},
	components:[
		{kind:"onyx.Toolbar", components:[
			{kind:"onyx.InputDecorator", style:"width:100%", components:[
				{name:"documentIdInput", kind:"onyx.Input", style:"width:100%"}
			]},
		]},
		{name:"documentBodyInput", kind:"onyx.TextArea", fit:true, style:"width:100%; resize:none; white-space:nowrap"},
		{kind:"onyx.Toolbar", components:[
			{kind:"FittableColumns", style:"width:100%", components:[
				{name:"reloadButton", kind:"onyx.Button", content:"Reload", ontap:"loadDocument"},
				{fit:true},
				{name:"deleteButton", kind:"onyx.Button", classes:"onyx-negative", content:"Delete", ontap:"promptDelete"},
				{name:"saveButton", kind:"onyx.Button", classes:"onyx-affirmative", content:"Save", ontap:'saveDocument'},
			]},
		]},
		{name:"confirmDeletePopup", floating:true, scrim:true, centered:true, kind:"onyx.Popup", components:[
			{content:"This action cannot be ondone."},
			{tag:'br'},
			{kind:"onyx.Button", ontap:"confirmDelete", content:"Cancel", style:"width:120px; margin:0px 4px;"},
			{kind:"onyx.Button", ontap:"confirmDelete", content:"Delete", classes:"onyx-negative", style:"width:120px; margin:0px 4px;"}
		]},
	],
	create:function() {
		this.inherited(arguments);
		this.setDisabled(!this.getDocumentId());
	},
	loadDocument:function() {
		this.ajax = new enyo.Ajax({
			url:"/raven/databases/"+this.getTenantId()+"/docs/"+this.getDocumentId()
		});
		this.ajax.go();
		this.ajax.response(this,function(sender,response) {
			this.gotResponse(response);
		});
	},
	gotResponse:function(response) {
		this.$.documentBodyInput.setValue(JSON.stringify(response,undefined,2));
	},
	documentIdChanged:function() {
		var documentId = this.getDocumentId();
		this.setDisabled(!documentId);
		if(documentId)
		{
			this.$.documentIdInput.setValue(this.getDocumentId());
			this.loadDocument();
		}
		else
		{
			this.$.documentIdInput.setValue("");
		}
	},
	disabledChanged:function() {
		var d = this.getDisabled();
		var cmps = ["documentIdInput", "documentBodyInput", "saveButton", "deleteButton", "reloadButton"];
		for(var item in cmps)
			this.$[cmps[item]].setDisabled(d);
	},
	saveDocument:function(sender,event) {
		var input = this.$.documentBodyInput;
		try
		{
			input.setValue(JSON.stringify(JSON.parse(input.getValue()),undefined,2));
		}
		catch(e)
		{
			this.doErrorReceived({error:e.message});
		}
		this.doSaveDocument();
	},
	saveDocument:function(sender,event) {
		var ajax = new enyo.Ajax({
			method:"PUT",
			url:"/raven/databases/"+this.getTenantId()+"/docs/"+this.getDocumentId(),
			contentType:"application/json",
			cacheBust:false,
			postBody:JSON.parse(this.$.documentBodyInput.getValue())
		});
		ajax.go();
		ajax.response(this,function(sender,response) {
			this.gotSaveResponse(response);
		});
	},
	gotSaveResponse:function(response) {
		this.loadDocument();
	},
	promptDelete:function(sender,event) {
		this.$.confirmDeletePopup.show();
	}
});
