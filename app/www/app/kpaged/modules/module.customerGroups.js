define({
	name: 'customerGroups',
	id: 'customerGroups', // This can be improved... the double ID reference isn't the greatest
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
			
			var nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>');
			
			var customerGroupGrid = $('#groupGrid').data('kendoGrid');
			
			customerGroupDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Tools), {
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'api/rest_admin/customergroups/',
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
						id: 'customer_group_id'
					}
				},
			}));
			
			// TODO: This is f***ing implemented differently
			customerGroupGrid.setDataSource(customerGroupDataSource);
			customerGroupDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'groupGrid',
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
						toolbar: [{ name: 'create', text: 'Add New Group' }],
						columns: [
							{
								field: 'customer_group_id',
								title: 'ID',
							},
							{
								field: 'name',
								title: 'Group Name'
							},
							{
								field: 'description',
								title: 'Description'
							},
							{
								field: 'sort_order',
								title: 'Sort Order',
								filterable: false,
								width: 125
							},
							// TODO: Languag is messed up
							/*{
								field: 'language_id',
								title: 'Language'
							},*/
							{
								field: 'status',
								title: 'Status'
							},
							{ command: [ { text: 'Details' }, { name: 'destroy'} ], title: '&nbsp;', width: '280px' }
						]
					}
				},
				{
					tag: 'div',
					id: 'groupAssignPopup',
					name: 'groupAssignPopup',
					class: 'entityPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Assign/Unassign Customers',
						width: '100%'
					},
					/*children: [
						{
							module: 'product'
						}
					]*/
				}
			]
		}
	}
});