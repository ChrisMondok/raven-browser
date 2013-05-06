enyo.kind({
	name:"RavenBrowser.DocumentViewer",
	classes:"onyx",
	kind:"FittableRows",
	connection:null,
	published:{
		tenantId:null,
		documentId:null,
		api:null
	},
	handlers:{
		onSaveDocument:"saveDocument",
		onDocumentSaved:"showSavedMessage"
	},
	events:{
		onErrorReceived:"",
		onDocumentSaved:""
	},
	components:[
		{kind:"onyx.Toolbar", components:[
			{kind:"FittableColumns", style:"width:100%", components:[
				{kind:"onyx.InputDecorator", fit:true, components:[
					{name:"documentIdInput", kind:"onyx.Input", style:"width:100%", onchange:"documentIdInputChanged"}
				]},
				{kind:"onyx.RadioGroup", onActiveChanged: 'ac', components:[
					{name:"dataTabButton", ontap:'tabButtonTapped', active:true, style:"margin:0", content:"Data"},
					{name:"metaTabButton", ontap:'tabButtonTapped', style:"margin:0", content:"Metadata"}
				]},
			]},
		]},
		{name:"tabPanel", kind:"Panels", arrangerKind:"CardSlideInArranger", draggable:false, fit:true, components:[
			{name:"documentBodyInput", kind:"onyx.TextArea", style:"width:100%; resize:none"},
			{name:"metadataInput", kind:"onyx.TextArea", style:"width:100%; resize:none"},
		]},
		{kind:"onyx.Toolbar", components:[
			{kind:"FittableColumns", style:"width:100%", components:[
				{name:"reloadButton", kind:"onyx.Button", content:"Load", ontap:"loadDocument", disabled:true},
				{fit:true},
				{kind:"onyx.MenuDecorator", components:[
					{name:"deleteButton", kind:"onyx.Button", content:"Delete", disabled:true},
					{name:"deletePopup", kind:"onyx.ContextualPopup", title:"Confirm delete", floating:true,
						components:[
							{content:"This cannot be undone"},
						],
						actionButtons:[
							{content:"Cancel", classes:"onyx-dark", ontap:"closeDeletePopup"},
							{content:"Delete", classes:"onyx-negative", ontap:"deleteDocument"}
					]},
				]},
				{name:"saveButton", kind:"onyx.Button", classes:"onyx-affirmative", content:"Save", ontap:'saveDocument', disabled:true},
			]},
		]},
	],
	ac:function() {
		debugger
	},
	loadDocument:function() {
		this.getApi().loadDocument(this.getTenantId(),this.getDocumentId(),enyo.bind(this,"gotResponse"), enyo.bind(this,"gotError"));
	},
	gotResponse:function(sender,response) {
		var data = {};
		for(var key in response)
			if(response.hasOwnProperty(key) && key != "@metadata")
				data[key] = response[key];

		this.$.documentBodyInput.setValue(JSON.stringify(data,undefined,2));
		this.$.metadataInput.setValue(JSON.stringify(response["@metadata"],undefined,2));
		this.$.deleteButton.setDisabled(false);
	},
	gotError:function(sender,error) {
		switch (error)
		{
		case 404:
			this.doErrorReceived({error:"Document not found"});
			break;
		default:
			this.doErrorReceived({error:"Failed to load document"});
		}
	},
	documentIdChanged:function() {
		this.$.documentIdInput.setValue(this.getDocumentId());
		this.$.saveButton.setDisabled(!this.getDocumentId());
		this.$.reloadButton.setDisabled(!this.getDocumentId());
		this.$.deleteButton.setDisabled(true);
	},
	tenantIdChanged:function() {
		this.setDocumentId("");
	},
	saveDocument:function(sender,event) {
		var input = this.$.documentBodyInput;
		var value = input.getValue();
		var joined;
		try
		{
			input.setValue(JSON.stringify(JSON.parse(value),undefined,2));
			joined = JSON.parse(value);
			joined["@metadata"] = JSON.parse(this.$.metadataInput.getValue());
		}
		catch(e)
		{
			this.doErrorReceived({error:e.message});
			return;
		}

		this.getApi().saveDocument(this.getTenantId(), this.getDocumentId(), joined,
			enyo.bind(this,"documentSaved"),
			enyo.bind(this,"documentSaveFailed"));
	},
	documentSaved:function(sender,response) {
		this.setDocumentId(response.Key);
		this.doDocumentSaved(response);
	},
	documentSaveFailed:function(sender,error) {
		this.doErrorReceived({error:"Failed to save document."});
	},
	documentIdInputChanged:function(sender,event) {
		this.setDocumentId(sender.getValue());
	},
	showSavedMessage:function(sender,event) {
		enyo.create({
			kind:"onyx.Toast",
			content:event.Key+" saved."
		});
	},
	closeDeletePopup:function() {
		this.$.deletePopup.hide();
	},
	deleteDocument:function(sender,event) {
		this.closeDeletePopup();
		this.getApi().deleteDocument(this.getTenantId(), this.getDocumentId(), enyo.bind(this,"documentDeleted"), enyo.bind(this,"documentDeleteFailed"));
	},
	documentDeleted:function(sender,event) {
		this.setDocumentId(null);
		this.$.documentBodyInput.setValue("");
		enyo.create({
			kind:"onyx.Toast",
			content:"Document deleted."
		});
	},
	documentDeleteFailed:function(sender,event) {
		this.doErrorReceived({error:"Failed to delete document."});
	},
	tabButtonTapped:function(sender,event) {
		var index = [this.$.dataTabButton,this.$.metaTabButton].indexOf(event.originator);
		this.$.tabPanel.setIndex(index);
	}
});
