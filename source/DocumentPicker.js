enyo.kind({
	name:"RavenBrowser.DocumentPicker",
	classes:"onyx",
	published:{
		tenantId:null,
		api:null,
	},
	events:{
		onErrorReceived:"",
		onDocumentSelected:""
	},
	loader:null,
	components:[
		{kind:"FittableRows", classes:"enyo-fit", components:[
			{kind:"onyx.Toolbar", components:[
				{kind:"onyx.InputDecorator", style:"display:block", components:[
					{name:"filterInput", kind:"onyx.Input", onchange:"applyFilter", placeholder:"Filter", type:"search", classes:"max-width"}
				]}
			]},
			{name:"documentList", kind:"RavenBrowser.DocumentList", fit:true},
			{kind:"onyx.Toolbar", components:[
				{kind:"FittableColumns", classes:"max-width", components:[
					{name:"reloadButton", kind:"onyx.Button", content:"Reload", ontap:"loadDocuments"},
					{kind:"onyx.MenuDecorator", components:[
						{name:"deleteButton", kind:"onyx.Button", content:"Delete", disabled:true},
						{name:"deletePopup", kind:"onyx.ContextualPopup", title:"Confirm delete", floating:true,
							components:[
								{content:"This cannot be undone"}
							],
							actionButtons:[
								{content:"Cancel", classes:"onyx-dark", ontap:"closeDeletePopup"},
								{content:"Delete", classes:"onyx-negative", ontap:"deleteDocuments"}
						]}
					]}
				]}
			]}
		]},
		{name:"destinationDialog", kind:"RavenBrowser.DestinationDialog"},
		{name:"contextMenu", kind:"RavenBrowser.Widgets.ContextMenu", onSelect:"contextMenuItemSelected", floating:true, components:[
			{content:$L("Copy")},
			{content:$L("Move")},
			{content:$L("Delete")}
		]}
	],

	setSortFunction:function(sortFunction) {
		this.$.documentList.setSortFunction(sortFunction)
	},

	showContextMenu:function(component, event) {
		this.$.contextMenu.showAtEvent(event);
		event.preventDefault();
	},

	contextMenuItemSelected:function(menu, selected) {
		switch(selected.content) {
			case $L("Copy"):
				this.$.destinationDialog.setActionName("Copy");
				this.$.destinationDialog.setShowing(true);
				break;
			case $L("Move"):
				this.$.destinationDialog.setActionName("Move");
				this.$.destinationDialog.setShowing(true);
				break;
			case $L("Delete"):
				this.$.deleteButton.setActive(true);
				break;
			default:
				alert("How do you even pick "+selected.content+"?");
				break;
		}
	},

	apiChanged:function(old, api) {
		this.$.documentList.setApi(api);
	},

	tenantIdChanged:function(old,tenantId) {
		this.$.documentList.setTenantId(tenantId);
		this.$.reloadButton.setDisabled(!tenantId);
	},

	loadDocuments:function() {
		this.$.documentList.loadDocuments();
	},

	gotError:function(response) {
		this.doErrorReceived({error:response.Error});
	},

	deleteDocuments:function(sender,event) {
		throw "Not implemented.";
		for(var key in this.$.selection.getSelected())
		{
			var id = this.getFilteredDocuments()[key].__document_id;
			this.getApi().deleteDocument(this.getTenantId(), id)
				.response(enyo.bind(this,"documentDeleted",sender,event,key))
				.error(enyo.bind(this,"documentDeleteFailed"));
		}
	},

	documentDeleteFailed:function(sender,event) {
		this.doErrorReceived({error:"Failed to delete document."});
	},

	closeDeletePopup:function() {
		this.$.deletePopup.hide();
	}
});
