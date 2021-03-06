enyo.kind({
	name:"RavenBrowser.Settings",
	kind:"FittableRows",
	published:{
		api:null,
		sortFunction:"Entity Type",
		fetchDocumentCount:undefined,
		secure:undefined
	},
	events:{
		onServerChanged:"",
		onSortFunctionChanged:"",
		onPageSizeChanged:"",
		onFetchDocumentCountChanged:"",
		onSecureChanged:""
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
			{kind:"onyx.Item", controlClasses:"inline", components:[
				{name:"httpsToggle", kind:"onyx.ToggleButton", onChange:"toggleHttps"},
				{content:"Use HTTPS", classes:"label", style:"float:right; line-height:32px"},
			]},
			{style:"padding:0.5em 0em;", components:[
				{name:"pageSizeLabel", style:"padding:0em 0.5em;"},
				{name:"pageSizeSlider", kind:"onyx.Slider", min:1, max:1024, increment:1, value:1024, onChange:"setPageSize", onChanging:"updatePageSizeLabel"},
				{style:"padding:0em 0.5em", components:[
					{content:"1", style:"display:inline-block; text-align:left; width:50%"},
					{content:"1024", style:"display:inline-block; text-align:right; width:50%"},
				]},
			]},
		]},
		{kind:"onyx.Groupbox", style:"margin-top:1em; margin-bottom:1em", components:[
			{kind:"onyx.GroupboxHeader", content:"Document Picker"},
			{classes:"picker-row", components:[
				{content:"Sort", classes:"label picker-label"},
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
		{kind:"onyx.Groupbox", components:[
			{kind:"onyx.GroupboxHeader", content:"Tenant Picker"},
			{kind:"onyx.Item", controlClasses:"inline", components:[
				{name:"fetchDocumentCountToggle", kind:"onyx.ToggleButton", onChange:"toggleFetchDocumentCount"},
				{content:"Fetch count", classes:"label", style:"float:right; line-height:32px"},
			]}
		]}
	],
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
	toggleFetchDocumentCount:function(sender,event) {
		this.setFetchDocumentCount(sender.getValue());
	},
	toggleHttps:function(sender,event) {
		this.setSecure(sender.getValue());
	},
	fetchDocumentCountChanged:function() {
		var value = this.getFetchDocumentCount();
		this.doFetchDocumentCountChanged({fetchDocumentCount:value});
		this.$.fetchDocumentCountToggle.setValue(value);
	},
	secureChanged:function() {
		var value = this.getSecure();
		this.doSecureChanged({secure:value});
		this.$.httpsToggle.setValue(value);
	},
	setPageSize:function(sender,event) {
		this.doPageSizeChanged({pageSize:sender.getValue()});
		this.updatePageSizeLabel();
	},
	updatePageSizeLabel:function() {
		this.$.pageSizeLabel.setContent("Page Size: "+this.$.pageSizeSlider.getValue());
	},
});
