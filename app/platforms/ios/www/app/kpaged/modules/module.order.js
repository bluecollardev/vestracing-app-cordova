define({
	name: 'order',
	id: 'order', // This can be improved... the double ID reference isn't the greatest
	autoBind: true,
	autoRender: false,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
				
			if (!dataSources.has('transaction.order')) {
				// Initialize datasources
				dataSources.set('transaction.order', new kendo.data.DataSource({
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
				page = that.getPage();
			
			that.dataBind(that.getViewModel());
			
			var orderGrid = $('#orderGrid').data('kendoGrid');
			
			orderGrid.element.on('click', '.k-grid-add, .k-grid-details', function (e) {
				var popup = $('#orderPopup').data('kendoWindow');
				popup.center().open();
			});
			
			orderDataSource = page.getDataSources().get('transaction.order');
			
			orderGrid.setDataSource(orderDataSource);
			orderDataSource.read();
		}
	},
	layout: {
		templates: {
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
	}
});