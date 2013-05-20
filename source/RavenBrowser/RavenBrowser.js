enyo.kind({
	name: "RavenBrowser",
	kind: "FittableRows",
	fit: true,
	published:{
		api:null
	},
	events:{
		onDocumentSelected:"",
		onTenantSelected:"",
	},
	handlers:{
		onTenantSelected:"selectTenant",
		onDocumentSelected:"selectDocument",
		onErrorReceived:"showError",
		onShowSettings:"showSettings",
		onConnectionChanged:"connectionChanged",
		onSortFunctionChanged:"setSortFunction",
		onPageSizeChanged:"setPageSize"
	},
	components:[
		{name:"slidingPanels", kind:"enyo.Panels", style:"width:100%", fit:true, classes:"main-panels", arrangerKind:"CollapsingArranger", components:[
			{name:"tenantPicker", kind:"RavenBrowser.TenantPicker", classes:"panel not-so-large"},
			{name:"documentPicker", kind:"RavenBrowser.DocumentPicker", classes:"panel not-so-large"},
			{kind:"RavenBrowser.DocumentViewer", classes:"panel"},
		]},
		{name:"settingsPopup", classes:"max-width-column onyx-light", style:"width:320px", floating:true, scrim:true, centered:true, kind:"onyx.Popup", components:[
			{name:"settings", kind:"RavenBrowser.Settings"},
			{kind:"onyx.Button", classes:"max-width onyx-dark", content:"Close", ontap:"hideSettings"},
		]},
		{name:"infoPopup", ontap:"hideInfoPopup", floating:true, scrim:true, centered:true, kind:"onyx.Popup", components:[
			{name:"infoPopupContent", content:"Info popup"},
		]},
	],
	create:function() {
		this.inherited(arguments);

		var host = localStorage.getItem("raven-host") || "localhost";
		var port = localStorage.getItem("raven-port") || 8080;
		var sortFunction = localStorage.getItem("sort-function") || "Entity Type";
		var pageSize = localStorage.getItem('page-size') || 1024;

		this.$.settings.setSortFunction(sortFunction);
		this.$.documentPicker.setSortFunction(sortFunction);

		this.setApi(this.createComponent({kind:"RavenApi", ravenHost:host, ravenPort: port, pageSize:pageSize}));
	},
	selectTenant:function(sender,event) {
		var tenant = event.tenant;
		this.$.documentPicker.setTenantId(tenant);
		this.$.documentViewer.setTenantId(tenant);
		this.doDocumentSelected({documentId:null});
		if(enyo.Panels.isScreenNarrow())
			this.$.slidingPanels.setIndex(1);
	},
	selectDocument:function(sender,event) {
		var selectedDocument = event.documentId;
		this.$.documentViewer.setDocumentId(selectedDocument);
		if(selectedDocument)
			this.$.documentViewer.loadDocument();
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
		this.$.settingsPopup.show();
	},
	hideSettings:function(sender,event) {
		this.$.settingsPopup.hide();
	},
	connectionChanged:function(sender,event) {
		this.$.tenantPicker.loadTenants();

		this.doTenantSelected({tenant:null});

		localStorage.setItem("raven-host",this.getApi().getRavenHost());
	},
	apiChanged:function() {
		this.$.tenantPicker.setApi(this.getApi());
		this.$.documentPicker.setApi(this.getApi());
		this.$.documentViewer.setApi(this.getApi());
		this.$.settings.setApi(this.getApi());
	},
	setSortFunction:function(sender,event) {
		this.$.documentPicker.setSortFunction(event.sortFunction);
		localStorage.setItem('sort-function', event.sortFunction);
	},
	setPageSize:function(sender,event) {
		this.getApi().setPageSize(event.pageSize);
		localStorage.setItem('page-size',event.pageSize);
	}
});

