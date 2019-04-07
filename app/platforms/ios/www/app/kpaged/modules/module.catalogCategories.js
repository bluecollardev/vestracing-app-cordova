define({
	name: 'catalogCategories',
	id: 'catalogCategories',
	autoBind: true, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources(),
				stringHelpers = App.Helpers.String;
				
			if (!dataSources.has('catalog.categoryTree')) {
				// Initialize datasources
				dataSources.set('catalog.categoryTree', new kendo.data.TreeListDataSource({
					transport: {
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/categories/level/3',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						}
					},
					schema: {
						parse: function (response) {
							// Flatten the data so it works with the TreeListDataSource
							// TODO: At some point, mod the REST API so it returns a flattened data set
							var categories = response.data.categories,
								results = [];
								
							// Push root category
							results.push({ 
								name: 'Catalog', 
								description: 'All Categories',
								sort_order: 0,
								meta_title: '',
								meta_description: '',
								meta_keyword: '',
								language_id: 1,
								image: null,
								parentId: null,
								id: 0
							});
							
							var flattenCategories = function (categories, parentId, langIdx) {
								$.each(categories, function (id, obj) {
									var row = obj[langIdx], // [0] for english (language id)
										children;
									
									row.parentId = (parentId > 0) ? parentId : 0;
									row.id = row.category_id;
									row.name = stringHelpers.decodeHtmlEntities(row.name);
									row.description = stringHelpers.decodeHtmlEntities(row.description);
									delete row.category_id;
									
									if (row.hasOwnProperty('categories') && row.categories !== null) {
										children = row.categories.categories;
										flattenCategories(children, id, langIdx);
									}
									
									delete row.categories;
									
									results.push(row);
									row = null;
								});
							};
							
							flattenCategories(categories, 0, 0);
							console.log('cats');
							console.log(results);
							return results;
						},					
						model: {
							//id: 'category_id',
							//parentId: 'parent_id',
							id: 'id',
							//parentId: 'parentId',
							// TODO: Something is up with this field config
							/*fields: {
								id: { editable: false, nullable: true },
								parentId: { type: 'number', editable: true },
								image: { type: 'string', editable: true, nullable: true },
								name: { type: 'string', editable: true, nullable: true }, 
								description: { type: 'string', editable: true, nullable: true },
								language_id: { type: 'number', editable: true, nullable: true },
								meta_description: { type: 'string', editable: true, nullable: true },
								meta_keyword: { type: 'string', editable: true, nullable: true },
								meta_title: { type: 'string', editable: true, nullable: true },
								sort_order: { type: 'number', editable: true, nullable: true }
							}*/
						}
					}
				}));
			}

			if (!dataSources.has('catalog.category')) {			
				// Initialize datasources
				dataSources.set('catalog.category', new kendo.data.DataSource({
					transport: {
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest/categories/level/2',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
							}
						}
					},
					/*filter: {
						
					},*/
					schema: {
						parse: function (response) {
							var categories = response.data,
								results = [];
							
							var flattenCategories = function (categories, parentId) {
								$.each(categories, function (idx, obj) {
									var row = obj,
										children;
									
									row.parentId = (parentId > 0) ? parentId : 0;
									row.id = row.category_id;
									row.name = stringHelpers.decodeHtmlEntities(row.name);
									row.description = stringHelpers.decodeHtmlEntities(row.description);
									delete row.category_id;
									
									if (row.hasOwnProperty('categories') && row.categories !== null) {
										children = row.categories;
										flattenCategories(children, row.id);
									}
									
									delete row.categories;
									
									results.push(row);
									row = null;
								});
							};
							
							flattenCategories(categories, 0);
							
							return results;
						},					
						model: {
							//id: 'category_id',
							//parentId: 'parent_id',
							id: 'id',
							//parentId: 'parentId',
							// TODO: Something is up with this field config
							/*fields: {
								id: { editable: false, nullable: true },
								parentId: { type: 'number', editable: true },
								image: { type: 'string', editable: true, nullable: true },
								name: { type: 'string', editable: true, nullable: true }, 
								description: { type: 'string', editable: true, nullable: true },
								language_id: { type: 'number', editable: true, nullable: true },
								meta_description: { type: 'string', editable: true, nullable: true },
								meta_keyword: { type: 'string', editable: true, nullable: true },
								meta_title: { type: 'string', editable: true, nullable: true },
								sort_order: { type: 'number', editable: true, nullable: true }
							}*/
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
				categoryTreeList = $('#categoryTreeList').data('kendoTreeList'),
				categoryDataSource;
			
			categoryDataSource = page.getDataSources().get('catalog.categoryTree');
			
			categoryTreeList.bind('dataBound', function (e)  {
				categoryTreeList.expand(categoryTreeList.element.find('tbody > tr:eq(0)'));
			});
			
			categoryTreeList.setDataSource(categoryDataSource);
			categoryDataSource.read();
			
			// TODO: Why the f*** is clicking anything triggering a page reload?
			$('#' + this.getId()).on('click', 'button', function (e) {
				e.preventDefault();
				e.stopPropagation();
			});
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'categoryTreeList',
					data: {
						role: 'treelist',
						autoBind: false,
						editable: {
							mode: 'popup',
							move: true
						},
						filterable: { mode: 'row' },
						sortable: true,
						scrollable: true,
						pageable: {
							pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
							pageSizes: [10, 25, 50],
							refresh: false
						},
						selectable: 'row',
						toolbar: [{ name: 'create', text: 'Add New Category' }],
						columns: [
							/*{
								field: 'id',
								title: 'ID',
							},*/
							{
								title: '', // Leave room for the expand/collapse button
								width: 50
							},
							{
								template: '<div class="image" style="width:75px; height: 75px; background-size: contain; background-image: url(# if (typeof image !== \'undefined\') { # #: image # # } #)"></div>',
								field: 'image',
								title: 'image',
								filterable: false,
								width: 100
							},
							{
								field: 'name',
								title: 'Category',
								width: 250
							},
							{
								// TODO: Convert this to a reusable method?
								template: '# var trimmed = (typeof description !== \'undefined\') ? $(\'<span/>\').html(description).text() : \'\'; trimmed = (trimmed.length > 100) ? App.Helpers.String.shortenText(trimmed, 100) + \'...\' : trimmed; # #= trimmed #',
								field: 'description',
								title: 'Description'
								
							},
							{
								field: 'sort_order',
								title: 'Sort Order',
								filterable: false,
								width: 125
							},
							// TODO: Language is messed up
							/*{
								field: 'language_id',
								title: 'Language'
							},*/
							/*{
								field: 'status',
								title: 'Status'
							},*/
							{
								command: [
									{ name: 'edit', text: ' ', iconClass: 'fa fa-pencil' }, 
									{ name: 'destroy', text: ' ', iconClass: 'fa fa-times' }
								], title: '', width: '160px' 
							}
						]
					}
				}
			]
		}
	}
});