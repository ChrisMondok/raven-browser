enyo.kind({
	name:"RavenBrowser.TenantPicker",
	kind:"FittableRows",
	classes:"onyx onyx-dark",
	events:{
		onTenantSelected:"",
		onErrorReceived:""
	},
	published:{
		tenants:null,
		api:null,
		fetchDocumentCount:false
	},
	components:[
		{name:"tenantList", kind:"List", style:"min-width:320px", onSetupItem:"renderTenant", onSelect:"selectTenant", fit:true, components:[
			{kind:"onyx.Item", controlClasses:"inline", components:[
				{name:"tenantName"},
				{name:"documentCount", style:"float:right", classes:"label"}
			]},
		]}
	],
	apiChanged:function() {
		this.loadTenants();
	},
	loadTenants:function() {
		this.setTenants([]);
		this.getApi().getTenants()
			.response(this,"gotTenants")
			.error(this,"handleError");
	},
	gotTenants:function(sender,response) {
		this.setTenants(response.map(
			function(tenantId){
				return {id:tenantId, documentCount:undefined};
			}
		));
	},
	handleError:function(sender,error) {
		this.doErrorReceived({error:"Failed to load tenants"});
	},
	tenantsChanged:function() {
		this.$.tenantList.setCount(this.getTenants().length);
		if(this.getFetchDocumentCount())
			this.loadDocumentCounts();
		this.$.tenantList.refresh();
	},
	fetchDocumentCountChanged:function() {
		if(this.getFetchDocumentCount() && this.getTenants())
			this.loadDocumentCounts();
	},
	loadDocumentCounts:function() {
		var api = this.getApi(),
			list = this.$.tenantList;
		this.getTenants().map(function(t, index){
			api.getDocumentCount(t.id).response( function(sender,count) {
				t.documentCount = count;
				list.renderRow(index);
			});
		});
	},
	renderTenant:function(sender,event) {
		var tenant = this.getTenants()[event.index];
		this.$.tenantName.setContent(tenant.id);
		this.$.documentCount.setContent(tenant.documentCount || null);
		this.$.item.addRemoveClass("selected",sender.isSelected(event.index));
		return true;
	},
	selectTenant:function(sender,event) {
		this.doTenantSelected({tenant:this.getTenants()[event.index].id});
	},
});
