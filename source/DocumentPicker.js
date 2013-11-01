enyo.kind({
	name:"RavenBrowser.DocumentPicker",
	classes:"onyx",
	published:{
		tenantId:null,
		api:null
	},
	events:{
		onErrorReceived:"",
		onDocumentSelected:""
	},
	handlers:{
		onDocumentContextMenu:"showContextMenu",
        onkeydown:"keydownHandler"
	},
	loader:null,
	components:[
		{kind:"FittableRows", classes:"enyo-fit", components:[
			{kind:"onyx.Toolbar", components:[
				{kind:"onyx.InputDecorator", style:"display:block", components:[
					{name:"filterInput", kind:"onyx.Input", oninput:"applyFilter", placeholder:"Filter", type:"search", classes:"max-width"}
				]}
			]},
			{name:"documentList", kind:"RavenBrowser.DocumentList", onSelectionChanged:"updateDeleteButton", fit:true},
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
								{name:"confirmDeleteButton", content:"Delete", classes:"onyx-negative", ontap:"deleteDocuments"}
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

    keydownHandler: function(sender, keyboardEvent)
    {
		switch (keyboardEvent.key) {
		case "Delete":
			this.$.deleteButton.setActive(true);
            keyboardEvent.preventDefault();
            return true;
        }
    },

	apiChanged:function(old, api) {
		this.$.documentList.setApi(api);
	},

	applyFilter:function(input, event) {
		this.$.documentList.setFilterString(input.getValue());
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
		var selectedDocuments = this.$.documentList.getSelectedDocuments();
		for(var i = 0; i < selectedDocuments.length; i++)
		{
			var docId = selectedDocuments[i];
			this.getApi().deleteDocument(this.getTenantId(), docId)
				.response(enyo.bind(this,"documentDeleted",sender,event,docId))
				.error(enyo.bind(this,"documentDeleteFailed"));
		}
		this.closeDeletePopup();
	},

	documentDeleted:function(sender, event, documentId) {
		enyo.create({
			kind:"onyx.Toast",
			content:["Document", documentId,"deleted."].join(' ')
		});
		enyo.job("reload",enyo.bind(this,this.loadDocuments),1000);
	},


	documentDeleteFailed:function(sender,event) {
		this.doErrorReceived({error:"Failed to delete document."});
	},

	closeDeletePopup:function() {
		this.$.deletePopup.hide();
	},

	updateDeleteButton:function(sender, event) {
		this.$.deleteButton.setDisabled(!event.selected.length);
	}
});
