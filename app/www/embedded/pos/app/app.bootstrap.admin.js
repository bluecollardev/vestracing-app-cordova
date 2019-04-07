requirejs.config({
	waitSeconds: 120, // Set the script timeout value
	baseUrl: '',
	//urlArgs: "bust=" + (new Date()).getTime(),
	paths: {
		lib: 'vendor/kpaged/lib/',
		//cordova: 'cordova',
		jquery: 'vendor/kpaged/lib/jquery/jquery-1.10.0.min',
		markdown: 'vendor/kpaged/lib/markdown-js/src/markdown',
		marked: 'vendor/kpaged/lib/marked/lib/marked',
		kendo: 'vendor/kpaged/lib/kendo/builds/telerik.kendoui.professional.2015.1.408/js/kendo.all.min',
		kendoObservingPanelBar: 'vendor/kpaged/lib/kendo/src/js/kendo.observingpanelbar',
		kendoObservingListView:	'vendor/kpaged/lib/kendo/src/js/kendo.observinglistview',
		kendoSemanticTabStrip: 'vendor/kpaged/lib/kendo/src/js/kendo.semantictabstrip',
		kendoSilentValidator: 'vendor/kpaged/lib/kendo/src/js/kendo.silentvalidator',
		signals: 'vendor/kpaged/lib/crossroads/dev/lib/signals',
		crossroads: 'vendor/kpaged/lib/crossroads/dist/crossroads',
		hasher: 'vendor/kpaged/lib/hasher/dist/js/hasher',
		jshint: 'vendor/kpaged/lib/debug/jshint',
		jsonpath: 'vendor/kpaged/lib/jsonpath/jsonpath-0.8.5',
		// Include jquery.xmleditor package
		xsd2json: 'vendor/jquery/community/jquery.xmleditor/xsd/xsd2json',
		ace: 'vendor/jquery/community/jquery.xmleditor/lib/ace/src-min/ace',
		jqueryui: 'vendor/jquery/community/jquery.xmleditor/lib/jquery-ui.min',
		autosize: 'vendor/jquery/community/jquery.xmleditor/lib/jquery.autosize-min',
		json2: 'vendor/jquery/community/jquery.xmleditor/lib/json2',
		//cycle: 'vendor/jquery/community/jquery.xmleditor/lib/cycle',
		xmleditor: 'vendor/jquery/community/jquery.xmleditor/jquery.xmleditor',
		// End package
		swipe: 'embedded/pos/lib/swipe/swipe',
		core: 'vendor/kpaged/core/kpaf.core',
		config: 'embedded/pos/app/app.config',
		kpafBehaviors: 'vendor/kpaged/core/kpaf.behaviors',
		kpafWidgetBehaviors: 'vendor/kpaged/core/kpaf.widgets.behaviors',
		kpafEntities: 'vendor/kpaged/lib/entity-fw/entity-fw.core',
		appFullScreenSplitter: 'embedded/pos/app/app.splitter.fullscreen',
		appSplitter: 'embedded/pos/app/app.splitter',
		appDialog: 'embedded/pos/app/app.dialog',
		// Load blocks first
		blockFieldGroup: 'vendor/kpaged/blocks/block.fieldgroup',
		blockAutoRow: 'vendor/kpaged/blocks/block.autorow',
		blockFieldGroupRow: 'vendor/kpaged/blocks/block.fieldgrouprow',
		blockQuestionRow: 'vendor/kpaged/blocks/block.questionrow',
		blockTextField: 'vendor/kpaged/blocks/block.textfield',
		blockNumericTextField: 'vendor/kpaged/blocks/block.numerictextfield',
		blockMessaging: 'vendor/kpaged/blocks/block.messaging',
		blockCustomerEntry: 'app/kpaged/blocks/block.customerEntry',
		blockLogin: 'app/kpaged/blocks/block.login',
		blockRegister: 'app/kpaged/blocks/block.register',
		blockSocial: 'vendor/kpaged/blocks/block.social',
		blockStickySidebar: 'app/kpaged/blocks/block.stickysidebar',
		blockPageActionsToolbar: 'vendor/kpaged/blocks/block.pageactionstoolbar',
		blockFooterMenu: 'vendor/kpaged/blocks/block.footermenu',
		blockPersonalInfo: 'vendor/kpaged/blocks/block.personalinfo',
		blockCompanyInfo: 'vendor/kpaged/blocks/block.companyinfo',
		blockContactInfo: 'vendor/kpaged/blocks/block.contactinfo',
		// Modules after blocks
		moduleAddress: 'vendor/kpaged/modules/module.address',
		moduleErrorPanel: 'vendor/kpaged/modules/module.errorPanel',
		moduleAjaxLoader: 'vendor/kpaged/modules/module.ajaxLoader',
		// QuickCommerce specific modules
		moduleMainMenu: 'embedded/pos/app/modules/module.mainmenu',
		moduleLogin: 'app/kpaged/modules/module.login',
		moduleCart: 'app/kpaged/modules/module.cart',
		moduleDownloads: 'app/kpaged/modules/module.downloads',
		moduleCustomers: 'app/kpaged/modules/module.customers',
		moduleCustomer: 'app/kpaged/modules/module.customer',
		moduleCustomerDashboard: 'app/kpaged/modules/module.customerDashboard',
		moduleCustomerOrders: 'app/kpaged/modules/module.customerOrders',
		moduleCatalogProducts: 'app/kpaged/modules/module.catalogProducts',
		moduleCatalogProduct: 'app/kpaged/modules/module.catalogProduct',
		moduleCatalogCategories: 'app/kpaged/modules/module.catalogCategories',
		moduleInventoryManufacturers: 'app/kpaged/modules/module.inventoryManufacturers',
		moduleInventoryFeeds: 'app/kpaged/modules/module.inventoryFeeds',
		moduleInventoryFeed: 'app/kpaged/modules/module.inventoryFeed',
		moduleOrders: 'app/kpaged/modules/module.orders',
		moduleOrder: 'app/kpaged/modules/module.order',
		moduleSales: 'app/kpaged/modules/module.sales',
		moduleUsers: 'app/kpaged/modules/module.users',
		moduleUser: 'app/kpaged/modules/module.user',
		moduleCountries: 'app/kpaged/modules/module.countries',
		moduleCountrySelector: 'app/kpaged/modules/module.countrySelector',
		moduleSwipeRegions: 'app/kpaged/modules/module.swipeRegions',
		// Pages after modules
		pageAdmin: 'embedded/pos/app/page.admin'
	},
	shim: {
		/*jquery: {
			deps: ['cordova']
		},*/
		/*jqueryui: {
			deps: ['jquery']

		},*/
		swipe: {
			deps: ['jquery']
		},
		autosize: {
			deps: ['jquery']
		},
		xmleditor: {
			deps: ['xsd2json', 'ace', 'jqueryui', 'json2', 'autosize']
		},
		kendo: {
			deps: ['jquery']
		},
		kendoObservingPanelBar: {
			deps: ['kendo']
		},
		kendoObservingListView:	{
			deps: ['kendo']
		},
		kendoSemanticTabStrip: {
			deps: ['kendo']
		},
		kendoSilentValidator: {
			deps: ['kendo']
        },
        kendoTotalTopGrid: {
            deps: ['kendo']
        },
		appSplitter: {
			deps: ['kendo', 'core']
		},
		appFullScreenSplitter: {
			deps: ['kendo', 'core']
		},
		appDialog: {
			deps: ['kendo', 'core']
		},
		core: {
			deps: [
				'kendo', 
				'kendoObservingPanelBar', 
				'kendoObservingListView', 
				'kendoSemanticTabStrip',
				'kendoSilentValidator',
                //'kendoTotalTopGrid', 
				'signals', 
				'crossroads', 
				'hasher',
				'marked',
				'xmleditor'
			]
		},
		config: {
			deps: ['core']
		},
		kpafBehaviors: {
			deps: ['core']
		},
		kpafWidgetBehaviors: {
			deps: ['core']
		}
	}
	
});

require(['config', 'appFullScreenSplitter', 'appDialog', 'kpafBehaviors', 'kpafWidgetBehaviors'], function (config) {
    // Main entry point of the application
    $(document).ready(function () {
        // Initialize variables and set the application path and/or base url
        var l = window.location,
			config = {};

        // Add custom (Kendo UI) event binders
        // Only if you want to though...

        // Customize config settings
        config.baseUrl = App.getRootWebsitePath(true);
		//config.serviceUrl = 'http://sd-otb.vest.technology/';
		config.serviceUrl = 'http://vestracing.quickcommerce.org/';
		config.systemUrl = config.baseUrl + 'vendor/kpaged/core/'; // Don't forget the trailing slash!
		config.libUrl = config.baseUrl + 'vendor/kpaged/lib/'; // Don't forget the trailing slash!
		config.appUrl = config.baseUrl + 'app/';
		config.templateUrl = config.appUrl + 'templates/';
		config.moduleUrl = config.appUrl + 'modules/';
		config.blockUrl = config.appUrl + 'vendor/kpaged/blocks/';
		config.configFile = config.appUrl + 'app.config.js';
		config.templates = {
			bind: {
				async: false
			}
		};
		
		config.debug = false; // Enable debugging
		config.profile = false; //{ blocks: false, modules: false, pages: true }; // Enable profiling
		
		// Display loader (Kendo UI progress bar)
		// Loader will display in the center pane, but this is app specific
		$('<div id="ui-loader"></div>').appendTo('body');
		$('<div id="ui-progress-container">'
		+ '<h3>VEST Racing</h3>'
		+ '<div id="ui-progress"></div>'
		+ '<h4><span class="status"></span><span class="ellipsis" style="position: absolute"><span>.</span><span>.</span><span>.</span><span>.</span><span>.</span></span></h4>'
		+ '</div>').appendTo('#ui-loader');
			
		$('#ui-progress-container').css({ display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center', alignItems: 'center', padding: '3.5rem 0', height: '100%' });
		$('#ui-progress-container').find('h3, h4').css({ textAlign: 'center', width: '100%', flex: '0 0 3.5rem' });
		$('#ui-progress').css({ width: '70%', flex: '0 0 30px' });
		
		var horzSplitter = $('#horizontal').data('kendoSplitter');
		var loader = $('#ui-loader').kendoWindow({
			title: false,
			modal: true,
			visible: false,
			resizable: false,
			draggable: false,
			width: '60%'
		}).data('kendoWindow');
		
		loader.element.parent().css({ backgroundColor: 'rgba(255, 255, 255, 0.888)' });
		
		var	progressBar = $('#ui-progress').kendoProgressBar({
                type: 'chunk',
                max: 6,
				value: 0,
				complete: function (e) {
					//horzSplitter.expand('.k-pane:first');
					loader.close();
				}
            }).data('kendoProgressBar');
		
		function updateProgress (progressBar, status, value) {
			if (typeof ellipsisInterval === 'function') {
				clearInterval(ellipsisInterval);
			}
			
			value = value || parseInt(progressBar.value() + 1);
			progressBar.value(value);
			
			$('#ui-progress-container span.status').text(status);
		}
		
		function updateProgressText (progressBar, status) {
			if (typeof ellipsisInterval === 'function') {
				clearInterval(ellipsisInterval);
			}
			
			$('#ui-progress-container span.status').text(status);
		}
		
		loader.center().open();
		
		updateProgress(progressBar, 'initializing application');
		
        // Initialize app
        App.init(config);
		
		updateProgress(progressBar, 'loading extra libraries');

        require(['marked', 'swipe', 'xmleditor'], function (marked, swipe, xmleditor) {
		
			updateProgress(progressBar, 'loading modules');
			
			// Load modules before loading pages
			require([
				'moduleErrorPanel', 
				'moduleAjaxLoader',
				'moduleLogin', 
				'moduleAddress', 
				'moduleMainMenu', 
				'moduleCart',
				'moduleCustomers', 
				'moduleCustomer', 
				'moduleCustomerDashboard', 
				'moduleCustomerOrders', 
				'moduleCatalogProducts', 
				'moduleCatalogProduct', 
				'moduleCatalogCategories', 
				'moduleDownloads',
				'moduleInventoryManufacturers', 
				'moduleInventoryFeeds', 
				'moduleInventoryFeed', 
				'moduleSales', 
				'moduleOrders',
				'moduleOrder',
				'moduleUsers', 
				'moduleUser', 
				'moduleCountries', 
				'moduleCountrySelector',
				'moduleSwipeRegions',
			], 
			function (
				moduleErrorPanel, 
				moduleAjaxLoader,
				moduleLogin, 
				moduleAddress, 
				moduleMainMenu, 
				moduleCart,
				moduleCustomers, 
				moduleCustomer,
				moduleCustomerDashboard,
				moduleCustomerOrders, 
				moduleCatalogProducts, 
				moduleCatalogProduct, 
				moduleCatalogCategories, 
				moduleDownloads,
				moduleInventoryManufacturers, 
				moduleInventoryFeeds, 
				moduleInventoryFeed, 
				moduleSales, 
				moduleOrders, 
				moduleOrder, 
				moduleUsers, 
				moduleUser, 
				moduleCountries, 
				moduleCountrySelector,
				moduleSwipeRegions) {
				
				var modules = [
					moduleErrorPanel,
					moduleAjaxLoader,
					moduleLogin, 
					moduleAddress, 
					moduleMainMenu, 
					moduleCart,
					moduleCustomers, 
					moduleCustomer, 
					moduleCustomerDashboard, 
					moduleCustomerOrders,
					moduleCatalogProducts, 
					moduleCatalogProduct, 
					moduleCatalogCategories, 
					moduleDownloads,
					moduleInventoryManufacturers, 
					moduleInventoryFeeds, 
					moduleInventoryFeed, 
					moduleSales, 
					moduleOrders, 
					moduleOrder, 
					moduleUsers, 
					moduleUser, 
					moduleCountries, 
					moduleCountrySelector,
					moduleSwipeRegions];
					
				$.each(modules, function (idx, module) {
					updateProgressText(progressBar, 'fetching module [' + module.name + '] from server');
					App.addModule(module);
				});
				
				updateProgress(progressBar, 'loading blocks');

				// Load blocks before loading pages
				require([
					'blockFieldGroup', 
					'blockAutoRow', 
					'blockFieldGroupRow', 
					'blockQuestionRow', 
					'blockMessaging', 
					'blockLogin',
					'blockRegister',
					'blockCustomerEntry',
					'blockSocial',
					'blockStickySidebar',
					'blockPageActionsToolbar', 
					'blockFooterMenu', 
					'blockPersonalInfo', 
					'blockCompanyInfo', 
					'blockContactInfo'], 
				function (
					blockFieldGroup, 
					blockAutoRow, 
					blockFieldGroupRow, 
					blockQuestionRow, 
					blockMessaging,
					blockLogin,
					blockRegister,
					blockCustomerEntry,
					blockSocial,
					blockStickySidebar,
					blockPageActionsToolbar, 
					blockFooterMenu, 
					blockPersonalInfo, 
					blockCompanyInfo, 
					blockContactInfo) {
					var blocks = [
						blockFieldGroup, 
						blockAutoRow, 
						blockFieldGroupRow, 
						blockQuestionRow, 
						blockMessaging,
						blockLogin,
						blockRegister,
						blockCustomerEntry,
						blockSocial,
						blockStickySidebar,
						blockPageActionsToolbar, 
						blockFooterMenu, 
						blockPersonalInfo, 
						blockCompanyInfo, 
						blockContactInfo];
					$.each(blocks, function (idx, block) {
						updateProgressText(progressBar, 'fetching block [' + block.name + '] from server');
						App.addBlock(block);
					});
					
					updateProgress(progressBar, 'building client interface');
					
					// Load pages
					require(['pageAdmin'], function (pageAdmin) {
						var pages = [pageAdmin];
						$.each(pages, function (idx, page) {
							updateProgressText(progressBar, 'fetching page [' + page.name + '] from server');
							App.addPage(page);
						});
						
						updateProgress(progressBar, 'starting app');

						// Execute application
						//console.profile();
						App.execute('.*'); // TODO: Ok, something's up with the routing and regex... it's been working until now because I've only used this in web-based scenarios
						// The above is fine and won't cause any issues, but I need to make adjustments to support routing in a mobile environment without urls
						
						/*var pageName = 'QCPOS', instance = App.getPage(pageName);
						App.setCurrent(pageName, instance);
						App.getRouter().parse('quickcommerce.org/index.html');*/
						//console.profileEnd();


						$('input[type=text], input[type=textarea]').keypress(function (e) {
							var code = e.keyCode || e.which;
							if (code === 13) e.preventDefault();
						});
						
						// This is a relic of the past
						var viewModel = App.getCurrent().getBlock(App.getPrimaryBlockName()).getViewModel();
						viewModel.bind('change', function (e) {
							if (e.field == 'firstName' || e.field == 'middleName' || e.field == 'lastName') {
								var test = viewModel.get(e.field).toUpperCase();
								viewModel.set(e.field, test);
							}
						});
					});
				});
			});
		});
    });
});