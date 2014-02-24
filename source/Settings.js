enyo.kind({
	name:"RavenBrowser.Settings",
	kind:"FittableRows",
	classes:"settings",
	published:{
		sortFunction:"Entity Type",
		fetchDocumentCount:false,
        pageSize: 1024
	},

    mixins:[ enyo.ObserverSupport ],

    bindings:[
        {from: '.host', to: '.$.ravenHostInput.value', oneWay: false},
        {from: '.port', to: '.$.ravenPortInput.value', oneWay: false},
        {from: '.secure', to: '.$.httpsToggle.value', oneWay: false},
        {from: '.host', to: '.$.ravenHostInput.value', oneWay: false},
        {from: '.fetchDocumentCount', to: '.$.fetchDocumentCountToggle.value', oneWay: false},
        {from: '.pageSize', to: '.$.pageSizeSlider.value', oneWay: false},
        {from: '.pageSize', to: '.$.pageSizeLabel.content'}
    ],

    observers:{
        updateConnectionString:['host','port','secure']
    },

    updateConnectionString: function() {
        var protocol = this.get('secure') ? 'https://' : 'http://';
        this.set('connectionString', protocol + this.get('host')+':'+this.get('port'));
    },

	components:[
		{kind:"onyx.Groupbox", components:[
			{kind:"onyx.GroupboxHeader", content:"Raven server"},
			{kind:"onyx.InputDecorator", components:[
				{name:"ravenHostInput", kind:"onyx.Input", classes:"max-width", placeholder:"Host"}
			]},
			{kind:"onyx.InputDecorator", components:[
				{name:"ravenPortInput", kind:"onyx.Input", classes:"max-width", placeholder:"Port"}
			]},
			{kind:"onyx.Item", controlClasses:"inline", components:[
				{name:"httpsToggle", kind:"onyx.ToggleButton"},
				{content:"Use HTTPS", classes:"label", style:"float:right; line-height:32px"}
			]},
			{style:"padding:0.5em 0em;", components:[
				{name:"pageSizeLabel", style:"padding:0em 0.5em;"},
				{name:"pageSizeSlider", kind:"onyx.Slider", min:1, max:1024, increment:1},
				{style:"padding:0em 0.5em", components:[
					{content:"1", style:"display:inline-block; text-align:left; width:50%"},
					{content:"1024", style:"display:inline-block; text-align:right; width:50%"}
				]}
			]}
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
					]}
				]}
			]}
		]},
		{kind:"onyx.Groupbox", components:[
			{kind:"onyx.GroupboxHeader", content:"Tenant Picker"},
			{kind:"onyx.Item", controlClasses:"inline", components:[
				{name:"fetchDocumentCountToggle", kind:"onyx.ToggleButton"},
				{content:"Fetch count", classes:"label", style:"float:right; line-height:32px"}
			]}
		]}
	],
    create: function() {
        this.inherited(arguments);

        var secure = localStorage.getItem('secure');

        this.set('host', localStorage.getItem('raven-host') || 'localhost');
        this.set('port', localStorage.getItem("raven-port") || 8080);
        this.set('sortFunction', localStorage.getItem("sort-function") || "Entity Type");
        this.set('secure', JSON.parse(secure) || false);
        this.set('pageSize', localStorage.getItem('page-size') || 1024);
    },
	pickSortFunction:function(sender,event) {
		this.setSortFunction(event.content);
	}
});
