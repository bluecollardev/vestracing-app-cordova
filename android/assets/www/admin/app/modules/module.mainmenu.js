define({
	name: 'mainmenu',
	id: 'mainmenu', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	events: {
		rendered: function (e) {
			this.dataBind();
			
			var that = this,
				page = App.getCurrent(),
				moduleElement = $('#' + that.getId()),
				menu = $('#contentPanels').data('kendoPanelBar');
			
			menu.setOptions({
				dataSource: [
					{
						text: '<div class="search-wrapper" style="display: flex; padding: 10px 0 12px"><input id="transactionSearch" type="text" style="flex: 2 2 270px" /></div>',
						encoded: false,
						spriteCssClass: 'fa fa-search'
					},
					{	
						text: 'Dashboard',
						spriteCssClass: 'fa fa-desktop',
					},
					{	
						text: 'Catalog',
						spriteCssClass: 'fa fa-th-list',
						items: [
							{
								text: 'Products',
								spriteCssClass: 'fa fa-tag',
							},
							{
								text: 'Categories',
								spriteCssClass: 'fa fa-tags',
							},
							{
								text: 'Manufacturers',
								spriteCssClass: 'fa fa-wrench',
							},
							{
								text: 'Distributors',
								spriteCssClass: 'fa fa-truck',
							},
							{
								text: 'Tools',
								spriteCssClass: 'fa fa-wrench',
							},
							{
								text: 'Feeds',
								spriteCssClass: 'fa fa-rss',
							}
						]
					},
					{
						text: 'Customers',
						spriteCssClass: 'fa fa-user',
						items: [
							{
								text: 'Customers',
								spriteCssClass: 'fa fa-user',
							},
							{
								text: 'Customer Groups',
								spriteCssClass: 'fa fa-group',
							},
						]
					},
					{
						text: 'Vendors',
						spriteCssClass: 'fa fa-shopping-cart',
						items: [
							{
								text: 'Vendors',
								spriteCssClass: 'fa fa-shopping-cart',
							},
							{
								text: 'Purchase Orders',
								spriteCssClass: 'fa fa-clipboard',
							}
						]
					},
					{
						text: 'Transactions',
						spriteCssClass: 'fa fa-refresh',
						items: [
							{
								text: 'Sales Orders',
								spriteCssClass: 'fa fa-clipboard',
							},
							{
								text: 'Cash Sales',
								spriteCssClass: 'fa fa-dollar'
							},
							{
								text: 'Returns',
								spriteCssClass: 'fa fa-repeat'
							},
							{
								text: 'Exchanges',
								spriteCssClass: 'fa fa-exchange'
							},
							{
								text: 'Purchase Orders',
								spriteCssClass: 'fa fa-clipboard',
							},
							// QuickBooks
							{
								text: 'Expenses',
								spriteCssClass: 'fa fa-credit-card',
							},
						]
					},
					{
						text: 'Content',
						spriteCssClass: 'fa fa-edit',
						items: [
							{
								text: 'Pages',
								spriteCssClass: 'fa fa-file'
							},
							{
								text: 'Page Categories',
								spriteCssClass: 'fa fa-sitemap'
							},
						]
					},
					{
						text: 'Reviews',
						spriteCssClass: 'fa fa-comments'
					},
					{
						text: 'Marketing',
						spriteCssClass: 'fa fa-whatsapp',
						items: [
							{
								text: 'Affiliates',
								spriteCssClass: 'fa fa-slideshare',
							},
							{
								text: 'Resellers',
								spriteCssClass: 'fa fa-mail-forward',
								
							},
							{
								text: 'Coupons',
								spriteCssClass: 'fa fa-ticket',
							},
							{
								text: 'Social Media, etc.',
								spriteCssClass: 'fa fa-wechat',
								items: [
									{
										text: 'Send E-mail',
										spriteCssClass: 'fa fa-envelope'
										
									},
									{
										text: 'Newsletter',
										spriteCssClass: 'fa fa-newspaper-o'
									},
									{
										text: 'Facebook',
										spriteCssClass: 'fa fa-facebook'
									},
									{
										text: 'Twitter',
										spriteCssClass: 'fa fa-twitter'
									},
									{
										// Generic subscription interface for managing correspondence modules (Send Email, Newsletter)
										text: 'Subscribers',
										spriteCssClass: 'fa fa-link'
									}
								]
							}
						]
					},
					{
						text: 'Users',
						spriteCssClass: 'fa fa-male',
						items: [
							{
								text: 'Accounts',
								spriteCssClass: 'fa fa-male',
							},
							{
								text: 'Employees',
								spriteCssClass: 'fa fa-male'
							},
							
						]
					},
					{
						text: 'System',
						spriteCssClass: 'fa fa-gear',
						items: [
							{
								text: 'Settings',
								spriteCssClass: 'fa fa-gears',
							},
							{
								text: 'Countries',
								spriteCssClass: 'fa fa-globe',
							},
							
						]
					}
				]
			});
			
			var search = $('#transactionSearch').kendoAutoComplete({
				placeholder: 'Search Transactions',
				minLength: 3,
				suggest: true,
				headerTemplate: '<div><h4>Results</h4></div>',
				dataTextField: 'name',
				dataSource: {
					data: [
						{ Key: '1', Value: 'TEST12345' },
						{ Key: '2', Value: 'TEST67890' },
						{ Key: '3', Value: 'TEST54321' },
						{ Key: '4', Value: 'TEST09876' },
						{ Key: '5', Value: 'TEST01234' }
					]
				}
			}).data('kendoAutoComplete');
			
			// TODO: Bind once to autocomplete widget
			/*var modules = App.getCurrent().getModules(),
				salesModule = modules.get('module_sales_1');
			// TODO: Use links or something...
			// Cross-module functionality based on IDs is not the way to go
			// Events perhaps? No time now...
			if (typeof salesModule !== 'undefined' && salesModule !== null) {
				console.log(salesModule);
				if (salesModule.dataBound === true) {
					// TODO: When get the datasource from the viewmodel yo...
					// That isn't working right now because I need to patch up nested module binding
					var grid = $('#' + salesModule.getId()).find('#saleGrid').first().data('kendoGrid');
					search.setDataSource(grid.dataSource);
					
					search.bind('select', function (e) {
						var popup = $('#salePopup').data('kendoWindow');
						popup.center().open();
					});
				}
			}*/
			
			var tabstrip = $('#contentTabs').data('kendoSemanticTabStrip'),
				tabs = tabstrip.tabGroup.children();
			
			tabs.each(function (idx, tab) {
				var el = $(tabstrip.element).find('[id^=module]').first(),
					module = page.getModule(el.attr('id')),
					eventHandler = module.getEventHandler();
				
				if (eventHandler.hasEvent('rendered') && module.isRendered() === false) {
					eventHandler.addEventListener('rendered', function () {
						App.Widgets.Helpers.Grid.resizeFullPane($(tabstrip.element).find('[id^=module] > .k-grid').first(), $(tabstrip.element).closest('.pane-content'));
					}, that);
				}
			});
			
			menu.bind('select', function (e) {
				var item = e.item,
					itemText = $(item).text();
				
				tabs.each(function (idx, tab) {
					if ($(tab).text() === itemText) tabstrip.select(idx);
				});
			});
		},
		initialized: function () {
			// Do something
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'contentPanels',
					data: {
						role: 'panelbar',
						autoBind: false
					}
				}
			]	
		}
	}
});