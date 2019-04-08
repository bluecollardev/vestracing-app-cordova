define({
	name: 'downloads',
	id: 'downloads', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
				
			/*if (!dataSources.has('customer.download')) {
				// Initialize datasources
				dataSources.set('customer.download', new kendo.data.DataSource({
					transport: {
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/downloads/',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						update: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/downloads/',
							type: 'PUT',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						},
						// TODO: Delete requires some packaging
						destroy: {
							url: App.getConfig('serviceUrl') + 'api/rest_admin/downloads/',
							type: 'DELETE',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
							}
						}
					},
					pageSize: 30,
					schema: {
						//data: 'data',
						model: {
							id: 'download_id'
						}
					}
				}));
			}*/
		},
		pageLoaded: function (e) {
			var	that = this,
				page = App.getCurrent(),
				eventHandler = that.getEventHandler();
			
			//eventHandler.dispatch('rendered');
		},
		rendered: function (e) {
			var	that = this,
				moduleElement = $('#' + that.getId()),
				page = that.getPage(),
				dataSources = page.getDataSources(),
				downloadPopup = $('#downloadPopup'),
				downloadWindow = downloadPopup.data('kendoWindow'),
				downloadModules,
				downloadModule,
				downloadGrid;
			
			that.dataBind(that.getViewModel());
			
			that.downloadGrid = downloadGrid = moduleElement.find('[name=downloadGrid]').first().data('kendoGrid');
			console.log(downloadGrid);
			downloadGrid.setDataSource(new kendo.data.DataSource({
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'api/rest/customerdownloads/',
						type: 'GET',
						dataType: 'json',
						beforeSend: function (request) {
							var customer = dataSources.get('customer.entity') || null;

							request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
							request.setRequestHeader('X-Oc-Merchant-Language', 'en');
							
							if (customer) {
								console.log('session: ' + page.getAuthHandler().getSession());
								request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
							}
						}
					}
				},
				schema: {
					parse: function (response) {
						var results = [],
							data;
						
						if (response.success && response.hasOwnProperty('data')) {
							data = response.data.downloads;
							
							$.each(data, function (idx, obj) {
								var row = obj,
									product;
								
								// TODO: We should make this generic so the module is useful for systems other than OpenCart
								// Some kind of entity mapping?
								if (row.hasOwnProperty('product') && row.product !== null) {
									product = row.product;
									
									// Map the properties to the main object
									row.image = product.image;
									row.product = product.name;
									row.model = product.model;
									row.track = product.track;
									row.date_added = product.date_added;
								}
								
								results.push(row);
								row = null;
							});
						}
						
						return results;
					},
					total: function (response) {
						return (response.success && response.hasOwnProperty('data')) ? response.data.downloads.length : 0;
					}
				},
				//batch: true,
				pageSize: 10,
				/*aggregate: [{ field: 'quantity', aggregate: 'sum' }, { field: 'reward', aggregate: 'sum' }, { field: 'total', aggregate: 'sum' }]*/
			}));
			
			downloadGrid.bind('edit', function (e) {
				downloadGrid.element.find('.k-grid-update').html('<span class="fa fa-check k-update"></span>');
				downloadGrid.element.find('.k-grid-cancel').html('<span class="fa fa-ban k-cancel"></span>');
			});
			
			downloadGrid.dataSource.read();
			console.log('download ds');
			console.log(downloadGrid.dataSource);
			
			/*downloadGrid.element.on('click', '.k-grid-add, .k-grid-details', function (e) {
				var uid, model;
				
				e.preventDefault();
				e.stopPropagation();
				
				// TODO: Turn this into a helper?
				uid = $(e.target).closest('tr').attr('data-uid'),
				model = downloadGrid.dataSource.getByUid(uid);
				console.log(model);
				
				downloadModules = downloadPopup.find('[data-module=download]');
				downloadModules.each(function () {
					var id = $(this).attr('id');
					downloadModule = page.getModule(id);
					
					downloadModule.render();
				});
				
				//downloadWindow.center().open();
			});*/
			
			downloadGrid.element.on('click', '.k-grid-details, .k-grid-download', function (e) {
				var uid, model;
				
				e.preventDefault();
				e.stopPropagation();
				
				// TODO: Turn this into a helper?
				uid = $(e.target).closest('tr').attr('data-uid'),
				model = downloadGrid.dataSource.getByUid(uid);
				console.log(model);
				
				var folderPath = model.get('path'),
					dateCode = page.formatTrackDate(new Date(model.get('date'))),
					trackCode = model.get('track_code'),
					files = [];

				if (typeof trackCode === 'string') {
					trackCode = model.get('track_code').split();
				}
				
				if (trackCode instanceof Array) {
					trackCode.forEach(function (code, idx) {
						// TODO: Detect trailing slashes everywhere!
						files.push(folderPath + '/' + code + dateCode + '.pdf');
					});
					
					$.each(files, function (idx, fileName) {
						// TODO: Unhardcode path -- pull path from product attributes
						window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
							window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + 'data/', function (directoryEntry) {
								/*cordova.plugins.FileOpener.openFile(directoryEntry.toURL() + fileName, 
								function (e) { 
									console.log('success, opening file: ' + directoryEntry.toURL() + fileName);
								}, function (e) {
									console.log('error, could not open file: ' + JSON.stringify(e));
								});*/
								//window.open(directoryEntry.toURL() + fileName, '_blank', 'location=no,enableViewportScale=yes');
								window.open('js/pdf.js-master/web/viewer.html?file=' + directoryEntry.toURL() + fileName, '_blank');
							}, function (error) {
								console.log('Error - ', error);
							});
						},
						function (error) {
							console.log('FileEntry Cannot be retrieved - ', error);
						});
					});
				}
			});
			
			//downloadDataSource = page.getDataSources().get('customer.download');
			//downloadGrid.setDataSource(downloadDataSource);
			//downloadDataSource.read();
		}
	},
	layout: {
		templates: {
			tag: 'fieldset',
			children: [
				{
					tag: 'div',
					name: 'downloadGrid',
					class: 'downloadGrid',
					data: {
						role: 'grid',
						autoBind: false,
						editable: false,
						//toolbar: [{ name: 'save', iconClass: 'fa fa-check' }, { name: 'cancel', iconClass: 'fa fa-ban' }],
						filterable: { mode: 'row' },
						sortable: true,
						scrollable: false,
						pageable: {
							pageSize: 10,
							refresh: true
						},
						selectable: true, 
						columns: [
							/*{
								template: '<input type="checkbox">',
								width: 50
							},*/
							{
								template: '<div class="image" style="width:75px; height: 75px; background-size: contain; background-image: url(# if (typeof thumb !== \'undefined\') { # #: thumb # # } #)"></div>',
								field: 'thumb',
								title: '&nbsp;',
								filterable: false,
								groupable: false,
								width: 100
							},
							{
								field: 'date_added',
								title: 'Date Purchased',
								template: '#= kendo.toString(new Date(date_added), "yyyy-MM-dd") #'
							},
							{
								field: 'name',
								title: 'Product',
							},
							/*{ // TODO: Only hide if portrait
								field: 'model',
								title: 'Model',
							},*/
							{
								field: 'track',
								title: 'Track Name',
							},
							{
								field: 'date',
								title: 'Race Date',
								template: '#= date #'
							},
							/*{
								field: 'option',
								title: 'Options'
							},*/
							/*{
								field: 'price',
								title: 'Price',
								template: '#= kendo.toString(price, "c") #'
							},
							{
								field: 'quantity',
								title: 'Qty.',
								aggregates: ['sum'], 
								footerTemplate: '<p class="total-line-item">#= data.quantity ? kendo.toString(data.quantity.sum, "n0") : kendo.toString(0, "n0") #</p>'
							},
							{
								field: 'reward',
								title: 'Points',
								aggregates: ['sum'], 
								footerTemplate: '<p class="total-line-item">#= data.reward ? kendo.toString(data.reward.sum, "n0") : kendo.toString(0, "n0") #</p>'
							},
							{
								field: 'total',
								title: 'Total',
								template: '#= kendo.toString(total, "c") #',
								aggregates: ['sum'], 
								footerTemplate: '<p class="total-line-item"><label>Sub-total </label>#= data.total ? kendo.toString(data.total.sum, "c") : kendo.toString(0, "c") #</p><p class="total-line-item"><label>Total </label>#= data.total ? kendo.toString(data.total.sum, "c") : kendo.toString(0, "c") #</p>'
							},*/
							/*{
								field: 'download_id',
								title: 'ID',
								//locked: true,
								//lockable: false,
								width: 100
							},
							{
								field: 'mask',
								title: 'File Name',
								width: 200
							},
							{
								field: 'date_added',
								title: 'Date'
							},*/
							/*{
								command: [
									{ name: 'details', text: '&nbsp;', iconClass: 'fa fa-eye' },
									{ name: 'download', text: '&nbsp;', iconClass: 'fa fa-cloud-download' },
									{ name: 'print', text: '&nbsp;', iconClass: 'fa fa-print' },
								], title: '&nbsp;', width: '260px' 
							}*/
							{
								command: [
									{ name: 'details', text: '&nbsp;View', iconClass: 'fa fa-eye' },
									//{ name: 'download', text: '&nbsp;Download', iconClass: 'fa fa-cloud-download' },
									//{ name: 'print', text: '&nbsp;Print', iconClass: 'fa fa-print' },
								//], title: '&nbsp;', width: '470px' 
								//], title: '&nbsp;', width: '370px' 
								], title: '&nbsp;', width: '160px' 
							}
						]
					}
				},
				{
					tag: 'div',
					id: 'downloadPopup',
					name: 'downloadPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'View File',
						width: '100%'
					}
				}
			]
		}
	}
});