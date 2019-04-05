// Index
define(['marked'], function (marked) { return {
	name: 'Order',
	/*ajax: {
		isString: true,
		mode: 'viewModel',
		filter: function (data) {
			if (data.hasOwnProperty('ChangeTracker')) {
				delete data.ChangeTracker;
			}
			
			if (data.hasOwnProperty('$id')) {
				delete data.$id;
			}
			
			return data;
		}
	},*/
	route: {
		mode: 'api',
		pattern: App.getConfig('baseUrl'),
		autoRead: false,
		read: {
			url: 'Api',
			type: 'GET'
		}
	},
	events: {
		save: function () {
		},
		loaded: function (e) {
			var that = this,
				page = App.getCurrent(),
				block = page.getBlock(that.getPrimaryBlockName()),
				viewModel = block.getViewModel(),
				validator = block.getValidator(),
				widgetTypes = App.Config.Widgets.defaults(),
				widgets;
			
			// Maps PanelBar menu items to their corresponding tabs
			$('.entityPopupMenu').each(function (idx, obj) {
				var menu = $(obj).data('kendoPanelBar'),
					tabs = $(obj).parent().find('.entityPopupTabs').first().data('kendoSemanticTabStrip');
					// TODO: Semantic vs. standard tabs
				
				menu.bind('select', function (e) {
					var panelIndex = menu.element.find('li').index($(e.item));
					tabs.select(panelIndex);
				});
			});
			
			//resizeGrid($(tabstrip.element).find('[id^=module] > .k-grid').first());
			
			var loginHandler = function (e) {
				// TODO: There has to be a better way than a hardcoded reference
				$('#loginPopup').data('kendoWindow').center().open();
			};
			
			var toolbar = $('#toolbar').kendoToolBar({
				items: [
					{ template: '<h3 style="text-align: left; padding-left: 2em; padding-right: 2em;">QuickCommerce</h3>' },
					{ 
						type: 'button', 
						text: 'Help', 
						spriteCssClass: 'fa fa-support'
					},
					{
						type: 'splitButton',
						text: 'Account',
						attributes: {
							style: 'float: right'
						},
						menuButtons: [
							{ text: 'Sign In', spriteCssClass: 'fa fa-sign-in', click: loginHandler },
							{ text: 'My Account', spriteCssClass: 'fa fa-user' },
							{ text: 'My Customer Account', spriteCssClass: 'fa fa-user' }, // This is going to have to be moved
							{ text: 'Manage Users', spriteCssClass: 'fa fa-users' },
							{ text: 'Change Accounts', spriteCssClass: 'fa fa-sign-in', click: loginHandler },
							{ text: 'Sign Out', spriteCssClass: 'fa fa-sign-out' }
						]
					},
					{
						type: 'splitButton',
						text: 'Stores',
						attributes: {
							style: 'float: right'
						},
						menuButtons: [
							{ text: 'Online Store', spriteCssClass: 'fa' },
							{ text: 'Service Provider', spriteCssClass: 'fa' },
							{ text: 'Property Rentals', spriteCssClass: 'fa' },
							{ text: 'Membership Site', spriteCssClass: 'fa' }
						]
					}
				]
			});

			var nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>');
			
			// TODO: Something is wrong with the Kendo Grid hierarchy rendering...
			// For now, just add the missing columns/cells
			var grids = $('#autoplusPolicyClaimsGrid'),
				grid;
			
			$.each(grids, function (idx, el) {
				grid = $(el);
				
				grid.find('.k-grid-header colgroup, .k-grid-content colgroup').prepend('<col class="k-hierarchy-col">');
				grid.find('.k-grid-header thead tr').first().prepend('<th class="k-hierarchy-cell k-header"></th>');
				grid.find('.k-grid-content tbody tr.k-master-row').prepend('<th class="k-hierarchy-cell"></th>');
			});
			
			var nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>');
		},
		isLoaded: function () {
			var that = this,
				page = App.getCurrent(),
				block = page.getBlock(that.getPrimaryBlockName()),
				viewModel = block.getViewModel(),
				validator = block.getValidator(),
				widgetTypes = App.Config.Widgets.defaults(),
				widgets;
				
			// TODO: Not sure what's up with the login rendering
			$('#header').find('[id^=module]').each(function () {
				module = page.getModule($(this).attr('id'));
				if (!module.isRendered()) module.render();
				console.log('just tried rendering the login module wtf');
			});
				
			var tabstrip = $('#contentTabs').data('kendoSemanticTabStrip'),
				tabs = tabstrip.tabGroup.children();
			
			var resizeGrid = function (panel) {
				var grid, panel = panel || tabstrip.element;
				
				grid = $(panel).find('[id^=module] > .k-grid').first();
				if (!grid.length > 0) return false;
				
				App.Widgets.Helpers.Grid.resizeFullPane(grid, $(panel).closest('.pane-content'));
			};
			
			tabstrip.bind('activate', function (e) {
				var module = null;
				
				$(e.contentElement).find('[id^=module]').each(function () {
					module = page.getModule($(this).attr('id'));
					if (!module.isRendered()) module.render();
				});
				
				resizeGrid(e.contentElement);
			});
			
			// TODO: Do we need some sort of config parameter that will hide the target tabs?
			tabstrip.tabGroup.css({ display: 'none' })
				.siblings('[role=tabpanel]')//.css({ marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: 0, border: 'none' })
				.find('h3').css({ boxSizing: 'border-box', padding: '20px 1.5rem 10px', margin: 0, width: '100%', background: '#555', color: 'white', zIndex: 1000, /*position: 'fixed'*/ });
				/*.each(function () {
					//$(this).after('<span class="heading-spacer" style="display: block; height: ' + $(this).outerHeight(true) + 'px"></span>');
					//return h;
				});*/			
			
			$(window).on('resize', function () {
				resizeGrid();
			});
			
			resizeGrid();
			
			/*var initSplitter = function () {
				var splitterElement = $('#horizontal'),
					maxHeight = 0,
					h;
				splitterElement.css('visibility', 'hidden');	
				splitterElement.find('.pane-content').parent().each(function (idx, pane) {
					console.log(pane);
					h = $(pane).height();
					maxHeight = (h > maxHeight) ? h : maxHeight;
					console.log(maxHeight);
				});
				
				var splitter = splitterElement.kendoSplitter({
					panes: [
						{ collapsible: true, collapsed: true, scrollable: false, resizable: true, size: '18%' },
						{ collapsible: false, scrollable: false },
						{ collapsible: true, collapsed: true, scrollable: false, resizable: true, size: '20%' }
					]
				}).data('kendoSplitter');
				splitter.wrapper.add(splitter.wrapper.children()).each(function (idx, el) {
					console.log(el);
					$(el).height(maxHeight);
					console.log($(el).height());
					console.log('------');
				});
				splitter.wrapper.css('visibility', 'visible');
			};
			
			initSplitter();*/
		}
	},
	validation: {
		validateOnBlur: true,
		messages: {
		},
		rules: {
		}
	},
    layout: [
		{
            block: 'top-pane',
			templates: {
				sections: [
					{
						tag: 'section',
						id: 'header',
						children: [
							{
								tag: 'div',
								id: 'toolbar'
							},
							{
								//module: 'login',
								// TODO: Gotta fix this yo
								/*config: {
									autoRender: true,
									autoBind: true
								}*/
							}
						]
					}
				]
			}
		},
        {
            block: 'center-pane',
			primary: true,
			templates: {
				sections: [
					{
						tag: 'div',
						class: 'nestedDetailGridDetail',
						// TODO: For some reason I can't use my kendoSemanticTabStrip widget...
						parts: [
							{
								tag: 'div',
								fields: [
									{
										tag: 'div',
										class: 'nestedDetailGrid'
									}
								]
							}
						]
					},
					{
						
						tag: 'div',
						id: 'contentTabs',
						data: {
							// TODO: Update SemanticTabStrip widget
							role: 'semantictabstrip'
							//role: 'tabstrip'
						},
						tabs: ['Dashboard', 'Products', 'Categories', 'Manufacturers', 'Distributors', 'Customers', 'Vendors', 'Sales Orders', 'Cash Sales', 'Purchase Orders', 'Reviews', 'Customer Groups', 'Countries', 'Feeds', 'Affiliates', 'Resellers', 'Accounts', 'Pages', 'Page Categories'],
						fieldsets: [
							{
								tag: 'fieldset',
								children: [
									{
										tag: 'h3',
										text: 'Welcome to QuickCommerce'
									},
									{
										tag: 'p',
										text: 'This is your management dashboard...'
									},
									{
										module: 'customerDashboard', config: { autoRender: true }
									}
								]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Products' }, { module: 'catalogProducts', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Categories' }, { module: 'catalogCategories', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Brands, Models & Inventory' }, { module: 'inventoryManufacturers', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Add/Remove Distributors' }, { module: 'distributors', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Customers' }, { module: 'customers', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Vendors' }, { module: 'vendors', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Sales Orders' }, { module: 'orders', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Cash Sales' }, { module: 'sales', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Purchase Orders' }, { module: 'purchases', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Reviews' }, { module: 'reviews', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Customer Groups' }, { module: 'customerGroups', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Countries' }, { module: 'countries', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Feeds' }, { module: 'inventoryFeeds', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Affiliates' }, { module: 'affiliates', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Resellers' }, { module: 'resellers', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Users' }, { module: 'users', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Pages' }, { module: 'contentArticles', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Page Categories' }, { module: 'contentCategories', config: { autoRender: false } }]
							}
						]
					}
				]
			}
        },
		{
			block: 'left-pane',
			templates: {
				tag: 'section',
				id: 'sidebar-a',
				panels: [
					{
						//module: 'errorPanel'
					}
				],
				children: [
					{
						module: 'mainmenu'
					}
					/*{
						tag: 'section',
						id: 'layout-toc',
						children: [
							{
								tag: 'div',
								id: 'tocTreeView',
								data: {
									role: 'treeview',
									autoBind: false
								}
							}
						]
						
					}*/
				]
			}
		},
		/*{
			block: 'right-pane',
			templates: {
				tag: 'section',
				id: 'sidebar-b',
				panels: [
					{
						module: 'errorPanel'
					}
				]
			}
		}*/
    ] // END layout
}; });