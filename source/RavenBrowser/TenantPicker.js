enyo.kind({
	name:"RavenBrowser.TenantPicker",
	kind:"FittableRows",
	classes:"onyx onyx-dark",
	events:{
		onTenantSelected:"",
		onShowSettings:"",
		onErrorReceived:""
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
			{kind:"onyx.Button", content:"Reload", ontap:"loadTenants"},
			{kind:"onyx.Button", content:"Settings", ontap:"doShowSettings"}
		]},
	],
	apiChanged:function() {
		this.loadTenants();
	},
	loadTenants:function() {
		this.setTenants([]);
		this.getApi().getTenants(enyo.bind(this,"setTenants"),enyo.bind(this,"handleError"));
	},
	handleError:function(sender,error) {
		this.doErrorReceived({error:"Failed to load tenants"});
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
