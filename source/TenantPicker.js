enyo.kind({
	name:"RavenBrowser.TenantPicker",
	kind:"FittableRows",
	classes:"onyx onyx-dark",
	events:{
		onTenantSelected:"",
		onShowSettings:"",
	},
	published:{
		tenants:null,
		api:null
	},
	components:[
		{name:"tenantList", kind:"List", style:"min-width:320px", onSetupItem:"renderTenant", onSelect:"selectTenant", fit:true, components:[
			{kind:"onyx.Item", components:[
				{name:"tenantName"},
			]},
		]},
		{kind:"onyx.Toolbar", components:[
			{kind:"FittableColumns", classes:"max-width", components:[
				{kind:"onyx.Button", content:"Reload", ontap:"loadTenants"},
				{fit:true},
				{kind:"onyx.Button", content:"Settings", ontap:"doShowSettings"}
			]},
		]},
	],
	apiChanged:function() {
		this.getApi().getTenants(enyo.bind(this,"setTenants"));
	},
	tenantsChanged:function() {
		this.$.tenantList.setCount(this.getTenants().length);
		this.$.tenantList.refresh();
	},
	renderTenant:function(sender,event) {
		this.$.tenantName.setContent(this.getTenants()[event.index]);
		this.$.item.addRemoveClass("selected",sender.isSelected(event.index));
		return true;
	},
	selectTenant:function(sender,event) {
		this.doTenantSelected({tenant:this.getTenants()[event.index]});
	},
});
