define({
	name: 'orders',
	id: 'orders', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
				
			if (!dataSources.has('transaction.order')) {
				// Initialize datasources
				dataSources.set('transaction.order', new kendo.data.DataSource({
					transport: {
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/orders/',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						update: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/orders/',
							type: 'PUT',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						// TODO: Delete requires some packaging
						destroy: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/orders/',
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
							id: 'order_id'
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
			var	that = this,
				page = App.getCurrent();
			
			that.dataBind(that.getViewModel());
			
			var	orderPopup = $('#orderPopup'),
				orderGrid = $('#orderGrid').data('kendoGrid'),
				orderWindow = orderPopup.data('kendoWindow'),
				orderModules,
				orderModule;
			
			orderGrid.element.on('click', '.k-grid-add, .k-grid-details', function (e) {
				var uid, model;
				
				e.preventDefault();
				e.stopPropagation();
				
				// TODO: Turn this into a helper?
				uid = $(e.target).closest('tr').attr('data-uid'),
				model = orderGrid.dataSource.getByUid(uid);
				console.log(model);
				
				orderModules = orderPopup.find('[data-module=order]');
				orderModules.each(function () {
					var id = $(this).attr('id');
					orderModule = page.getModule(id);
					
					orderModule.render();
				});
				
				orderWindow.center().open();
			});
			
			orderDataSource = page.getDataSources().get('transaction.order');
			
			orderGrid.setDataSource(orderDataSource);
			orderDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'fieldset',
			children: [
				{
					tag: 'div',
					id: 'orderGrid',
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
							refresh: false
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
								], title: '&nbsp;', width: '155px' 
							}
						]
					}
				},
				{
					tag: 'div',
					id: 'orderPopup',
					name: 'orderPopup',
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