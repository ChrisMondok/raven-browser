enyo.kind({
	name:"RavenBrowser.DocumentViewer",
	classes:"onyx",
	kind:"FittableRows",
	connection:null,
	published:{
		tenantId:null,
		documentId:null,
		disabled:false,
		api:null
	},
	handlers:{
		onSaveDocument:"saveDocument"
	},
	events:{
		onErrorReceived:"",
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
		this.getApi().loadDocument(this.getTenantId(),this.getDocumentId(),enyo.bind(this,this.gotResponse));
	},
	gotResponse:function(sender,response) {
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
			this.$.documentIdInput.setValue("");
	},
	disabledChanged:function() {
		var d = this.getDisabled();
		var cmps = ["documentIdInput", "documentBodyInput", "saveButton", "deleteButton", "reloadButton"];
		for(var item in cmps)
			this.$[cmps[item]].setDisabled(d);
	},
	saveDocument:function(sender,event) {
		var input = this.$.documentBodyInput;
		var value = input.getValue();
		try
		{
			input.setValue(JSON.stringify(JSON.parse(value),undefined,2));
		}
		catch(e)
		{
			this.doErrorReceived({error:e.message});
			return;
		}

		this.getApi().saveDocument(this.getTenantId(), this.getDocumentId(), value);
	},
	gotSaveResponse:function(response) {
		this.loadDocument();
	},
	promptDelete:function(sender,event) {
		this.$.confirmDeletePopup.show();
	}
});
