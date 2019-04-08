define({
	name: 'downloads',
	id: 'downloads', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
				
			if (!dataSources.has('customer.download')) {
				// Initialize datasources
				dataSources.set('customer.download', new kendo.data.DataSource({
					/*transport: {
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/downloads/',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						update: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/downloads/',
							type: 'PUT',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						// TODO: Delete requires some packaging
						destroy: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/downloads/',
							type: 'DELETE',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						}
					},*/
					data: [
						{ download_id: 1, filename: App.getConfig('baseUrl') + 'vendor/opencart/upload/system/download/' + 'ajx07sep.zip.c76253899d5416b59d1427e88b04777b', mask: 'ajx07sep.zip', date_added: '2015-09-27 21:08:12' }
					],
					pageSize: 30,
					schema: {
						//data: 'data',
						model: {
							id: 'download_id'
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
				moduleElement = $('#' + that.getId()),
				page = that.getPage(),
				dataSources = page.getDataSources(),
				downloadPopup = $('#downloadPopup'),
				downloadWindow = downloadPopup.data('kendoWindow'),
				downloadModules,
				downloadModule,
				downloadGrid;
			
			that.dataBind(that.getViewModel());
			
			that.downloadGrid = downloadGrid = moduleElement.find('[name=downloadGrid]').first().data('kendoGrid');
			console.log(downloadGrid);
			downloadGrid.setDataSource(new kendo.data.DataSource({
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'api/rest/customerdownloads/',
						type: 'GET',
						dataType: 'json',
						beforeSend: function (request) {
							var customer = dataSources.get('customer.entity') || null;

							request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
							request.setRequestHeader('X-Oc-Merchant-Language', 'en');
							
							if (customer) {
								console.log('session: ' + page.getAuthHandler().getSession());
								request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
							}
						}
					}
				},
				schema: {
					parse: function (response) {
						var results = [],
							data;
						
						if (response.success && response.hasOwnProperty('data')) {
							data = response.data.downloads;
							
							$.each(data, function (idx, obj) {
								var row = obj,
									product;
								
								// TODO: We should make this generic so the module is useful for systems other than OpenCart
								// Some kind of entity mapping?
								if (row.hasOwnProperty('product') && row.product !== null) {
									product = row.product;
									
									// Map the properties to the main object
									row.image = product.image;
									row.product = product.name;
									row.manufacturer = product.manufacturer;
									row.model = product.model;
									
									// TODO: Row options for tracks and dates
								}
								
								results.push(row);
								row = null;
							});
						}
						
						return results;
					},
					total: function (response) {
						return (response.success && response.hasOwnProperty('data')) ? response.data.downloads.length : 0;
					},
					model: {
						id: 'download_id',
						fields: {
							download_id: { type: 'number', editable: false },
							date_added: { type: 'date', editable: false, nullable: true },
							product: { type: 'string', editable: true, nullable: true },
							name: { type: 'string', editable: true, nullable: true },
							size: { type: 'string', editable: false, nullable: true },
							href: { type: 'string', editable: false, nullable: true },
							model: { type: 'string', editable: false, nullable: true },
							thumb: { field: 'image', editable: false, nullable: true }
							/*thumb: { field: 'thumb', editable: false, nullable: true },
							option: { field: 'option', editable: false, nullable: true },
							quantity: { field: 'quantity', type: 'number', editable: false, nullable: true },
							stock: { field: 'stock', type: 'number', editable: false, nullable: true },
							reward: { field: 'reward', type: 'number', editable: false, nullable: true },
							price: { field: 'price', type: 'number', editable: false, nullable: true },
							total: { field: 'total', type: 'number', editable: false, nullable: true }*/
						}
					}
				},
				//batch: true,
				pageSize: 10,
				/*aggregate: [{ field: 'quantity', aggregate: 'sum' }, { field: 'reward', aggregate: 'sum' }, { field: 'total', aggregate: 'sum' }]*/
			}));
			
			downloadGrid.bind('edit', function (e) {
				downloadGrid.element.find('.k-grid-update').html('<span class="fa fa-check k-update"></span>');
				downloadGrid.element.find('.k-grid-cancel').html('<span class="fa fa-ban k-cancel"></span>');
			});
			
			downloadGrid.dataSource.read();
			console.log('download ds');
			console.log(downloadGrid.dataSource);
			
			downloadGrid.element.on('click', '.k-grid-add, .k-grid-details', function (e) {
				var uid, model;
				
				e.preventDefault();
				e.stopPropagation();
				
				// TODO: Turn this into a helper?
				uid = $(e.target).closest('tr').attr('data-uid'),
				model = downloadGrid.dataSource.getByUid(uid);
				console.log(model);
				
				downloadModules = downloadPopup.find('[data-module=download]');
				downloadModules.each(function () {
					var id = $(this).attr('id');
					downloadModule = page.getModule(id);
					
					downloadModule.render();
				});
				
				//downloadWindow.center().open();
			});
			
			//downloadDataSource = page.getDataSources().get('customer.download');
			//downloadGrid.setDataSource(downloadDataSource);
			//downloadDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'fieldset',
			children: [
				{
					tag: 'div',
					name: 'downloadGrid',
					class: 'downloadGrid',
					data: {
						role: 'grid',
						autoBind: false,
						editable: false,
						//toolbar: [{ name: 'save', iconClass: 'fa fa-check' }, { name: 'cancel', iconClass: 'fa fa-ban' }],
						filterable: { mode: 'row' },
						sortable: true,
						scrollable: false,
						pageable: {
							pageSize: 10,
							refresh: true
						},
						selectable: true, 
						columns: [
							/*{
								template: '<input type="checkbox">',
								width: 50
							},*/
							{
								template: '<div class="image" style="width:75px; height: 75px; background-size: contain; background-image: url(# if (typeof thumb !== \'undefined\') { # #: thumb # # } #)"></div>',
								field: 'thumb',
								title: '&nbsp;',
								filterable: false,
								groupable: false,
								width: 100
							},
							{
								field: 'model',
								title: 'Model',
							},
							{
								field: 'product',
								title: 'Filename',
								template: '#= product ? product : \'\' #'
								//template: '#= data.href ? \'<a href="\' + data.href + \'">\' + name + \'</a>\' : name #'
							},
							{
								field: 'size',
								title: 'Size',
								template: '#= size ? size : \'\' #'
							},
							{
								field: 'href',
								title: 'Link',
								template: '#= href ? href : \'\' #'
							},
							/*{
								field: 'option',
								title: 'Options'
							},*/
							/*{
								field: 'price',
								title: 'Price',
								template: '#= kendo.toString(price, "c") #'
							},
							{
								field: 'quantity',
								title: 'Qty.',
								aggregates: ['sum'], 
								footerTemplate: '<p class="total-line-item">#= data.quantity ? kendo.toString(data.quantity.sum, "n0") : kendo.toString(0, "n0") #</p>'
							},
							{
								field: 'reward',
								title: 'Points',
								aggregates: ['sum'], 
								footerTemplate: '<p class="total-line-item">#= data.reward ? kendo.toString(data.reward.sum, "n0") : kendo.toString(0, "n0") #</p>'
							},
							{
								field: 'total',
								title: 'Total',
								template: '#= kendo.toString(total, "c") #',
								aggregates: ['sum'], 
								footerTemplate: '<p class="total-line-item"><label>Sub-total </label>#= data.total ? kendo.toString(data.total.sum, "c") : kendo.toString(0, "c") #</p><p class="total-line-item"><label>Total </label>#= data.total ? kendo.toString(data.total.sum, "c") : kendo.toString(0, "c") #</p>'
							},*/
							/*{
								field: 'download_id',
								title: 'ID',
								//locked: true,
								//lockable: false,
								width: 100
							},
							{
								field: 'mask',
								title: 'File Name',
								width: 200
							},
							{
								field: 'date_added',
								title: 'Date'
							},*/
							/*{
								command: [
									{ name: 'details', text: '&nbsp;', iconClass: 'fa fa-eye' },
									{ name: 'download', text: '&nbsp;', iconClass: 'fa fa-cloud-download' },
									{ name: 'print', text: '&nbsp;', iconClass: 'fa fa-print' },
								], title: '&nbsp;', width: '260px' 
							}*/
							{
								command: [
									{ name: 'details', text: '&nbsp;View', iconClass: 'fa fa-eye' },
									{ name: 'download', text: '&nbsp;Download', iconClass: 'fa fa-cloud-download' },
									{ name: 'print', text: '&nbsp;Print', iconClass: 'fa fa-print' },
								], title: '&nbsp;', width: '470px' 
							}
						]
					}
				},
				{
					tag: 'div',
					id: 'downloadPopup',
					name: 'downloadPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'View File',
						width: '100%'
					}
				}
			]
		}
	}
});