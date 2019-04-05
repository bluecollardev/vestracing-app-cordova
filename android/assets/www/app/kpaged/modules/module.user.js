define({
	name: 'user',
	id: 'user',
	autoBind: true,
	autoRender: false,
	// TODO: Make this generic!
	setUser: function (id) {
		var that = this,
			page = that.getPage(),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel();
			
		if (dataSources.has('user.entity')) {
			var entityDataSource = new kendo.data.DataSource($.extend(true, {}, dataSources.get('user.entity').options, {
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'api/rest_admin/users/' + id,
						type: 'GET',
						dataType: 'json',
						beforeSend: function (request) {
							request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
						}
					}
				}
			}));
			
			entityDataSource.one('change', function () {
				model = entityDataSource.at(0);
				
				$('#' + that.getId()).find('[id^=block_]').each(function (idx, block) {
					page.getBlock($(block).attr('id')).dataBind(viewModel);
				});
				
				kendo.bind($('#' + that.getId()), viewModel);
				
				that.setData(model);
			});
			
			entityDataSource.read();
		}
	},
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
			
			// Register any custom methods
			that.setUser = that.getConfig().setUser;
			
			if (!dataSources.has('user.entity')) {
				// Initialize datasources
				dataSources.set('user.entity', new kendo.data.DataSource({
					pageSize: 30,
					schema: {
						//data: 'data',
						model: {
							id: 'user_id'
						},
						parse: function (response) {
							return [response.data];
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
			
			var	userPopup = $('#userPopup'),
				moduleElement = $('#' + that.getId()),
				addressModules,
				addressModule;
				
			addressModules = userPopup.find('[data-module=address]');
			addressModules.each(function () {
				var id = $(this).attr('id');
				addressModule = page.getModule(id);
				
				addressModule.getEventHandler().dispatch('pageLoaded');
			});
			
			var widgetTypes = App.Config.Widgets.defaults(),
				widgets;
				
			// Trigger pageLoaded event on widgets
			// TODO: Add support for attaching multiple event listeners to a built-in page event
			$.each(widgetTypes, function (widgetRole, widgetConfig) {
				if (widgetConfig.hasOwnProperty('type')) {
					widgets = $('.k-widget').find('[data-role=' + widgetRole + ']');
					if (widgets) {
						widgets.each(function (idx, widget) {
							if (App.getConfig('debug') === true) {
								/*App.log('Triggering pageLoaded event on ' + widgetConfig.type + ' widget attached to:');
								App.log(widget);
								App.log($(widget));*/
							}
							
							if (typeof $(widget).data(widgetConfig.type) !== 'undefined') {
								$(widget).data(widgetConfig.type).trigger('pageLoaded');
							}
						});
					}
				}
			});
			
			moduleElement.find('#userPanels').data('kendoPanelBar').setOptions({
				dataSource: [
					{	
						text: 'Profile',
						spriteCssClass: 'fa fa-user'
					},
					{	
						text: 'Membership',
						spriteCssClass: 'fa fa-slideshare'
					},
					{	
						text: 'Address Book',
						spriteCssClass: 'fa fa-book'
					},
					{	
						text: 'Wish List',
						spriteCssClass: 'fa fa-cloud'
					},
					{	
						text: 'Downloads',
						spriteCssClass: 'fa fa-download'
					},
					{	
						text: 'History',
						spriteCssClass: 'fa fa-clock-o'
					},
					{	
						text: 'Transactions',
						spriteCssClass: 'fa fa-refresh'
					},
					{	
						text: 'Returns',
						spriteCssClass: 'fa fa-repeat'
					},
					{	
						text: 'Reward Points',
						spriteCssClass: 'fa fa-star'
					},
					{	
						text: 'IP Addresses',
						spriteCssClass: 'fa fa-laptop'
					}
				]
			});
			
			// Maps PanelBar menu items to their corresponding tabs
			moduleElement.find('.entityPopupMenu').each(function (idx, obj) {
				var menu = $(obj).data('kendoPanelBar'),
					tabs = $(obj).parent().find('.entityPopupTabs').first().data('kendoSemanticTabStrip');
					// TODO: Semantic vs. standard tabs
				
				menu.bind('select', function (e) {
					var panelIndex = menu.element.find('li').index($(e.item));
					tabs.select(panelIndex);
				});
			});
			
			that.setUser(1);
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					style: 'display: flex; flex-flow: row wrap',
					children: [
						// Menu Column
						{
							tag: 'div',
							style: 'width: 20%; height: 140px; background: black; border: 1px solid grey;'
						},
						// General
						{
							tag: 'div',
							style: 'width: 53%',
							children: [
								
							]
						},
						{
							tag: 'div',
							style: 'width: 25%',
							children: [
								{
									module: 'address'
								}
							]
						},
						{
							tag: 'ul',
							id: 'userPanels',
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
									id: 'user-tabs',
									name: 'user-tabs',
									class: 'entityPopupTabs content-box-only',
									data: {
										role: 'semantictabstrip',
										animation: false
									},
									tabs: ['Profile', 'Membership', 'Address Book', 'Wish List', 'Downloads', 'History', 'Transactions', 'Returns', 'Reward Points', 'IP Addresses'],
									fieldsets: [
										{
											tag: 'fieldset',
											children: [
												{
													tag: 'div',
													id: 'contact-info-tabs',
													name: 'contact-info-tabs',
													class: 'content-box-only',
													data: {
														role: 'semantictabstrip',
														animation: false
													},
													tabs: ['Person', 'Organization'],
													fieldsets: [
														{
															tag: 'fieldset',
															id: 'contact-personal',
															legend: 'Personal Details',
															children: [{
																block: 'personalInfo'
															}]
														},
														{
															tag: 'fieldset',
															id: 'contact-company',
															legend: 'Organization Details',
															children: [{
																block: 'companyInfo'
															}]
														}
													]
												},
												{
													block: 'contactInfo'
												}
											]
										},
										{
											tag: 'fieldset'
										},
										{
											tag: 'fieldset',
											children: [
												{ tag: 'h4', text: 'Billing Address' },  
												{
													module: 'address'
												},
												{ tag: 'h4', text: 'Shipping Address' },
												{
													module: 'address'
												},
												{
													tag: 'div',
													id: 'userAddressGrid',
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
														toolbar: [{ name: 'create', text: 'Add New Address' }],
														columns: [
															{
																field: 'Address',
																title: 'Address',
																width: 100
															},
															{
																field: 'City',
																title: 'City',
																width: 200
															},
															{
																field: 'Province',
																title: 'Province'
															},
															{
																field: 'PostalCode',
																title: 'Postal Code'
															},
															{
																field: 'Country',
																title: 'Country'
															},
															{ command: [ { text: 'Details' }, { text: 'Default' }, { text: 'Unlink', name: 'destroy'} ], title: '&nbsp;', width: '280px' }
														]
													}
												}
											]
										},
										{
											tag: 'fieldset'
										},
										{
											tag: 'fieldset'
										},
										{
											tag: 'fieldset'
										},
										{
											tag: 'fieldset',
											children:[
												{
													tag: 'div',
													id: 'userOrderGrid',
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
														//toolbar: [{ name: 'create', text: 'Create New Order' }],
														columns: [
															{
																field: 'ID',
																title: 'ID',
																//locked: true,
																//lockable: false,
																width: 100
															},
															{
																field: 'ReferenceNo',
																title: 'Reference No.',
																width: 200
															},
															{
																field: 'Customer',
																title: 'Customer',
																width: 250
															},
															{
																field: 'Date',
																title: 'Date'
															},
															{
																field: 'Amount',
																title: 'Amount'
															},
															{
																field: 'Active',
																title: 'Status'
															},
															{ command: [ { text: 'Edit', name: 'edit'}, /*{ text: 'Details' },*/ 'destroy'], title: '&nbsp;', width: '250px' }
														]
													}
												}
											]
										},
										{
											tag: 'fieldset'
										},
										{
											tag: 'fieldset'
										},
										{
											tag: 'fieldset'
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
});