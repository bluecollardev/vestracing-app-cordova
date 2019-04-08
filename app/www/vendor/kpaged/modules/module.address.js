define({
	name: 'address',
	id: 'address', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	mode: 'simple',
	dataSources: undefined,
	getDataSources: function () {
		var that = this;
		return that.dataSources;
	},
	getFields: function () {
		var that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			block = page.getBlock('center-pane'),
			viewModel = that.getViewModel(),
			fields = {};
			
		var config = {
			addressee: true,
			civic: true,
			rural: false
		};
		
		if (config.addressee) {
			fields.addressee = {
				customer_id: $.trim(viewModel.get('customer_id')),
				firstname: $.trim(viewModel.get('firstname')),
				lastname: $.trim(viewModel.get('lastname')),
				company: $.trim(viewModel.get('company'))
			};
		}
		
		switch (that.mode) {
			case 'simple':
				fields.simple = {
					address_1: $.trim(viewModel.get('address.address_1')),
					address_2: $.trim(viewModel.get('address.address_2'))
				};
				
				break;
			case 'complex':
				fields.civic = {
					suiteNumber: $.trim(viewModel.get('address.suiteNumber')),
					streetNumber: $.trim(viewModel.get('address.streetNumber')),
					streetName: $.trim(viewModel.get('address.streetName')),
					streetType: $.trim(viewModel.get('address.streetType')),
					streetDirection: $.trim(viewModel.get('address.streetDirection')),
					poBox: (viewModel.get('address.poBox')) ? 'PO BOX ' + $.trim(viewModel.get('address.poBox')) : ''
					
				};
				// Rural address fields
				
				if (config.rural) {
					fields.rural = {
						rr: (viewModel.get('address.rr')) ? 'RR ' + $.trim(viewModel.get('address.rr')) : '',
						site: (viewModel.get('address.site')) ? 'SITE ' + $.trim(viewModel.get('address.site')) : '',
						comp: (viewModel.get('address.comp')) ? 'COMP ' + $.trim(viewModel.get('address.comp')) : '',
						box: (viewModel.get('address.box')) ? 'BOX ' + $.trim(viewModel.get('address.box')) : '',
						lotNumber: (viewModel.get('address.lotNumber')) ? 'LOT ' + $.trim(viewModel.get('address.lotNumber')) : '',
						concessionNumber: (viewModel.get('address.concessionNumber')) ? 'CONCESSION ' + $.trim(viewModel.get('address.concessionNumber')) : ''
					};
				}
				
				break;
		}	
			
		fields.common = {
			address_id: $.trim(viewModel.get('address.address_id')),
			station: (viewModel.get('address.station')) ? 'STN ' + $.trim(viewModel.get('address.station')) : '',
			city: $.trim(viewModel.get('address.city')),
			zone: $.trim(viewModel.get('address.zone')),
			postcode: $.trim(viewModel.get('address.postcode')),
			country: $.trim(viewModel.get('address.country'))
		};
		
		return fields;
	},
	initWindows: function () {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			//block = page.getBlock('center-pane'),
			viewModel = that.getViewModel(),
			addressEditPopup,
			addressLookupPopup,
			addressEditWindow,
			addressLookupWindow;
			
		// Bind popups, and set module props so they can be accessed from layout
		that.addressEditPopup = addressEditPopup = moduleElement.find('[name=addressEditPopup]');
		that.addressLookupPopup = addressLookupPopup = moduleElement.find('[name=addressLookupPopup]');
		
		kendo.bind(addressEditPopup, viewModel);
		kendo.bind(addressLookupPopup, viewModel);
			
		// Initialize windows from popups
		that.addressEditWindow = addressEditWindow = addressEditPopup.kendoWindow({
			//appendTo: 'form',
			modal: true,
			visible: false,
			resizable: false,
			draggable: true,
			title: 'Edit Current Address',
			width: 'auto'
		}).data('kendoWindow');
		
		// Bind form buttons
		var addressEditSelect = $(document.body).find('[name=addressEditSelect]').first();
		addressEditSelect = addressEditSelect.data('kendoButton');
		addressEditSelect.bind('click', function (e) {
			that.updateAddress(); // TODO: Callback for executing code below
			that.setAddress();
			that.addressEditWindow.close();
		});
		
		that.addressLookupWindow = addressLookupWindow = addressLookupPopup.kendoWindow({
			//appendTo: 'form',
			modal: true,
			visible: false,
			resizable: false,
			draggable: true,
			title: 'Address Search',
			width: '90%'
		}).data('kendoWindow');
		
	},
	initTriggers: function () {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			//block = page.getBlock('center-pane'),
			viewModel = that.getViewModel(),
			addressEditTrigger, 
			addressLookupTrigger;
		
		// Bind triggers
		addressEditTrigger = moduleElement.find('[name=addressEditTrigger]').first();
		addressLookupTrigger = moduleElement.find('[name=addressLookupTrigger]').first();
		
		kendo.bind(addressEditTrigger, viewModel);
		kendo.bind(addressLookupTrigger, viewModel);
		
		that.addressEditTrigger = addressEditTrigger.data('kendoButton'); // Watch out - changing types!
		that.addressLookupTrigger = addressLookupTrigger.data('kendoButton'); // Watch out - changing types!
		
		// TODO: This if f***ing stupid I should be able to bind from layout
		that.addressEditTrigger.bind('click', function (e) {
			var moduleElement = e.sender.element.closest('[id^=module_address_]'),
				module = page.getModule(moduleElement.attr('id')),
				editWindow = that.addressEditWindow;
			
			editWindow.center();
			editWindow.wrapper.css({ top: 0 });
			editWindow.open();
			
			// Get the original values...
			var initialCountryValue = parseInt(viewModel.get('address.country_id')),
				initialCountryText = viewModel.get('address.country'),
				isCountrySwitched = false;
			
			that.addressEditPopup.find('[name=country_form]').each(function (idx, countrySelect) {
				$(countrySelect).data('kendoComboBox').unbind('change');
				$(countrySelect).data('kendoComboBox').bind('change', function (e) {
					var value = parseInt(e.sender.value()),
						text = '';
						
					if (value) {
						text = e.sender.text();
						that.loadZones(value);
						viewModel.set('address.country', text);
						// Not sure why I have to set this if it's bound but whatever...
						viewModel.set('address.country_id', value);
						
						if (value !== initialCountryValue || isCountrySwitched) {
							viewModel.set('address.zone_id', null);
							viewModel.set('address.zone', '');
							// Stupid ComboBox widget doesn't update just 'cause you update the viewmodel? That is retarded...
							that.addressEditPopup.find('[name=zone_form]').each(function (idx, zoneSelect) {
								$(zoneSelect).data('kendoComboBox').value('');
							});
							
							// After it's switched once, we can't revert
							isCountrySwitched = true;
						}
					}
				});
			});
			
			that.addressEditPopup.find('[name=zone_form]').each(function (idx, zoneSelect) {
				$(zoneSelect).data('kendoComboBox').unbind('change');
				$(zoneSelect).data('kendoComboBox').bind('change', function (e) {
					var value = e.sender.value(),
						text = '';
						
					if (value) {
						text = e.sender.text();
						viewModel.set('address.zone', text);
						// Not sure why I have to set this if it's bound but whatever...
						viewModel.set('address.zone_id', value);
					}
				});
			});
			
			that.loadCountries();
			var countryId = viewModel.get('address.country_id');
			if (typeof countryId !=='undefined') {
				that.loadZones(viewModel.get('address.country_id'));
			}
			
			// TODO: No IDs yo
			// Make sure Canadian fields are displayed if address lookup was used
			that.addressEditPopup.find('[name=country_form]').each(function (idx, countrySelect) {
				$(countrySelect).data('kendoComboBox').trigger('change');
			});
		});
		
		that.addressLookupTrigger.bind('click', function (e) {
			var moduleElement = e.sender.element.closest('[id^=module_address_]'),
				module = page.getModule(moduleElement.attr('id')),
				lookupWindow = that.addressLookupWindow;
			
			lookupWindow.center();
			lookupWindow.wrapper.css({ top: 0 });
			lookupWindow.open();
		});
		
	},
	initTabs: function () {
		var that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			//block = page.getBlock('center-pane'),
			viewModel = that.getViewModel(),
			tabs;
		
		// Bind tabs
		tabs = that.addressEditPopup.find('.address-tabs');
		if (tabs.length > 0) {
			tabs = tabs.first();
			kendo.bind(tabs, viewModel);
			
			that.tabs = tabs.data('kendoSemanticTabStrip'); // Watch out - changing types!
		} else {
			that.tabs = false;
		}
	},
	getActiveTab: function () {
		var that = this,
			tabs = that.tabs || false,
			tab = false;
		
		tab = (tabs) ? tabs.select() : tab;
		
		return tab;
	},
	// TODO: Accept format from OpenCart etc.
	buildAddressString: function (fields) {
		var that = this,
			mode = that.mode || 'simple',
			address = [],
			addressString = [],
			tab = that.getActiveTab(),
			current;
			
		if (mode === 'simple') {
			that.buildSimpleAddressString(fields, address);
		} else if (mode === 'complex') {
			that.buildComplexAddressString(fields, address);
		}
		
		// Append city/municipality, zone and postal code
		address.push('{city}, {zone}');

		//if (fields.common.country == 'USA') {
			address.push('{country} {postcode}');
		//}
		
		// Replace formatting keys with form values
		$.each(address, function (idx, format) {
			current = format;
			if (tab) {
				if (tab.index() === 0) {
					$.each(fields.civic, function (key, value) {
						current = current.replace('{' + key + '}', value);
					});
				} else if (tab.index() === 1) {
					$.each(fields.rural, function (key, value) {
						current = current.replace('{' + key + '}', value);
					});
				}
			} else {
				// Simple address mode
				$.each(fields.simple, function (key, value) {
					current = current.replace('{' + key + '}', value);
				});
			}
			
			$.each(fields.common, function (key, value) {
				current = current.replace('{' + key + '}', value);
			});
			
			if ($.trim(current) !== '') {
				addressString.push($.trim(current));
			}
		});
		
		// Join address strings
		addressString = addressString.join('\r\n');
		
		return addressString;
	},
	buildSimpleAddressString: function (fields, address) {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			block = page.getBlock('center-pane'),
			viewModel = that.getViewModel();
		
		address.push('{address_1}');
		address.push('{address_2}');
	},
	buildComplexAddressString: function (fields, address) {
		var that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			block = page.getBlock('center-pane'),
			viewModel = that.getViewModel(),
			addressString = [],
			tab = that.getActiveTab();
			
		// Create a string representation of the address fields
		if (tab.index() === 0) {
			// Civic address selected
			// Clear all rural values
			$.each(fields.rural, function (key, value) {
				viewModel.set(key, '');
			});
			
			if (fields.civic.suiteNumber !== '') {
				address.push('{suiteNumber}-{streetNumber} {streetName} {streetType} {streetDirection}');
			} else {
				address.push('{streetNumber} {streetName} {streetType} {streetDirection}');
			}
			address.push('{poBox} {station}');
		} else if (tab.index() === 1) {
			// Rural address selected
			// Clear all civic values
			$.each(fields.civic, function (key, value) {
				viewModel.set(key, ''); 
			});
			
			if (fields.rural.lot !== '' && fields.rural.concession !== '') {
				address.push('{lotNumber} {concessionNumber}');
			}
			if (fields.rural.site !== '' && fields.rural.comp !== '') {
				address.push('{site} {comp} {box}');
			}
			address.push('{rr} {station}');
		}
	},
	setAddress: function () {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			block = page.getBlock('center-pane'),
			viewModel = that.getViewModel(),
			addressEventHandler = that.getEventHandler(),
			addressValidator = block.getValidator(),
			tab = that.getActiveTab(),
			current;
			
		//if (tab) {}
		
		var fields = that.getFields(),
			addressString;
			
		addressString = that.buildAddressString(fields);
		$(that.addressDisplay).attr('readonly', false).val(addressString).attr('readonly', true);
		
		// TODO: Re-implement complex address
		/*if (typeof tab !== 'undefined') {
			that.addressDisplay.attr('readonly', false).val(addressString).attr('readonly', true);
			$('div[name=addressEditPopup]').data('kendoWindow').close();
		}*/
	},
	loadCountries: function () {
		var that = this,
			moduleElement = $('#' + that.getId()),
			dataSources = that.getDataSources(),
			page = that.getPage(),
			defaults, ds;
		
		defaults = {
			data: [
				{ Key: 'CANADA', Value: 'CANADA' },
				{ Key: 'USA', Value: 'USA' }
			]
		};
		
		var createCountryDataSource = function () {
			return new kendo.data.DataSource({
				transport: {
					read: {
						beforeSend: function (request) {
							request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
							request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
						},
						url: App.getConfig('serviceUrl') + 'api/rest/countries',
						type: 'GET',
						dataType: 'json',
						contentType: 'application/json'
					}
				},
				schema: {
					parse: function (response) {
						var results = [];
						
						if (response.success) {
							if (response.hasOwnProperty('data')) {
								results = response.data;
							}
						} else if (response.success === false || response.responseJSON.success === false) {
							loader.setMessage(response.responseJSON.error).open();
							
							setTimeout(function () {
								loader.close();
							}, 3000);
						} else {
							loader.close();
						}
						
						return results;
					},
					total: function (data) {
						return (data.hasOwnProperty('length')) ? data.length : 0;
					},
					model: {
						id: 'country_id',
						fields: {
							country_id: { field: 'country_id', type: 'number', editable: false },
							name: { field: 'name', editable: false, nullable: true },
							iso_code_2: { field: 'iso_code_2', editable: false, nullable: true },
							iso_code_3: { field: 'iso_code_3', editable: false, nullable: true },
							address_format: { field: 'address_format', editable: false, nullable: true },
							status: { field: 'status', type: 'number', editable: false, nullable: true }
						}
					}
				},
				filter: { field: 'status', operator: 'eq', value: 1 }
			});
		}
		
		if (dataSources.has('countries') === false || (dataSources.get('countries') instanceof kendo.data.DataSource) === false) {
			dataSources.set('countries', createCountryDataSource());
		}
		
		ds = dataSources.get('countries');
		
		that.addressEditPopup.find('[name=country_form]').each(function (idx, countrySelect) {
			$(countrySelect).data('kendoComboBox').setDataSource(ds);
			console.log($(countrySelect).data('kendoComboBox').options);
		});
	},
	loadZones: function (countryId) {
		var that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			defaults, ds;
		
		ds = new kendo.data.DataSource({
			transport: {
				read: {
					beforeSend: function (request) {
						request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
						request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
					},
					url: App.getConfig('serviceUrl') + 'api/rest/countries/' + countryId,
					type: 'GET',
					dataType: 'json',
					contentType: 'application/json'
				}
			},
			schema: {
				parse: function (response) {
					var results = [];
					
					if (response.success) {
						if (response.hasOwnProperty('data') && response.data.hasOwnProperty('zone')) {
							results = response.data.zone;
						}
					} else if (response.success === false || response.responseJSON.success === false) {
						loader.setMessage(response.responseJSON.error).open();
						
						setTimeout(function () {
							loader.close();
						}, 3000);
					} else {
						loader.close();
					}
					
					return results;
				},
				total: function (data) {
					return (data.hasOwnProperty('length')) ? data.length : 0;
				},
				model: {
					id: 'zone_id',
					fields: {
						zone_id: { field: 'zone_id', type: 'number', editable: false },
						name: { field: 'name', editable: false, nullable: true },
						// TODO: Implement additional fields?
						//iso_code_2: { field: 'iso_code_2', editable: false, nullable: true },
						//iso_code_3: { field: 'iso_code_3', editable: false, nullable: true },
						//address_format: { field: 'address_format', editable: false, nullable: true }
					}
				}
			}
		});
		
		that.addressEditPopup.find('[name=zone_form]').each(function (idx, zoneSelect) {
			// Get the value before rebinding the datasource or you'll lose the value
			$(zoneSelect).data('kendoComboBox').setDataSource(ds);
			console.log($(zoneSelect).data('kendoComboBox').options);
		});
		
		ds.read();
	},
	updateAddress: function () {
		// TODO: Create a way to sync the model on change This is a Model, 
		var that = this,
			page = that.getPage(),
			loader = page.getLoader(),
			moduleElement = $('#' + that.getId()),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel(),
			addressModel = viewModel.get('address'),
			//request = that.getRequest(),
			validator = that.getValidator(),
			eventHandler = that.getEventHandler(),
			filterData = false,
			// _block and _page properties are assigned to the view-model during Block binding
			// $id is a remnant from JSON.NET serialization
			filterKeys = ['_block', '_page', '$id', 'session'], // Also strip password and cart
			data,
			response,
			url;
		
		// If we're dealing with a view-model convert to JSON to fry any methods & circular references
		if (viewModel instanceof kendo.data.ObservableObject) {
			data = $.extend(true, new kendo.data.ObservableObject(), addressModel);
			
			// TODO: Let's change the var names... prop/key same thing in JS
			data.forEach(function (prop, key) {										
				// Fry internal references from the view-model
				if (filterKeys.indexOf(key) > -1) {
					delete data[key];
				}
				
				// Fry any kendo.data.DataSource objects attached to the view-model
				if (prop instanceof kendo.data.DataSource) {
					delete data[key];
				}
			});

			// Convert to a plain object
			data = data.toJSON();
		}
		
		console.log('SEND ADDRESS TO SERVER');
		console.log(data);
		
		// Update user
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/account/address/' + viewModel.get('address_id'),
			data: JSON.stringify(data),
			type: 'PUT',
			dataType: 'json',
			contentType: 'application/json',
			async: true, // No async login
			beforeSend: function (request) {
				request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
				request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
				loader.setMessage('Please wait while we update your address...').open();
			},
			success: function (response, status, xhr) {
				if (response.success) {
					if (response.hasOwnProperty('data')) {
						loader.setMessage('Success! Your address has been updated').open();
					
						setTimeout(function () {
							loader.close();
						}, 3000);
					}
				}
			},
			complete: function (response, status) {
				console.log('xhr response', response);
				console.log('status', status);
				
				// TODO: hasOwnProperty checks, etc. - make this more robust
				if (response.success === false || response.responseJSON.success === false) {					
					var message = (response.responseJSON.hasOwnProperty('error')) ? response.responseJSON.error : 'Unspecified error! Please try again or contact support';
					message = (typeof message === 'object' && message.hasOwnProperty('warning')) ? message.warning : message;
					
					loader.setMessage().open();
					
					viewModel.set('password', '');
				
					setTimeout(function () {
						loader.close();
					}, 3000);
				} else {
					loader.close();
				}
			} 
		});
		
		return this;
	},
	// TODO: Re-enable XPath mods -- I have previously worked on this
	/*setLayout: function () {
		var that = this,
			config,
			params;
		
		if (that.getConfig().hasOwnProperty('params')) {
			params = that.getConfig().params;
		}
		
		if (typeof params !== 'undefined') {
			if (params.hasOwnProperty('style')) {
			}
			
			if (params.hasOwnProperty('class')) {
				row.class = [row.class, params.class].join(' ');
			}
		}
	},*/
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage();
			
			that.dataSources = Object.create(App.Utilities.ChainableHash(), {});
			
			// Register any custom methods
			that.mode = that.getConfig().mode; // TODO: Set using params
			that.initTriggers = that.getConfig().initTriggers;
			that.initWindows = that.getConfig().initWindows;
			that.initTabs = that.getConfig().initTabs;
			that.getActiveTab = that.getConfig().getActiveTab;
			that.getFields = that.getConfig().getFields;
			that.buildComplexAddressString = that.getConfig().buildComplexAddressString;
			that.buildSimpleAddressString = that.getConfig().buildSimpleAddressString;
			that.buildAddressString = that.getConfig().buildAddressString;
			that.updateAddress = that.getConfig().updateAddress;
			that.setAddress = that.getConfig().setAddress;
			that.getDataSources = that.getConfig().getDataSources;
			that.loadCountries = that.getConfig().loadCountries;
			that.loadZones = that.getConfig().loadZones;
		},
		rendered: function (e) {
			// TODO: This is temporary until I figure out a more permanent solution
			if ((this._viewModel instanceof kendo.data.ObservableObject) === false) {
				this._viewModel = new kendo.data.ObservableObject();
			}
			
			console.log('rendering address module [' + this._id + ']');
			var	that = this,
				moduleElement = $('#' + that.getId()),
				page = that.getPage(),
				block = page.getBlock('center-pane'),
				viewModel = that.getViewModel(),
				//data = page.getFormData(),
				//addressEventHandler = that.getEventHandler(),
				//addressValidator = block.getValidator(),
				params,
				fields = {},
				current;
			
			try {
				that.dataBind(viewModel);
			} catch (e) {
				App.log(e);
			}
			
			that.initWindows();
			that.initTriggers();
			that.initTabs();
			
			if (that.getConfig().hasOwnProperty('params')) {
				params = that.getConfig().params;
			}
			
			if (typeof params !== 'undefined') {
				if (params.hasOwnProperty('label')) {
					moduleElement.find('[name=addressDisplay]').siblings('label').text(params.label);
				}
			}
			
			// We have to use name attr because initializing widgets can replace the class name
			that.overrideAddress = moduleElement.find('[name=overrideAddress]').first();
			that.overrideAddressReason = moduleElement.find('[name=overrideAddressReason]').first();
			that.addressReviewDate = moduleElement.find('[name=addressReviewDate]').first();
			that.addressDisplay = moduleElement.find('[name=addressDisplay]').first();
			
			// Bind preview
			kendo.bind(that.addressDisplay, viewModel);
			
			// TODO: Only if autobind+autorender or something of the sort
			//that.setAddress();
			
			// Set values to view-model
			/*for (prop in data) {
				if (viewModel.hasOwnProperty(prop)) {
					value = data[prop] || '';
					
					console.log('setting prop: ' + prop + ' | value: ' + value);
					viewModel.set(prop, value);
				}
			}
			
			overrideAddress.click(function (e) {
				var behavior = App.Widgets.Behaviors.OnCheckedEnableWidget(e, {
					target: [
						addressEditTrigger, 
						addressLookupTrigger
					]
				});
				
				behavior.execute();
				
				behavior = App.Behaviors.OnCheckedDisplayFieldGroup(e, {
					target: [overrideAddressReason, addressReviewDate]
				});
				
				behavior.execute();
			});
			
			tab = tabs.select();
			
			// Only if autoBind is true...
			/*try {
				that.dataBind(viewModel);
			} catch (e) {
				App.log(e);
			}*/
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				// START ADDRESS
				// Replace with address module
				{
					tag: 'div',
					class: 'kpaf-row clearfix',
					fieldgroups: [
						{
							tag: 'div',
							class: 'fieldgroup',
							group: [{
								name: 'addressDisplay',
								tag: 'textarea',
								label: 'Current Address',
								readonly: true
							}]
						},
						{
							tag: 'div',
							class: 'fieldgroup address-buttons',
							group: [
								{
									name: 'addressLookupTrigger',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Search for an Address',
									class: 'k-button',
									data: {
										role: 'button',
										// TODO: This is f***ed -- I don't know why it's not working
										/*bind: {
											events: {
												click: function (e) {
													// TODO: Make two helpers for this, getWidget/getWindow?
													// TODO: Or better yet, make a behavior?
													// Get the module
													var moduleElement = e.sender.element.closest('[id^=module_address_]'),
														module = App.getCurrent().getModule(moduleElement.attr('id')),
														lookupWindow = module.addressLookupPopup.data('kendoWindow');
														
													console.log(moduleElement);
													console.log(module);
													console.log(lookupWindow);
													
													lookupWindow.center().open();
												}
											}
										}*/
									}
								},
								{
									name: 'addressEditTrigger',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Edit Current Address',
									class: 'k-button',
									data: {
										role: 'button',
										// TODO: This is f***ed -- I don't know why it's not working
										/*bind: {
											events: {
												click: function (e) {
													// TODO: Make two helpers for this, getWidget/getWindow?
													// Get the module
													var moduleElement = e.sender.element.closest('[id^=module_address_]'),
														module = App.getCurrent().getModule(moduleElement.attr('id')),
														editWindow = module.addressEditPopup.data('kendoWindow');
													
													console.log(moduleElement);
													console.log(module);
													console.log(editWindow);
													
													editWindow.center().open();
												}
											}
										}*/
									}
								}
							]
						},
						{
							tag: 'div',
							class: 'fieldgroup',
							group: [
								{
									class: 'overrideAddress',
									name: 'overrideAddress',
									tag: 'input',
									type: 'checkbox',
									label: 'Override',
									data: {
										bind: {
											checked: 'overrideAddress'
										}
									}
								}
							]
						}
					]
				},
				{
					tag: 'div',
					class: 'kpaf-row clearfix',
					fieldgroups: [
						{
							tag: 'div',
							class: 'fieldgroup',
							style: 'display: none',
							group: [{
								id: 'overrideAddressReason',
								name: 'overrideAddressReason',
								tag: 'textarea',
								label: 'Address Override Reason',
								style: 'width: 306px; height: 60px; border: 1px solid #ddd'
							}]
						},
						{
							tag: 'div',
							class: 'fieldgroup',
							style: 'display: none',
							group: [{
								id: 'addressReviewDate',
								name: 'addressReviewDate',
								tag: 'input',
								type: 'text',
								label: 'Review Date',
								data: {
									role: 'datepicker',
									culture: 'en-CA',
									format: 'dd/MM/yyyy',
									parseFormats: ['yyyy-MM-dd', 'dd/MM/yyyy', 'd/MM/yyyy', 'd/M/yyyy']
								}
							}]
						}
					]
				},
				{
					tag: 'div',
					name: 'addressEditPopup',
					children: [
						{
							block: 'addressSimple', // Custom dynamic block
							name: 'addressSimple', // Custom dynamic block
							config: {
								autoRender: true,
								layout: {
									tag: 'div',
									name: 'address-simple',
									class: 'address-simple',
									children: [
										{
											block: 'autorow',
											config: {
												items: [
													{
														name: 'address_1',
														label: 'Address Line 1',
														tag: 'input',
														type: 'text',
														class: 'k-textbox large',
														data: {
															bind: {
																value: 'address.address_1'
															}
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
														name: 'address_2',
														label: 'Address Line 2',
														tag: 'input',
														type: 'text',
														class: 'k-textbox medium',
														data: {
															bind: {
																value: 'address.address_2'
															}
														}
													},
													{
														id: 'station',
														name: 'station_form',
														label: 'Station',
														tag: 'input',
														type: 'text',
														class: 'small k-textbox',
														data: {
															bind: {
																value: 'address.station',
																events: {
																	change: function (e) {
																		var viewModel = this,
																			station = viewModel.get('address.station');
																		
																		if (station) {
																			viewModel.set('address.station', station.toUpperCase());
																			//$('#station_hidden').val(station.toUpperCase());
																		}
																	}
																}
															}
														}
													}
												]
											}
										}
									]
								}
							}
						},
						{
							block: 'addressComplex', // Custom dynamic block
							name: 'addressComplex', // Custom dynamic block
							config: {
								autoRender: false,
								layout: {
									tag: 'div',
									name: 'address-tabs',
									class: 'address-tabs',
									data: {
										role: 'semantictabstrip',
										animation: false
									},
									tabs: ['Enter Civic', 'Enter Rural'],
									fieldsets: [
										{
											tag: 'fieldset',
											class: 'address-civic',
											legend: 'Civic',
											children: [
												{
													block: 'autorow',
													config: {
														items: [
															// TODO: Complex address mode
															{
																id: 'suiteNumber',
																name: 'suiteNumber_form',
																label: 'Apt/Suite #',
																tag: 'input',
																type: 'text',
																class: 'tiny k-textbox',
																data: {
																	bind: {
																		value: 'address.suiteNumber',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					suiteNumber = viewModel.get('address.suiteNumber');

																				if (suiteNumber) {
																					viewModel.set('address.suiteNumber', suiteNumber.toUpperCase());
																					//$('#suiteNumber_hidden').val(suiteNumber.toUpperCase());
																				}
																			}
																		}
																	}
																}
															},
															{
																id: 'streetNumber',
																name: 'streetNumber_form',
																label: 'Street #',
																tag: 'input',
																type: 'text',
																class: 'small k-textbox',
																data: {
																	bind: {
																		value: 'address.streetNumber',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					streetNumber = viewModel.get('address.streetNumber');
																					
																				if (streetNumber) {
																					viewModel.set('address.streetNumber', streetNumber.toUpperCase());
																					//$('#streetNumber_hidden').val(streetNumber.toUpperCase());
																				}
																			}
																		}
																	}
																}
															},
															{
																id: 'streetName',
																name: 'streetName_form',
																label: 'Street Name',
																tag: 'input',
																type: 'text',
																class: 'medium k-textbox',
																data: {
																	bind: {
																		value: 'address.streetName',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					streetName = viewModel.get('address.streetName');
																				
																				if (streetName)  {
																					viewModel.set('address.streetName', streetName.toUpperCase());
																					//$('#streetName_hidden').val(streetName.toUpperCase());
																				}
																			}
																		}
																	}
																}
															},
															{
																id: 'streetType',
																name: 'streetType_form',
																label: 'Street Type',
																tag: 'input',
																type: 'text',
																class: 'small k-textbox',
																data: {
																	bind: {
																		value: 'address.streetType',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					streetType = viewModel.get('address.streetType');
																				
																				if (streetType) {
																					viewModel.set('address.streetType', streetType.toUpperCase());
																					//$('#streetType_hidden').val(streetType.toUpperCase());
																				}
																			}
																		}
																	}
																}
															},
															{
																id: 'streetDirection',
																name: 'streetDirection_form',
																label: 'Street Direction',
																tag: 'input',
																type: 'text',
																class: 'small',
																style: 'width: 108px',
																data: {
																	role: 'dropdownlist',
																	bind: {
																		source: {
																			type: 'custom',
																			config: {
																				data: [
																					{ Key: 'NE', Value: 'NE' },
																					{ Key: 'NW', Value: 'NW' },
																					{ Key: 'SE', Value: 'SE' },
																					{ Key: 'SW', Value: 'SW' },
																					{ Key: 'N', Value: 'N' },
																					{ Key: 'S', Value: 'S' },
																					{ Key: 'W', Value: 'W' },
																					{ Key: 'E', Value: 'E' },
																					{ Key: '', Value: '' }
																				]
																			}
																		},
																		value: 'address.streetDirection',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					streetDirection = viewModel.get('address.streetDirection') != null ? viewModel.get('address.streetDirection').Value.toUpperCase() : "";
																					
																				viewModel.set('address.streetDirection', streetDirection);
																				//$('#streetDirection_hidden').val(streetDirection);
																			}
																		}
																	},
																	optionLabel: ' '
																}
															},
															{
																id: 'poBox',
																name: 'poBox_form',
																label: 'P.O. Box',
																tag: 'input',
																type: 'text',
																class: 'small k-textbox',
																data: {
																	bind: {
																		value: 'address.poBox',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					poBox = viewModel.get('poBox');
																					
																				if (poBox) {
																					viewModel.set('poBox', poBox.toUpperCase());
																					//$('#poBox_hidden').val(poBox.toUpperCase());
																				}
																			}
																		}
																	}
																}
															}
														]
													}
												}
											]
										},
										{
											tag: 'fieldset',
											class: 'address-rural',
											legend: 'Rural',
											children: [
												{
													block: 'autorow',
													config: {
														items: [
															{
																id: 'rr',
																name: 'rr_form',
																label: 'RR',
																tag: 'input',
																type: 'text',
																class: 'small k-textbox',
																data: {
																	bind: {
																		value: 'address.rr',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					rr = viewModel.get('address.rr');
																				
																				if (rr) {
																					viewModel.set('address.rr', rr.toUpperCase());
																					//$('#rr_hidden').val(rr.toUpperCase());
																				}
																			}
																		}
																	}
																}
															},
															{
																id: 'site',
																name: 'site_form',
																label: 'Site',
																tag: 'input',
																type: 'text',
																class: 'small k-textbox',
																data: {
																	bind: {
																		value: 'address.site',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					site = viewModel.get('address.site');
																				
																				if (site) {
																					viewModel.set('address.site', site.toUpperCase());
																					//$('#site_hidden').val(site.toUpperCase());
																				}
																			}
																		}
																	}
																}
															},
															{
																id: 'comp',
																name: 'comp_form',
																label: 'Comp',
																tag: 'input',
																type: 'text',
																class: 'small k-textbox',
																data: {
																	bind: {
																		value: 'address.comp',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					comp = viewModel.get('address.comp');
																				
																				if (comp) {
																					viewModel.set('address.comp', comp.toUpperCase());
																					//$('#comp_hidden').val(comp.toUpperCase());
																				}
																			}
																		}
																	}
																}
															},
															{
																id: 'box',
																name: 'box_form',
																label: 'Box',
																tag: 'input',
																type: 'text',
																class: 'small k-textbox',
																data: {
																	bind: {
																		value: 'address.box',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					box = viewModel.get('address.box');
																				
																				if (box) {
																					viewModel.set('address.box', box.toUpperCase());
																					//$('#box_hidden').val(box.toUpperCase());
																				}
																			}
																		}
																	}
																}
															},
															{
																id: 'lotNumber',
																name: 'lotNumber_form',
																label: 'Lot #',
																tag: 'input',
																type: 'text',
																class: 'small k-textbox',
																data: {
																	bind: {
																		value: 'address.lotNumber',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					lotNumber = viewModel.get('address.lotNumber');
																				
																				if (lotNumber) {
																					viewModel.set('address.lotNumber', lotNumber.toUpperCase());
																					//$('#lotNumber_hidden').val(lotNumber.toUpperCase());
																				}
																			}
																		}
																	}
																}
															},
															{
																id: 'concessionNumber',
																name: 'concessionNumber_form',
																label: 'Concession #',
																tag: 'input',
																type: 'text',
																class: 'small k-textbox',
																data: {
																	bind: {
																		value: 'address.concessionNumber',
																		events: {
																			change: function (e) {
																				var viewModel = this,
																					concessionNumber = viewModel.get('address.concessionNumber');
																				
																				if (concessionNumber) {
																					viewModel.set('address.concessionNumber', concessionNumber.toUpperCase());
																					//$('#concessionNumber_hidden').val(concessionNumber.toUpperCase());
																				}
																			}
																		}
																	}
																}
															}
														]
													}
												}
											]
										} // END fieldset
									] // END fieldsets
								}
							}
						},
						{
							block: 'autorow',
							config: {
								items: [
									{
										id: 'city',
										name: 'city_form',
										label: 'City/County',
										tag: 'input',
										type: 'text',
										class: 'medium k-textbox',
										data: {
											bind: {
												value: 'address.city',
												events: {
													change: function (e) {
														var viewModel = this,
															city = viewModel.get('address.city');
														
														if (city) {
															viewModel.set('address.city', city.toUpperCase());
															//$('#city_hidden').val(city.toUpperCase());
														}
													}
												}
											}
										}
									},
									{
										id: 'zone',
										name: 'zone_form',
										label: 'Province/State',
										tag: 'input',
										type: 'text',
										data: {
											role: 'combobox',
											bind: {
												value: 'address.zone_id'
											},
											valueField: 'zone_id',
											textField: 'name',
											valuePrimitive: true,
											suggest: true
											//optionLabel: ' '
										}
									},
									
								]
							}
						},
						{
							block: 'autorow',
							config: {
								items: [
									{
										id: 'postcode',
										name: 'postcode_form',
										label: 'Postal Code',
										tag: 'input',
										type: 'text',
										class: 'small k-textbox',
										data: {
											bind: {
												value: 'address.postcode',
												events: {
													change: function (e) {
														var viewModel = this,
															postcode = viewModel.get('address.postcode');
															
														if (postcode)  {
															viewModel.set('address.postcode', postcode.toUpperCase());
															//$('#postcode_hidden').val(postcode.toUpperCase());
														}
													}
												}
											}
										}
									},
									{
										id: 'country',
										name: 'country_form',
										label: 'Country',
										tag: 'input',
										type: 'text',
										data: {
											role: 'combobox',
											bind: {
												value: 'address.country_id',
											},
											valueField: 'country_id',
											textField: 'name',
											valuePrimitive: true,
											suggest: true
											//optionLabel: ' '
										}
									}
								]
							}
						},
						{
							tag: 'div',
							class: 'kpaf-row button-row',
							fields: [
								{
									name: 'addressEditSelect',
									tag: 'button',
									type: 'button',
									label: '\u00a0',
									text: 'Update Current Address',
									class: 'k-button right cta primary',
									data: {
										role: 'button'
									}
								}
							]
						}
					]
				},
				{
					block: 'addressLookup', // Custom dynamic block
					name: 'addressLookup', // Custom dynamic block
					config: {
						autoRender: false,
						layout: {
							tag: 'div',
							name: 'addressLookupPopup',
							/*fieldgroups: [					
								{
									tag: 'div',
									class: 'kpaf-row',
									fields: [
										{
											tag: 'div',
											class: 'fieldgroup',
											group: [{
												class: 'lookupPostalCode',
												name: 'lookupPostalCode',
												label: 'Postal Code',
												tag: 'input',
												type: 'text',
												class: 'k-textbox',
												data: {
													bind: 'lookupPostalCode'
												}
											}]
										},
										{
											tag: 'div',
											class: 'fieldgroup',
											group: [{
												class: 'addressLookupSearch',
												name: 'addressLookupSearch',
												tag: 'button',
												type: 'button',
												label: '\u00a0',
												text: 'Search',
												class: 'k-button right',
												data: {
													role: 'button',
													bind: {
														events: {
															click: function (e) {
																$('#lookupPostalCode').val($('#lookupPostalCode').val().toUpperCase().replace(/\s/g,''));
																$('#addressLookupGrid').data('kendoGrid').dataSource.read();
															}
														}
													}
												}
											}]
										}
									]
								},
								{
									tag: 'div',
									class: 'kpaf-row',
									fields: [
										{
											tag: 'div',
											class: 'addressLookupGrid',
											name: 'addressLookupGrid',
											class: 'max-height-300 scroll-y',
											data: {
												role: 'grid',
												bind: {
													source: {
														type: 'method',
														config: {
															transport: {
																read: {
																	// TODO: these should be configured
																	url:'Insured.aspx/GetAddress',
																	type: 'POST',
																	data: function () {
																		var lookupPostalCode = $("#lookupPostalCode").val();
																		
																		return {
																			lookupPostalCode: lookupPostalCode
																		};
																	},
																	dataType: 'json',
																	contentType: 'application/json'
																}
															},
															schema: {
																data: function (data) {
																	return data.d;
																},
																total: function (data) {
																	return data.d.length;
																}
															},
															pageSize: 10
														}
													}
												},
												autoBind: false, 
												filterable: true,
												sortable: true,
												scrollable: true,
												pageable: {
													pageSize: 10, 
													pageSizes: [ 10 , 25, 50 ]
												},
												selectable: true, 
												columns: [
													{
														field: 'MinStreetNum',
														title: 'Min Street #'
													},
													{
														field: 'MaxStreetNum',
														title: 'Max Street #'
													},
													{
														field: 'StreetName',
														title: 'Street Name'
													},
													{
														field: 'StreetType',
														title: 'Street Type'
													},
													{
														field: 'City',
														title: 'City'
													},
													{
														field: 'Jurisdiction'
													},
													{
														field: 'PostalCode',
														title: 'Postal Code'
													},
													{
														field: 'Direction'
													}
												]
											}
										}
									]
								},
								{
									tag: 'div',
									class: 'kpaf-row',
									fields: [
										{
											class: 'addressLookupSelect',
											name: 'addressLookupSelect',
											tag: 'button',
											type: 'button',
											label: '\u00a0',
											text: 'Select',
											class: 'k-button right',
											data: {
												role: 'button',
												bind: {
													events: {
														click: function (e) {
															var addressLookupGrid = $("#addressLookupGrid").data("kendoGrid"),
																selectedItem = addressLookupGrid.dataItem(addressLookupGrid.select()),
																viewModel = this,
																fields = {
																	// Civic address fields
																	civic: {
																		suiteNumber: $.trim(viewModel.get('address.suiteNumber')),
																		streetNumber: $.trim(viewModel.get('address.streetNumber')),
																		streetName: $.trim(viewModel.get('address.streetName')),
																		streetType: $.trim(viewModel.get('address.streetType')),
																		streetDirection: $.trim(viewModel.get('address.streetDirection')),
																		poBox: (viewModel.get('address.poBox')) ? 'PO BOX ' + $.trim(viewModel.get('address.poBox')) : ''
																	},
																	// Rural address fields
																	rural: {
																		rr: (viewModel.get('address.rr')) ? 'RR ' + $.trim(viewModel.get('address.rr')) : '',
																		site: (viewModel.get('address.site')) ? 'SITE ' + $.trim(viewModel.get('address.site')) : '',
																		comp: (viewModel.get('address.comp')) ? 'COMP ' + $.trim(viewModel.get('address.comp')) : '',
																		box: (viewModel.get('address.box')) ? 'BOX ' + $.trim(viewModel.get('address.box')) : '',
																		lotNumber: (viewModel.get('address.lotNumber')) ? 'LOT ' + $.trim(viewModel.get('address.lotNumber')) : '',
																		concessionNumber: (viewModel.get('address.concessionNumber')) ? 'CONCESSION ' + $.trim(viewModel.get('address.concessionNumber')) : ''
																	},
																	common: {
																		station: (viewModel.get('address.station')) ? 'STN ' + $.trim(viewModel.get('address.station')) : '',
																		city: $.trim(viewModel.get('address.city')),
																		zone: $.trim(viewModel.get('address.zone')),
																		postcode: $.trim(viewModel.get('address.postcode')),
																		country: $.trim(viewModel.get('address.country'))
																	}
																};
																
															if (selectedItem !== null) {
																// Clear the address fields
																$.each(fields, function (key, value) {
																	$.each(fields[key], function (key, value) {
																		viewModel.set(key, ''); 
																	});
																});

																viewModel.set('address.streetName', selectedItem.StreetName);
																viewModel.set('address.streetType', selectedItem.StreetType);
																viewModel.set('address.streetDirection', selectedItem.Direction);
																viewModel.set('address.city', selectedItem.City);
																viewModel.set('address.zone', selectedItem.Jurisdiction);
																viewModel.set('address.postcode', selectedItem.PostalCode);
																viewModel.set('address.country', "CANADA");
																
																// Clear the street number
																viewModel.set('address.streetNumber', '');
																
																$("div#addressLookupPopup").data("kendoWindow").close();
																$("div#addressEditPopup").data("kendoWindow").open();
															}
														}
													}
												}
											}
										}
									]
								}
							]*/
						}
						// END ADDRESS
					}
				}
			]	
		}
	}
});