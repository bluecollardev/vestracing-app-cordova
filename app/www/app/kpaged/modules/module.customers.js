define({
	name: 'customers',
	id: 'customers',
	autoBind: true,
	autoRender: false,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
				
			if (!dataSources.has('customer')) {
				// Initialize datasources
				dataSources.set('customer', new kendo.data.DataSource({
					transport: {
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/customers/',
							type: 'GET',
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
							id: 'customer_id'
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
			
			var	customerPopup = $('#customerPopup'),
				customerGrid = $('#customerGrid').data('kendoGrid'),
				customerWindow = customerPopup.data('kendoWindow'),
				customerModules,
				customerModule;
			
			customerGrid.element.on('click', '.k-grid-add, .k-grid-details', function (e) {
				var uid, model;
				
				e.preventDefault();
				e.stopPropagation();
				
				// TODO: Turn this into a helper?
				uid = $(e.target).closest('tr').attr('data-uid'),
				model = customerGrid.dataSource.getByUid(uid);
				console.log(model);
				
				customerModules = customerPopup.find('[data-module=customer]');
				customerModules.each(function () {
					var id = $(this).attr('id');
					customerModule = page.getModule(id);
					
					customerModule.render();
				});
				
				customerWindow.center().open();
			});
			
			customerDataSource = page.getDataSources().get('customer');
			
			customerGrid.setDataSource(customerDataSource);
			customerDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'fieldset',
			children: [
				{
					tag: 'div',
					id: 'customerGrid',
					data: {
						role: 'grid',
						autoBind: false,
						editable: 'inline',
						filterable: { mode: 'row' },
						sortable: true,
						scrollable: true,
						selectable: 'row',
						pageable: {
							pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
							pageSizes: [10, 25, 50],
							refresh: true
						},
						toolbar: [{ name: 'create', text: 'Add New Customer' }],
						columns: [
							/*{
								field: 'customer_id',
								title: 'ID',
								width: 100
							},*/
							{
								field: 'name',
								title: 'Name',
								width: 250
							},
							/*{
								template: '#: customer_group #',
								field: 'customer_group_id',
								title: 'Group',
								width: 100
							},*/
							{
								field: 'email',
								title: 'Email',
								width: 150
							},
							{
								field: 'Phone',
								title: 'Phone',
								width: 150
							},
							{
								field: 'Address',
								title: 'Address'
							},
							{
								//field: 'postcode',
								title: 'Postal Code'
							},
							{
								field: 'status',
								title: 'Status'
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
				},
				{
					tag: 'div',
					id: 'customerPopup',
					name: 'customerPopup',
					class: 'entityPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit Customer',
						width: '100%'
					},
					children: [
						{
							module: 'customer',
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