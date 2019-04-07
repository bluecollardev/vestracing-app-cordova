define(['xmleditor'], function (xmleditor) { return {
	name: 'inventoryFeed',
	id: 'inventoryFeed', // This can be improved... the double ID reference isn't the greatest
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
			
			var that = this,
				moduleElement = $('#' + that.getId());
			
			var extractor = new Xsd2Json('doctrine-mapping.xsd', {'schemaURI':  App.getConfig('serviceUrl') + 'app/doctrine/orm/schema/', 'rootElement': 'doctrine-mapping'});
			var options = {
				//documentTitle: false,
				ajaxOptions: {
					xmlRetrievalPath: App.getConfig('serviceUrl') + 'app/doctrine/orm/mappings/App.Entity.OpenCart.Product.dcm.xml'
				},
				floatingMenu: false,
				schema : extractor.getSchema(),
				libPath :  App.getConfig('serviceUrl') + 'vendor/jquery/community/jquery.xmleditor/lib'
			};
			
			//console.log($('#' + that.getId() + ' #ocEntities'));
			/*$('#' + that.getId() + ' #ocEntities').xmlEditor(options);
			$('#' + that.getId() + ' #qbEntities').xmlEditor(options);*/
			$('#' + that.getId() + ' #feedXml').xmlEditor(options);
			//console.log(xmleditor);
			
			moduleElement.find('#feedPanels').data('kendoPanelBar').setOptions({
				dataSource: [
					{	
						text: 'Basic Settings',
						spriteCssClass: 'fa fa-gear'
					},
					{	
						text: 'Authentication',
						spriteCssClass: 'fa fa-lock'
					},
					{
						text: 'Data Mappings',
						spriteCssClass: 'fa fa-list'
					},
					{
						text: 'Database Settings',
						spriteCssClass: 'fa fa-database'
					},
					{
						text: 'Event Handlers',
						spriteCssClass: 'fa fa-mail-forward'
					},
					{
						text: 'Import Data',
						spriteCssClass: 'fa fa-tasks'
					}
				]
			});
			
			// TODO: Just load the data... and use it in the code block after this ajax call
			// TODO: Selecting an entity item should reload the Data Mapping config
			$.ajax({
				url: App.getConfig('serviceUrl') + 'public/api/list/entities',
				type: 'GET',
				dataType: 'json',
				success: function (data, status, xhr) {
					var feedPanels = moduleElement.find('#feedPanels').first().data('kendoPanelBar'),
						items = [];
					
					$.each(data, function (idx, obj) {
						items.push({ text: obj });
					});
					
					feedPanels.append(items, 'li:eq(2)');
				}
			});
			
			// Maps PanelBar menu items to their corresponding tabs
			moduleElement.find('.entityPopupMenu').each(function (idx, obj) {
				var menu = $(obj).data('kendoPanelBar'),
					tabs = $(obj).parent().find('.entityPopupTabs').first().data('kendoSemanticTabStrip');
					// TODO: Semantic vs. standard tabs
				
				menu.bind('select', function (e) {
					var panelIndex = menu.element.children('li').index($(e.item));
					if (panelIndex) tabs.select(panelIndex);
				});
			});
			
			var entityGrid = $('#qcEntityGrid').data('kendoGrid'),
				entityDataSource;
			
			entityDataSource = new kendo.data.DataSource({
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'public/api/list/entities',
						type: 'GET',
						dataType: 'json'
						/*beforeSend: function (request) {
							request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
						}*/
					}
				},
				pageSize: 30,
				schema: {
					model: {
						id: 'id'
					},
					parse: function (response) {
						// Product descriptions can exist for more than one language
						var data = response,
							results = [];
						
						$.each(data, function (idx, obj) {
							results.push({ id: idx, entity: obj });
							
						});
						
						return results;
					}
				}
			});
			
			entityGrid.setDataSource(entityDataSource);
			entityDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					children: [
						{
							tag: 'ul',
							id: 'feedPanels',
							class: 'entityPopupMenu',
							style: 'width: 20%',
							data: {
								role: 'panelbar'
							}
						},
						{
							tag: 'div',
							class: 'entityPopupContent',
							style: 'width: 78%',
							children: [																
								{
									tag: 'div',
									id: 'product-tabs',
									name: 'product-tabs',
									class: 'entityPopupTabs content-box-only',
									data: {
										role: 'semantictabstrip',
										animation: false
									},
									tabs: ['General', 'Authentication', 'Data Map', 'Database Settings', 'Event Handlers', 'Import Data'],
									fieldsets: [
										// General
										{
											tag: 'fieldset',
											children: [
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'input',
																type: 'text',
																class: 'k-textbox',
																id: 'ProviderName',
																name: 'ProviderName',
																label: 'Provider'
															},
															{
																tag: 'input',
																type: 'text',
																class: 'k-textbox',
																id: 'FeedName',
																name: 'FeedName',
																label: 'Feed Name'
															},
															{
																tag: 'select',
																id: 'status',
																name: 'status',
																label: 'Enabled',
																data: {
																	role: 'truefalse'
																}
															}
														]
													}
												},
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'input',
																type: 'text',
																class: 'k-textbox',
																id: 'FeedUrl',
																name: 'FeedUrl',
																label: 'Feed URL'
															},
															{
																tag: 'select',
																id: 'FeedType',
																name: 'FeedType',
																label: 'Data Type',
																data: {
																	role: 'dropdownlist'
																}
															},
															{
																tag: 'select',
																id: 'FeedUpdate',
																name: 'FeedUpdate',
																label: 'Update Interval',
																data: {
																	role: 'dropdownlist'
																}
															}
														]
													}
												},
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'textarea',
																id: 'FeedDescription',
																name: 'FeedDescription',
																label: 'Feed Description',
																data: {
																	role: 'editor'
																}
															}
														]
													}
												}
											]
										},
										// Authentication
										{
											tag: 'fieldset',
											children: [
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'textarea',
																id: 'AuthHeaders',
																name: 'AuthHeaders',
																label: 'Authentication Headers',
																data: {
																	role: 'editor'
																}
															}
														]
													}
												}
											]
										},
										// Data Map
										{
											tag: 'fieldset',
											children: [
												{
													tag: 'div',
													id: 'ocEntities'
												},
												{
													tag: 'div',
													id: 'qbEntities'
												},
												{
													tag: 'div',
													id: 'feedXml'
												}
											]
										},
										// DB Settings
										{
											tag: 'fieldset'
										},
										// Event Handlers
										{
											tag: 'fieldset',
										},
										// Import Data
										{
											tag: 'fieldset',
											children: [
												//{ tag: 'h4', text: 'Import/Refresh Entities' },
												{
													tag: 'div',
													id: 'qcEntityGrid',
													name: 'qcEntityGrid',
													data: {
														role: 'grid',
														scrollable: false,
														sortable: false,
														pageable: {
															pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
															pageSizes: [10, 25, 50],
															refresh: false
														},
														selectable: 'row',
														editable: false,
														filterable: { mode: 'row' },
														toolbar: [{ name: 'syncSelected', text: 'Synchronize', iconClass: 'fa fa-refresh' }, { name: 'enableSelected', text: 'Enable', iconClass: 'fa fa-check' }, { name: 'disableSelected', text: 'Disable', iconClass: 'fa fa-ban' }],
														columns: [
															{
																field: 'ID',
																title: '',
																template: '<input type="checkbox" />',
																width: 50
															},
															{
																field: 'entity',
																title: 'Entity'
															},
															{
																command: [
																	{ name: 'enable', text: '&nbsp;', iconClass: 'fa fa-check' }, 
																	{ name: 'disable', text: '&nbsp;', iconClass: 'fa fa-ban' },
																	//{ name: 'manage', text: '&nbsp;', iconClass: 'fa fa-gear' },
																	{ name: 'sync', text: '&nbsp;', iconClass: 'fa fa-refresh' }
																], title: '&nbsp;', width: '230px'
															}
														]
													}
												}
											]
										}
									]
								}		
							]
						}
					]
				}
			]	
		}
	}
}; });