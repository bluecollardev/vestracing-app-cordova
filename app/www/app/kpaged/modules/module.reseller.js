define({
	name: 'reseller',
	id: 'reseller', // This can be improved... the double ID reference isn't the greatest
	dataSource: 'self', // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	events: {
		// TODO: This should be registered as a default event handler for all pages
		// For now, include this function in all page scripts
		pageLoaded: function (e) {
			$('#resellerPanels').data('kendoPanelBar').setOptions({
				dataSource: [
					{	
						text: 'My Profile',
						spriteCssClass: 'fa fa-user'
					},
					{
						text: 'My Customer Account',
						spriteCssClass: 'fa'
					},
					{	
						text: 'Browse Inventory',
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
							}
						]
					},
					{	
						text: 'My Listings',
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
							}
						]
					},
					{
						text: 'My Customers',
						spriteCssClass: 'fa fa-users',
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
								text: 'My Team',
								spriteCssClass: 'fa fa-slideshare',
					},
					{
						text: 'Marketing',
						spriteCssClass: 'fa fa-whatsapp',
						items: [
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
						text: 'Feeds',
						spriteCssClass: 'fa fa-rss',
					}
				]
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
							id: 'resellerPanels',
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
									id: 'customer-tabs',
									name: 'customer-tabs',
									class: 'entityPopupTabs content-box-only',
									data: {
										role: 'semantictabstrip',
										animation: false
									},
									tabs: ['Profile', 'Address Book', 'Wish List', 'Downloads', 'History', 'Transactions', 'Returns', 'Reward Points', 'IP Addresses'],
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
													id: 'customerAddressGrid',
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
													id: 'customerOrderGrid',
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