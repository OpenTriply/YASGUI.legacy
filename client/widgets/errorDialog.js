(function(){
	this.Yasgui = this.Yasgui || {};
	this.Yasgui.widgets = this.Yasgui.widgets || {};
	this.Yasgui.widgets.errorDialog = function(config) {
		config = config || {};
		config.width = 500;
		if (!config.id) config.id = "errorDialog";
		if (!config.title) config.title = "Error";
		
		Yasgui.widgets.dialog(config);
	};
}).call(this);