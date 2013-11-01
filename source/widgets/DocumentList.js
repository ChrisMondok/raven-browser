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
	name:"RavenBrowser.DocumentList",
	kind:"FittableRows",

	published:{
		api:null,
		tenantId:null,
		documents:null,
		filterString:null,
		filteredDocuments:null,
		sortFunction:undefined
	},

	events:{
		onDocumentSelected:"",
		onDocumentContextMenu:"",
		onSelectionChanged:""
	},

	handlers:{
		onkeydown:"keyboardListener"
	},

	entityTypes:null,

	statics:{
		sortFunctions:sortFunctions
	},

	components:[
		{name:"list", kind:"List", noSelect:true, attributes:{tabIndex:0}, fit:true, onSetupItem:"renderDocument", components:[
			{name:"divider", showing:false, classes:"divider", content:"Divider"},
			{name:"item", kind:"onyx.Item", ontap:"pickDocument", oncontextmenu:"contextMenu", components:[
				{name:"documentId"}
			]}
		]},
		{name:"loadingDrawer", kind:"onyx.Drawer", classes:"footer-drawer", components:[
			{name:"loadingDescription", style:"text-align:center; font-size:0.75em;", content:"Select a tenant"},
			{name:"loadingBar", barClasses:"onyx-dark", kind:"onyx.ProgressBar", animateStripes:true}
		]},
		{name:"selection", kind:"Selection", onSelect:"updateDocumentSelectedState", onDeselect:"updateDocumentSelectedState", onChange:"selectionChanged"}
	],
	
	create:function() {
		this.setDocuments([]);
	},

	contextMenu:function(sender, event) {
		this.pickDocument(sender,event);
		this.doDocumentContextMenu(event);
	},

	setDocuments:function(docs) {
		var oldValue = this.documents;
		if(docs != oldValue) {
			this.documents = docs;
			this.documentsChanged(oldValue,docs);
		}
	},

	keyboardListener:function(sender,keyboardEvent) {
		var self = this,
			newSelection,
			handled = true,
			selected = this.getSelectedIndexes();
		switch (keyboardEvent.key) {
		case "Esc":
			if(selected.length) {
				self.clearSelection();
			}
			break;
		case "Down":
			if(selected.length) {
				var last = selected.reduce(function(l,r){return (l > r ? l : r);});
				newSelection = Number(last) + 1;
				if(newSelection < self.$.list.getCount()) {
					self.clearSelection();
					self.$.selection.select(newSelection);
				}
			}
			break;
		case "Up":
			if(selected.length) {
				var first = selected.reduce(function(l,r){return (l < r ? l : r);});
				newSelection = Number(first) - 1;
				if(newSelection >= 0) {
					self.clearSelection();
					self.$.selection.select(newSelection);
				}
			}
			break;
		default:
			handled = false;
			break;
		}
		if(handled)
			keyboardEvent.preventDefault();
        return handled;
	},

	pickDocument:function(sender,event) {

		if(this.$.selection.getMulti() && !(event.ctrlKey || event.shiftKey)) {
			var keys = this.$.selection.getSelected();
			for(var key in keys)
				this.$.selection.deselect(key);
		}

		this.$.selection.setMulti(event.ctrlKey || event.shiftKey);
		if(!event.shiftKey)
		{
			this._lastSelected = event.index;
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

	tenantIdChanged:function(old, tenantId){
		this.clearSelection();
		if(tenantId)
			this.loadDocuments();
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
				this.entityTypes.push(eType);
		}
		this.entityTypes.sort();
	},

	renderDocument:function(sender,event) {
		var docs = this.getFilteredDocuments();
		var doc = docs[event.index];

		this.$.documentId.setContent(doc.__document_id);

		this.renderDivider(sender,event);

		this.$.item.addRemoveClass("selected",this.$.selection.isSelected(event.index));

		var eType = doc["@metadata"]["Raven-Entity-Name"];

		if(eType && this.entityTypes.length) {
			var eHue = 360*this.entityTypes.indexOf(eType)/this.entityTypes.length;
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
					var eHue = 360*this.entityTypes.indexOf(eType)/this.entityTypes.length;
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
			break;
		}
	},

	setSortFunction:function(functionName) {
		var oldValue = this.sortFunction;
		var newValue = RavenBrowser.DocumentList.sortFunctions[functionName];
		if(newValue != oldValue) {
			this.sortFunction = newValue;
			this.sortFunctionChanged(oldValue,newValue);
		}
	},

	filterStringChanged:function() {
		this.applyFilter();
	},

	applyFilter:function() {
		var filtered = new Array(),
			filterString = this.getFilterString(),
			unfiltered = this.getDocuments();

		for(var i in unfiltered) {
			if(!filterString || unfiltered[i].__document_id.indexOf(filterString) != -1)
				filtered.push(unfiltered[i]);
		}

		this.setFilteredDocuments(filtered);
	},

	filteredDocumentsChanged:function() {
		var filterString = this.getFilterString();
		var documents = this.getFilteredDocuments();
		this.$.list.setCount(documents?documents.length:0);
		this.$.list.refresh();
	},

	clearSelection:function() {
		var selection = this.$.selection.getSelected();
		for(var s in selection) {
			this.$.selection.deselect(s);
		}
	},

	loadDocuments:function() {
		this.clearSelection();
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
			this.getApi().ensureStartup(this.getTenantId()).response(this,this.loadDocuments);
			break;
		case 0:
			break;
		default:
			if(sender.xhrResponse)
				this.gotError(JSON.parse(sender.xhrResponse.body));
			break;
		}
	},

	sortDocuments:function() {
		var sortFn = this.getSortFunction();
		var docs = this.getDocuments();
		if(sortFn && docs && docs.length)
			docs.sort(sortFn);
	},

	sortFunctionChanged:function(oldValue,newValue) {
		this.sortDocuments();
		this.applyFilter();
	},

	updateDocumentSelectedState:function(sender,event) {
		if(this.$.selection.isSelected(event.key)) {
			this.doDocumentSelected({documentId:this.getFilteredDocuments()[event.key].__document_id});
		}

		this.$.list.renderRow(event.key);
	},

	selectionChanged:function(selection, event) {
		this.doSelectionChanged({selected:Object.keys(selection.getSelected())});
	},

	getSelectedIndexes:function() {
		return Object.keys(this.$.selection.getSelected());
	},

	getSelectedDocuments:function() {
		return this.getSelectedIndexes().map(function(index){return this.getFilteredDocuments()[index].__document_id;}, this );
	}
});
