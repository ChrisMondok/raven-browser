enyo.kind({
	name: "RavenBrowser",
	kind: "FittableRows",
	fit: true,
	published:{
		selectedTenant:null,
		selectedDocument:null,
	},
	handlers:{
		onTenantSelected:"changeTenant",
		onDocumentIdSelected:"showDocument",
		onErrorReceived:"showError",
	},
	components:[
		{name:"panels", kind:"enyo.Panels", style:"width:100%", fit:true, classes:"main-panels", arrangerKind:"CollapsingArranger", components:[
			{kind:"RavenBrowser.TenantPicker", style:"max-width:320px", classes:"panel"},
			{name:"documentPicker", kind:"RavenBrowser.DocumentPicker", style:"max-width:320px;", classes:"panel"},
			{kind:"RavenBrowser.DocumentViewer", classes:"panel"}
		]},
		{name:"infoPopup", ontap:"hideInfoPopup", floating:true, scrim:true, centered:true, kind:"onyx.Popup", components:[
			{name:"infoPopupContent", content:"Info popup"},
		]},
	],
	changeTenant:function(sender,event) {
		this.setSelectedTenant(event.tenant);
	},
	showDocument:function(sender,event) {
		this.setSelectedDocument(event.documentId);
	},
	selectedTenantChanged:function() {
		var tenant = this.getSelectedTenant();
		this.$.documentPicker.setTenantId(tenant);
		this.setSelectedDocument(null);
		if(enyo.Panels.isScreenNarrow())
			this.$.panels.setIndex(1);
	},
	selectedDocumentChanged:function() {
		this.$.documentViewer.setTenantId(this.getSelectedTenant());
		this.$.documentViewer.setDocumentId(this.getSelectedDocument());
		if(enyo.Panels.isScreenNarrow())
			this.$.panels.setIndex(2);
	},
	showError:function(sender,event) {
		this.$.infoPopupContent.setContent(event.error);
		this.$.infoPopup.show();
	},
	hideInfoPopup:function(sender,event) {
		this.$.infoPopup.hide();
	}
});

