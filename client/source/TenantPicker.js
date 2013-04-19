enyo.kind({
	name:"RavenBrowser.TenantPicker",
	kind:"FittableRows",
	classes:"onyx onyx-dark",
	events:{
		onTenantSelected:"",
	},
	published:{
		tenants:null
	},
	components:[
		{kind:"onyx.Toolbar", components:[
			{content:"Tenants"},
		]},
		{name:"tenantList", kind:"List", style:"min-width:320px", onSetupItem:"renderTenant", onSelect:"selectTenant", fit:true, components:[
			{kind:"onyx.Item", components:[
				{name:"tenantName"},
			]},
		]},
	],
	create:function() {
		this.inherited(arguments);
		this.loadTenants();
	},
	loadTenants:function() {
		var ajax = new enyo.Ajax({
			url:"/raven/databases"
		});
		ajax.go();
		ajax.response(this,function(sender,response) {
			this.setTenants(response);
		});
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
