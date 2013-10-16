enyo.kind({
	name:"RavenBrowser.ContextMenu",
	kind:"onyx.Menu",

	adjustPosition:function(){},

	showingChanged:function(wasShowing, showing) {
		this.inherited(arguments);
		this.updatePosition();
	}
});
