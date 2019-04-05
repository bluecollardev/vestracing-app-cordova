define({
	name: 'vendors',
	id: 'vendors', // This can be improved... the double ID reference isn't the greatest
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
			
			$('#vendorGrid .k-grid-add, #vendorGrid .k-grid-Details').on('click', function (e) {
				var popup = $('#vendorPopup').data('kendoWindow');
				popup.center().open();
			});
		}
	},
	layout: {
		templates: {
			tag: 'div',
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
						width: '100%'
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
		}
	}
});