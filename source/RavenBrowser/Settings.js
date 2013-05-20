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
		onSortFunctionChanged:"",
		onPageSizeChanged:""
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
			{style:"padding:0.5em 0em;", components:[
				{name:"pageSizeLabel", style:"padding:0em 0.5em;"},
				{name:"pageSizeSlider", kind:"onyx.Slider", min:1, max:1024, increment:1, value:1024, onChange:"setPageSize"},
				{style:"padding:0em 0.5em", components:[
					{content:"1", style:"display:inline-block; text-align:left; width:50%"},
					{content:"1024", style:"display:inline-block; text-align:right; width:50%"},
				]},
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
		this.$.pageSizeSlider.setValue(this.getApi().getPageSize());
		this.updatePageSizeLabel();
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
	},
	setPageSize:function(sender,event) {
		this.doPageSizeChanged({pageSize:sender.getValue()});
		this.updatePageSizeLabel();
	},
	updatePageSizeLabel:function() {
		this.$.pageSizeLabel.setContent("Page Size: "+this.$.pageSizeSlider.getValue());
	},
});
