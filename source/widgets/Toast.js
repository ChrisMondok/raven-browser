enyo.kind({
	name:"onyx.Toast",
	kind:"onyx.Popup",
	classes:"onyx-toast",
	floating:true,
	centered:true,
	autoDismiss:false,
	published:{
		lifetime:2000
	},

	statics:{
		instances: [],
		positionInstances:function() {
			var bottom = 6*16;
			for(var i = 0; i < this.instances.length; i++)
			{
			   var toast = this.instances[this.instances.length - (i+1)];
			   toast.setBounds({bottom:bottom});
			   bottom += 2 + toast.getBounds().height;
			}
		}
	},

	create:function() {
		var r = this.inherited(arguments);
		this.show();
		setTimeout(enyo.bind(this,"destroy"),this.getLifetime());
		this.applyStyle('top','');
		this.applyStyle('bottom','0em');
		onyx.Toast.instances.push(this);
		onyx.Toast.positionInstances();
		return r;
	},
	destroy:function() {
		onyx.Toast.instances.splice(onyx.Toast.instances.indexOf(this),1);
		this.inherited(arguments);
		onyx.Toast.positionInstances();
	}
});
