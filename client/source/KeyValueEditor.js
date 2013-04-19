enyo.kind({
	name:"RavenBrowser.KeyValueEditor",
	kind:"FittableRows",
	published:{
		value:null
	},
	keys:null,
	components:[
		{name:"keyValueRepeater", kind:"Repeater", onSetupItem:"setUpItem", components:[
			{kind:"onyx.InputDecorator", classes:"key-value-pair key", components:[
				{name:"keyInput", kind:"onyx.Input", style:"width:100%"},
			]},
			{name:"valueDecorator", kind:"onyx.InputDecorator", classes:"key-value-pair value", components:[
				{name:"valueInput", kind:"onyx.Input", style:"width:100%"},
			]},
			{name:"nestedEditor", kind:"RavenBrowser.KeyValueEditor", classes:"key-value-pair value nested"},
		]},
		{kind:"onyx.Button", content:"Add row", style:"display:block;"},
	],
	create:function() {
		this.inherited(arguments);
		this.keys = [];
	},
	valueChanged:function() {
		var value = this.getValue();
		this.keys = [];
		for(var key in value)
			if(value.hasOwnProperty(key))
				this.keys.push(key);
		this.$.keyValueRepeater.setCount(this.keys.length);
	},
	setUpItem:function(sender,event)
	{
		var item = event.item;
		var value = this.getValue()[this.keys[event.index]];
		item.$.keyInput.setValue(this.keys[event.index]);
		if(typeof value == "string")
		{
			item.$.valueInput.setValue(value);
			item.$.valueDecorator.show();
			item.$.nestedEditor.hide();
		}
		else
		{
			item.$.nestedEditor.setValue(value);
			item.$.valueDecorator.hide();
			item.$.nestedEditor.show();
		}
		return true;
	}
});
