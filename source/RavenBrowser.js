enyo.kind({
	name: "RavenBrowser",
	kind: "FittableRows",
	fit: true,
	published:{
		selectedTenant:null,
		selectedDocument:null,
		api:null
	},
	handlers:{
		onTenantSelected:"changeTenant",
		onDocumentSelected:"showDocument",
		onErrorReceived:"showError",
		onShowSettings:"showSettings",
		onHideSettings:"hideSettings",
		onConnectionChanged:"connectionChanged"
	},
	components:[
		{name:"mainPanel", kind:"enyo.Panels", arrangerKind:"CardSlideInArranger", draggable:false, style:"width:100%", fit:true, components:[
			{name:"slidingPanels", kind:"enyo.Panels", style:"width:100%", fit:true, classes:"main-panels", arrangerKind:"CollapsingArranger", components:[
				{name:"tenantPicker", kind:"RavenBrowser.TenantPicker", classes:"panel not-so-large"},
				{name:"documentPicker", kind:"RavenBrowser.DocumentPicker", classes:"panel not-so-large"},
				{kind:"RavenBrowser.DocumentViewer", classes:"panel"}
			]},
			{kind:"RavenBrowser.Settings"},
		]},
		{name:"infoPopup", ontap:"hideInfoPopup", floating:true, scrim:true, centered:true, kind:"onyx.Popup", components:[
			{name:"infoPopupContent", content:"Info popup"},
		]},
	],
	create:function() {
		this.inherited(arguments);
		var host = localStorage.getItem("raven-host") || "localhost";
		var port = localStorage.getItem("raven-port") || 8080;
		this.setApi(this.createComponent({kind:"RavenApi", ravenHost:host, ravenPort: port}));
	},
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
			this.$.slidingPanels.setIndex(1);
	},
	selectedDocumentChanged:function() {
		this.$.documentViewer.setTenantId(this.getSelectedTenant());
		this.$.documentViewer.setDocumentId(this.getSelectedDocument());
		if(enyo.Panels.isScreenNarrow())
			this.$.slidingPanels.setIndex(2);
	},
	showError:function(sender,event) {
		this.$.infoPopupContent.setContent(event.error);
		this.$.infoPopup.show();
	},
	hideInfoPopup:function(sender,event) {
		this.$.infoPopup.hide();
	},
	showSettings:function(event) {
		this.$.mainPanel.setIndex(1);
	},
	hideSettings:function(sender,event) {
		this.$.mainPanel.setIndex(0);
	},
	connectionChanged:function(sender,event) {
		this.$.tenantPicker.loadTenants();
		this.$.documentPicker.setTenantId(null);
		this.$.documentViewer.setDocumentId(null);

		localStorage.setItem("raven-host",this.getApi().getRavenHost());
		localStorage.getItem("raven-port",this.getApi().getRavenPort());
	},
	apiChanged:function() {
		this.$.tenantPicker.setApi(this.getApi());
		this.$.documentPicker.setApi(this.getApi());
		this.$.documentViewer.setApi(this.getApi());
		this.$.settings.setApi(this.getApi());
	}
});

