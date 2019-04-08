define({
	name: 'test',
	id: 'test', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	events: {
		// TODO: This should be registered as a default event handler for all pages
		// For now, include this function in all page scripts
		initialized: function () {
			console.log('test module "initialized" event triggered');
		},
		rendered: function () {			
			this.dataBind();
			
			var	that = this,
				page = App.getCurrent(),
				addressModules,
				addressModule;
			
			console.log('attempting to find address modules within the module...');
			addressModules = $('#' + this.getId()).find('[data-module=address]');
			console.log(addressModules);
			
			$('#' + this.getId()).find('[data-module=address]').each(function () {
				var id = $(this).attr('id');
				addressModule = page.getModule(id);
				
				addressModule.getEventHandler().dispatch('pageLoaded');
			});
		},
		pageLoaded: function (e) {
			var	that = this,
				page = App.getCurrent(),
				//block = page.getBlock('center-pane'),
				//viewModel = block.getViewModel(),
				//moduleViewModel = viewModel,
				//moduleValidator = block.getValidator(),
				//data = page.getFormData(),
				eventHandler = that.getEventHandler();
			
			////eventHandler.dispatch('rendered');
			console.log('test module "pageLoaded" event triggered');
			console.log('event handler');
			console.log(eventHandler);
			console.log(eventHandler.getEvents());
		}
	},
	layout: {
		templates: {
			tag: 'div',
			style: 'background-color: black; flex: 3 1 30%',
			children: [
				{
					tag: 'div',
					style: 'color: white',
					text: 'Test Module'
					
				},
				{
					module: 'address',
					config: {
						autoBind: false,
						autoRender: false
					}
				}
			]	
		}
	}
});