define({
	name: 'contentArticles',
	id: 'contentArticles',
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
			this.dataBind();
			
			var stringHelpers = App.Helpers.String,
				that = this,
				page = App.getCurrent(),
				moduleElement = $('#' + that.getId()),
				viewModel = that.getViewModel(),
				nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>'),
				articleGrid = $('#articleGrid').data('kendoGrid'),
				articlePopup = $('#articlePopup'),
				articleWindow = articlePopup.data('kendoWindow'),
				articleDataSource,
				articleModules,
				articleModule;
			
			articleGrid.element.on('click', 'k-grid-add, .k-grid-details', function (e) {
				e.preventDefault();
				e.stopPropagation();
				
				var grid = $(e.delegateTarget).data('kendoGrid'),
					uid = $(e.target).closest('tr').attr('data-uid'),
					model = grid.dataSource.getByUid(uid);
					
				// Window widgets append themselves by default to 
				// <body>, even if the appendTo parameter has been
				// specified - Kendo FAIL
				kendo.unbind(articlePopup);
				kendo.bind(articlePopup, viewModel);
				
				articleModules = articlePopup.find('[data-module=catalogProduct]');
				articleModules.each(function () {
					var id = $(this).attr('id');
					articleModule = page.getModule(id);
					
					articleModule.render();
				});
				
				articleWindow.center().open();
			});
			
			articleGrid.element.on('click', '.k-grid-group', function (e) {
				var button = $(this);
				if (button.hasClass('k-state-active')) {
					button.removeClass('k-state-active');
					articleGrid.dataSource.group([]); // Clear groups
				} else {
					button.addClass('k-state-active');
					articleGrid.dataSource.group({ field: 'manufacturer' }); // Group by manufacturer
				}
				
			});
			
			articleDataSource = new kendo.data.DataSource({
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
						var articles = response.data
							results = [];
						
						// TODO: Language stuff
						var langId = 1;
						$.each(articles, function (idx, obj) {
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
			});
			
			articleGrid.setDataSource(articleDataSource);
			articleDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'articleGrid',
					data: {
						role: 'grid',
						autoBind: false,
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
						toolbar: [{ name: 'create', text: 'Add New Article', iconClass: 'fa fa-plus' }, { name: 'group', text: 'Group by Category', iconClass: 'fa fa-sitemap' }],
						columns: [
							{
								template: '<input type="checkbox">',
								width: 50
							},
							/*{
								field: 'product_id',
								title: 'ID',
								width: 100
							},*/
							{
								template: '<div class="image" style="width:75px; height: 75px; background-size: contain; background-image: url(# if (typeof image !== \'undefined\') { # #: image # # } #)"></div>',
								field: 'image',
								title: 'Image',
								filterable: false,
								groupable: false,
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
								groupable: false,
								width: 250
							},
							{
								field: 'sku',
								title: 'SKU',
								groupable: false
							},
							{
								field: 'manufacturer',
								title: 'Manufacturer'
							},
							{
								field: 'price',
								title: 'Price',
								groupable: false,
								format: '{0:c}'
							},
							{
								field: 'quantity',
								title: 'Stock Qty.',
								groupable: false
							},
							{
								field: 'status',
								title: 'Status',
								groupable: false,
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
					}
				},
				{
					tag: 'div',
					id: 'articlePopup',
					name: 'articlePopup',
					class: 'entityPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit Article',
						width: '100%'
					},
					/*children: [
						{
							module: 'catalogProduct',
							config: {
								autoRender: false
							}
						}
					]*/
				}
			]
		}
	}
});