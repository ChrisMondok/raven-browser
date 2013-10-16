enyo.kind({
	name:"RavenBrowser.DestinationDialog",
	kind:"onyx.Popup",
	classes:"onyx-light",

	scrim: true,
	floating: true,
	centered: true,
	modal: true,

	published:{
		actionName:"Save"
	},

	events:{
		onActionRequested:""
	},

	components:[
		{kind:"onyx.Groupbox", style:"min-width:320px", components:[
			{kind:"onyx.GroupboxHeader", content:"Destination"},
			{kind:"onyx.InputDecorator", components:[
				{kind:"onyx.Input", classes:"max-width", placeholder:"Tenant ID"}
			]},
			{kind:"onyx.InputDecorator", components:[
				{kind:"onyx.Input", classes:"max-width", placeholder:"Document ID"}
			]}
		]},
		{kind:"onyx.Button", classes:"max-width onyx-dark", style:"margin-top:1em", name:"goButton"}
	],

	create:function() {
		this.inherited(arguments);
		this.actionNameChanged(undefined,this.getActionName());
	},
	actionNameChanged:function(old, actionName) {
		this.$.goButton.setContent(actionName)
	},

	showingChanged:function(was,showing) {
		this.inherited(arguments);
		console.info("Showing: "+showing);
	}
});
