define({
	name: 'countrySelector',
	id: 'countrySelector', // This can be improved... the double ID reference isn't the greatest
	autoBind: true, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	events: {
		initialized: function () {
			// Do something
		},
		rendered: function (e) {
			var	that = this,
				page = that.getPage(),
				viewModel = page.getBlock(App.getPrimaryBlockName()).getViewModel(),
				eventHandler = that.getEventHandler();
				
			that.dataBind(viewModel);
			
			var countries = $('#countries').data('kendoListView'),
				countriesDataSource = null,
			
			countriesDataSource = new kendo.data.DataSource({
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'api/rest_admin/countries/',
						type: 'GET',
						dataType: 'json',
						beforeSend: function (request) {
							request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
						}
					}
				},
				//pageSize: 30,
				schema: {
					data: 'data',
					model: {
						id: 'country_id'
					}
				},
			});
			
			console.log(viewModel);
			viewModel.set('countriesDataSource', countriesDataSource);
			countries.setDataSource(countriesDataSource);
			
			countries.bind('change', function (e) {
				// Do something
			});
			
			// Set up filters
			$('#textCountry').keyup(function (e) {
				countries.dataSource.filter({ field: 'name', operator: 'contains', value: e.target.value });
			});
			
			viewModel.set('textCountry', 'Canada');
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					block: 'autorow',
					config: {
						params: {
							class: 'country-searchbar'
						},
						items: [
							{
								id: 'textCountry',
								name: 'textCountry',
								label: 'Search Countries',
								tag: 'input',
								type: 'text',
								class: 'k-textbox',
								data: {
									bind: {
										value: 'textCountry'
									}
								},
							},
							{
								tag: 'div',
								id: 'countries',
								name: 'countries',
								//label: 'Countries',
								style: 'max-width: 800px; height: 30px; border: 0; overflow: hidden',
								data: {
									role: 'listview',
									selectable: 'multiple',
									template: {
										id: 'country-item-template',
										source: 'country-item.tmpl.htm'
									}
								}
							}
						]
					}
				}
			]
			
		}
	}
});