define({
	name: 'reviews',
	id: 'reviews', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	events: {
		initialized: function () {
			// Do something
		},
		pageLoaded: function (e) {
			var	that = this,
				page = App.getCurrent(),
				eventHandler = that.getEventHandler();
			
			//eventHandler.dispatch('rendered');
		},
		rendered: function (e) {
			this.dataBind();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'reviewGrid',
					data: {
						role: 'grid',
						autoBind: false,
						editable: 'inline',
						filterable: { mode: 'row' },
						sortable: true,
						scrollable: true,
						pageable: {
							pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
							pageSizes: [10, 25, 50],
							refresh: false
						},
						selectable: 'row',
						columns: [
							{
								field: 'ID',
								title: 'ID',
								//locked: true,
								//lockable: false,
								width: 100
							},
							/*{
								field: 'ProviderID',
								title: 'Provider ID',
								width: 100
							},*/
							{
								field: 'Customer',
								title: 'Customer',
								width: 250
							},
							{
								field: 'Name',
								title: 'Summary',
								width: 250
							},
							{
								field: 'Rating',
								title: 'Rating'
							},
							{
								field: 'Active',
								title: 'Status'
							},
							{ command: [ { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
						]
					}
				}
			]
		}
	}
});