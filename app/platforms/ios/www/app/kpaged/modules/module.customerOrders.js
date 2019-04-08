define({
	name: 'customerOrders',
	id: 'customerOrders', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	// TODO: Add setCustomer method
	getCollection: function () {
		var that = this,
			page = that.getPage(),
			dataSources = page.getDataSources();
				
		if (dataSources.has('customer.entity')) customer = dataSources.get('customer.entity');
		
		// TODO: A better check....
		if (typeof customer !== 'undefined' && customer !== null) {
			// Check session
			
			// Set datasource
			if (!dataSources.has('customer.transaction.order')) {
				// Initialize datasources
				dataSources.set('customer.transaction.order', new kendo.data.DataSource({
					transport: {
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest/customerorders/',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
								console.log('fetching customer orders');
								if (customer) {
									console.log('session: ' + page.getAuthHandler().getSession());
									request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
								}
							}
						}
					},
					pageSize: 30,
					schema: {
						parse: function (response) {
							if (response.success) {
								if (response.hasOwnProperty('data')) {
									return response.data.orders;
								}
							}
						},
						model: {
							id: 'order_id'
						}
					}
				}));
			}
			
			var ordersDataSource = dataSources.get('customer.transaction.order');
			that.customerOrderGrid.setDataSource(ordersDataSource);
			ordersDataSource.read();
		}
		
		return that;
		
	},
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
				
			// Register any custom methods
			that.getCollection = that.getConfig().getCollection;
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
			
			var	customerOrderPopup = $('#customerOrderPopup'),
				customerOrderGrid = $('[name=customerOrderGrid]').first().data('kendoGrid'),
				customerOrderWindow = customerOrderPopup.data('kendoWindow'),
				customerOrderModules,
				customerOrderModule;
				
			that.customerOrderGrid = customerOrderGrid;
			
			// TODO: Only if we autoBind?
			customerOrderGrid.element.on('click', '.k-grid-add, .k-grid-details', function (e) {
				var uid, model;
				
				e.preventDefault();
				e.stopPropagation();
				
				// TODO: Turn this into a helper?
				uid = $(e.target).closest('tr').attr('data-uid'),
				model = customerOrderGrid.dataSource.getByUid(uid);
				console.log(model);
				
				customerOrderModules = customerOrderPopup.find('[data-module=customerOrder]');
				customerOrderModules.each(function () {
					var id = $(this).attr('id');
					customerOrderModule = page.getModule(id);
					
					customerOrderModule.render();
				});
				
				customerOrderWindow.center().open();
			});
		}
	},
	layout: {
		templates: {
			tag: 'fieldset',
			children: [
				{
					tag: 'div',
					name: 'customerOrderGrid',
					data: {
						role: 'grid',
						autoBind: false,
						editable: false,
						filterable: { mode: 'row' },
						sortable: true,
						scrollable: true,
						pageable: {
							pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
							pageSizes: [10, 25, 50],
							refresh: true
						},
						selectable: 'row',
						toolbar: [{ name: 'create', text: 'Create New Order' }],
						columns: [
							{
								field: 'order_id',
								title: 'ID',
								//locked: true,
								//lockable: false,
								width: 100
							},
							{
								field: 'invoice_no',
								title: 'Reference No.',
								width: 200
							},
							{
								field: 'name',
								title: 'Customer',
								width: 250
							},
							{
								field: 'date_added',
								title: 'Date'
							},
							{
								field: 'products',
								title: 'Items'
							},
							{
								field: 'total',
								title: 'Total'
							},
							{
								field: 'status',
								title: 'Status'
							},
							{
								command: [
									{ name: 'details', text: '&nbsp;', iconClass: 'fa fa-edit' },
									{ name: 'destroy', text: '&nbsp;', iconClass: 'fa fa-times' }
								], title: '&nbsp;', width: '180px' 
							}
						]
					}
				},
				{
					tag: 'div',
					id: 'customerOrderPopup',
					name: 'customerOrderPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit Order',
						width: '100%'
					},
					children: [
						{
							module: 'order',
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