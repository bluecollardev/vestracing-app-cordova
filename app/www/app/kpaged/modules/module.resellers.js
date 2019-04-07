define({
	name: 'resellers',
	id: 'resellers', // This can be improved... the double ID reference isn't the greatest
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
			var	that = this,
				page = App.getCurrent();
				
			that.dataBind(that.getViewModel());
			
			var	resellerPopup = $('#resellerPopup'),
				resellerGrid = $('#resellerGrid').data('kendoGrid'),
				resellerWindow = resellerPopup.data('kendoWindow'),
				resellerModules,
				resellerModule;
			
			resellerGrid.element.on('click', '.k-grid-add, .k-grid-details', function (e) {
				e.preventDefault();
				e.stopPropagation();
				
				resellerModules = resellerPopup.find('[data-module=reseller]');
				resellerModules.each(function () {
					var id = $(this).attr('id');
					resellerModule = page.getModule(id);
					
					resellerModule.render();
				});
				
				resellerWindow.center().open();
			});
			
			resellerDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Tools), {
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
				},
			}));
			
			resellerGrid.setDataSource(resellerDataSource);
			resellerDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'resellerGrid',
					data: {
						role: 'grid',
						autoBind: false,
						editable: 'popup',
						filterable: { mode: 'row' },
						sortable: true,
						scrollable: true,
						pageable: {
							pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
							pageSizes: [10, 25, 50],
							refresh: false
						},
						selectable: 'row',
						toolbar: [{ name: 'create', text: 'Add New Reseller' }],
						columns: [
							{
								field: 'name',
								title: 'Name',
								width: 250
							},
							{
								field: 'email',
								title: 'Email',
								width: 150
							},
							{
								field: 'Membership',
								title: 'Membership',
								width: 200
							},
							{
								field: 'Level',
								title: 'Level',
								width: 200
							},
							{
								field: 'DateAdded',
								title: 'Date Added'
							},
							{
								field: 'status',
								title: 'Status'
							},
							{
								command: [
									{ name: 'approve', text: '&nbsp;', iconClass: 'fa fa-thumbs-up' }, 
									{ name: 'reject', text: '&nbsp;', iconClass: 'fa fa-thumbs-down' },
									{ name: 'details', text: '&nbsp;', iconClass: 'fa fa-edit' },
									{ name: 'destroy', text: '&nbsp;', iconClass: 'fa fa-times' }
								], title: '&nbsp;', width: '300px' 
							}
						]
					}
				},
				{
					tag: 'div',
					id: 'resellerPopup',
					name: 'resellerPopup',
					class: 'entityPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit Reseller',
						width: '100%'
					},
					children: [
						{
							module: 'reseller',
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