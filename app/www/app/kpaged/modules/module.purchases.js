define({
	name: 'purchases',
	id: 'purchases', // This can be improved... the double ID reference isn't the greatest
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
			
			var purchaseGrid = $('#purchaseGrid').data('kendoGrid');
			
			purchaseGrid.element.on('click', '.k-grid-add, .k-grid-details', function (e) {
				var popup = $('#purchasePopup').data('kendoWindow');
				popup.center().open();
			});
			
			purchaseDataSource = new kendo.data.DataSource($.extend(true, {}, Object.create(App.Config.DataSources.Orders), {
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'api/rest_admin/orders/',
						type: 'GET',
						dataType: 'json',
						beforeSend: function (request) {
							request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
						}
					},
					update: {
						url: App.getConfig('serviceUrl') + 'api/rest_admin/orders/',
						type: 'PUT',
						dataType: 'json',
						beforeSend: function (request) {
							request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
						}
					},
					// TODO: Delete requires some packaging
					destroy: {
						url: App.getConfig('serviceUrl') + 'api/rest_admin/orders/',
						type: 'DELETE',
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
						id: 'order_id'
					}
				}
			}));
			
			purchaseGrid.setDataSource(purchaseDataSource);
			purchaseDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'fieldset',
			children: [
				{
					tag: 'div',
					id: 'purchaseGrid',
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
						toolbar: [{ name: 'create', text: 'Create New Purchase Order' }],
						columns: [
							{
								field: 'order_id',
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
								field: 'name',
								title: 'Customer',
								width: 250
							},
							{
								field: 'date_added',
								title: 'Date'
							},
							{
								field: 'products',
								title: 'Items'
							},
							{
								field: 'total',
								title: 'Total'
							},
							{
								field: 'status',
								title: 'Status'
							},
							{
								command: [
									{ name: 'details', text: '&nbsp;', iconClass: 'fa fa-edit' },
									{ name: 'destroy', text: '&nbsp;', iconClass: 'fa fa-times' }
								], title: '&nbsp;', width: '155px' 
							}
						]
					}
				},
				{
					tag: 'div',
					id: 'purchasePopup',
					name: 'purchasePopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Edit Purchase Order',
						width: '100%'
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
										/*{
											module: 'address'
										},*/
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
										/*{
											module: 'address'
										}*/
									]
								}
							]
						},
						{ tag: 'h4', text: 'Order Items' },
						{
							tag: 'div',
							id: 'purchaseProductsGrid',
							name: 'purchaseProductsGrid',
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
		}
	}
});