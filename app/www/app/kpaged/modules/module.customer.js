// TODO: This needs to be split up into two modules at some point: account (client) and customer (administration)
define({
	name: 'customer',
	id: 'customer',
	autoBind: true,
	autoRender: false,
	// TODO: Make this generic!
	bindCustomFieldsByLabel: function () {
		var that = this,
			page = that.getPage(),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel(),
			model = model || dataSources.get('customer.entity');
			
		console.log('ok we wanna bind to the OpenCart label... god knows why it\'s in text with spaces but whatever');
		console.log(model);
		
	},
	getAccount: function () {
		// TODO: Wtf password sent as plain text?
		var that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			loader = page.getLoader(),
			dataSources = page.getDataSources(),
			sessionId = page.getAuthHandler().getSession(),
			customer;
		
		if (sessionId) {
			customer = dataSources.get('customer.entity') || null;
			if (customer instanceof kendo.data.Model) {
				if (customer.get('session') === sessionId) {
					return customer;
				}
			}
		} else {
			return false;
		}
		
		// Get the account
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/account/',
			type: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			async: false, // No async?
			beforeSend: function (request) {
				request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
				request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
				loader.setMessage('Loading account information...').open();
			},
			success: function (response, status, xhr) {
				if (response.success) {
					if (response.hasOwnProperty('data')) {
						// Create new customer model
						// TODO: Define these in app config
						var Entity = kendo.data.Model.define({
							id: 'customer_id'
						});
						
						var model = new Entity();
						// We can specify a target observable as the second param
						console.log('calling setData... set response data to customer model - ' + new Date());
						that.setData(response.data, model);
						console.log(response.data);
						console.log(dataSources.get('customer.entity'));
						
						// TODO: Better please... events maybe?
						console.log('set customer data - ' + new Date());
						that.setCustomer(model);
						console.log('customer data has been set - ' + new Date());
						
						$('#menu-button-sign-in').closest('li').hide();
						
						$('#menu-button-dashboard').show();
						$('#menu-button-account').closest('li').show();
						$('#menu-button-sign-out').closest('li').show();
						$('#menu-button-change-account').closest('li').show();
					}
				}
			},
			complete: function (response, status) {
				console.log('xhr response', response);
				console.log('status', status);
				
				// TODO: hasOwnProperty checks, etc. - make this more robust
				if (response.success === false || response.responseJSON.success === false) {
					// TODO: Fix checkuser route/action in OpenCart API -- this is fucking stupid
					// Having to base my action on text returned is weak
					loader.setMessage(response.responseJSON.error).open();
					
					setTimeout(function () {
						loader.close();
					}, 3000);
				} else {
					loader.close();
				}
			} 
		});
	},
	updateCustomer: function () {
		// TODO: Create a way to sync the model on change This is a Model, 
		var that = this,
			page = that.getPage(),
			loader = page.getLoader(),
			moduleElement = $('#' + that.getId()),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel(),
			model = model || dataSources.get('customer.entity'),
			//request = that.getRequest(),
			validator = that.getValidator(),
			eventHandler = that.getEventHandler(),
			filterData = false,
			// _block and _page properties are assigned to the view-model during Block binding
			// $id is a remnant from JSON.NET serialization
			filterKeys = ['_block', '_page', '$id', 'password', 'cart', 'wishlist', 'session'], // Also strip password and cart
			data,
			response,
			url;
		
		// If we're dealing with a view-model convert to JSON to fry any methods & circular references
		if (viewModel instanceof kendo.data.ObservableObject) {
			data = $.extend(true, new kendo.data.ObservableObject(), viewModel);
			
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
		
		console.log('SEND TO SERVER');
		console.log(data);
		
		// Update user
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/account/',
			data: JSON.stringify(data),
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			async: true, // No async login
			beforeSend: function (request) {
				request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
				request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
				loader.setMessage('Please wait while we update your account...').open();
			},
			success: function (response, status, xhr) {
				if (response.success) {
					if (response.hasOwnProperty('data')) {
						loader.setMessage('Success! Your information has been updated').open();
					
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
		
		// Set defaults
		/*ajaxDefaults = {
			type: 'POST',
			url: '
			contentType: 'application/json; charset=utf-8',
			data: data,
			dataType: 'json',
			async: true,
			processData: false,
			beforeSend: function (xhr, settings) {
				// Trigger the Page's saving event
				if (eventHandler.hasEvent('saving')) {
					event = eventHandler.getEvent('saving');
					event.dispatch(event, settings);
				}
			},
			complete: function (xhr, status) {
				switch (status) {
					case 'success':
						// Trigger the Page's saved event
						if (eventHandler.hasEvent('saved')) {
							event = eventHandler.getEvent('saved');
							event.dispatch(event, status, xhr);
						}
						
						break;
					case 'error':
						// Trigger the Page's saveFailed event
						if (eventHandler.hasEvent('saveFailed')) {
							event = eventHandler.getEvent('saveFailed');
							event.dispatch(event, status, xhr);
						}
						
						break;
				}
			}
		};*/
		
		// Do we use the string value of the route, or extend the ajax configuration?
		/*if (config.hasOwnProperty('route') && typeof config.route !== 'undefined') {
			if (config.route.hasOwnProperty('update') && typeof config.route.update !== 'undefined') {
				url = App.getRootWebsitePath() + '/' + config.route.update.url;
					
					// Check if an ID was set in the request, otherwise try to pull it from the query string
					id = (request.hasOwnProperty('id') && request.id !== '') ? request.id : App.Helpers.URL.getParam('id');

					// If we found an ID, append it to the URL
					// TODO: I'm not sure if this is the best way of going about this...
					// Ideally, each route.{crud} parameter would be a route with a callback for a corresponding page event
					if (id !== null) {
						url = url + '/' + id; 
					}
					
					$.extend(true, ajaxDefaults, config.route.update, { url: url });
				}
				
				response = $.ajax(ajaxDefaults);
			} else {
				if (App.getConfig('debug') === true) {
					throw new Error('The route parameters for this page have been incorrectly configured');
				} else {
					errors[0] = 'The route parameters for this page have been incorrectly configured';
					errorHandler.setErrors('error', errors);
				}
			}
		} else {
			// This is a redundant check, just to be safe
			// A page will not render unless a route configuration has been provided
			if (App.getConfig('debug') === true) {
				throw new Error('The route parameters for this page have not been configured');
			} else {
				errors[0] = 'Please contact your systems administrator: the route parameters for this module have not been configured';
				errorHandler.setErrors('error', errors);
			}
		}*/
		
		return this;
	},
	setCustomer: function (model) {
		var that = this,
			page = that.getPage(),
			moduleElement = $('#' + that.getId()),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel(),
			model = model || dataSources.get('customer.entity');
			
		// TODO: setCustomer is being called by the login right now, and not all of this has to process at once
		// Actual rendering/binding should be done when the My Account button's click event is triggered
		if (model instanceof kendo.data.Model) {
			var setModel = function (model) {
				//that.bindCustomFieldsByLabel();
				
				//console.log('rebinding nested customer module blocks - ' + new Date());
				console.log('nested customer blocks - let\'s see what we have to work with here...');
				moduleElement.find('[id^=block_]').each(function (idx, block) {
					console.log('binding nested block [' + $(block).attr('id') + ']');
					console.log(page.getBlock($(block).attr('id')));
				});
				//console.log('nested blocks databound - ' + new Date());
				
				console.log('calling setData... setting customer model data to the view-model - ' + new Date());
				that.setData(model);
				
				dataSources.set('customer.entity', model);
				
				//kendo.unbind(moduleElement);
				console.log('rebinding customer module - ' + new Date());
				kendo.bind(moduleElement, viewModel);
				
				console.log('binding custom fields - ' + new Date());
				console.log('custom fields');
				console.log(model.custom_fields);
				
				var hash = App.Utilities.HashTable();
				model.custom_fields.forEach (function (customField, idx) {
					// OpenCart uses a stupid "name" field with spaces
					hash.setItem(customField.name, customField);
				});
				
				//console.log('rebinding nested customer module blocks - ' + new Date());
				/*moduleElement.find('[id^=block_]').each(function (idx, block) {
					console.log('binding nested block 'block);
					page.getBlock($(block).attr('id')).dataBind(viewModel);
				});*/
				//console.log('nested blocks databound - ' + new Date());
				
				// TODO: Complete this
				// Step 1: Get labels - we're going to need to match against these
				moduleElement.find('label').each(function (idx, label) {
					var fieldName = $(label).attr('for'),
						labelText = $(label).text(),
						item = hash.hasItem(labelText) ? hash.getItem(labelText) : null,
						field;
					
					// We're using custom bindings which should override any preexisting stuff so don't worry about overwriting...
					if (fieldName && item !== null) {
						
						console.log('found item');
						console.log(item);
						fields = $('[name=' + fieldName + ']');
						
						fields.each(function (idx, field) {
							console.log('matching text to field [' + fieldName + ']');
							console.log(field);
							if ($(field).hasClass('k-input') || $(field).hasClass('k-textbox')) {
								// It's a text box just bind 'er
								moduleElement.find('[name=' + fieldName + ']').attr('data-bind', 'value: account_custom_field[' + item.custom_field_id + ']');
							} else if ($(field).attr('data-role') === 'dropdownlist') {
								// Create dataSource
								
								var dsName = 'account_custom_field_' + item.custom_field_id + 'Source',
									ds = new kendo.data.DataSource({
										data: item.custom_field_value.toJSON()
									});
									
								
								viewModel.set(dsName, ds);
								
								moduleElement.find('[name=' + fieldName + ']').attr('data-text-field', 'name').attr('data-value-field', 'custom_field_value_id');
								moduleElement.find('[name=' + fieldName + ']').attr('data-bind', 'value: account_custom_field[' + item.custom_field_id + '], source: ' + dsName);
								
								kendo.bind(moduleElement.find('[name=' + fieldName + ']'), viewModel);
								
								moduleElement.find('[name=' + fieldName + ']').each(function (idx, el) {
									var list = $(el).data('kendoDropDownList');
									list.setOptions({
										valuePrimitive: true
									});
								});
							}
						});
					}
				});
				
				console.log('finished binding custom fields - ' + new Date());
				
				console.log('customer module data-binding complete... logging view-model - ' + new Date());
				console.log(viewModel);
				
				/*moduleElement.find('[id^=module_orders_]').each(function (idx, ordersModule) {
					page.getModule($(ordersModule).attr('id')).dataBind(viewModel);
				});*/
				
				moduleElement.find('[id^=module_customerOrders_]').each(function (idx, module) {
					var customerOrdersModule = page.getModule($(module).attr('id'));
					customerOrdersModule.dataBind()
					customerOrdersModule.getCollection();
				});
				
				var addressGrid = $('#' + that.getId()).find('[name=customerAddressGrid]').first().data('kendoGrid'),
					addressData = [];
				
				// TODO: If address is bound to customer, provide an option to bind to existing address data
				// I think this is how it works with OpenCart REST API, and that's why I have this here...
				/*if (viewModel.get('addresses')) {
					$.each(viewModel.get('addresses').toJSON(), function (idx, address) {
						addressData.push(address); 
					});
				}*/
				
				addressGrid.setDataSource(new kendo.data.DataSource({
					//data: addressData
					transport: {
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest/account/address',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
							}
						},
						/*update: {
							url: App.getConfig('serviceUrl') + 'api/rest/account/address',
							type: 'PUT',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
							}
						},
						// TODO: Delete requires some packaging
						destroy: {
							url: App.getConfig('serviceUrl') + 'api/rest/account/address',
							type: 'DELETE',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Merchant', 'demo');
							}
						}*/
					},
					pageSize: 30,
					schema: {
						parse: function (response) {
							var results = [];
							
							$.each(response.data.addresses, function (idx, address) {
								results.push(address);
							});
							
							return results;
						},
						model: {
							id: 'address_id'
						}
					}
				}));
				
				addressGrid.dataSource.bind('change', function (e) {
					moduleElement.find('[id^=module_address_]').each(function (idx, el) {
						var id = $(el).attr('id'),
							addressModule = page.getModule(id),
							addressId, addressModel; 
						
						addressId = model.get('address_id') || null; // The customer should be bound so let's grab the address id
						// Keep these logs for debug mode
						console.log('attempting to set address data using address_id: ' + addressId);
						
						addressModel = (addressId !== null) ? addressGrid.dataSource.get(addressId) : null;
						
						console.log('customer model');
						console.log(model);
						console.log('address model');
						console.log(addressModel);
						
						// Nest the data in an address property, and force binding!
						//addressModule.setData({ address: addressModel });
						addressModule.getViewModel().set('address', addressModel);
						addressModule.dataBind(viewModel, true);
						console.log(addressModule.getViewModel());
						// I added a force parameter to KendoDOMBinder.bind but I may need to modify or re-render the module instance to get this working smoothly
						// Another look is needed at the least :)
						
						console.log('dumping customer and address viewmodels - they should match up if this is working');
						console.log(viewModel);
						console.log(addressModule.getViewModel());
					});
				});
				
				addressGrid.dataSource.read();
				console.log('address grid yo');
				console.log(addressGrid.dataSource);
				
				// If we're setting the customer, the download grid should be rendered anyway
				var downloadGrid = $('#' + that.getId()).find('[name=downloadGrid]').each(function (idx, el) {
					var grid = $(el).data('kendoGrid');
					grid.dataSource.read();
				});
				
			};
			
			setModel(model);
		}
	},
	clearCustomer: function () {
		var that = this,
			page = that.getPage(),
			dataSources = page.getDataSources();
			
		dataSources.set('customer.entity', undefined);
	},
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
			
			// Register any custom methods
			that.getAccount = that.getConfig().getAccount;
			that.setCustomer = that.getConfig().setCustomer;
			that.updateCustomer = that.getConfig().updateCustomer;
			that.clearCustomer = that.getConfig().clearCustomer;
			that.bindCustomFieldsByLabel = that.getConfig().bindCustomFieldsByLabel;
			
			/*if (!dataSources.has('customer.entity')) {
				// Initialize datasources
				// TODO: Some generic way to get metadata from service URL
				// I have done entity work before so mostly refactoring involved
				dataSources.set('customer.entity', kendo.data.Model.define({
					id: 'customer_id',
				}));
			}*/
			
			/*if (!dataSources.has('customer.transaction.order')) {
				// Initialize datasources
				dataSources.set('customer.transaction.order', new kendo.data.DataSource({
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
			}*/
		},
		// TODO: Speed up rendering, we don't need to load address etc. modules yet?
		rendered: function (e) {
			var	that = this,
				page = that.getPage();
			
			that.dataBind(that.getViewModel());
			
			var moduleElement = $('#' + that.getId()),
				modules, module;
				
			var modules = moduleElement.find('[data-module=address], [data-module=customerOrders], [data-module=downloads]');
			modules.each(function () {
				var id = $(this).attr('id');
				module = page.getModule(id);
				module.render();
			});
			
			var widgetTypes = App.Config.Widgets.defaults(),
				widgets;
				
			// Trigger pageLoaded event on widgets
			// TODO: Add support for attaching multiple event listeners to a built-in page event
			$.each(widgetTypes, function (widgetRole, widgetConfig) {
				if (widgetConfig.hasOwnProperty('type')) {
					widgets = $('.k-widget').find('[data-role=' + widgetRole + ']');
					if (widgets) {
						widgets.each(function (idx, widget) {
							if (App.getConfig('debug') === true) {
								/*App.log('Triggering pageLoaded event on ' + widgetConfig.type + ' widget attached to:');
								App.log(widget);
								App.log($(widget));*/
							}
							
							if (typeof $(widget).data(widgetConfig.type) !== 'undefined') {
								$(widget).data(widgetConfig.type).trigger('pageLoaded');
							}
						});
					}
				}
			});
			
			moduleElement.find('#customerPanels').data('kendoPanelBar').setOptions({
				dataSource: [
					{	
						text: 'Profile',
						spriteCssClass: 'fa fa-user'
					},
					/*{	
						text: 'Membership',
						spriteCssClass: 'fa fa-slideshare'
					},*/
					{	
						text: 'Address Book',
						spriteCssClass: 'fa fa-book'
					},
					/*{	
						text: 'Wish List',
						spriteCssClass: 'fa fa-cloud'
					},*/
					{	
						text: 'Downloads',
						spriteCssClass: 'fa fa-download'
					},
					/*{	
						text: 'History',
						spriteCssClass: 'fa fa-clock-o'
					},*/
					{	
						text: 'Transactions',
						spriteCssClass: 'fa fa-refresh'
					},
					/*{	
						text: 'Returns',
						spriteCssClass: 'fa fa-repeat'
					},*/
					{	
						text: 'Credits',
						spriteCssClass: 'fa fa-star'
					},
					/*{	
						text: 'IP Addresses',
						spriteCssClass: 'fa fa-laptop'
					}*/
				]
			});
			
			// Maps PanelBar menu items to their corresponding tabs
			moduleElement.find('.entityPopupMenu').each(function (idx, obj) {
				var menu = $(obj).data('kendoPanelBar'),
					tabs = $(obj).parent().find('.entityPopupTabs').first().data('kendoSemanticTabStrip');
					// TODO: Semantic vs. standard tabs
				
				menu.bind('select', function (e) {
					var panelIndex = menu.element.find('li').index($(e.item));
					tabs.select(panelIndex);
				});
			});
			
			// TODO: We need an admin version of this... where we do manually set the customer
			// Now that I think, we have a setCustomer method, but maybe a setCustomerById would be good
			// Some way to decorate the module if it's an admin module? 
			// Sending out a JS file with all the functionality isn't all that secure
			//that.setCustomer(1);
			
			moduleElement.find('[name=buttonCustomerEditSave]').each(function (idx, button) {
				$(button).data('kendoButton').bind('click', function (e) {
					that.updateCustomer();
				});
			});
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					style: 'display: flex; flex-flow: row wrap; height: 100%; width: 100%; justify-content: space-between',
					children: [
						{
							tag: 'div',
							style: 'display: flex; flex: 1 1 0; flex-flow: row wrap; order: 2',
							children: [
								{
									tag: 'div',
									class: 'entityPopupContent',
									style: 'flex: 0 0 100%',
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
											tabs: ['Profile', /*'Membership',*/ 'Address Book', /*'Wish List',*/ 'Downloads', 'History', 'Transactions', /*'Returns',*/ 'Credits'/*, 'IP Addresses'*/],
											fieldsets: [
												{
													tag: 'fieldset',
													children: [
														{
															tag: 'div',
															style: 'display: flex !important; flex-flow: row wrap; width: 100%; height: 100%; justify-content: space-around',
															children: [
																{
																	tag: 'div',
																	style: 'width: 20%; height: 220px; background: url(public/images/avatars/avatar_m01.png) no-repeat 50% 50%; background-size: contain'
																},
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
																				block: 'personalInfo',
																				autoBind: false
																			}]
																		},
																		{
																			tag: 'fieldset',
																			id: 'contact-company',
																			legend: 'Organization Details',
																			children: [{
																				block: 'companyInfo',
																				autoBind: false
																			}]
																		}
																	]
																},
																{
																	tag: 'div',
																	children: [{ block: 'contactInfo', autoBind: false }]
																},
																{
																	tag: 'div',
																	style: 'position: relative; left: 25px',
																	//style: 'position: relative; left: 120px',
																	children: [
																		{
																			block: 'autorow',
																			config: {
																				items: [
																					{
																						tag: 'input',
																						type: 'text',
																						label: 'Customer Card Number',
																						id: 'customerCardNo', // TODO: Label "for" attr dependent on having ID set... alternatives?
																						name: 'customerCardNo',
																						class: 'k-textbox',
																						/*data: {
																							bind: ''
																						}*/
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
																						type: 'password',
																						label: 'Update Password',
																						name: 'password',
																						class: 'k-textbox',
																						/*data: {
																							bind: ''
																						}*/
																					},
																					{
																						tag: 'input',
																						type: 'password',
																						label: 'Confirm Password',
																						name: 'password',
																						class: 'k-textbox',
																						/*data: {
																							bind: ''
																						}*/
																					}
																				]
																			}
																		},
																		{ tag: 'h4', text: 'Billing Address', style: 'position: absolute' },
																		{ module: 'address', config: { autoBind: false } }																		
																	]
																},
																// TODO: Make shipping address configurable
																/*{
																	tag: 'div',
																	children: [{ tag: 'h4', text: 'Shipping Address', style: 'position: absolute' }, { module: 'address' }]
																}*/
																{
																	block: 'autorow',
																	config: {
																		params: {
																			style: 'margin-top: 10px'
																		},
																		items: [
																			{
																				id: 'button-clear',
																				name: 'buttonCustomerEditCancel',
																				class: 'cta',
																				tag: 'button',
																				type: 'button',
																				text: 'Cancel Changes',
																				// TODO: CTA styles
																				data: {
																					role: 'button',
																					spriteCssClass: 'fa fa-ban'
																				}
																			},
																			{
																				id: 'button-customer-save',
																				name: 'buttonCustomerEditSave',
																				class: 'cta primary',
																				tag: 'button',
																				type: 'button',
																				text: 'Save Profile',
																				// TODO: CTA styles
																				data: {
																					role: 'button',
																					spriteCssClass: 'fa fa-check',
																					/*bind: {
																						events: {
																							click: function (e) {
																								App.getCurrent().save(e);
																							}
																						}
																					}*/
																				}
																			}
																		]
																	}
																}
															]
														}
													]
												},
												/*{
													tag: 'fieldset'
												},*/
												{
													tag: 'fieldset',
													children: [
														{
															tag: 'div',
															name: 'customerAddressGrid',
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
																	refresh: true
																},
																selectable: 'row',
																toolbar: [{ name: 'create', text: 'Add New Address' }],
																columns: [
																	{
																		field: 'address_1',
																		title: 'Address',
																		width: 200
																	},
																	{
																		field: 'city',
																		title: 'City',
																		width: 200
																	},
																	{
																		field: 'zone',
																		title: 'Province'
																	},
																	{
																		field: 'postcode',
																		title: 'Postal Code'
																	},
																	{
																		field: 'country',
																		title: 'Country'
																	},
																	{ command: [ { text: 'Details' }, { text: 'Default' }, { text: 'Unlink', name: 'destroy'} ], title: '&nbsp;', width: '280px' }
																]
															}
														}
													]
												},
												/*{
													tag: 'fieldset'
												},*/
												{
													tag: 'fieldset',
													children:[{ module: 'downloads', config: { autoRender: true } }]
												},
												/*{
													tag: 'fieldset',
													//children:[{ module: 'history', config: { autoRender: true } }]
												},*/
												{
													tag: 'fieldset',
													children:[{ module: 'customerOrders', config: { autoRender: true } }]
												},
												{
													tag: 'fieldset',
													//children:[{ module: 'orders', config: { autoRender: true } }]
												}
											]
										}		
									]
								}
							]
						},
						{
							tag: 'ul',
							id: 'customerPanels',
							class: 'entityPopupMenu',
							style: 'width: 20%; order: 1',
							data: {
								role: 'panelbar'
							}
						}
					]
				}
			]	
		}
	}
});