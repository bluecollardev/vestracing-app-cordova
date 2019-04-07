define({
	name: 'countries',
	id: 'countries', // This can be improved... the double ID reference isn't the greatest
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
			
			var countryGrid = $('#countryGrid').data('kendoGrid');
			
			countryDataSource = new kendo.data.DataSource({
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'api/rest_admin/countries/',
						type: 'GET',
						dataType: 'json',
						beforeSend: function (request) {
							request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
						}
					}
				},
				//pageSize: 30,
				schema: {
					data: 'data',
					model: {
						id: 'country_id'
					}
				},
			});
			
			countryGrid.setDataSource(countryDataSource);
			countryDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'countryGrid',
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
						toolbar: [{ name: 'create', text: 'Add New Country' }],
						columns: [
							/*{	
								field: 'country_id',
								title: 'ID',
								width: 100
							},*/
							{
								field: 'image',
								title: 'Flag',
								filterable: false,
								width: 150
							},
							// TODO: Implement providers
							{
								field: 'name',
								title: 'Country',
								width: 250
							},
							{
								field: 'lat',
								title: 'Latitude',
								width: 150
							},
							{
								field: 'long',
								title: 'Longitude',
								width: 150
							},
							{
								field: 'iso_code_2',
								title: 'ISO Code 2',
								width: 150
							},
							{
								field: 'iso_code_3',
								title: 'ISO Code 3',
								width: 150
							},
							{
								field: 'address_format',
								title: 'Format',
								width: 150
							},
							{
								field: 'postcode_required',
								title: 'Postal Code',
								width: 150
							},
							{
								field: 'status',
								title: 'Status',
								width: 150
							},
							{
								command: [
									{ name: 'edit', text: '&nbsp;', iconClass: 'fa fa-pencil' }, 
									{ name: 'details', text: '&nbsp;', iconClass: 'fa fa-edit' },
									{ name: 'destroy', text: '&nbsp;', iconClass: 'fa fa-times' }
								], title: '&nbsp;', width: '260px' 
							}
						]
					}
				}		
			]
			
		}
	}
});