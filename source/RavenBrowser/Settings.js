enyo.kind({
	name:"RavenBrowser.Settings",
	kind:"FittableRows",
	published:{
		api:null,
		sortFunction:"Entity Type"
	},
	controlClasses:"nice-margin",
	events:{
		onServerChanged:"",
		onSortFunctionChanged:""
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
		{kind:"onyx.Groupbox", components:[
			{kind:"onyx.GroupboxHeader", content:"Document Picker"},
			{classes:"picker-row", components:[
				{content:"Sort", classes:"picker-label"},
				{kind:"onyx.PickerDecorator", onSelect:"pickSortFunction", components:[
					{content:"Entity Type"},
					{name:"sortPicker", kind:"onyx.Picker", classes:"row-picker", components:[
						{content:"Entity Type"},
						{content:"Document ID"},
						{content:"Unsorted"}
					]},
				]},
			]},
		]},
	],
	create:function() {
		this.inherited(arguments);
		window.S = this;
	},
	apiChanged:function() {
		this.$.ravenHostInput.setValue(this.getApi().getRavenHost());
		this.$.ravenPortInput.setValue(this.getApi().getRavenPort());
	},
	setRavenHost:function(sender,event) {
		this.getApi().setRavenHost(sender.getValue());
	},
	setRavenPort:function(sender,event) {
		this.getApi().setRavenPort(sender.getValue());
	},
	pickSortFunction:function(sender,event) {
		this.setSortFunction(event.content);
	},
	sortFunctionChanged:function() {
		this.doSortFunctionChanged({sortFunction:this.getSortFunction()});

//		var options = this.$.sortPicker.components;
//		for(var i = 0; i < options.length; i++)
//			if(options[i].content == this.getSortFunction())
//				this.$.sortPicker.setSelected(options[i]);
	}
});
