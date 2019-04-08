define({
	name: 'inventoryFeeds',
	id: 'inventoryFeeds', // This can be improved... the double ID reference isn't the greatest
	autoBind: true, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
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
			var	that = this,
				page = App.getCurrent();
			
			that.dataBind(that.getViewModel());
			
			var stringHelpers = App.Helpers.String,
				moduleElement = $('#' + that.getId()),
				viewModel = that.getViewModel(),
				//nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>'),
				feedGrid = $('#feedGrid').data('kendoGrid'),
				feedPopup = $('#feedPopup'),
				feedWindow = feedPopup.data('kendoWindow'),
				feedDataSource,
				feedModules,
				feedModule;
			
			feedGrid.element.on('click', '.k-grid-add, .k-grid-manage', function (e) {
				e.preventDefault();
				e.stopPropagation();
				
				feedModules = feedPopup.find('[data-module=inventoryFeed]');
				feedModules.each(function () {
					var id = $(this).attr('id');
					feedModule = page.getModule(id);
					
					feedModule.render();
				});
				
				feedWindow.center().open();
			});
			
			feedGrid.element.on('click', '.k-grid-sync', function (e) {
				$.ajax({
					url: '/quickcommerce/public/index.php/import/from/feed'
				});
			});
			
			var nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>');
			
			var feedGridDetailInit = function (e) {
				var detailRow = e.detailRow;
				
				var modelDataSource = new kendo.data.DataSource({
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
										if (description.hasOwnProperty(prop)) {
											row[prop] = stringHelpers.decodeHtmlEntities(description[prop]);
										}
									}
								}
								
								results.push(row);
								row = null;
							});
							
							return results;
						}
					},
					// TODO: Filter by feed_id, need to implement feeds in OC first
					//filter: { field: 'manufacturer', operator: 'eq', value: e.data.name }
				});

				detailRow.find('.nestedDetailGrid').each(function (idx) {
					var modelGrid = $(this).kendoGrid({
						dataSource: modelDataSource,
						editable: 'inline',
						filterable: { mode: 'row' },
						groupable: false,
						sortable: true,
						scrollable: true,
						pageable: {
							pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
							pageSizes: [10, 25, 50],
							refresh: false
						},
						selectable: 'row',
						toolbar: [
							{ name: 'enable', text: 'Enable', iconClass: 'fa fa-check' }, 
							{ name: 'disable', text: 'Disable', iconClass: 'fa fa-times' }, 
							{ name: 'groupByManufacturer', text: 'Group by Manufacturer', iconClass: 'fa fa-wrench' }, 
							{ name: 'groupByCategory', text: 'Group by Category', iconClass: 'fa fa-tags' }
						],
						columns: [
							/*{
								field: 'product_id',
								title: 'ID',
								width: 100
							},*/
							{
								template: '<input type="checkbox">',
								width: 50
							},
							{
								template: '<div class="image" style="width:75px; height: 75px; background-size: contain; background-image: url(# if (typeof image !== \'undefined\') { # #: image # # } #)"></div>',
								field: 'image',
								title: 'Default Image',
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
								field: 'manufacturer',
								title: 'Manufacturer',
								width: 200
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
								title: 'Store Price',
								format: '{0:c}'
							},
							{
								field: 'quantity',
								title: 'Stock Qty.'
							},
							{
								field: 'available',
								title: 'Available'
							},
							{
								field: 'status',
								title: 'Status',
								width: 125
							},
							{
								command: [
									{ name: 'enable', text: '&nbsp;', iconClass: 'fa fa-check' }, 
									{ name: 'disable', text: '&nbsp;', iconClass: 'fa fa-ban' }, 
									{ name: 'edit', text: '&nbsp;', iconClass: 'fa fa-pencil' },
									{ name: 'manage', text: '&nbsp;', iconClass: 'fa fa-gear' }
								], title: '&nbsp;', width: '300px'
							}
						]
					}).data('kendoGrid');
					
					modelGrid.element.on('click', '.k-grid-groupByManufacturer', function (e) {
						e.stopPropagation();
						
						var button = $(this);
						if (button.hasClass('k-state-active')) {
							button.removeClass('k-state-active');
							modelGrid.dataSource.group([]); // Clear groups
						} else {
							button.addClass('k-state-active');
							modelGrid.dataSource.group({ field: 'manufacturer' }); // Group by manufacturer
						}
						
					});
					
					modelGrid.element.on('click', '.k-grid-groupByCategory', function (e) {
						e.stopPropagation();
						
						var button = $(this);
						if (button.hasClass('k-state-active')) {
							button.removeClass('k-state-active');
							modelGrid.dataSource.group([]); // Clear groups
						} else {
							button.addClass('k-state-active');
							modelGrid.dataSource.group({ field: 'manufacturer' }); // Group by manufacturer
						}
						
					});
					
					modelGrid.dataSource.read();
				});
			};
			
			feedGrid.setOptions({
				detailTemplate: kendo.template(nestedDetailGridDetail.html()),
				detailInit: feedGridDetailInit,
				autoBind: false,
				editable: false,
				filterable: { mode: 'row' },
				sortable: true,
				scrollable: true,
				pageable: {
					pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
					pageSizes: [10, 25, 50],
					refresh: false
				},
				selectable: 'row',
				toolbar: [{ name: 'create', text: 'Add New Feed' }],
				columns: [
					/*{	
						field: 'feed_id',
						title: 'ID',
						width: 100
					},*/
					// TODO: Implement providers
					{
						field: 'name',
						title: 'Provider'
					},
					{
						field: 'name',
						title: 'Feed Name'
					},
					{
						field: 'type',
						title: 'Type'
					},
					{
						field: 'serviceType',
						title: 'Service Type'
					},
					{
						field: 'status',
						title: 'Status'
					},
					{
						command: [
							{ name: 'enable', text: '&nbsp;', iconClass: 'fa fa-check' }, 
							{ name: 'disable', text: '&nbsp;', iconClass: 'fa fa-ban' },
							{ name: 'manage', text: '&nbsp;', iconClass: 'fa fa-gear' },
							{ name: 'sync', text: '&nbsp;', iconClass: 'fa fa-refresh' }
						], title: '&nbsp;', width: '300px' 
					}
				],
				/*toolbar: [{ name: 'create', text: 'Add New Feed' }],
				columns: [
					{
						field: 'Provider',
						title: 'Provider',
						width: 200
					},
					{
						field: 'URL',
						title: 'URL',
						width: 200
					},
					{
						field: 'ProductCount',
						title: 'Products Available',
						width: 200
					},
					{
						field: 'ActiveProductCount',
						title: 'Active Products',
						width: 200
					},
					{
						field: 'Status',
						title: 'Status'
					},
					{ command: [ { text: 'Details' }, { name: 'destroy'} ], title: '&nbsp;', width: '280px' }
				]*/
			});
			
			feedDataSource = new kendo.data.DataSource({
				data: [
					{ feed_id: 1, name: 'QuickBooks Online', type: 'JSON', serviceType: 'REST', status: 1 },
					{ feed_id: 2, name: 'WYNIT FTP', type: 'XML', serviceType: 'FTP', status: 1 },
					{ feed_id: 3, name: 'Chris Coffee Service', type: 'XML', serviceType: 'SOAP', status: 1 },
					{ feed_id: 4, name: 'UnlockBase', type: 'XML', serviceType: 'SOAP', status: 1 },
					{ feed_id: 5, name: 'eBay', type: 'XML', serviceType: 'SOAP', status: 1 },
					{ feed_id: 6, name: 'Amazon', type: 'XML', serviceType: 'SOAP', status: 1 }
				],
				/*transport: {
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
				},*/
				pageSize: 30,
				schema: {
					//data: 'data',
					model: {
						//id: 'manufacturer_id'
						id: 'feed_id'
					}
				}
			});
			
			feedGrid.setDataSource(feedDataSource);
			feedDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'feedGrid',
					data: {
						role: 'grid'
					}
				},
				{
					tag: 'div',
					id: 'feedOrderPopup',
					name: 'feedOrderPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Create Purchase Order',
						width: '100%'
					},
					children: [
						{
							tag: 'fieldset',
							id: 'general-information',
							legend: 'General Information'
						}
					]
				},
				{
					tag: 'div',
					id: 'feedPopup',
					name: 'feedPopup',
					class: 'entityPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit Feed Settings',
						width: '100%',
						height: '80%'
					},
					children: [
						{
							module: 'inventoryFeed',
							config: {
								autoRender: false
							}
						}
					]
				}
			]
		}
	}
});