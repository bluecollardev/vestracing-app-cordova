define({
	name: 'distributors',
	id: 'distributors', // This can be improved... the double ID reference isn't the greatest
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
			
			var distributorGrid = $('#distributorGrid').data('kendoGrid');
			
			distributorDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Networks), {
				transport: {
					read: {
						url: 'service/index.php/Read/Network/',
						type: 'GET',
						dataType: 'json'
					}
				},
				pageSize: 30
			}));
			
			distributorGrid.setDataSource(distributorDataSource);
			
			distributorDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'distributorGrid',
					data: {
						/*bind: {
							source: {
								type: 'method',
								config: {
									transport: {
										read: {
											url: 'service/index.php/DBGetNetworks',
											type: 'GET',
											contentType: 'xml'
										}
									},
									schema: {
										type: 'xml',
										data: '/API/Network',
										model: {
											fields: {
												Value: 'Name/text()',
												Key: 'ProviderID/text()'
											}
										}
									}
								}
							}
						},*/
						role: 'grid',
						autoBind: false,
						editable: 'inline',
						filterable: { mode: 'row' },
						sortable: true,
						scrollable: true,
						pageable: {
							pageSize: 30, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
							pageSizes: [15, 30, 60],
							refresh: false
						},
						selectable: 'row',
						toolbar: [{ name: 'create', text: 'Add New Distributor' }],
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
								field: 'Name',
								title: 'Network',
								width: 250
							},
							{
								field: 'Image',
								title: 'Logo',
								width: 150
							},
							{
								command: [
									{ name: 'edit', text: '&nbsp;', iconClass: 'fa fa-pencil' }, 
									{ name: 'destroy', text: '&nbsp;', iconClass: 'fa fa-times' }
								], title: '&nbsp;', width: '155px' 
							}
						]
					}
					
				}		
			]
			
		}
	}
});