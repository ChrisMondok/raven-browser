enyo.kind({
	name: "RavenBrowser.Main",
	kind: "FittableRows",
	fit: true,
	published: {
		api: null,
        source: null
	},
	events: {
		onDocumentSelected: "",
		onTenantSelected: ""
	},
	handlers: {
		onTenantSelected: "selectTenant",
		onDocumentSelected: "selectDocument",
		onErrorReceived: "showError",
		onShowSettings: "showSettings",
		onSortFunctionChanged: "setSortFunction",
		onPageSizeChanged: "setPageSize",
		onFetchDocumentCountChanged: "fetchDocumentCountChanged",
		onSecureChanged: "secureChanged",
		oncontextmenu: "contextMenu"
	},

    bindings:[
        {from: '.$.settings.connectionString', to: '.connectionString'},
        {from: '.$.settings.sortFunction', to: '.$.documentPicker.sortFunction'},
        {from: '.$.settings.fetchDocumentCount', to: '.$.tenantPicker.fetchDocumentCount'},

        //THESE WILL GO AWAY SOON.
        {from: '.$.settings.host', to: '.$.ravenApi.host'},
        {from: '.$.settings.port', to: '.$.ravenApi.port'},
        {from: '.$.settings.pageSize', to: '.$.ravenApi.pageSize'},
        {from: '.$.settings.secure', to: '.$.settings.secure'}
    ],

	components: [
        {kind: 'RavenApi'},
		{name: "screenPanel", kind: "enyo.Panels", arrangerKind: "CardSlideInArranger", fit: true, draggable: false, components: [
			{name: "slidingPanels", kind: "enyo.Panels", classes: "main-panels", arrangerKind: "CollapsingArranger", components: [
				{kind: "FittableRows", classes: "panel", components: [
					{name: "tenantPicker", fit: true, kind: "RavenBrowser.TenantPicker", classes: "not-so-large"},
					{kind: "onyx.Toolbar", components: [
						{kind: "onyx.Button", content: "Reload", ontap: "reloadTenants"},
						{kind: "onyx.Button", content: "Settings", ontap: "showSettings"}
					]}
				]},
				{name: "documentPicker", kind: "RavenBrowser.DocumentPicker", classes: "panel not-so-large"},
				{kind: "RavenBrowser.DocumentViewer", classes: "panel"}
			]},
			{kind: "FittableRows", components: [
				{kind: "Scroller", fit: true, style: "background-color: #CCC", components: [
					{name: "settings", kind: "RavenBrowser.Settings"}
				]},
				{kind: "onyx.Toolbar", classes: "centered", components: [
					{kind: "onyx.Button", content: "Close", style: "width: 320px;", ontap: "showMain"}
				]}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);

		enyo.dispatcher.listen(document,'contextmenu');
		enyo.dispatcher.listen(document,'keydown');

        this.createSource();

        window.M = this;

        this.apiChanged();
	},
    createSource: function() {
        this.setSource(new RavenSource());
        enyo.store.addSources({raven:this.getSource()});
    },
    connectionStringChanged: function(old, connectionString) {
        this.getSource().set('urlRoot', connectionString);
    },
	reloadTenants: function() {
		this.$.tenantPicker.loadTenants();
	},
	selectTenant: function(sender,event) {
		var tenant = event.tenant;
		this.$.documentPicker.setTenantId(tenant);
		this.$.documentViewer.setTenantId(tenant);
		this.doDocumentSelected({documentId: null});
		if(enyo.Panels.isScreenNarrow())
			this.$.slidingPanels.setIndex(1);
	},
	selectDocument: function(sender,event) {
        var selectedDocument = event.documentId;
		this.$.documentViewer.setDocumentId(selectedDocument);
		if(selectedDocument)
		{
			this.$.documentViewer.loadDocument();
			if(enyo.Panels.isScreenNarrow())
				this.$.slidingPanels.setIndex(2);
		}
	},
	showError: function(sender,event) {
		enyo.create({kind: "onyx.Toast", content: event.error});
	},
	showSettings: function(event) {
		this.$.screenPanel.setIndex(1);
	},
	showMain: function(sender,event) {
		this.$.screenPanel.setIndex(0);
	},
	apiChanged: function() {
		this.$.tenantPicker.setApi(this.$.ravenApi);
		this.$.documentPicker.setApi(this.$.ravenApi);
		this.$.documentViewer.setApi(this.$.ravenApi);
	}
});
