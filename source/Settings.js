enyo.kind({
	name:"RavenBrowser.Settings",
	kind:"FittableRows",
	published:{
		api:null
	},
	events:{
		onServerChanged:"",
	},
	components:[
		{kind:"onyx.Groupbox", components:[
			{kind:"onyx.GroupboxHeader", content:"Raven server"},
			{kind:"onyx.InputDecorator", components:[
				{name:"ravenHostInput", kind:"onyx.Input", classes:"max-width", placeholder:"Host", onchange:"setRavenHost"},
			]},
			{kind:"onyx.InputDecorator", components:[
				{name:"ravenPortInput", kind:"onyx.Input", classes:"max-width", placeholder:"Port", onchange:"setRavenPort"},
			]},
		]},
	],
	apiChanged:function() {
		this.$.ravenHostInput.setValue(this.getApi().getRavenHost());
		this.$.ravenPortInput.setValue(this.getApi().getRavenPort());
	},
	setRavenHost:function(sender,event) {
		this.getApi().setRavenHost(sender.getValue());
	},
	setRavenPort:function(sender,event) {
		this.getApi().setRavenPort(sender.getValue());
	}
});
