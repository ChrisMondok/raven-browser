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
		api:null,
		sortFunction:undefined
	},
	entityTypes:null,
	events:{
		onErrorReceived:"",
		onDocumentSelected:"",
	},
	loader:null,
	components:[
		{name:"documentList", onSelect:"selectDocument", kind:"List", fit:true, onSetupItem:"renderDocument", components:[
			{name:"divider", showing:false, classes:"divider", content:"Divider"},
			{kind:"onyx.Item", components:[
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
			]},
		]},
	],
	statics:{
		sortFunctions:sortFunctions
	},
	create:function() {
		this.inherited(arguments);
		this.$.reloadButton.setDisabled(!this.getTenantId());
		this.setDocuments([]);
		this.setSortFunction(sortFunctions["Entity Type"]);
		window.DP = this;
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
		if(this.loader)
			this.loader.abort();

		this.loader = this.getApi().getDocuments(this.getTenantId(),
			enyo.bind(this, function(documentIds) {
				this.setDocuments(documentIds);
				this.loader = null;
			}),
			enyo.bind(this, function(progress) {
				this.$.loadingBar.animateProgressTo(progress.loaded * 100 / progress.total);
				this.$.loadingDescription.setContent(progress.loaded+" of "+progress.total);

				if(progress.loaded == progress.total)
					enyo.job("closeLoadingDrawer", enyo.bind(this, function() {
							this.$.loadingDrawer.setOpen(false);
						}),1000);
			}),
			enyo.bind(this,function(sender,response) {
				if(response == "404")
					this.gotError(JSON.parse(sender.xhrResponse.body));
			}));

		this.$.loadingBar.setProgress(0);
		this.$.loadingDrawer.setOpen(true);
		this.$.loadingDescription.setContent("0 of 0");
	},
	gotError:function(response) {
		this.doErrorReceived({error:response.Error});
	},
	setDocuments:function(docs) {
		var oldValue = this.documents;
		if(docs != oldValue) {
			this.documents = docs;
			this.sortDocuments();
			this.documentsChanged(oldValue,docs)
		}
	},
	sortDocuments:function() {
		var sortFn = this.getSortFunction();
		var docs = this.getDocuments();
		if(sortFn && docs)
			docs.sort(sortFn);
	},
	documentsChanged:function(oldValue,newValue) {
		var documents = this.getDocuments();
		this.entityTypes = [];
		for(var i in documents) {
			var eType = documents[i]["@metadata"]["Raven-Entity-Name"];
			if(eType && this.entityTypes.indexOf(eType) == -1)
				this.entityTypes.push(eType)
		}
		this.entityTypes.sort();
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
		this.$.documentList.refresh();
	},
	renderDocument:function(sender,event) {
		var docs = this.getDocuments();
		var doc = docs[event.index];

		this.$.documentId.setContent(doc.__document_id);

		this.renderDivider(sender,event);

		this.$.item.addRemoveClass("selected",sender.isSelected(event.index));

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
		var docs = this.getDocuments();
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
					}
					else {
						this.$.divider.applyStyle("background-image","linear-gradient(90deg, #333333 0%, #EAEAEA 100%)");
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
				break;
		}
	},
	selectDocument:function(sender,event) {
		this.doDocumentSelected({documentId:this.getDocuments()[event.index].__document_id});
	}
});
