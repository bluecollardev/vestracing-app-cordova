define({
	name: 'users',
	id: 'users',
	autoBind: true,
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
			
			var	userPopup = $('#userPopup'),
				userGrid = $('#userGrid').data('kendoGrid'),
				userWindow = userPopup.data('kendoWindow'),
				userModules,
				userModule;
			
			userGrid.element.on('click', '.k-grid-add, .k-grid-details', function (e) {
				e.preventDefault();
				e.stopPropagation();
				
				userModules = userPopup.find('[data-module=user]');
				userModules.each(function () {
					var id = $(this).attr('id');
					userModule = page.getModule(id);
					
					userModule.render();
				});
				
				userWindow.center().open();
			});
			
			userDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Tools), {
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
			
			userGrid.setDataSource(userDataSource);
			userDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'fieldset',
			children: [
				{
					tag: 'div',
					id: 'userGrid',
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
						toolbar: [{ name: 'create', text: 'Add New User' }],
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
							{
								template: '#: customer_group #',
								field: 'customer_group_id',
								title: 'Group',
								width: 100
							},
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
					id: 'userPopup',
					name: 'userPopup',
					class: 'entityPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit User',
						width: '100%'
					},
					children: [
						{
							module: 'user',
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