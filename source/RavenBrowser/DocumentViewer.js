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
		{style:"position:relative; z-index:1", fit:true, components:[
			{name:"documentBodyInput", style:"height:100%; width:100%", kind:"onyx.TextArea"},
			{
				name:"metaSlider",
				kind:"Slideable",
				classes:"sliding-overlay",
				style:"width:64px; position:absolute; height:300; margin-left:auto; margin-right:auto; left:0%; bottom:0%; width:100%",
				axis:'v',
				min:0,
				max:300,
				value:300,
				unit:'px',
				components:[
					{kind:"Scroller", horizontal:"hidden", controlClasses:'nice-margin', style:"height:100%", touchOverscroll:false, components:[
						{kind:"onyx.Groupbox", components:[
							{kind:"onyx.GroupboxHeader", content:"Raven Entity Name"},
							{kind:"onyx.InputDecorator", style:"display:block", components:[
								{name:"entityNameInput", kind:"onyx.Input", placeholder:"Raven-Entity-Name"},
							]},
						]},
						{kind:"onyx.Groupbox", components:[
							{kind:"onyx.GroupboxHeader", content:"Metadata"},
							{kind:"Scroller", style:"width:100%", horizontal:"auto", vertical:"hidden", components:[
								{name:"metadataDisplay", tag:"pre", style:"margin:0"},
							]},
						]},
					]},
				]
			},
		]},
		{style:"z-index:2; position:relative;", components:[
			{kind:"onyx.Toolbar", components:[
				{kind:"FittableColumns", style:"width:100%", components:[
					{kind:"onyx.InputDecorator", fit:true, components:[
						{name:"documentIdInput", kind:"onyx.Input", style:"width:100%", onchange:"documentIdInputChanged"}
					]},
					{name:"reloadButton", kind:"onyx.Button", content:"Load", ontap:"loadDocument", disabled:true},
					{name:"metadataButton", kind:"onyx.Button", content:"Metadata", ontap:"showMetadata"},
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
		]},
	],
	loadDocument:function() {
		this.getApi().loadDocument(this.getTenantId(),this.getDocumentId(),enyo.bind(this,"gotResponse"), enyo.bind(this,"gotError"));
	},
	gotResponse:function(sender,response) {
		var data = {};
		for(var key in response)
			if(response.hasOwnProperty(key) && key != "@metadata")
				data[key] = response[key];

		this.$.documentBodyInput.setValue(JSON.stringify(data,undefined,2));
		this.$.metadataDisplay.setContent(JSON.stringify(response["@metadata"],undefined,2));
		var eName = response["@metadata"]["Raven-Entity-Name"];
		this.$.entityNameInput.setValue(eName || "");
		//this.$.metadataInput.setValue(JSON.stringify(response["@metadata"],undefined,2));
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
			//joined["@metadata"] = JSON.parse(this.$.metadataInput.getValue());
		}
		catch(e)
		{
			this.doErrorReceived({error:e.message});
			return;
		}

		var eName = this.$.entityNameInput.getValue()
			if(eName)
				joined["@metadata"] = {"Raven-Entity-Name": eName};

		this.getApi().saveDocument(this.getTenantId(), this.getDocumentId(), joined,
			enyo.bind(this,"documentSaved"),
			enyo.bind(this,"documentSaveFailed"));
	},
	documentSaved:function(sender,response) {
		this.setDocumentId(response.Key);
		this.loadDocument();
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
	showMetadata:function(sender,event) {
		if(this.$.metaSlider.getValue())
			this.$.metaSlider.animateToMin();
		else
			this.$.metaSlider.animateToMax();
	},
});
