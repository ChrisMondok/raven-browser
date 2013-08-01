var sortFunctions = {
	"Entity Type": function(a,b) {
			var aType = a["@metadata"]["Raven-Entity-Name"];
			var bType = b["@metadata"]["Raven-Entity-Name"];
			if(aType && bType) {
				if(aType < bType)
					return -1;
				else
					if(aType > bType)
						return 1;
			}
			else {
				if(aType)
					return -1;
				else
					return 1;
			}
			return 0;
		},
	"Document ID": function(a,b) {
		if(a.__document_id < b.__document_id)
			return -1
		else
			if(a.__document_id > b.__document_id)
				return 1
		return 0
	},
	"unsorted":null
}

enyo.kind({
	name:"RavenBrowser.DocumentPicker",
	kind:"FittableRows",
	classes:"onyx",
	published:{
		tenantId:null,
		documents:null,
		filteredDocuments:null,
		api:null,
		sortFunction:undefined
	},
	entityTypes:null,
	events:{
		onErrorReceived:"",
		onDocumentSelected:""
	},
	loader:null,
	components:[
		{kind:"onyx.Toolbar", components:[
			{kind:"onyx.InputDecorator", style:"display:block", components:[
				{name:"filterInput", kind:"onyx.Input", onchange:"applyFilter", placeholder:"Filter", type:"search", classes:"max-width"}
			]},
		]},
		{name:"documentList", kind:"List", noSelect:true, fit:true, onSetupItem:"renderDocument", components:[
			{name:"divider", showing:false, classes:"divider", content:"Divider"},
			{kind:"onyx.Item", ontap:"pickDocument", components:[
				{name:"documentId"},
			]},
		]},
		{name:"loadingDrawer", kind:"onyx.Drawer", classes:"footer-drawer", components:[
			{name:"loadingDescription", style:"text-align:center; font-size:0.75em;", content:"Select a tenant"},
			{name:"loadingBar", barClasses:"onyx-dark", kind:"onyx.ProgressBar", animateStripes:true},
		]},
		{kind:"onyx.Toolbar", components:[
			{kind:"FittableColumns", classes:"max-width", components:[
				{name:"reloadButton", kind:"onyx.Button", content:"Reload", ontap:"loadDocuments"},
				{kind:"onyx.MenuDecorator", components:[
					{name:"deleteButton", kind:"onyx.Button", content:"Delete", disabled:true},
					{name:"deletePopup", kind:"onyx.ContextualPopup", title:"Confirm delete", floating:true,
						components:[
							{content:"This cannot be undone"},
						],
						actionButtons:[
							{content:"Cancel", classes:"onyx-dark", ontap:"closeDeletePopup"},
							{content:"Delete", classes:"onyx-negative", ontap:"deleteDocuments"}
					]},
				]},
			]},
		]},
		{name:"selection", kind:"Selection", onSelect:"rerenderDocument", onDeselect:"rerenderDocument", onChange:"selectionChanged"},
	],
	statics:{
		sortFunctions:sortFunctions
	},
	create:function() {
		this.inherited(arguments);
		this.$.reloadButton.setDisabled(!this.getTenantId());
		this.setDocuments([]);

		window.L = this.$.documentList;
		window.S = this.$.selection;
		window.D = this;
	},
	tenantIdChanged:function(){
		var selection = this.$.selection.getSelected();
		for(var s in selection.selected) {
			this.$.selection.deselect(s);
		}
		var tenantId = this.getTenantId();
		if(tenantId)
			this.loadDocuments();
		this.$.reloadButton.setDisabled(!tenantId);
	},
	loadDocuments:function() {
		enyo.job.stop("closeLoadingDrawer");
		this.setDocuments([]);
		if(this.loader)
			this.loader.abort();

		this.loader = this.getApi().getDocuments(this.getTenantId());
		this.loader.response(this,"loadDocumentsHandler");
		this.loader.progress(this,"loadDocumentsProgressHandler");
		this.loader.error(this,"loadDocumentsErrorHandler");

		this.$.loadingBar.setProgress(0);
		this.$.loadingDrawer.setOpen(true);
		this.$.loadingDescription.setContent("0 of 0");
	},
	loadDocumentsHandler:function(async, documentIds) {
		this.setDocuments(documentIds);
		this.loader = null;
	},
	loadDocumentsProgressHandler:function(async, progress) {
		this.$.loadingBar.animateProgressTo(progress.loaded * 100 / progress.total);
		this.$.loadingDescription.setContent(progress.loaded+" of "+progress.total);

		if(progress.loaded == progress.total)
			enyo.job("closeLoadingDrawer", enyo.bind(this, function() {
					this.$.loadingDrawer.setOpen(false);
				}),1000);
	},
	loadDocumentsErrorHandler:function(async, response) {
		switch (response)
		{
		case 404:
			enyo.create({
				kind:"onyx.Toast",
				content:"Creating index."
			});
			this.getApi().ensureStartup(this.getTenantId(),enyo.bind(this,this.loadDocuments));
			break;
		case 0:
			break;
		default:
			if(sender.xhrResponse)
				this.gotError(JSON.parse(sender.xhrResponse.body));
		}
	},
	gotError:function(response) {
		this.doErrorReceived({error:response.Error});
	},
	setDocuments:function(docs) {
		var oldValue = this.documents;
		if(docs != oldValue) {
			this.documents = docs;
			this.documentsChanged(oldValue,docs)
		}
	},
	sortDocuments:function() {
		var sortFn = this.getSortFunction();
		var docs = this.getDocuments();
		if(sortFn && docs && docs.length)
			docs.sort(sortFn);
	},
	documentsChanged:function(oldValue,newValue) {
		this.updateEntityTypes();
		this.sortDocuments();
		this.applyFilter();
	},
	updateEntityTypes:function() {
		var documents = this.getDocuments();
		this.entityTypes = [];
		for(var i in documents) {
			var eType = documents[i]["@metadata"]["Raven-Entity-Name"];
			if(eType && this.entityTypes.indexOf(eType) == -1)
				this.entityTypes.push(eType)
		}
		this.entityTypes.sort();
	},
	applyFilter:function() {
		var filterString = this.$.filterInput.getValue();
		var filtered = new Array();
		var unfiltered = this.getDocuments();
		for(var i in unfiltered) {
			if(unfiltered[i].__document_id.indexOf(filterString) != -1)
				filtered.push(unfiltered[i]);
		}
		this.setFilteredDocuments(filtered);
	},
	filteredDocumentsChanged:function(oldValue,newValue) {
		var documents = this.getFilteredDocuments();
		this.$.documentList.setCount(documents?documents.length:0);
		this.$.documentList.refresh();
	},
	setSortFunction:function(functionName) {
		var oldValue = this.sortFunction;
		var newValue = RavenBrowser.DocumentPicker.sortFunctions[functionName];
		if(newValue != oldValue) {
			this.sortFunction = newValue;
			this.sortFunctionChanged(oldValue,newValue);
		}
	},
	sortFunctionChanged:function(oldValue,newValue) {
		this.sortDocuments();
		this.applyFilter();
	},
	renderDocument:function(sender,event) {
		var docs = this.getFilteredDocuments();
		var doc = docs[event.index];

		this.$.documentId.setContent(doc.__document_id);

		this.renderDivider(sender,event);

		this.$.item.addRemoveClass("selected",this.$.selection.isSelected(event.index));

		var eType = doc["@metadata"]["Raven-Entity-Name"];

		if(eType && this.entityTypes.length) {
			var eHue = 360*this.entityTypes.indexOf(eType)/this.entityTypes.length
			this.$.item.applyStyle("border-left","0.5ex solid hsl("+eHue+",50%,50%)");
		}
		else
			this.$.item.applyStyle("border-left","0.5ex solid #333");

		return true;
	},
	renderDivider:function(sender,event) {
		var docs = this.getFilteredDocuments();
		var doc = docs[event.index];

		switch (this.getSortFunction()) {
		case sortFunctions["Entity Type"]:
			var eType = doc["@metadata"]["Raven-Entity-Name"];
			this.$.divider.setContent(eType || "Untyped");
			this.$.divider.setShowing(!docs[event.index-1] || doc["@metadata"]["Raven-Entity-Name"] != docs[event.index-1]["@metadata"]["Raven-Entity-Name"]);
			if(this.entityTypes.length) {
				if(eType) {
					var eHue = 360*this.entityTypes.indexOf(eType)/this.entityTypes.length
					this.$.divider.applyStyle("background-image","linear-gradient(90deg, hsl("+eHue+",50%,50%) 0%, #EAEAEA 100%)");
					this.$.divider.applyStyle("color","black");
				}
				else {
					this.$.divider.applyStyle("background-image","linear-gradient(90deg, #333333 0%, #EAEAEA 100%)");
				this.$.divider.applyStyle("color","white");
				}
			}
			else {
				this.$.divider.applyStyle("background-image","none");
			}
			break;
		case sortFunctions["Document ID"]:
			this.$.divider.setContent(doc.__document_id.charAt(0).toUpperCase());
			this.$.divider.setShowing(!docs[event.index-1] || doc.__document_id.charAt(0) != docs[event.index-1].__document_id.charAt(0));
			this.$.item.applyStyle("border-left","none");
			this.$.divider.applyStyle("background-image","linear-gradient(90deg, #333333 0%, #EAEAEA 100%)");
			this.$.divider.applyStyle("color","white");
			break;
		default:
			this.$.divider.setShowing(false);
		}
	},
	pickDocument:function(sender,event) {
		this.doDocumentSelected({documentId:this.getFilteredDocuments()[event.index].__document_id});

		if(this.$.selection.getMulti() && !(event.ctrlKey || event.shiftKey)) {
			var keys = this.$.selection.getSelected();
			for(var key in keys)
				this.$.selection.deselect(key);
		}

		this.$.selection.setMulti(event.ctrlKey || event.shiftKey);
		if(!event.shiftKey)
		{
			this._lastSelected = event.index
			this.$.selection.toggle(event.index);
		}
		else
		{
			var start = Math.min(event.index,this._lastSelected);
			var end = Math.max(event.index,this._lastSelected);
			for(var i = start; i <= end; i++)
				this.$.selection.setByKey(i,true);
		}
	},
	rerenderDocument:function(sender,event) {
		this.$.documentList.renderRow(event.key);
	},
	selectionChanged:function(sender,event) {
		this.$.deleteButton.setDisabled(!Boolean(
			Object.keys(this.$.selection.getSelected()).length
		));
	},
	deleteDocuments:function(sender,event) {
		this.closeDeletePopup();
		for(var key in this.$.selection.getSelected())
		{
			var id = this.getFilteredDocuments()[key].__document_id;
			this.getApi().deleteDocument(this.getTenantId(), id)
				.response(enyo.bind(this,"documentDeleted",sender,event,key))
				.error(enyo.bind(this,"documentDeleteFailed"));
		}
	},
	documentDeleted:function(sender,event,index) {
		enyo.create({
			kind:"onyx.Toast",
			content:"Document deleted."
		});
		this.$.selection.deselect(index);
		enyo.job("reload",enyo.bind(this,this.loadDocuments),1000);
	},
	documentDeleteFailed:function(sender,event) {
		this.doErrorReceived({error:"Failed to delete document."});
	},
	closeDeletePopup:function() {
		this.$.deletePopup.hide();

	},
});
