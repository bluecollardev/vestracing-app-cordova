define({
	name: 'cart',
	id: 'cart', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: false,
	events: {
		rendered: function (e) {
			var	that = this,
				moduleElement = $('#' + that.getId()),
				page = that.getPage(),
				block = page.getBlock('center-pane'),
				loader = page.getLoader(),
				//viewModel = block.getViewModel()
				dataSources = page.getDataSources(),
				viewModel = that.getViewModel(),
				dashboardViewModel = page.getModule('module_customerDashboard_1').getViewModel(),
				cartEventHandler = that.getEventHandler(),
                cartViewModel = viewModel,
				cartValidator = block.getValidator(),
				cartPopup,
				cartWindow,
				cartTrigger,
				cartDisplay,
				cartGrid,
				sources = {},
				fields = {},
				cart = [],
				cartString = [],
				current;
			
			console.log('rendering cart module [' + this._id + ']');
			// TODO: This is temporary until I figure out a more permanent solution
			if ((this._viewModel instanceof kendo.data.ObservableObject) === false) {
				this._viewModel = new kendo.data.ObservableObject();
			}
				
			console.log('------------------- DASHBOARD VIEWMODEL -------------------');
			console.log(dashboardViewModel);
			
			try {
				that.dataBind(cartViewModel);
			} catch (e) {
				App.log(e);
			}
			
			// Bind popups, and set module props so they can be accessed from layout
			// TODO: Should be able to have multiple instances, we can't do that right now
			// Need some generic way to assign a uid to a window that references the module
			//that.cartPopup = cartPopup = moduleElement.find('[name=cartPopup]');
			that.cartPopup = cartPopup = $(document.body).find('[name=cartPopup]').first();
			that.promoPopup = promoPopup = $(document.body).find('[name=promoPopup]').first();
			
			kendo.bind(cartPopup, cartViewModel);
			
			//if (moduleElement.parent('fieldgroup'));
			
			// Bind triggers
			cartTrigger = moduleElement.find('[name=cartTrigger]').first();
			promoTrigger = cartPopup.find('[name=promoTrigger]').first();
			
			kendo.bind(cartTrigger, cartViewModel);
			kendo.bind(promoTrigger, cartViewModel);
			
			that.cartTrigger = cartTrigger = cartTrigger.data('kendoButton'); // Watch out - changing types!
			that.promoTrigger = promoTrigger = promoTrigger.data('kendoButton'); // Watch out - changing types!
			
			// Initialize windows from popups
			that.cartWindow = cartWindow = cartPopup.data('kendoWindow');
			that.promoWindow = promoWindow = promoPopup.data('kendoWindow');
			
			// We have to use name attr because initializing widgets can replace the class name
			that.cartDisplay = cartDisplay = moduleElement.find('[name=cartDisplay]').first();
			
			// Bind preview
			kendo.bind(cartDisplay, cartViewModel);
			
			// TODO: This if f***ing stupid I should be able to bind from layout
			cartTrigger.bind('click', function (e) {
				var moduleElement = e.sender.element.closest('[id^=module_cart_]'),
					module = page.getModule(moduleElement.attr('id')),
					window = cartWindow;
				
				cartWindow.center().open();
			});
			
			promoTrigger.bind('click', function (e) {
				var moduleElement = e.sender.element.closest('[id^=module_cart_]'),
					module = page.getModule(moduleElement.attr('id')),
					window = promoWindow;
				
				promoWindow.center().open();
			});
			
			that.cartGrid = cartGrid = cartPopup.find('[name=cartGrid]').first().data('kendoGrid');
			cartGrid.setDataSource(new kendo.data.DataSource({
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'api/rest/cart/',
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
					data: function (response) {
						return (response.success && response.hasOwnProperty('data')) ? response.data.products : [];
					},
					total: function (response) {
						return (response.success && response.hasOwnProperty('data')) ? response.data.products.length : 0;
					},
					model: {
						id: 'key',
						fields: {
							key: { field: 'key', editable: false },
							thumb: { field: 'thumb', editable: false, nullable: true },
							name: { field: 'name', editable: false, nullable: true },
							model: { field: 'model', editable: false, nullable: true },
							option: { field: 'option', editable: false, nullable: true },
							quantity: { field: 'quantity', type: 'number', editable: true, nullable: true },
							stock: { field: 'stock', type: 'number', editable: false, nullable: true },
							reward: { field: 'reward', type: 'number', editable: false, nullable: true },
							price: { field: 'price', type: 'number', editable: false, nullable: true },
							total: { field: 'total', type: 'number', editable: false, nullable: true }
						}
					}
				},
				batch: true,
				pageSize: 10,
				aggregate: [{ field: 'quantity', aggregate: 'sum' }, { field: 'reward', aggregate: 'sum' }, { field: 'total', aggregate: 'sum' }]
			}));
			
			cartGrid.bind('edit', function (e) {
				cartGrid.element.find('.k-grid-update').html('<span class="fa fa-check k-update"></span>');
				cartGrid.element.find('.k-grid-cancel').html('<span class="fa fa-ban k-cancel"></span>');
			});
			
			cartGrid.dataSource.read();
			
			var cartClearButton = cartPopup.find('[name=buttonClear]').first().data('kendoButton');
			
			cartClearButton.bind('click', function (e) {
				that.clearCart();
			});
			
			cartPopup.find('[name=buttonCheckout]').first().data('kendoButton')
			.bind('click', function (e) {
				that.checkout();
				
				/*
				Logged in checkout
				Step 1: POST api/rest/paymentaddress to set the payment address
				Step 2: POST api/rest/shippingaddress to set the shipping address
				*/
				// Tested and okay
				/*$.ajax({
					url: App.getConfig('serviceUrl') + 'api/rest/paymentaddress',
					type: 'POST',
					dataType: 'json',
					data: JSON.stringify({
						address_id: 1,
						payment_address: 'existing'
					}),
					contentType: 'application/json',
					beforeSend: function (request) {
						var customer = dataSources.get('customer.entity') || null;

						request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
						//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
						
						if (customer) {
							console.log('session: ' + page.getAuthHandler().getSession());
							request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
						}
					},
					success: function (response, status, xhr) {
						if (response.success) {
						}
					},
					complete: function () {
					}
				});*/
				
				// Tested and okay
				/*$.ajax({
					url: App.getConfig('serviceUrl') + 'api/rest/shippingaddress',
					type: 'POST',
					dataType: 'json',
					data: JSON.stringify({
						address_id: 1,
						shipping_address: 'existing'
					}),
					contentType: 'application/json',
					beforeSend: function (request) {
						var customer = dataSources.get('customer.entity') || null;

						request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
						//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
						
						if (customer) {
							console.log('session: ' + page.getAuthHandler().getSession());
							request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
						}
					},
					success: function (response, status, xhr) {
						if (response.success) {
						}
					},
					complete: function () {
					}
				});
				
				/*
				Other steps
				Step 3: GET api/rest/shippingmethods to get all available shipping methods
				Step 4: POST api/rest/shippingmethods to set the shipping method
				*/
				/*$.ajax({
					url: App.getConfig('serviceUrl') + 'api/rest/shippingmethods',
					type: 'GET',
					dataType: 'json',
					contentType: 'application/json',
					beforeSend: function (request) {
						var customer = dataSources.get('customer.entity') || null;

						request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
						//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
						
						if (customer) {
							console.log('session: ' + page.getAuthHandler().getSession());
							request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
						}
					},
					success: function (response, status, xhr) {
						if (response.success) {
						}
					},
					complete: function () {
					}
				});*/
				
				/*$.ajax({
					url: App.getConfig('serviceUrl') + 'api/rest/shippingmethods',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json',
					beforeSend: function (request) {
						var customer = dataSources.get('customer.entity') || null;

						request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
						//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
						
						if (customer) {
							console.log('session: ' + page.getAuthHandler().getSession());
							request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
						}
					},
					success: function (response, status, xhr) {
						if (response.success) {
						}
					},
					complete: function () {
					}
				});*/
				
				/*
				Step 5: GET api/rest/paymentmethods to get all available payment methods
				Step 6: POST api/rest/paymentmethods to setthe payment method
				*/
				/*$.ajax({
					url: App.getConfig('serviceUrl') + 'api/rest/paymentmethods',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json',
					beforeSend: function (request) {
						var customer = dataSources.get('customer.entity') || null;

						request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
						//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
						
						if (customer) {
							console.log('session: ' + page.getAuthHandler().getSession());
							request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
						}
					},
					success: function (response, status, xhr) {
						if (response.success) {
						}
					},
					complete: function () {
					}
				});*/
				
				/*$.ajax({
					url: App.getConfig('serviceUrl') + 'api/rest/paymentmethods',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json',
					beforeSend: function (request) {
						var customer = dataSources.get('customer.entity') || null;

						request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
						//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
						
						if (customer) {
							console.log('session: ' + page.getAuthHandler().getSession());
							request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
						}
					},
					success: function (response, status, xhr) {
						if (response.success) {
						}
					},
					complete: function () {
					}
				});*/
				
				/*
				Step 7: POST api/rest/confirm to get an overview of the order
				Step 8: GET api/rest/pay You only need to call this service, if you want to start payment process in webview
				Step 9: PUT api/rest/confirm Update order status, empty cart, and clear session data
				*/
				/*$.ajax({
					url: App.getConfig('serviceUrl') + 'api/rest/confirm',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json',
					beforeSend: function (request) {
						var customer = dataSources.get('customer.entity') || null;

						request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
						//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
						
						if (customer) {
							console.log('session: ' + page.getAuthHandler().getSession());
							request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
						}
					},
					success: function (response, status, xhr) {
						if (response.success) {
						}
					},
					complete: function () {
					}
				});*/
				
				/*$.ajax({
					url: App.getConfig('serviceUrl') + 'api/rest/confirm',
					type: 'PUT',
					dataType: 'json',
					contentType: 'application/json',
					beforeSend: function (request) {
						var customer = dataSources.get('customer.entity') || null;

						request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
						//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
						
						if (customer) {
							console.log('session: ' + page.getAuthHandler().getSession());
							request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
						}
					},
					success: function (response, status, xhr) {
						if (response.success) {
						}
					},
					complete: function () {
					}
				});*/
			});
			
			// Set values to view-model
			/*for (prop in data) {
				if (cartViewModel.hasOwnProperty(prop)) {
					value = data[prop] || '';
					
					console.log('setting prop: ' + prop + ' | value: ' + value);
					cartViewModel.set(prop, value);
				}
			}
			
			try {
				
			} catch (e) {
				App.log(e);
			}
			
			// Create a string representation of the cart fields
			if (tab.index() === 0) {
				// Civic cart selected
				// Clear all rural values
				$.each(fields.rural, function (key, value) {
					cartViewModel.set(key, '');
				});
				
				if (fields.civic.suiteNumber !== '') {
					cart.push('{suiteNumber}-{streetNumber} {streetName} {streetType} {streetDirection}');
				} else {
					cart.push('{streetNumber} {streetName} {streetType} {streetDirection}');
				}
				cart.push('{poBox} {station}');
			} else if (tab.index() === 1) {
				// Rural cart selected
				// Clear all civic values
				$.each(fields.civic, function (key, value) {
					cartViewModel.set(key, ''); 
				});
				
				if (fields.rural.lot !== '' && fields.rural.concession !== '') {
					cart.push('{lotNumber} {concessionNumber}');
				}
				if (fields.rural.site !== '' && fields.rural.comp !== '') {
					cart.push('{site} {comp} {box}');
				}
				cart.push('{rr} {station}');
			}
			
			// Append city/municipality, province and postal code
			cart.push('{city} {province} {postalCode}');
			
			// Replace formatting keys with form values
			$.each(cart, function (idx, format) {
				current = format;
				if (tab.index() === 0) {
					$.each(fields.civic, function (key, value) {
						current = current.replace('{' + key + '}', value);
					});
				} else if (tab.index() === 1) {
					$.each(fields.rural, function (key, value) {
						current = current.replace('{' + key + '}', value);
					});
				}
				
				$.each(fields.common, function (key, value) {
					current = current.replace('{' + key + '}', value);
				});
				
				if ($.trim(current) !== '') {
					cartString.push($.trim(current));
				}
			});
			
			// Join cart strings
			cartString = cartString.join('\r\n');
			
			cartDisplay.attr('readonly', false).val(cartString).attr('readonly', true);
			cartEditWindow.close();*/
			// Create hidden fields in the parent form (if it exists)
			
			try {
				that.dataBind(cartViewModel);
			} catch (e) {
				App.log(e);
			}
			
			page.setCart(that);
		},
		initialized: function () {
			var that = this,
				page = that.getPage();
			
			that.setHeaders = that.getConfig().setHeaders;
			that.addProduct = that.getConfig().addProduct;
			that.clearCart = that.getConfig().clearCart;
			that.setPaymentAddress = that.getConfig().setPaymentAddress;
			that.applyRewardPoints = that.getConfig().applyRewardPoints;
			that.confirmOrder = that.getConfig().confirmOrder;
			that.checkout = that.getConfig().checkout;
			
			page.setCart = function (cart) {
				this._cart = cart;
				return this;
			}
			
			page.getCart = function () {
				return this._cart;
			}
		}
	},
	setHeaders: function (request) {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			dataSources = page.getDataSources(),
			customer = dataSources.get('customer.entity') || null;

		request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
		//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
		
		if (customer) {
			console.log('session: ' + page.getAuthHandler().getSession());
			request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
		}
		
		return request;
		
	},
	addProduct: function () {
		// TODO: Move functionality from dashboard
	},
	clearCart: function () {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			loader = page.getLoader(),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel(),
			dashboardViewModel = page.getModule('module_customerDashboard_1').getViewModel();
		
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/cart/empty',
			type: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			beforeSend: function (request) {
				that.setHeaders(request);
			},
			success: function (response, status, xhr) {
				if (response.success) {
					// Sync? Can't I just clear?
					that.cartGrid.dataSource.data([]);
					dashboardViewModel.set('product_config', new kendo.data.ObservableObject());
				}
			},
			complete: function () {
				//widget.value(0); // Reset progress bar
				//browser.reset(); // Clear menu selection
			}
		});
	},
	setPaymentAddress: function () {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			loader = page.getLoader(),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel(),
			dashboardViewModel = page.getModule('module_customerDashboard_1').getViewModel();
			
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/paymentaddress',
			type: 'POST',
			async: false,
			dataType: 'json',
			data: JSON.stringify({
				address_id: 1,
				payment_address: 'existing'
			}),
			contentType: 'application/json',
			beforeSend: function (request) {
				that.setHeaders(request);
			},
			success: function (response, status, xhr) {
				if (response.success) {
				}
			},
			complete: function () {
			}
		});
		
		/*$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/shippingaddress',
			type: 'POST',
			async: false,
			dataType: 'json',
			data: JSON.stringify({
				address_id: 1,
				payment_address: 'existing'
			}),
			contentType: 'application/json',
			beforeSend: function (request) {
				var customer = dataSources.get('customer.entity') || null;

				request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
				//request.setRequestHeader('X-Oc-Merchant-Language', 'en');
				
				if (customer) {
					console.log('session: ' + page.getAuthHandler().getSession());
					request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
				}
			},
			success: function (response, status, xhr) {
				if (response.success) {
				}
			},
			complete: function () {
			}
		});*/
	},
	applyRewardPoints: function (points) {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			loader = page.getLoader(),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel(),
			dashboardViewModel = page.getModule('module_customerDashboard_1').getViewModel(),
			isSuccess = false;
		
		if (typeof points === 'undefined' || points === null || !(points > 0)) return false;
		
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/reward',
			type: 'POST',
			async: false,
			dataType: 'json',
			data: JSON.stringify({
				reward: points
			}),
			contentType: 'application/json',
			beforeSend: function (request) {
				that.setHeaders(request);
			},
			success: function (response, status, xhr) {
				if (response.success) {
					isSuccess = true;
				}
			},
			complete: function () {
			}
		});
		
		return isSuccess;
	},
	confirmOrder: function () {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			loader = page.getLoader(),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel(),
			dashboardViewModel = page.getModule('module_customerDashboard_1').getViewModel();
			
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/simpleconfirm',
			type: 'POST',
			dataType: 'json',
			// Not necessary for simple confirm
			/*data: JSON.stringify({
				address_id: 1,
				payment_address: 'existing'
			}),*/
			contentType: 'application/json',
			beforeSend: function (request) {
				that.setHeaders(request);
			},
			success: function (response, status, xhr) {
				if (response.success) {
					$.ajax({
						url: App.getConfig('serviceUrl') + 'api/rest/simpleconfirm',
						type: 'PUT',
						dataType: 'json',
						// Not necessary for simple confirm
						/*data: JSON.stringify({
							address_id: 1,
							payment_address: 'existing'
						}),*/
						contentType: 'application/json',
						beforeSend: function (request) {
							that.setHeaders(request);
						},
						success: function (response, status, xhr) {
							if (response.success) {
								that.cartWindow.close();

								page.displayDownload();
								that.clearCart();
							}
						},
						complete: function () {
						}
					});
				}
			},
			complete: function () {
			}
		});
	},
	checkout: function () {
		var	that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			loader = page.getLoader(),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel(),
			dashboardViewModel = page.getModule('module_customerDashboard_1').getViewModel(),
			aggregates = that.cartGrid.dataSource.aggregates(),
			requiredPoints = (aggregates && aggregates.hasOwnProperty('total') && aggregates.total.hasOwnProperty('sum')) ? aggregates.total.sum : null; // $1 = 1 credit
		
		that.setPaymentAddress();
		
		if (requiredPoints !== null) {
			if (that.applyRewardPoints(requiredPoints)) that.confirmOrder();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					class: 'fieldgroup',
					group: [
						{
							name: 'cartTrigger',
							tag: 'button',
							type: 'button',
							text: 'My Shopping Cart',
							class: 'k-button',
							style: 'display: none',
							data: {
								role: 'button',
								// TODO: Fix binding on button click events in layouts
								/*bind: {
									events: {
										click: function (e) {
											// TODO: Make two helpers for this, getWidget/getWindow?
											// TODO: Or better yet, make a behavior?
											// Get the module
											var moduleElement = e.sender.element.closest('[id^=module_cart_]'),
												module = App.getCurrent().getModule(moduleElement.attr('id')),
												lookupWindow = module.cartPopup.data('kendoWindow');
												
											console.log(moduleElement);
											console.log(module);
											console.log(lookupWindow);
											
											lookupWindow.center().open();
										}
									}
								}*/
							}
						}
					]
				},
				{
					tag: 'div',
					name: 'cartPopup',
					data: {
						role: 'window',
						//appendTo: 'form',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						scrollable: true,
						title: 'My Shopping Cart',
						width: '90%',
						height: '90%',
						bind: {
							events: {
								open: function (e) {
									e.sender.element.data('kendoWindow').center();
								}
							}
						}
					},
					fieldgroups: [
						{
							tag: 'div',
							class: 'kpaf-row',
							fields: [
								{
									tag: 'div',
									class: 'cartGrid',
									name: 'cartGrid',
									style: 'width: 100%; height: 100%;',
									data: {
										role: 'grid',
										autoBind: false,
										editable: 'inline',
										toolbar: [{ name: 'save', iconClass: 'fa fa-check' }, { name: 'cancel', iconClass: 'fa fa-ban' }],
										filterable: false,
										sortable: true,
										scrollable: true,
										selectable: true,
										pageable: {
											pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
											pageSizes: [10, 25, 50],
											refresh: true
										},
										columns: [
											{
												template: '<input type="checkbox">',
												width: 50
											},
											{
												template: '<div class="image" style="width:75px; height: 75px; background-size: contain; background-image: url(# if (typeof thumb !== \'undefined\') { # #: thumb # # } #)"></div>',
												field: 'thumb',
												title: '&nbsp;',
												filterable: false,
												groupable: false,
												width: 100
											},
											{
												field: 'model',
												title: 'Model',
											},
											{
												field: 'name',
												title: 'Product Name'
											},
											{
												field: 'option',
												title: 'Options',
												template: '# option.forEach(function (opt, idx) { # ${opt.name} \: ${opt.value} # }) #'
											},
											/*{
												field: 'price',
												title: 'Price',
												template: '#= kendo.toString(price, "c") #'
											},*/
											{
												field: 'quantity',
												title: 'Qty.',
												aggregates: ['sum'], 
												footerTemplate: '<p class="total-line-item">#= data.quantity ? kendo.toString(data.quantity.sum, "n0") : kendo.toString(0, "n0") #</p>'
											},
											/*{
												field: 'reward',
												title: 'Points',
												aggregates: ['sum'], 
												footerTemplate: '<p class="total-line-item">#= data.reward ? kendo.toString(data.reward.sum, "n0") : kendo.toString(0, "n0") #</p>'
											},*/
											{
												field: 'total',
												title: 'Credits',
												aggregates: ['sum'], 
												footerTemplate: '<p class="total-line-item">#= data.total ? kendo.toString(data.total.sum, "n0") : kendo.toString(0, "n0") #</p>'
											},
											/*{
												field: 'total',
												title: 'Total',
												template: '#= kendo.toString(total, "c") #',
												aggregates: ['sum'], 
												footerTemplate: '<p class="total-line-item"><label>Sub-total </label>#= data.total ? kendo.toString(data.total.sum, "c") : kendo.toString(0, "c") #</p><p class="total-line-item"><label>Total </label>#= data.total ? kendo.toString(data.total.sum, "c") : kendo.toString(0, "c") #</p>'
											},*/
											{
												command: [
													{ name: 'edit', text: ' ', iconClass: 'fa fa-pencil' }, 
													{ name: 'destroy', text: ' ', iconClass: 'fa fa-times' },
													/*{ name: 'update', text: ' ', iconClass: 'fa fa-check' },
													{ name: 'cancel', text: ' ', iconClass: 'fa fa-ban' },*/
												], title: '', width: '180px' 
												//], title: '', width: '160px' 
											}
										]
									}
								}
							]
						},
						/*{
							block: 'autorow',
							config: {
								params: {
									style: 'text-align: right; justify-content: flex-end'
								},
								items: [
									{
										id: 'subtotal',
										name: 'subtotal',
										label: 'Sub-total',
										tag: 'input',
										type: 'text',
										class: 'medium k-textbox',
										data: {
											bind: 'subtotal'
										}
									}
								]
							}
						},
						{
							block: 'autorow',
							config: {
								params: {
									style: 'text-align: right; justify-content: flex-end'
								},
								items: [
									{
										id: 'total',
										name: 'total',
										label: 'Total',
										tag: 'input',
										type: 'text',
										class: 'medium k-textbox',
										data: {
											bind: 'total'
										}
									}
								]
							}
						},*/
						{
							tag: 'div',
							style: 'display: flex; flex-flow: row wrap;',
							children: [
								{
									id: 'button-clear',
									name: 'buttonClear',
									class: 'cta',
									tag: 'button',
									type: 'button',
									text: 'Clear Cart',
									// TODO: CTA styles
									data: {
										role: 'button',
										spriteCssClass: 'fa fa-trash'
									}
								},
								{
									id: 'button-promo',
									name: 'promoTrigger',
									class: 'cta',
									tag: 'button',
									type: 'button',
									text: 'Promo Code',
									// TODO: CTA styles
									data: {
										role: 'button',
										spriteCssClass: 'fa fa-ticket',
										/*bind: {
											events: {
												click: function (e) {
													App.getCurrent().save(e);
												}
											}
										}*/
									}
								},
								{
									id: 'button-scan',
									name: 'buttonScan',
									class: 'cta',
									tag: 'button',
									type: 'button',
									text: 'Scan Item',
									// TODO: CTA styles
									data: {
										role: 'button',
										spriteCssClass: 'fa fa-barcode',
										/*bind: {
											events: {
												click: function (e) {
													App.getCurrent().save(e);
												}
											}
										}*/
									}
								},
								{
									id: 'button-checkout',
									name: 'buttonCheckout',
									class: 'cta primary',
									tag: 'button',
									type: 'button',
									text: 'Checkout',
									// TODO: CTA styles
									data: {
										role: 'button',
										spriteCssClass: 'fa fa-cart-arrow-down',
										/*bind: {
											events: {
												click: function (e) {
													App.getCurrent().save(e);
												}
											}
										}*/
									}
								},
								{
									tag: 'div',
									name: 'promoPopup',
									data: {
										role: 'window',
										//appendTo: 'form',
										modal: true,
										visible: false,
										resizable: false,
										draggable: true,
										title: 'Enter a Coupon or Voucher Code',
										width: 960,
										/*bind: {
											events: {
												open: function (e) {
													e.sender.element.data('kendoWindow').center();
												}
											}
										}*/
									}
								}
							]
						}
					]
				}
				// END cart
			]	
		}
	}
});