enyo.kind({
	name:"RavenBrowser.DocumentPicker",
	kind:"FittableRows",
	classes:"onyx",
	published:{
		tenantId:null,
		documents:null,
		api:null
	},
	events:{
		onErrorReceived:"",
		onDocumentSelected:"",
	},
	components:[
		{name:"documentList", onSelect:"selectDocument", kind:"List", fit:true, onSetupItem:"renderDocument", components:[
			{kind:"onyx.Item", components:[
				{name:"documentId"},
			]},
		]},
		{name:"loadingDrawer", kind:"Drawer", classes:"footer-drawer", open:false, components:[
			{name:"loadingDescription", style:"text-align:center; font-size:0.75em;", content:"0 of 0"},
			{name:"loadingBar", barClasses:"onyx-dark", kind:"onyx.ProgressBar", animateStripes:true},
		]},
		{kind:"onyx.Toolbar", components:[
			{kind:"FittableColumns", classes:"max-width", components:[
				{name:"reloadButton", kind:"onyx.Button", content:"Reload", ontap:"loadDocuments"},
			]},
		]},
	],
	create:function() {
		this.inherited(arguments);
		this.$.reloadButton.setDisabled(!this.getTenantId());
		this.setDocuments([]);
	},
	tenantIdChanged:function(){
		var selection = this.$.documentList.getSelection();
		for(var s in selection.selected) {
			this.$.documentList.deselect(s);
		}
		var tenantId = this.getTenantId();
		if(tenantId)
			this.loadDocuments();
		this.$.reloadButton.setDisabled(!tenantId);
	},
	loadDocuments:function() {
		enyo.job.stop("closeLoadingDrawer");
		this.setDocuments([]);

		this.getApi().getDocuments(this.getTenantId(),
			enyo.bind(this, function(documentIds) {
				this.setDocuments(documentIds);
			}),
			enyo.bind(this, function(progress) {
				this.$.loadingBar.animateProgressTo(progress.loaded * 100 / progress.total);
				this.$.loadingDescription.setContent(progress.loaded+" of "+progress.total);

				if(progress.loaded == progress.total)
					enyo.job("closeLoadingDrawer", enyo.bind(this, function() {
							this.$.loadingDrawer.setOpen(false);
						}),1000);
			}));

		this.$.loadingBar.setProgress(0);
		this.$.loadingDrawer.setOpen(true);
		this.$.loadingDescription.setContent("0 of 0");
	},
	gotError:function(response) {
		this.doErrorReceived({error:response.Error});
	},
	documentsChanged:function() {
		this.$.documentList.setCount(this.getDocuments().length);
		this.$.documentList.refresh();
	},
	renderDocument:function(sender,event) {
		this.$.documentId.setContent(this.getDocuments()[event.index].__document_id);
		this.$.item.addRemoveClass("selected",sender.isSelected(event.index));
		return true;
	},
	selectDocument:function(sender,event) {
		this.doDocumentSelected({documentId:this.getDocuments()[event.index].__document_id});
	},
	createDocument:function(sender,event) {
		this.$.createPopup.hide();
		this.getApi().createDocument(this.getTenantId(),this.$.documentIdInput.getValue());
	}
});
