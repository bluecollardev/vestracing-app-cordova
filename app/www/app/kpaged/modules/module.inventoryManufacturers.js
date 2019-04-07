define({
	name: 'inventoryManufacturers',
	id: 'inventoryManufacturers', // This can be improved... the double ID reference isn't the greatest
	autoBind: true, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources(),
				stringHelpers = App.Helpers.String;
				
			if (!dataSources.has('inventory.manufacturer')) {
				// Initialize datasources
				dataSources.set('inventory.manufacturer', new kendo.data.DataSource({
					transport: {
						create: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/manufacturers/',
							type: 'PUT',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/manufacturers/',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						update: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/manufacturers/',
							type: 'PUT',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						// TODO: Delete requires some packaging
						destroy: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/manufacturers/',
							type: 'DELETE',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						}
					},
					pageSize: 30,
					schema: {
						data: 'data',
						model: {
							id: 'manufacturer_id'
						}
					}
				}));
			}
			
			if (!dataSources.has('inventory.model')) {
				// Initialize datasources
				dataSources.set('inventory.model', new kendo.data.DataSource({
					transport: {
						create: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/bulk_products/',
							type: 'PUT',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/products/',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						update: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/bulk_products/',
							type: 'PUT',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						// TODO: Delete requires some packaging
						destroy: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/bulk_products/',
							type: 'DELETE',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						}
					},
					pageSize: 30,
					batch: true,
					schema: {
						model: {
							id: 'id'
						},
						parse: function (response) {
							// Product descriptions can exist for more than one language
							var products = response.data,
								results = [];
							
							// TODO: Language stuff
							var langId = 1;
							$.each(products, function (idx, obj) {
								var row = obj,
									description;
								
								// TODO: We should make this generic so the module is useful for systems other than OpenCart
								// Some kind of entity mapping?
								if (row.hasOwnProperty('product_description')) {
									description = row.product_description[langId];
									
									// Map the properties to the main object
									for (var prop in description) {
										row[prop] = stringHelpers.decodeHtmlEntities(description[prop]);
									}
								}
								
								results.push(row);
								row = null;
							});
							
							return results;
						}
					}
				}));
			}
		},
		pageLoaded: function (e) {
			var	that = this,
				page = App.getCurrent(),
				eventHandler = that.getEventHandler();
			
			//eventHandler.dispatch('rendered');
		},
		rendered: function (e) {			
			this.dataBind();
			
			var stringHelpers = App.Helpers.String,
				that = this,
				page = App.getCurrent(),
				moduleElement = $('#' + that.getId()),
				manufacturerGrid = $('#manufacturerGrid').data('kendoGrid');
			
			manufacturerGrid.element.on('click', '.nestedDetailGrid .k-grid-add', function (e) {
				e.preventDefault();
				
				var popup = $('#modelPopup').data('kendoWindow');
				popup.center().open();
			});
			
			var nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>');
			
			var manufacturerGridDetailInit = function (e) {
				var detailRow = e.detailRow;
				
				var modelDataSource = page.getDataSources().get('inventory.model');
				modelDataSource.filter({ field: 'manufacturer', operator: 'eq', value: e.data.name });

				detailRow.find('.nestedDetailGrid').each(function (idx) {
					var modelGrid = $(this).kendoGrid({
						dataSource: modelDataSource,
						//autoBind: false,
						scrollable: false,
						sortable: true,
						pageable: false,
						editable: 'inline',
						toolbar: ['create', /*'save', 'cancel',*/ 'destroy'],
						columns: [
							/*{
								field: 'product_id',
								title: 'ID',
								width: 100
							},*/
							{
								template: '<div class="image" style="width:75px; height: 75px; background-size: contain; background-image: url(# if (typeof image !== \'undefined\') { # #: image # # } #)"></div>',
								field: 'image',
								title: 'image',
								width: 100
							},
							/*{
								field: 'ProviderID',
								title: 'Provider ID',
								width: 100
							},*/
							{
								field: 'name',
								title: 'Name',
								width: 250
							},
							{
								field: 'sku',
								title: 'SKU'
							},
							{
								field: 'cost',
								title: 'Cost',
								format: '{0:c}'
							},
							{
								field: 'price',
								title: 'Price',
								format: '{0:c}'
							},
							{
								field: 'quantity',
								title: 'Stock Qty.'
							},
							{
								field: 'status',
								title: 'Status',
								width: 125
							},
							{
								command: [
									{ name: 'edit', text: '&nbsp;', iconClass: 'fa fa-pencil' }, 
									{ name: 'details', text: '&nbsp;', iconClass: 'fa fa-edit' },
									{ name: 'destroy', text: '&nbsp;', iconClass: 'fa fa-times' }
								], title: '&nbsp;', width: '260px' 
							}
						]
					}).data('kendoGrid');
					
					modelGrid.dataSource.read();
				});
			};
			
			manufacturerGrid.setOptions({
				detailTemplate: kendo.template(nestedDetailGridDetail.html()),
				detailInit: manufacturerGridDetailInit,
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
				toolbar: [{ name: 'create', text: 'Add New Manufacturer' }],
				columns: [
					/*{	
						field: 'manufacturer_id',
						title: 'ID',
						width: 100
					},*/
					// TODO: Implement providers
					{
						template: '<div class="image" style="width:75px; height: 75px; background-size: contain; background-image: url(# if (typeof image !== \'undefined\') { # #: image # # } #)"></div>',
						field: 'image',
						title: 'Logo',
						filterable: false,
						width: 100
					},
					{
						field: 'name',
						title: 'Brand'
					},
					{
						field: 'sort_order',
						title: 'Sort Order',
						filterable: false,
						width: 125
					},
					{
						command: [
							{ name: 'edit', text: '&nbsp;', iconClass: 'fa fa-pencil' }, 
							//{ name: 'details', text: '&nbsp;', iconClass: 'fa fa-edit' },
							{ name: 'destroy', text: '&nbsp;', iconClass: 'fa fa-times' }
						], title: '&nbsp;', width: '155px' 
					}
				]
			});
			
			manufacturerDataSource = page.getDataSources().get('inventory.manufacturer');
			
			manufacturerGrid.setDataSource(manufacturerDataSource);
			manufacturerDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'manufacturerGrid',
					data: {
						role: 'grid'
					}
				},
				{
					tag: 'div',
					id: 'modelPopup',
					name: 'modelPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit Product/Model',
						width: '100%'
					},
					children: [
						{
							tag: 'fieldset',
							id: 'general-information',
							legend: 'General Information'
						}
					]
				}
			]
		}
	}
});