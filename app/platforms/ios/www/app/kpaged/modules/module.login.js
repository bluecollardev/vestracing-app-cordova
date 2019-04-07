// TODO: This needs to be split up into two modules at some point: login and auth
define({
	name: 'login',
	id: 'login', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	doLogin: function (email, password) {
		// TODO: Wtf password sent as plain text?
		var that = this,
			moduleElement = $('#' + that.getId()),
			page = that.getPage(),
			customerModule = page.getModule('module_customer_1'),
			loader = page.getLoader(),
			viewModel = that.getViewModel(),
			dataSources = page.getDataSources(),
			customerSession = that.checkSession(),
			isLogged = (customerSession !== false) ? true : false,
			customer;
		
		account = email || viewModel.get('email');
		password = password || viewModel.get('password');
		customer = dataSources.get('customer.entity') || null;
		
		if (!isLogged) {
			// Log in the user
			$.ajax({
				url: App.getConfig('serviceUrl') + 'api/rest/login/',
				data: JSON.stringify({
					email: account,
					password: password
				}),
				type: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				async: true, // No async login
				beforeSend: function (request) {
					request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
					loader.setMessage('Welcome! We\'re logging you in...').open();
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
							
							
							// TODO: Better please... events maybe?
							console.log('set customer data - ' + new Date());
							customerModule.setCustomer(model);
							console.log('customer data has been set - ' + new Date());
							//page.getBlock('block_personalInfo_1').dataBind(customerModule.getViewModel());
							
							// Show/hide menu buttons
							// TODO: This should be part of the menu module?
							// I don't like hardcoding dependencies but here will just have to do for now...
							// 'Cause it's faster :)
							/*ar toolbar = $('#toolbar').data('kendoToolBar');
							toolbar.show($('#menu-button-dashboard'));
							toolbar.show($('#menu-button-account'));
							toolbar.show($('#menu-button-sign-out'));
							toolbar.show($('#menu-button-change-account'));*/
							$('#menu-button-sign-in').closest('li').hide();
							
							$('#menu-button-dashboard').show();
							$('#menu-button-account').closest('li').show();
							$('#menu-button-sign-out').closest('li').show();
							$('#menu-button-change-account').closest('li').show();
							
							isLogged = true;
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
						if (response.responseJSON.error === 'User already is logged') {
							console.log('User logged in... manually logout and login');
							that.doLogout();
							that.doLogin();
						} else {
							loader.setMessage(response.responseJSON.error.warning).open();
						
							setTimeout(function () {
								loader.close();
							}, 3000);
						}
					} else {
						loader.close();
					}
				} 
			});
		}
		
		return isLogged;
	},
	doLogout: function () {
		var that = this,
			page = that.getPage(),
			customerModule = page.getModule('module_customer_1'),
			loader = page.getLoader(),
			dataSources = page.getDataSources();
		
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/logout/',
			type: 'POST',
			dataType: 'json',
			async: true, // No async logout
			beforeSend: function (request) {
				request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
				console.log('session: ' + that.getSession());
				request.setRequestHeader('X-Oc-Session', that.getSession());
				
				loader.setMessage('Goodbye! Hold on while we log you out...').open();
			},
			success: function () {
				that.clearSession();
				customerModule.clearCustomer();
				// Show/hide menu buttons
				// TODO: This should be part of the menu module?
				// I don't like hardcoding dependencies but here will just have to do for now...
				// 'Cause it's faster :)
				/*var toolbar = $('#toolbar').data('kendoToolBar');
				toolbar.hide($('#menu-button-dashboard'));
				toolbar.hide($('#menu-button-account'));
				toolbar.hide($('#menu-button-sign-out'));
				toolbar.hide($('#menu-button-change-account'));*/
				$('#menu-button-dashboard').hide();
				$('#menu-button-account').closest('li').hide();
				$('#menu-button-sign-out').closest('li').hide();
				$('#menu-button-change-account').closest('li').hide();
				
				$('#menu-button-sign-in').closest('li').show();
			},
			complete: function () {
				loader.close();
			}
		});
		
		dataSources.set('customer.entity', null);
	}, 
	// These next four session related methods need to be moved to an auth module - so use 'user' in vars instead of customer
	setSession: function (model) {
		// Accepts session string or model
		var sessionId = null;
		
		model = model || false;
		if (model && model instanceof kendo.data.Model) {
			sessionId = model.get('sessionId');
			if (typeof sessionId === 'string') {
				sessionStorage.setItem('sessionId', sessionId);
			}
		} else if (model && typeof model === 'string') {
			sessionId = model;
			sessionStorage.setItem('sessionId', sessionId);
		}
	},
	getSession: function () {
		var that = this;
		
		if (!(sessionStorage.hasOwnProperty('sessionId'))) {
			$.ajax({
				url: App.getConfig('serviceUrl') + 'api/rest/session/',
				type: 'GET',
				dataType: 'json',
				async: false, // We need a session for pretty much everything
				beforeSend: function (request) {
					request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
				},
				success: function (response, status, xhr) {
					if (response.success) {
						if (response.hasOwnProperty('data')) {
							that.setSession(response.data.session);
						}
					}
				}
			});
		}
		
		if (sessionStorage.hasOwnProperty('sessionId')) {
			return sessionStorage.getItem('sessionId');
		} else {
			return false;
		}
	},
	clearSession: function () {
		if (sessionStorage.hasOwnProperty('sessionId')) {
			sessionStorage.removeItem('sessionId');
		}
	},
	checkSession: function () {
		// TODO: Wtf password sent as plain text?
		var that = this,
			//isValidSession = false,
			//user = (user instanceof kendo.data.Model) ? user : null,
			userSession;
			
		userSession = that.doLoginCheck();
		
		return (userSession) ? that.getSession() : false;
	},
	doLoginCheck: function () {
		var that = this,
			page = that.getPage(),
			loader = page.getLoader(),
			dataSources = page.getDataSources(),
			isLogged = false;
		
		App.log('Current customer has session id ' + that.getSession() + '. Verifying...');
		$.ajax({
			url: App.getConfig('serviceUrl') + 'api/rest/checkuser/',
			type: 'GET',
			async: false, // Wait for the response before setting isLogged
			dataType: 'json',
			beforeSend: function (request) {
				request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
				request.setRequestHeader('X-Oc-Session', that.getSession());
				loader.setMessage('Verifying login status...').open();
			},
			success: function (response, status, xhr) {
				console.log('successfully contacted server, dumping response', response);
				if (response.success && response.hasOwnProperty('data')) {
					isLogged = (response.data !== false) ? true : false;
					if (isLogged) console.log('user with id: ' + response.data + ' is logged in with session ID: ' + that.getSession());
				}
			},
			complete: function () {
				loader.close();
			}
		});
		
		return (isLogged) ? that.getSession() : isLogged;
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
			that.setSession = that.getConfig().setSession;
			that.getSession = that.getConfig().getSession;
			that.clearSession = that.getConfig().clearSession;
			that.checkSession = that.getConfig().checkSession;
			
			page.setAuthHandler = function (handler) {
				this._authHandler = handler;
				return this;
			}
			
			page.getAuthHandler = function () {
				return this._authHandler;
			}
		},
		rendered: function (e) {
			var that = this,
				page = that.getPage(),
				moduleElement = $('#' + that.getId()),
				viewModel = that.getViewModel(),
				loginButton = moduleElement.find('[name=loginButton]').first();
				
			that.dataBind();
			
			kendo.bind(loginPopup, viewModel);
			
			viewModel.set('email', '');
			viewModel.set('password', '');
			
			// TODO: This needs to be unit tested -- test these
			//that.doLoginCheck();
			
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
			
			// TODO: Check this, we don't wanna duplicate functionality
			if (loginButton.length > 0) {
				loginButton.data('kendoButton').bind('click', function (e) {
					var loginPopup = $(document.body).find('[name=loginPopup]').first(), //moduleElement.find('#loginPopup'),
						loginWindow = loginPopup.data('kendoWindow');
					
					that.doLogin();
					loginWindow.close();
				});
			}
			
			page.setAuthHandler(that);
			that.getSession();
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