enyo.kind({
	name: "RavenBrowser.Main",
	kind: "FittableRows",
	fit: true,
	published:{
		api:null
	},
	events:{
		onDocumentSelected:"",
		onTenantSelected:""
	},
	handlers:{
		onTenantSelected:"selectTenant",
		onDocumentSelected:"selectDocument",
		onErrorReceived:"showError",
		onShowSettings:"showSettings",
		onConnectionChanged:"connectionChanged",
		onSortFunctionChanged:"setSortFunction",
		onPageSizeChanged:"setPageSize",
		onFetchDocumentCountChanged:"fetchDocumentCountChanged",
		onSecureChanged:"secureChanged",
		oncontextmenu:"contextMenu"
	},
	components:[
		{name:"slidingPanels", kind:"enyo.Panels", style:"width:100%", fit:true, classes:"main-panels", arrangerKind:"CollapsingArranger", components:[
			{kind:"FittableRows", classes:"panel", components:[
				{name:"tenantPicker", fit:true, kind:"RavenBrowser.TenantPicker", classes:"not-so-large"},
				{kind:"onyx.Toolbar", components:[
					{kind:"onyx.Button", content:"Reload", ontap:"reloadTenants"},
					{kind:"onyx.Button", content:"Settings", ontap:"showSettings"}
				]}
			]},
			{name:"documentPicker", kind:"RavenBrowser.DocumentPicker", classes:"panel not-so-large"},
			{kind:"RavenBrowser.DocumentViewer", classes:"panel"}
		]},
		{name:"settingsPopup", classes:"onyx-light", style:"max-width:100%; min-width:300px;", floating:true, scrim:true, centered:true, kind:"onyx.Popup", components:[
			{kind:"Scroller", style:"max-height:360px", components:[
				{name:"settings", kind:"RavenBrowser.Settings"}
			]},
			{kind:"onyx.Button", classes:"max-width onyx-dark", content:"Close", ontap:"hideSettings"}
		]}
	],
	create:function() {
		this.inherited(arguments);

		enyo.dispatcher.listen(document,'contextmenu');
		enyo.dispatcher.listen(document,'keydown');

		var host = localStorage.getItem("raven-host") || "localhost";
		var port = localStorage.getItem("raven-port") || 8080;
		var sortFunction = localStorage.getItem("sort-function") || "Entity Type";
		var pageSize = localStorage.getItem('page-size') || 1024;

		var secure = JSON.parse(localStorage.getItem('secure'));
		if(secure === undefined || secure === null)
			secure = true;

		var fetchDocumentCount = JSON.parse(localStorage.getItem('fetch-document-count'));
		if(fetchDocumentCount === undefined || fetchDocumentCount === null)
			fetchDocumentCount = true;

		this.$.settings.setSortFunction(sortFunction);
		this.$.settings.setFetchDocumentCount(fetchDocumentCount);
		this.$.settings.setSecure(secure);
		this.$.documentPicker.setSortFunction(sortFunction);
		this.$.tenantPicker.setFetchDocumentCount(fetchDocumentCount);

		this.setApi(this.createComponent({kind:"RavenApi", ravenHost:host, ravenPort: port, pageSize:pageSize, secure:secure}));
	},
	reloadTenants:function() {
		this.$.tenantPicker.loadTenants();
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
		{
			this.$.documentViewer.loadDocument();
			if(enyo.Panels.isScreenNarrow())
				this.$.slidingPanels.setIndex(2);
		}
	},
	showError:function(sender,event) {
		enyo.create({kind:"onyx.Toast", content:event.error});
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
	},
	fetchDocumentCountChanged:function(sender,event) {
		this.$.tenantPicker.setFetchDocumentCount(event.fetchDocumentCount);
		localStorage.setItem('fetch-document-count',event.fetchDocumentCount);
	},
	secureChanged:function(sender,event) {
		if(this.getApi())
			this.getApi().setSecure(event.secure);
		localStorage.setItem('secure',event.secure);
	}
});
