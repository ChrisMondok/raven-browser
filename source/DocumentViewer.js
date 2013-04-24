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
			{kind:"onyx.InputDecorator", style:"width:100%", components:[
				{name:"documentIdInput", kind:"onyx.Input", style:"width:100%", onchange:"documentIdInputChanged"}
			]},
		]},
		{name:"documentBodyInput", kind:"onyx.TextArea", fit:true, style:"width:100%; resize:none; white-space:nowrap"},
		{name:"savedMessageDrawer", classes:"footer-drawer", open:false, kind:"Drawer", components:[
			{name:"savedMessage", content:"Document saved", classes:"nice-padding"}
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
	loadDocument:function() {
		this.getApi().loadDocument(this.getTenantId(),this.getDocumentId(),enyo.bind(this,"gotResponse"), enyo.bind(this,"gotError"));
	},
	gotResponse:function(sender,response) {
		this.$.documentBodyInput.setValue(JSON.stringify(response,undefined,2));
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
		try
		{
			input.setValue(JSON.stringify(JSON.parse(value),undefined,2));
		}
		catch(e)
		{
			this.doErrorReceived({error:e.message});
			return;
		}

		this.getApi().saveDocument(this.getTenantId(), this.getDocumentId(), value,
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
		this.$.savedMessage.setContent(event.Key+" saved.");
		this.$.savedMessageDrawer.setOpen(true);
		enyo.job("hideSavedMessage", enyo.bind(this, function() {
				this.$.savedMessageDrawer.setOpen(false);
			}),2500);
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
	},
	documentDeleteFailed:function(sender,event) {
		this.doErrorReceived({error:"Failed to delete document."});
	},
});
