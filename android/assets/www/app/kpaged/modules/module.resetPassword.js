define({
	name: 'resetPassword',
	id: 'resetPassword', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	doLogin: function () {
		// TODO: Wtf password sent as plain text?
		var that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			viewModel = that.getViewModel(),
			dataSources = page.getDataSources(),
			isLogged = false,
			customer;
			
		if (dataSources.has('customer.entity')) customer = dataSources.get('customer.entity');
		
		// TODO: A better check....
		if (typeof customer !== 'undefined' && customer.entity !== null) {
			// Check session
		} else {
			// Log in the user
			$.ajax({
				url: App.getConfig('serviceUrl') + 'api/rest/login/',
				data: JSON.stringify({
					email: viewModel.get('email'),
					password: viewModel.get('password')
				}),
				type: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				async: false, // No async login
				beforeSend: function (request) {
					request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
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
							that.setData(response.data, model);
							
							dataSources.set('customer.entity', model);
							console.log('persisting customer entity...');
							console.log(dataSources.get('customer.entity'));
							
							// TODO: Better please... events maybe?
							var customerModule = page.getModule('module_customer_1');
							customerModule.setCustomer(model);
							//page.getBlock('block_personalInfo_1').dataBind(customerModule.getViewModel());
						}
					} else {
						console.log(response.error);
						// TODO: Fix checkuser route/action in OpenCart API -- this is fucking stupid
						// Basing my action on text returned is weak
						// TODO: OpenCart RESTful API sucks & Doctrine rules
						// Make a real bloody API
						if (response.error === 'User already is logged') {
							console.log('user logged in... opencart api checkuser is not working... manually logout and login');
							that.doLogout();
							that.doLogin();							
						}
					}
					
					that.doLoginCheck();
				}
			});
		}
	},
	doLogout: function () {
		var that = this,
			page = that.getPage(),
			dataSources = page.getDataSources(),
			customer;
			
		if (dataSources.has('customer.entity')) customer = dataSources.get('customer.entity');
		
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/logout/',
			type: 'POST',
			dataType: 'json',
			async: false, // No async logout
			beforeSend: function (request) {
				request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
				console.log('force logging out customer');
				if (customer) {
					console.log('session: ' + page.getAuthHandler().getSession());
					request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
				}
			}
		});
	},
	doLoginCheck: function () {
		var that = this,
			page = that.getPage(),
			dataSources = page.getDataSources(),
			isLogged = false,
			customer = null;
			
		customer = dataSources.get('customer.entity') || null;
		
		if (customer instanceof kendo.data.Model) {
			App.log('Current customer has session id ' + page.getAuthHandler().getSession() + '. Verifying...');
			// TODO: Why is this not working? Seems to be missing from the API or something I'm getting a 404
			/*$.ajax({
				//url: App.getConfig('serviceUrl') + 'api/rest/checkuser/',
				url: App.getConfig('serviceUrl') + 'index.php?route=rest/login/checkuser',
				type: 'GET',
				dataType: 'json',
				beforeSend: function (request) {
					request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
					request.setRequestHeader('X-Oc-Session', page.getAuthHandler().getSession());
				},
				success: function (response, status, xhr) {
					console.log('ajax success');
					console.log(response);
					
					isLogged = true;
				}
			});*/
			return page.getAuthHandler().getSession();
		} else {
			console.log('No customer');
		}
		
		console.log(isLogged);
		
		return isLogged;
		
	},
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
			
			// Register any custom methods
			that.doLogin = that.getConfig().doLogin;
			that.doLogout = that.getConfig().doLogout;
			that.doLoginCheck = that.getConfig().doLoginCheck;
		},
		rendered: function (e) {
			var that = this,
				moduleElement = $('#' + that.getId()),
				viewModel = that.getViewModel(),
				loginButton = moduleElement.find('[name=loginButton]').first();
				
			that.dataBind();
			
			kendo.bind(loginPopup, viewModel);
			
			viewModel.set('email', '');
			viewModel.set('password', '');
			
			// TODO: This needs to be unit tested -- test these
			that.doLoginCheck();
			
			/*moduleElement.find('.loginTrigger').bind('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				
				// Window widgets append themselves by default to 
				// <body>, even if the appendTo parameter has been
				// specified - Kendo FAIL
				kendo.unbind(loginPopup);
				kendo.bind(loginPopup, viewModel);
			});*/
			
			// IDK why we would have more than one but leave in the first anyway...
			
			
			if (loginButton.length > 0) {
				loginButton.data('kendoButton').bind('click', function (e) {
					var loginPopup = $(document.body).find('[name=loginPopup]').first(), //moduleElement.find('#loginPopup'),
						loginWindow = loginPopup.data('kendoWindow');
					
					that.doLogin();
					loginWindow.close();
				});
			}
			// TODO: Check auth -- not sure what's best; in the page, embedded in the module?
			//loginWindow.center().open();
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					id: 'loginPopup',
					name: 'loginPopup',
					class: 'entityPopup',
					//style: 'display: none',
					data: {
						role: 'window',
						//appendTo: '#center-pane',
						modal: true,
						visible: false,
						resizable: false,
						draggable: true,
						title: 'Login',
						width: 430
					},
					children: [
						{
							tag: 'p',
							text: 'Please sign in to start using QuickCommerce'
						},
						{
							block: 'login'
						}
					]
				}
			]
		}
	}
});