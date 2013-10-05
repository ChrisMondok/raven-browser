enyo.kind({
	name:"DragImage",
	kind:"Image",
	src:"assets/drag-dots.png",
	classes:"drag-image",
	width:54,
	height:54,

	attributes:{ draggable:true },

	events:{
		onDragStart:"",
		onDragEnd:"",
		onDrag:""
	},

	handlers:{
		onDragStart:"dragStartHandler",
		onDragEnd:"dragEndHandler"
	},

	rendered:function() {
		this.inherited(arguments);
		if(this.hasNode()) {
			var self = this;
			this.node.addEventListener('dragstart',enyo.bind(self,'doDragStart'));
			this.node.addEventListener('drag',enyo.bind(self,'doDrag'));
			this.node.addEventListener('dragend',enyo.bind(self,'doDragEnd'));
		}
	},

	dragStartHandler:function(sender,event) {
		this.addClass('dragging');
		console.info('drag start');
	},

	dragEndHandler:function(sender,event) {
		this.removeClass('dragging');
		console.info('drag end');
	}
});
