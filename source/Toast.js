enyo.kind({
	name:"onyx.Toast",
	kind:"onyx.Popup",
	classes:"onyx-toast",
	floating:true,
	centered:true,
	published:{
		lifetime:20000,
	},
	handlers:{
		ontap:"hide",
	},
	create:function() {
		var r = this.inherited(arguments);
		this.show();
		setTimeout(enyo.bind(this,"destroyToast"),this.getLifetime());
		this.applyStyle('top','');
		this.applyStyle('bottom','8em');
		return r;
	},
	destroyToast:function() {
		this.destroy();
	}
});
