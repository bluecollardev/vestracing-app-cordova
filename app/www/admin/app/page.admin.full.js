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
		pattern: App.getConfig('baseUrl') + 'index.html',
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
				
			$('#makeGrid').on('click', '.nestedDetailGrid .k-grid-add', function (e) {
				e.preventDefault();
				
				var popup = $('#modelPopup').data('kendoWindow');
				popup.center().open();
			});
			
			$('#customerGrid .k-grid-add, #customerGrid .k-grid-Details').on('click', function (e) {
				var popup = $('#customerPopup').data('kendoWindow');
				popup.center().open();
			});
			
			$('#vendorGrid .k-grid-add, #vendorGrid .k-grid-Details').on('click', function (e) {
				var popup = $('#vendorPopup').data('kendoWindow');
				popup.center().open();
			});
			
			$('#orderGrid .k-grid-add, #orderGrid .k-grid-edit').on('click', function (e) {
				var popup = $('#orderPopup').data('kendoWindow');
				popup.center().open();
			});
				
			var toolbar = $('#toolbar').kendoToolBar({
				items: [
					{ template: '<h3 style="text-align: left; padding-left: 2em; padding-right: 2em;">QuickCommerce</h3>' },
					{ type: 'button', text: 'Button' },
					{ type: 'button', text: 'Toggle Button', togglable: true },
					{ template: '<label>Quick Search:</label>' },
					{
						template: '<input id=\'dropdown\' style=\'width: 150px;\' />',
						//overflow: 'never'
					},
					{ type: 'separator' },
					
					{ 
						type: 'separator',
						attributes: {
							style: 'float: right'
						}
					},
					{ 
						type: 'button', 
						text: 'Help', 
						spriteCssClass: 'fa fa-support',
						attributes: {
							style: 'float: right'
						}
					},
					{
						type: 'splitButton',
						text: 'Account',
						attributes: {
							style: 'float: right'
						},
						menuButtons: [
							{ text: 'Your Account', spriteCssClass: 'fa fa-user' },
							{ text: 'Manage Users', spriteCssClass: 'fa fa-users' },
							{ text: 'Change Accounts', spriteCssClass: 'fa fa-sign-in' },
							{ text: 'Sign Out', spriteCssClass: 'fa fa-sign-out' }
						]
					},
					{ type: 'separator' },
					/*{
						type: 'buttonGroup',
						buttons: [
							{ spriteCssClass: 'k-tool-icon k-justifyLeft', text: 'Left', togglable: true, group: 'text-align' },
							{ spriteCssClass: 'k-tool-icon k-justifyCenter', text: 'Center', togglable: true, group: 'text-align' },
							{ spriteCssClass: 'k-tool-icon k-justifyRight', text: 'Right', togglable: true, group: 'text-align' }
						]
					},*/
					/*{
						type: 'buttonGroup',
						buttons: [
							{ spriteCssClass: 'k-tool-icon k-bold', text: 'Bold', togglable: true, showText: 'overflow' },
							{ spriteCssClass: 'k-tool-icon k-italic', text: 'Italic', togglable: true, showText: 'overflow' },
							{ spriteCssClass: 'k-tool-icon k-underline', text: 'Underline', togglable: true, showText: 'overflow' }
						]
					},*/
					{
						type: 'button',
						text: 'Action',
						overflow: 'always'
					},
					{
						type: 'button',
						text: 'Another Action',
						overflow: 'always'
					},
					{
						type: 'button',
						text: 'Something else here',
						overflow: 'always'
					}
				]
			});

			var nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>');
            
			// Tab Order: General, Data, Links, Attribute, Option, Recurring, Marketing, Media
			$('#productPanels').data('kendoPanelBar').setOptions({
				dataSource: [
					{	
						text: 'General',
						spriteCssClass: ''
					},
					{	
						text: 'Data',
						spriteCssClass: ''
					},
					{	
						text: 'Links',
						spriteCssClass: ''
					},
					{	
						text: 'Attribute',
						spriteCssClass: ''
					},
					{	
						text: 'Option',
						spriteCssClass: ''
					},
					{	
						text: 'Recurring',
						spriteCssClass: ''
					},
					{	
						text: 'Marketing',
						spriteCssClass: ''
					},
					{	
						text: 'Media',
						spriteCssClass: ''
					}
				]
			});
			
			$('#contentPanels').data('kendoPanelBar').setOptions({
				dataSource: [
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
								text: 'Categories',
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
								text: 'Feeds',
								spriteCssClass: 'fa fa-rss',
							},
							{
								text: 'Countries',
								spriteCssClass: 'fa fa-globe',
							},
							
						]
					}
				]
			});
			
			var productGrid = $('#productGrid').data('kendoGrid');
			
			productGrid.element.on('click', '.k-grid-Details', function (e) {
				e.preventDefault();
				e.stopPropagation();
				
				var window = $('#productPopup').data('kendoWindow'), //$(e.delegateTarget).closest('[data-role=window]').data('kendoWindow'),
					grid = $(e.delegateTarget).data('kendoGrid'),
					uid = $(e.target).closest('tr').attr('data-uid'),
					model = grid.dataSource.getByUid(uid);
					
				// Window widgets append themselves by default to 
				// <body>, even if the appendTo parameter has been
				// specified - Kendo FAIL
				kendo.unbind($('#productPopup'));
				kendo.bind($('#productPopup'), viewModel);
					
				/*viewModel.set('vin', model.get('Vin'));
				viewModel.set('year', model.get('Year'));
				viewModel.set('make', model.get('Make'));
				viewModel.set('model', model.get('Model'));
				viewModel.set('vehicleCode', model.get('CarCode'));
				
				$.ajax({
					url: 'Api/VehicleInfo/BodyAndFuelTypes',
					type: 'GET',
					data: { year: model.get('Year'), make: model.get('Make'), model: model.get('Model') },
					dataType: 'json',
					contentType: 'application/json;charset=utf-8',
					success: function (data, status, xhr) {
						if (data) {
							viewModel.set('fuelType', data.fuelType);
							viewModel.set('bodyType', data.bodyType);
						}
					}
				});
				
				$.ajax({
					url: 'Api/VehicleInfo/ListPrices',
					type: 'GET',
					data: { carcode: model.get('CarCode'), year: model.get('Year'), effective: model.get('VICCEffective') },
					dataType: 'json',
					contentType: 'application/json;charset=utf-8',
					success: function (data, status, xhr) {
						if (data) {
							viewModel.set('listPriceNew', parseInt(data));
						}
					}
				});*/
				
				window.center().open();
			});
			
			var makeGrid = $('#makeGrid').data('kendoGrid');
			var distributorGrid = $('#distributorGrid').data('kendoGrid');
			
			
			/////
			var makeGridDetailInit = function (e) {
				var detailRow = e.detailRow;
				
				console.log('data yo!!!');
				console.log(e.data.ID);
				var modelDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Models), {
					transport: {
						read: {
							//url: (parseInt(e.data.ID) > 0) ? 'service/index.php/Read/Brand/' + e.data.ID + '/Mobile/' : 'service/index.php/Read/Mobile/',
							url: 'service/index.php/Read/Brand/' + e.data.ID + '/Mobile/',
							type: 'GET',
							dataType: 'json'
						}
					},
					pageSize: 30
				}));

				detailRow.find('.nestedDetailGrid').each(function (idx) {
					var modelGrid = $(this).kendoGrid({
						dataSource: modelDataSource,
						//autoBind: false,
						scrollable: false,
						sortable: true,
						pageable: false,
						editable: 'inline',
						toolbar: ['create', /*'save', 'cancel',*/ 'destroy'],
						columns: [
							{
								field: 'ID',
								title: 'ID',
								template: '<input type="checkbox" />',
								width: 50
							},
							{
								field: 'ProviderID',
								title: 'Provider ID',
								width: 100
							},
							{
								field: 'Name',
								title: 'Model'
							},
							{
								field: 'Photo',
								title: 'Image',
								template: '# if (typeof Photo !== \'undefined\') { #<img src="#= Photo #" /># } #',
								width: 150
							},
							{
								field: 'Status',
								title: 'Status'
							},
							{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
						]
					}).data('kendoGrid');
					
					modelGrid.dataSource.read();
				});
				
				var grids = {},
					grid;
				
				/*grids.nestedDetailGrids = $('.nestedDetailGrid');
				console.log('there are the following detail grids');
				console.log(grids.nestedDetailGrids);
				console.log(e);
				
				$.each(grids, function (idx, collection) {
					collection.each(function () {
						grid = $(this).data('kendoGrid');
						if (grid && (typeof grid.dataSource !== 'undefined')) {
							$(this).data('kendoGrid').dataSource.read();
						}
					});
				});*/
			};
			
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
			
			//autoplusViewModel.set('selectedClaims', new kendo.data.ObservableObject());
			
			// Load policy details when selecting a new policy
			/*
			var loadPolicyDetails = function (e) {
				var policyPrefix = 'policy_', // This can be set to whatever, but make sure it starts with a letter! Javascript doesn't like using numbers as keys (even if they're cast to string)
					claimPrefix = 'claim_', // This can be set to whatever, but make sure it starts with a letter! Javascript doesn't like using numbers as keys (even if they're cast to string)
					dataItem = e.sender.dataItem(e.sender.select()), // Return the data item to which the specified table row is bound				
					subgridSources = ['policyClaims', 'policyDrivers', 'policyVehicles'],
					policyNumber,
					policyKey;
				
				// Get the currently selected claims, if they exist
				selectedClaims = autoplusViewModel.get('selectedClaims');
				
				// Make sure there's actually a dataItem
				if (typeof dataItem !== 'undefined') {
					policyNumber = dataItem.policyNumber;
					policyKey = policyPrefix + policyNumber;
					
					// Use the prefix!
					if (!selectedClaims.get(policyKey)) {
						selectedClaims.set(policyKey, new kendo.data.ObservableObject());
					}
					
					autoplusViewModel.set('companyName', dataItem.companyName);
					autoplusViewModel.set('policyNumber', dataItem.policyNumber);
					autoplusViewModel.set('policyStatus', dataItem.policyStatus);
					
					// Read and filter sub-grids
					$.each(subgridSources, function (idx, source) {
						if (typeof sources[source] !== 'undefined') {
							// Update the grids
							sources[source].read();
							sources[source].filter({ field: 'policyNumber', operator: 'eq', value: dataItem.policyNumber });
						}
					});
					
					autoplusPolicyClaimsGrid.setOptions({
						detailTemplate: kendo.template(nestedDetailGridDetail.html()),
						detailInit: policyClaimsDetailInit,
						dataBound: function (e) {
							var data = e.sender.dataSource.data(),
								selectedPolicyClaims,
								claimID,
								claimKey;
							
							if (typeof policyKey !== 'undefined') {
								selectedPolicyClaims = selectedClaims.get(policyKey);
								
								if (!selectedPolicyClaims) {
									for (var i = 0; i < data.length; i++) {
										if (typeof selectedPolicyClaims !== 'undefined') {
											claimID = data[i].claimID;
											claimKey = claimPrefix + claimID;
											
											if (!selectedPolicyClaims.get(claimKey)) {
												// Claim ID must be a string - using an integer will cause an error
												selectedPolicyClaims.set(claimKey, false);
											}
										}
									}
								}
								
								//this.expandRow(this.tbody.find('tr.k-master-row').first()); // Do this if you want to expand the first row
								this.tbody.find('input[type=checkbox]').each(function (idx) {
									var uid = $(this).closest('[role=row]').attr('data-uid'),
										model;

									if (uid) {
										model = e.sender.dataSource.getByUid(uid);
										claimID = model.claimID;
										claimKey = claimPrefix + claimID;
										
										$(this).attr('data-bind', 'checked: ' + claimKey);
									}
								});
								
								kendo.bind(this.tbody, selectedPolicyClaims);
							}
						}
					});
					
					var getDate = function (year, month, day) {
						var dateArr = [year, month, day],
							date;

						date = dateArr.filter(function (n) {
							return (n === 0) ? false : n
						});
						
						return kendo.toString(kendo.parseDate(date.join('-'), ['yyyy-MM-dd', 'dd/MM/yyyy', 'd/MM/yyyy', 'd/M/yyyy']), 'dd/MM/yyyy');
					};
				}
			};*/
			
			makeGrid.setOptions({
				detailTemplate: kendo.template(nestedDetailGridDetail.html()),
				detailInit: makeGridDetailInit,
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
				toolbar: [{ name: 'create', text: 'Add New Manufacturer' }],
				columns: [
					{	
						field: 'ID',
						title: 'ID',
						//locked: true,
						//lockable: false,
						width: 100
					},
					{
						field: 'ProviderID',
						title: 'Provider ID',
						width: 100
					},
					{
						field: 'Name',
						title: 'Brand',
						width: 250
					},
					{
						field: 'Image',
						title: 'Logo',
						width: 150
					},
					{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
				]
			});
			
			//makeGrid.setDataSource(sampleData);
			
			// distributors
			
			makeDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Makes), {
				transport: {
					read: {
						url: 'service/index.php/Read/Brand/',
						type: 'GET',
						dataType: 'json'
					},
					update: {
						url: 'service/index.php/Update/Brand/',
						type: 'POST',
						dataType: 'json'
					},
					
				},
				pageSize: 30
			}));
			
			makeGrid.setDataSource(makeDataSource);
			makeDataSource.read();
			
			distributorDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Networks), {
				transport: {
					read: {
						url: 'service/index.php/Read/Network/',
						type: 'GET',
						dataType: 'json'
					}
				},
				pageSize: 30
			}));
			
			distributorGrid.setDataSource(distributorDataSource);
			
			distributorDataSource.read();
			
			productDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Tools), {
				transport: {
					read: {
						url: 'service/index.php/Read/Tool/',
						type: 'GET',
						dataType: 'json'
					}
				},
				pageSize: 30
			}));
			
			productGrid.setDataSource(productDataSource);
			productDataSource.read();
			//	productGrid.setDataSource(sampleData);
			
			//productGrid.dataSource.read();
			//	console.log(productGrid);
			
			orderDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Orders), {
				transport: {
					read: {
						url: 'service/index.php/Read/Order',
						type: 'GET',
						dataType: 'json',
					}
				},
				pageSize: 30
			}));
			
			var orderGrid = $('#orderGrid').data('kendoGrid');
			
			orderGrid.setDataSource(orderDataSource);
			orderDataSource.read();
			
			var countryGrid = $('#countryGrid').data('kendoGrid');
			
			countryDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Countries), {
				transport: {
					read: {
						url: 'service/index.php/Read/Country/',
						type: 'GET',
						dataType: 'json'
					}
				},
				pageSize: 30
			}));
			
			console.log('countryGrid');
			console.log('config');
			console.log(App.Config.DataSources.Countries);
			console.log(countryGrid);
			
			countryGrid.setDataSource(countryDataSource);
			countryDataSource.read();
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
								id: 'toolbar',
								/*data: {
									role: 'toolbar',
									items: [
										{ type: 'button', text: 'Button' },
										{ type: 'button', text: 'Toggle Button', togglable: true },
										{
											type: 'splitButton',
											text: 'Insert',
											menuButtons: [
												{ text: 'Insert above', icon: 'insert-n' },
												{ text: 'Insert between', icon: 'insert-m' },
												{ text: 'Insert below', icon: 'insert-s' }
											]
										},
										{ type: 'separator' },
										{ template: '<label>Format:</label>' },
										{
											template: '<input id=\'dropdown\' style=\'width: 150px;\' />',
											overflow: 'never'
										},
										{ type: 'separator' },
										{
											type: 'buttonGroup',
											buttons: [
												{ spriteCssClass: 'k-tool-icon k-justifyLeft', text: 'Left', togglable: true, group: 'text-align' },
												{ spriteCssClass: 'k-tool-icon k-justifyCenter', text: 'Center', togglable: true, group: 'text-align' },
												{ spriteCssClass: 'k-tool-icon k-justifyRight', text: 'Right', togglable: true, group: 'text-align' }
											]
										},
										{
											type: 'buttonGroup',
											buttons: [
												{ spriteCssClass: 'k-tool-icon k-bold', text: 'Bold', togglable: true, showText: 'overflow' },
												{ spriteCssClass: 'k-tool-icon k-italic', text: 'Italic', togglable: true, showText: 'overflow' },
												{ spriteCssClass: 'k-tool-icon k-underline', text: 'Underline', togglable: true, showText: 'overflow' }
											]
										},
										{
											type: 'button',
											text: 'Action',
											overflow: 'always'
										},
										{
											type: 'button',
											text: 'Another Action',
											overflow: 'always'
										},
										{
											type: 'button',
											text: 'Something else here',
											overflow: 'always'
										}
									]
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
						tag: 'section',
						id: 'header'
						
					},
					{
						tag: 'section',
						id: 'layout-c',
						//children: [
							tabstrip: {
								tag: 'div',
								id: 'contentTabs',
								data: {
									// TODO: Update SemanticTabStrip widget
									role: 'semantictabstrip'
									//role: 'tabstrip'
								},
								tabs: ['Products', 'Manufacturers', 'Distributors', 'Customers', 'Vendors', 'Orders', 'Reviews', 'Groups', 'Countries', 'Feeds', 'Resellers'],
								fieldsets: [
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'productGrid',
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
													toolbar: [{ name: 'create', text: 'Add New Product' }],
													columns: [
														{
															field: 'ID',
															title: 'ID',
															//locked: true,
															//lockable: false,
															width: 100
														},
														/*{
															field: 'ProviderID',
															title: 'Provider ID',
															width: 100
														},*/
														{
															field: 'Name',
															title: 'Name',
															width: 250
														},
														{
															field: 'Credits',
															title: 'Credits',
															width: 150
														},
														{
															field: 'Price',
															title: 'Price',
															width: 200
														},
														{
															field: 'Active',
															title: 'Status',
															width: 200
														},
														{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '280px' }
													]
												}
											},
											{
												tag: 'div',
												id: 'productPopup',
												name: 'productPopup',
												class: 'entityPopup',
												//style: 'display: none',
												data: {
													role: 'window',
													//appendTo: '#center-pane',
													modal: true,
													visible: false,
													resizable: false,
													draggable: true,
													title: 'Edit Product',
													width: 1540
												},
												children: [
													{
														tag: 'div',
														style: 'display: flex; flex-flow: row wrap',
														children: [
															// Main Image
															{
																tag: 'div',
																style: 'width: 20%; height: 140px; background: black; border: 1px solid grey;'
															},
															// General
															{
																tag: 'div',
																style: 'width: 53%',
																children: [
																	{
																		block: 'autorow',
																		config: {
																			items: [
																				{
																					tag: 'input',
																					type: 'text',
																					id: 'Name',
																					name: 'Name',
																					label: 'Display Name',
																					class: 'large'
																				},
																				
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
																					id: 'ID',
																					name: 'ID',
																					label: 'ID',
																					class: 'small'
																				},
																				{
																					tag: 'select',
																					id: 'itemType',
																					name: 'itemType',
																					label: 'Type',
																					data: {
																						role: 'productitemtype'
																						/*role: 'dropdownlist',
																						bind: {
																							source: {
																								type: 'custom',
																								config: {
																									data: [
																										{ Key: '', Value: '' },
																										{ Key: 'product', Value: 'Product' },
																										{ Key: 'accessory', Value: 'Accessory' },
																										{ Key: 'service', Value: 'Service' }
																									]
																								}
																							}
																						},
																						valuePrimitive: true,
																						textField: 'Value',
																						valueField: 'Key'*/
																					}
																				},
																				{
																					tag: 'input',
																					type: 'text',
																					id: '',
																					name: '',
																					label: 'Manufacturer',
																					data: {
																						role: 'combobox'
																					}
																				},
																				{
																					tag: 'input',
																					type: 'text',
																					id: '',
																					name: '',
																					label: 'Model',
																					data: {
																						role: 'combobox'
																					}
																				}
																			]
																		}
																	}
																]
															},
															{
																tag: 'div',
																style: 'width: 25%',
																children: [
																	{
																		block: 'autorow',
																		config: {
																			items: [
																				{
																					tag: 'input',
																					type: 'text',
																					label: 'Price/Rate',
																					data: {
																						role: 'numerictextbox'
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
																					label: 'Quantity',
																					data: {
																						role: 'numerictextbox'
																					}
																				}
																			]
																		}
																	}
																]
															},
															{
																tag: 'ul',
																id: 'productPanels',
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
																		tabs: ['General', 'Data', 'Links', 'Attribute', 'Option', 'Recurring', 'Marketing', 'Media'],
																		fieldsets: [
																			// General
																			{
																				tag: 'fieldset',
																				children: [
																					/*{
																						block: 'autorow',
																						config: {
																							items: [
																								{
																									tag: 'input',
																									type: 'text',
																									id: 'ProviderID',
																									name: 'ProviderID',
																									label: 'Provider'
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: 'ProviderCredits',
																									name: 'ProviderCredits',
																									label: 'Provider Credits'
																								},
																							]
																						}
																					},
																					{
																						block: 'autorow',
																						config: {
																							items: [
																								{
																									tag: 'select',
																									id: 'Network',
																									name: 'Network',
																									label: 'Network',
																									data: {
																										role: 'dropdownlist'
																									}
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: 'Price',
																									name: 'Price',
																									label: 'Price',
																									data: {
																										role: 'numerictextbox'
																									}
																								}
																							]
																						}
																					},*/
																					{
																						block: 'autorow',
																						config: {
																							items: [
																								{
																									tag: 'textarea',
																									id: 'Description',
																									name: 'Description',
																									label: 'Description',
																									style: 'width: 600px',
																									data: {
																										role: 'editor',
																										width: '600px'
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
																									id: 'metaTagTitle',
																									name: 'metaTagTitle',
																									label: 'Meta Tag Title'
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
																									id: 'metaTagDescription',
																									name: 'metaTagDescription',
																									label: 'Meta Tag Description'
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
																									id: 'metaTagKeywords',
																									name: 'metaTagKeywords',
																									label: 'Meta Tag Keywords'
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
																									id: 'productTags',
																									name: 'productTags',
																									label: 'Product Tags',
																									data: {
																										role: 'multiselect'
																									}
																								}
																							]
																						}
																					}
																				]
																			},
																			// Data
																			{
																				tag: 'fieldset',
																				children: [
																					{
																						block: 'questionrow',
																						config: {
																							items: [
																								{
																									tag: 'select',
																									id: 'trackQuantity',
																									name: 'trackQuantity',
																									label: 'I track quantity on hand for this product. This enables inventory cost accounting.',
																									data: {
																										role: 'truefalse'
																									}
																								}
																							]
																						}
																					},
																					{
																						block: 'questionrow',
																						config: {
																							items: [
																								{
																									tag: 'select',
																									id: 'isSellable',
																									name: 'isSellable',
																									label: 'I sell this product/service to my customers.',
																									data: {
																										role: 'truefalse'
																									}
																								}
																							]
																						}
																					},
																					{
																						block: 'questionrow',
																						config: {
																							items: [
																								{
																									tag: 'select',
																									id: 'isPurchased',
																									name: 'isPurchased',
																									label: 'I purchase this product/service from a vendor.',
																									data: {
																										role: 'truefalse'
																									}
																								}
																							]
																						}
																					},
																					{ tag: 'h4', text: 'Accounting' },
																					{
																						block: 'autorow',
																						config: {
																							items: [
																								{
																									tag: 'input',
																									type: 'text',
																									label: 'Income Account',
																									data: {
																										role: 'dropdownlist'
																									}
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									label: 'Expense Account',
																									data: {
																										role: 'dropdownlist'
																									}
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									label: 'Vendor',
																									data: {
																										role: 'dropdownlist'
																									}
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									label: 'Cost',
																									data: {
																										role: 'numerictextbox'
																									}
																								}
																							]
																						}
																					},
																					{ tag: 'h4', text: 'Tracking' },
																					{
																						block: 'autorow',
																						config: {
																							items: [
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									label: 'SKU'
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									label: 'UPC'
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									label: 'EAN'
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
																									id: '',
																									name: '',
																									label: 'JAN'
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									label: 'ISBN'
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									label: 'MPN'
																								}
																							]
																						}
																					},
																					{ tag: 'h4', text: 'Measurements' },
																					{
																						block: 'autorow',
																						config: {
																							items: [
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									class: 'small',
																									label: 'Length',
																									data: {
																										role: 'numerictextbox'
																									}
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									class: 'small',
																									label: 'Width',
																									data: {
																										role: 'numerictextbox'
																									}
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									class: 'small',
																									label: 'Height',
																									data: {
																										role: 'numerictextbox'
																									}
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									label: 'Units',
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
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									class: 'small',
																									label: 'Weight',
																									data: {
																										role: 'numerictextbox'
																									}
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: '',
																									name: '',
																									label: 'Units',
																									data: {
																										role: 'dropdownlist'
																									}
																								}
																							]
																						}
																					}
																				]
																			},
																			// Links
																			{
																				tag: 'fieldset',
																				children: [
																					{
																						tag: 'div',
																						id: 'link-tabs',
																						name: 'link-tabs',
																						class: 'content-box-only',
																						
																						data: {
																							role: 'semantictabstrip',
																							animation: false
																						},
																						tabs: ['Catalog', 'Downloads', 'Compatibility', 'Feeds'],
																						fieldsets: [
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
																													id: '',
																													name: '',
																													label: 'Select Stores',
																													data: {
																														role: 'multiselect'
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
																													id: '',
																													name: '',
																													label: 'Select Categories',
																													data: {
																														role: 'multiselect'
																													}
																												}
																											]
																										}
																									}
																								]
																							},
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
																													id: '',
																													name: '',
																													label: 'Select Downloads',
																													data: {
																														role: 'multiselect'
																													}
																												}
																											]
																										}
																									}
																								]
																							},
																							{
																								tag: 'fieldset',
																								children: [
																									{ tag: 'h4', text: 'Product Compatibility' },
																									{
																										block: 'questionrow',
																										config: {
																											items: [
																												{
																													tag: 'select',
																													id: 'productCompatibility',
																													name: 'productCompatibility',
																													label: 'This product is compatible with more than one product.',
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
																													id: '',
																													name: '',
																													label: 'Manufacturer',
																													data: {
																														role: 'combobox'
																													}
																												},
																												{
																													tag: 'input',
																													type: 'text',
																													id: '',
																													name: '',
																													label: 'Model',
																													data: {
																														role: 'combobox'
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
																													id: '',
																													name: '',
																													label: 'Manufacturers',
																													data: {
																														role: 'multiselect'
																													}
																												},
																												{
																													tag: 'input',
																													type: 'text',
																													id: '',
																													name: '',
																													label: 'Models',
																													data: {
																														role: 'multiselect'
																													}
																												}
																											]
																										}
																									},
																									// TODO: These need to be implemented as product attributes
																									{
																										tag: 'div',
																										id: 'Compatibility',
																										name: 'Compatibility',
																										label: 'Requirements (select all that apply)',
																										/*data: {
																											role: 'listview',
																											selectable: 'multiple',
																											template: {
																												id: 'default-listview-item-template',
																												//source: 'default-listview-item.tmpl.htm'
																											},
																											bind: {
																												source: {
																													type: 'custom',
																													config: {
																														data: [
																															{ Key: 'RequiresNetwork', Value: 'Network' },
																															{ Key: 'RequiresMobile', Value: 'Mobile' },
																															{ Key: 'RequiresProvider', Value: 'Provider' },
																															{ Key: 'RequiresPIN', Value: 'PIN' },
																															{ Key: 'RequiresKBH', Value: 'KBH' },
																															{ Key: 'RequiresMEP', Value: 'MEP' },
																															{ Key: 'RequiresPRD', Value: 'PRD' },
																															{ Key: 'RequiresSN', Value: 'SN' },
																															{ Key: 'RequiresSecR0', Value: 'SecR0' },
																															{ Key: 'RequiresReference', Value: 'Reference' },
																															{ Key: 'RequiresServiceTag', Value: 'Service Tag' },
																															{ Key: 'RequiresICloudEmail', Value: 'iCloud Email' },
																															{ Key: 'RequiresICloudPhone', Value: 'iCloud Phone' },
																															{ Key: 'RequiresICloudUDID', Value: 'iCloud UDID' },
																															{ Key: 'RequiresType', Value: 'Type' }
																														]
																													}
																												}
																											}
																										}*/
																									}
																								]
																							},
																							{
																								tag: 'fieldset',
																								children: [
																									{
																										tag: 'div',
																										id: 'productFeedGrid',
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
																											toolbar: [{ name: 'create', text: 'Add Existing Feed' }],
																											columns: [
																												{
																													field: 'Name',
																													title: 'Product Name',
																													width: 100
																												},
																												{
																													field: 'Provider',
																													title: 'Provider',
																													width: 200
																												},
																												{
																													field: 'Cost',
																													title: 'Cost'
																												},
																												{
																													field: 'Default',
																													title: 'Default'
																												},
																												{ command: [ { text: 'Details' }, { text: 'Default' }, { text: 'Populate' }, { text: 'Unlink', name: 'destroy'} ], title: '&nbsp;', width: '280px' }
																											]
																										}
																									}
																								]
																							}
																						]
																					}
																				]
																			},
																			// Attribute
																			{
																				tag: 'fieldset',
																				children: [
																					{
																						tag: 'div',
																						id: 'productAttributeGrid',
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
																							toolbar: [{ name: 'create', text: 'Add Attribute' }],
																							columns: [
																								{	
																									field: 'Name',
																									title: 'Attribute',
																									//locked: true,
																									//lockable: false,
																								},
																								{
																									field: 'Value',
																									title: 'Text'
																								},
																								{
																									field: 'Display',
																									title: 'Display',
																									width: 200
																								},
																								{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
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
																									id: 'DeliveryMin',
																									name: 'DeliveryMin',
																									label: 'Delivery Min.',
																									data: {
																										role: 'numerictextbox'
																									}
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: 'DeliveryMax',
																									name: 'DeliveryMax',
																									label: 'Delivery Max.',
																									data: {
																										role: 'numerictextbox'
																									}
																								},
																								{
																									tag: 'select',
																									id: 'DeliveryUnit',
																									name: 'DeliveryUnit',
																									label: 'Delivery Unit',
																									data: {
																										role: 'dropdownlist',
																										bind: {
																											source: {
																												type: 'custom',
																												config: {
																													data: [
																														{ Key: 'Instant', Value: 'Instant' },
																														{ Key: 'Minute', Value: 'Minute' },
																														{ Key: 'Hour', Value: 'Hour' },
																														{ Key: 'Day', Value: 'Day' },
																														{ Key: 'Unknown', Value: 'Unknown' },
																													]
																												}
																											}
																										}
																									}
																								}
																							]
																						}
																					},
																					
																				]
																			},
																			// Option
																			{
																				tag: 'fieldset',
																				children: [
																					{
																						tag: 'div',
																						id: 'productOptionGrid',
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
																							toolbar: [{ name: 'create', text: 'Add Option' }],
																							columns: [
																								{	
																									field: 'Name',
																									title: 'Option Value',
																									//locked: true,
																									//lockable: false,
																								},
																								{
																									field: 'Quantity',
																									title: 'Quantity'
																								},
																								{
																									field: 'SubtractStock',
																									title: 'Subtract Stock',
																									width: 200
																								},
																								{
																									field: 'Price',
																									title: 'Price',
																									width: 200
																								},
																								{
																									field: 'Points',
																									title: 'Points',
																									width: 200
																								},
																								{
																									field: 'Weight',
																									title: 'Weight',
																									width: 200
																								},
																								{ command: [ { text: 'Quick Edit', name: 'edit'}, 'destroy'], title: '&nbsp;', width: '200px' }
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
																									id: 'Name',
																									name: 'Name',
																									label: 'Name'
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: 'ID',
																									name: 'ID',
																									label: 'ID'
																								},
																								{
																									tag: 'input',
																									type: 'text',
																									id: 'ProviderID',
																									name: 'ProviderID',
																									label: 'Provider ID'
																								}
																							]
																						}
																					}
																				]
																			},
																			// Recurring
																			{
																				tag: 'fieldset'
																			},
																			// Marketing
																			{
																				tag: 'fieldset',
																				children: [
																					{ tag: 'h4', text: 'Discounts' }, 
																					{
																						tag: 'div',
																						id: 'productDiscountGrid',
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
																							toolbar: [{ name: 'create', text: 'Add New Discount' }],
																							columns: [
																								{
																									field: 'CustomerGroup',
																									title: 'Customer Group'
																								},
																								{
																									field: 'Quantity',
																									title: 'Quantity'
																								},
																								{
																									field: 'Priority',
																									title: 'Priority',
																									
																								},
																								{
																									field: 'Price',
																									title: 'Price'
																								},
																								{
																									field: 'DateStart',
																									title: 'Date Start'
																								},
																								{
																									field: 'DateEnd',
																									title: 'Date End'
																								},
																								{
																									field: 'Active',
																									title: 'Status'
																								},
																								{ command: [ { text: 'Quick Edit', name: 'edit'}, 'destroy'], title: '&nbsp;', width: '200px' }
																							]
																						}
																					},
																					{ tag: 'h4', text: 'Specials' }, 
																					{
																						tag: 'div',
																						id: 'productSpecialGrid',
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
																							toolbar: [{ name: 'create', text: 'Add New Special' }],
																							selectable: 'row',
																							columns: [
																								{
																									field: 'CustomerGroup',
																									title: 'Customer Group'
																								},
																								{
																									field: 'Priority',
																									title: 'Priority'
																								},
																								{
																									field: 'Price',
																									title: 'Price'
																								},
																								{
																									field: 'DateStart',
																									title: 'Date Start'
																								},
																								{
																									field: 'DateEnd',
																									title: 'Date End'
																								},
																								{
																									field: 'Active',
																									title: 'Status'
																								},
																								{ command: [ { text: 'Quick Edit', name: 'edit'}, 'destroy'], title: '&nbsp;', width: '200px' }
																							]
																						}
																					},
																					{ tag: 'h4', text: 'Reward Points' },
																					{
																						block: 'autorow',
																						config: {
																							items: [
																								{
																									tag: 'input',
																									type: 'text',
																									id: 'purchasePointsNeeded',
																									name: 'purchasePointsNeeded',
																									label: 'Points Needed',
																									data: {
																										role: 'numerictextbox'
																									}
																								}
																							]
																						}
																					},
																					{
																						tag: 'div',
																						id: 'productPointsGrid',
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
																							columns: [
																								{
																									field: 'CustomerGroup',
																									title: 'Customer Group'
																								},
																								{
																									field: 'Points',
																									title: 'Points',
																									width: 200
																								}
																							]
																						}
																					}
																				]
																			},
																			// Media
																			{
																				tag: 'fieldset',
																				children: [
																					{
																						block: 'autorow',
																						config: {
																							items: [
																								{
																									tag: 'input',
																									type: 'file',
																									id: 'productImageUpload',
																									name: 'productImageUpload',
																									label: 'Upload Images',
																									data: {
																										role: 'upload'
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
																									type: 'file',
																									id: 'productDocUpload',
																									name: 'productDocUpload',
																									label: 'Upload Documentation',
																									data: {
																										role: 'upload'
																									}
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
										]
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'makeGrid',
												data: {
													role: 'grid'
												}
											},
											{
												tag: 'div',
												id: 'modelPopup',
												name: 'modelPopup',
												//style: 'display: none',
												data: {
													role: 'window',
													//appendTo: '#center-pane',
													modal: true,
													visible: false,
													resizable: false,
													draggable: true,
													title: 'Edit Product/Model',
													width: 1540
												},
												children: [
													{
														tag: 'fieldset',
														id: 'general-information',
														legend: 'General Information'
													}
												]
											}
										]
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'distributorGrid',
												data: {
													/*bind: {
														source: {
															type: 'method',
															config: {
																transport: {
																	read: {
																		url: 'service/index.php/DBGetNetworks',
																		type: 'GET',
																		contentType: 'xml'
																	}
																},
																schema: {
																	type: 'xml',
																	data: '/API/Network',
																	model: {
																		fields: {
																			Value: 'Name/text()',
																			Key: 'ProviderID/text()'
																		}
																	}
																}
															}
														}
													},*/
													role: 'grid',
													autoBind: false,
													editable: 'inline',
													filterable: { mode: 'row' },
													sortable: true,
													scrollable: true,
													pageable: {
														pageSize: 30, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
														pageSizes: [15, 30, 60],
														refresh: false
													},
													selectable: 'row',
													toolbar: [{ name: 'create', text: 'Add New Distributor' }],
													columns: [
														{
															field: 'ID',
															title: 'ID',
															//locked: true,
															//lockable: false,
															width: 100
														},
														/*{
															field: 'ProviderID',
															title: 'Provider ID',
															width: 100
														},*/
														{
															field: 'Name',
															title: 'Network',
															width: 250
														},
														{
															field: 'Image',
															title: 'Logo',
															width: 150
														},
														{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
													]
												}
												
											}
											
										]
										
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'customerGrid',
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
													toolbar: [{ name: 'create', text: 'Add New Customer' }],
													columns: [
														{
															field: 'ID',
															title: 'ID',
															//locked: true,
															//lockable: false,
															width: 100
														},
														{
															field: 'Name',
															title: 'Name',
															width: 250
														},
														{
															field: 'Email',
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
															field: 'Group',
															title: 'Group',
															width: 150
														},
														{
															field: 'Active',
															title: 'Status'
														},
														{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
													]
												}
											},
											{
												tag: 'div',
												id: 'customerPopup',
												name: 'customerPopup',
												//style: 'display: none',
												data: {
													role: 'window',
													//appendTo: '#center-pane',
													modal: true,
													visible: false,
													resizable: false,
													draggable: true,
													title: 'Edit Customer',
													width: 1540
												},
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
											}		
										]
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'vendorGrid',
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
													toolbar: [{ name: 'create', text: 'Add New Vendor' }],
													columns: [
														{
															field: 'ID',
															title: 'ID',
															//locked: true,
															//lockable: false,
															width: 100
														},
														{
															field: 'Name',
															title: 'Name',
															width: 250
														},
														{
															field: 'Email',
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
															field: 'Group',
															title: 'Group',
															width: 150
														},
														{
															field: 'Active',
															title: 'Status'
														},
														{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
													]
												}
											},
											{
												tag: 'div',
												id: 'vendorPopup',
												name: 'vendorPopup',
												//style: 'display: none',
												data: {
													role: 'window',
													//appendTo: '#center-pane',
													modal: true,
													visible: false,
													resizable: false,
													draggable: true,
													title: 'Edit Vendor',
													width: 1540
												},
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
													},
													{
														tag: 'div',
														id: 'vendorTransactionGrid',
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
															toolbar: [{ name: 'create', text: 'Create New Transaction' }],
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
											}		
										]
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'orderGrid',
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
													toolbar: [{ name: 'create', text: 'Create New Order' }],
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
											},
											{
												tag: 'div',
												id: 'orderPopup',
												name: 'orderPopup',
												//style: 'display: none',
												data: {
													role: 'window',
													//appendTo: '#center-pane',
													modal: true,
													visible: false,
													resizable: false,
													draggable: true,
													title: 'Edit Order',
													width: 1540
												},
												children: [
													{
														tag: 'div',
														style: 'display: flex; flex-flow: row wrap',
														children: [
															{
																tag: 'div',
																children: [
																	{ tag: 'h4', text: 'Purchaser' },
																	{
																		block: 'autorow',
																		config: {
																			items: [
																				{
																					tag: 'select',
																					id: 'customer',
																					name: 'customer',
																					label: 'Customer',
																					data: {
																						role: 'dropdownlist'
																					}
																				},
																				{
																					tag: 'input',
																					type: 'text',
																					id: 'customerEmail',
																					name: 'customerEmail',
																					label: 'Customer Email'
																				}
																			]
																		}
																	},
																	{
																		module: 'address'
																	},
																	{
																		block: 'autorow',
																		config: {
																			items: [
																				{
																					tag: 'select',
																					id: 'terms',
																					name: 'terms',
																					label: 'Terms',
																					data: {
																						role: 'dropdownlist'
																					}
																				},
																				{
																					tag: 'input',
																					type: 'text',
																					id: 'invoiceDate',
																					name: 'invoiceDate',
																					label: 'Invoice Date',
																					data: {
																						role: 'datepicker'
																					}
																				},
																				{
																					tag: 'input',
																					type: 'text',
																					id: 'dueDate',
																					name: 'dueDate',
																					label: 'Due Date',
																					data: {
																						role: 'datepicker'
																					}
																				}
																			]
																		}
																	}
																]
															},
															{
																tag: 'div',
																children: [
																	{ tag: 'h4', text: 'Shipping' },
																	{
																		block: 'autorow',
																		config: {
																			items: [
																				{
																					tag: 'select',
																					id: 'shippingMethod',
																					name: 'shippingMethod',
																					label: 'Shipping Method',
																					data: {
																						role: 'dropdownlist'
																					}
																				},
																				{
																					tag: 'input',
																					type: 'text',
																					id: 'shippingType',
																					name: 'shippingType',
																					label: 'Shipping Type'
																				}
																			]
																		}
																	},
																	{
																		module: 'address'
																	}
																]
															}
														]
													},
													{ tag: 'h4', text: 'Order Items' },
													{
														tag: 'div',
														id: 'orderProductsGrid',
														name: 'orderProductsGrid',
														data: {
															role: 'grid',
															scrollable: false,
															sortable: true,
															pageable: false,
															editable: 'inline',
															toolbar: [{ name: 'create', text: 'Add Order Item' }, /*'save', 'cancel',*/ 'destroy'],
															columns: [
																{
																	field: 'ID',
																	title: 'ID',
																	template: '<input type="checkbox" />',
																	width: 50
																},
																{
																	field: 'ProviderID',
																	title: 'Provider ID',
																	width: 100
																},
																{
																	field: 'Name',
																	title: 'Model'
																},
																{
																	field: 'Photo',
																	title: 'Image',
																	template: '# if (typeof Photo !== \'undefined\') { #<img src="#= Photo #" /># } #',
																	width: 150
																},
																{
																	field: 'Status',
																	title: 'Status'
																},
																{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
															]
														}
													},
													{
														tag: 'div',
														style: 'display: flex',
														children: [
															{
																tag: 'div',
																style: 'width: 50%; order: 2',
																children: [
																	{
																		block: 'autorow',
																		config: {
																			items: [
																				{
																					tag: 'input',
																					id: 'subtotal',
																					name: 'subtotal',
																					label: 'Subtotal'
																				}
																			]
																		}
																	},
																	{
																		block: 'autorow',
																		config: {
																			items: [
																				{
																					tag: 'select',
																					id: 'tax',
																					name: 'tax',
																					label: 'Tax',
																					data: {
																						role: 'dropdownlist'
																					}
																				},
																				{
																					tag: 'input',
																					id: 'taxtotal',
																					name: 'taxtotal',
																					label: 'Taxable Subtotal'
																				}
																			]
																		}
																	},
																	{
																		block: 'autorow',
																		config: {
																			items: [
																				{
																					tag: 'select',
																					id: 'discount',
																					name: 'discount',
																					label: 'Discount',
																					data: {
																						role: 'dropdownlist'
																					}
																				},
																				{
																					tag: 'input',
																					id: 'discounttotal',
																					name: 'discounttotal',
																					label: 'Discount'
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
																					id: 'total',
																					name: 'total',
																					label: 'Total'
																				}
																			]
																		}
																	}
																]
															},
															{
																tag: 'div',
																style: 'width: 50%; order: 1',
																children: [
																	{
																		block: 'autorow',
																		config: {
																			items: [
																				{
																					tag: 'textarea',
																					id: 'orderMessage',
																					name: 'orderMessage',
																					label: 'Message Displayed on Invoice'
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
																					id: 'orderMemo',
																					name: 'orderMemo',
																					label: 'Statement Memo'
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
																					type: 'file',
																					id: 'orderAttachments',
																					name: 'orderAttachments',
																					label: 'Attachments',
																					data: {
																						role: 'upload'
																					}
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
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'reviewGrid',
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
													columns: [
														{
															field: 'ID',
															title: 'ID',
															//locked: true,
															//lockable: false,
															width: 100
														},
														/*{
															field: 'ProviderID',
															title: 'Provider ID',
															width: 100
														},*/
														{
															field: 'Customer',
															title: 'Customer',
															width: 250
														},
														{
															field: 'Name',
															title: 'Summary',
															width: 250
														},
														{
															field: 'Rating',
															title: 'Rating'
														},
														{
															field: 'Active',
															title: 'Status'
														},
														{ command: [ { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
													]
												}
											}
										]
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'groupGrid',
												data: {
													role: 'grid'
												}
											}
										]
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'countryGrid',
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
													toolbar: [{ name: 'create', text: 'Add New Country' }],
													columns: [
														{	
															field: 'ID',
															title: 'ID',
															//locked: true,
															//lockable: false,
															width: 100
														},
														{
															field: 'ProviderID',
															title: 'Provider ID',
															width: 100
														},
														{
															field: 'Name',
															title: 'Country',
															width: 250
														},
														{
															field: 'Image',
															title: 'Logo',
															width: 150
														},
														{
															field: 'Lat',
															title: 'Latitude',
															width: 150
														},
														{
															field: 'Long',
															title: 'Longitude',
															width: 150
														},
														{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
													]
												}
											}
										]
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'feedGrid',
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
													toolbar: [{ name: 'create', text: 'Add New Feed' }],
													columns: [
														{
															field: 'Provider',
															title: 'Provider',
															width: 200
														},
														{
															field: 'URL',
															title: 'URL',
															width: 200
														},
														{
															field: 'ProductCount',
															title: 'Products Available',
															width: 200
														},
														{
															field: 'ActiveProductCount',
															title: 'Active Products',
															width: 200
														},
														{
															field: 'Status',
															title: 'Status'
														},
														{ command: [ { text: 'Details' }, { name: 'destroy'} ], title: '&nbsp;', width: '280px' }
													]
												}
											}
										]
									},
									{
										tag: 'fieldset',
										children: [
											{
												tag: 'div',
												id: 'resellerGrid',
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
													toolbar: [{ name: 'create', text: 'Add New Reseller' }],
													columns: [
														{
															field: 'Name',
															title: 'Name',
															width: 100
														},
														{
															field: 'Email',
															title: 'Email',
															width: 200
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
															field: 'Status',
															title: 'Status'
														},
														{ command: [ { text: 'Approve' }, 'edit', 'destroy' ], title: '&nbsp;', width: '280px' }
													]
												}
											}
										]
									}
									
								]
							}
						//]
						
					},
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
					}
				] // END sections
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
						tag: 'div',
						id: 'contentPanels',
						data: {
							role: 'panelbar',
							autoBind: false
						}
					},
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