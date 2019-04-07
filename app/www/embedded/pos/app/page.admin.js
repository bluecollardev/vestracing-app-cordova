// Index
define(['marked'], function (marked) { return {
	name: 'QCPOS',
	/*ajax: {
		isString: true,
		mode: 'viewModel',
		filter: function (data) {
			if (data.hasOwnProperty('ChangeTracker')) {
				delete data.ChangeTracker;
			}
			
			if (data.hasOwnProperty('$id')) {
				delete data.$id;
			}
			
			return data;
		}
	},*/
	route: {
		mode: 'api',
		pattern: '.*',
		autoRead: false,
		read: {
			url: 'Api',
			type: 'GET'
		}
	},
	downloadFile: function (url, filePath, successCallback, errorCallback) {
		// !! Assumes variable url contains a valid URI to a file on a server and filePath is a valid path on the device
		var fileTransfer = new FileTransfer();

		fileTransfer.download(url, filePath, successCallback, errorCallback);
			/*function (entry) {
				console.log("download complete: " + entry.fullPath);
				return entry;
			},
			function (error) {
				console.log("download error source " + error.source);
				console.log("download error target " + error.target);
				console.log("upload error code" + error.code);
				
				return false;
			}
		);*/
	},
	getControlFileName: function (date) {
		return 'california_tablet_' + kendo.toString(date, 'MMddyyyy') + '.txt';
	},
	syncFiles: function (date, controlFileName) {
		var that = this;
		
		date = date || new Date(); // TODO: Fallback date
		controlFileName = controlFileName || that.getControlFileName(date);
		
		// Does the current day's control file exist?
		window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + 'control/' + controlFileName, 
		function () { // Success
			// Use the existing file
			that.readRemoteFiles(cordova.file.externalDataDirectory + 'control/', controlFileName);
		}, 
		function () { // Error
			// Since it's screwed we're gonna generate it instead
			that.downloadFile(App.getConfig('serviceUrl') + 'api/rest/data/controlfile/', cordova.file.externalDataDirectory + 'control/' + controlFileName,
			//that.downloadFile(App.getConfig('serviceUrl') + 'datasync/control/' + controlFileName, cordova.file.externalDataDirectory + 'control/' + controlFileName,
			function (entry) { // Success
				console.log('download complete: ' + entry.fullPath);
				that.readRemoteFiles(cordova.file.externalDataDirectory + 'control/', controlFileName);
			},
			function (error) {
				// TODO: Use the last local file available
				console.log('error downloading control file');
				console.log('download error source ' + error.source);
				console.log('download error target ' + error.target);
				console.log('upload error code' + error.code);
			});
		});
	},
	// Stupid assed way of doing this if you ask me, but whatever I don't fucking care right now
	createFileDownloader: function (context, remoteUrl, filePath) {
		// 0: In queue, 1: Processing, 2: Complete, 5: Failed
		return {
			remoteUrl: remoteUrl,
			filePath: filePath,
			context: context,
			//status: 0,
			fetch: function () {
				var download = this;
				
				// TODO: Check slashes
				window.resolveLocalFileSystemURL(download.filePath, 
					function (entry) {
						console.log(entry);
						console.log(download.filePath + ' exists');
						download.context.activeDownloads--;
						//download.status = 2;
					},
					function (error) {
						console.log('downloading file [' + download.filePath + ']');
						download.context.downloadFile(download.remoteUrl, download.filePath,
							function (entry) {
								//download.status = 2;
								console.log('successfully downloaded ' + download.filePath);
								download.context.activeDownloads--;
							},
							function (error) {
								//download.status = 5;
								console.log('error downloading ' + download.filePath);
								download.context.activeDownloads--;
							}
						);
					}
				);
			}
		};
	},
	processDownloads: function () {
		var that = this,
			loader = that.getLoader(),
			timer;
			
		loader.setMessage('Synchronizing data...').open();
			
		timer = setInterval(function () {
			if (that.downloadQueue.stack.length > 0) {
				if (!(that.activeDownloads > that.maxActiveDownloads)) {
					var download = that.downloadQueue.dequeue();
					that.activeDownloads++;
					download.fetch();
				}
			} else {
				loader.close();
				clearInterval(timer);
			}
		}, 100);
	},
	readRemoteFiles: function (controlFileDir, controlFileName) {
		var that = this;
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 512000, function (fileSystem) {
			//window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'control/', function(directoryEntry) {
			window.resolveLocalFileSystemURL(controlFileDir, function (directoryEntry) {
				console.log('Directory Entry Log - ', directoryEntry);
				directoryEntry.getFile(controlFileName, { create: false, exclusive: true },
					function (fileEntry) {
						fileEntry.file(
							function (file) {
								var folderRegex = /\/data\/(.*)/,
									fileRegex = /([^\\\/]*\.pdf)$/,
									isDataDir = false,
									dataDir = false,
									fileName;
									
								console.log('File Object Retrieved is - ', file);
								var reader = new FileReader();
								reader.onloadend = function (evt) {
									console.log('File Content - ', reader.result);

									var lines = reader.result.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
                                    var idx = 0;
									
									for (idx; idx < lines.length; idx++) {
										matches = lines[idx].match(folderRegex);
										
										// Does the current line specify a directory?
										if (matches !== null && typeof matches[1] !== 'undefined') {
											dataDir = App.Helpers.URL.stripTrailingSlashes(matches[1], true); // Strip and append to make sure there's only one trailing slash
											// TODO: Support Windows and Unix slashes?
											isDataDir = true;
										} else {
											isDataDir = false;
										}
										
										if (isDataDir === false) {
											fileName = lines[idx].match(fileRegex);
											
											// Does the current line specify a file?
											if (fileName !== null && typeof fileName[1] !== 'undefined') {
												fileName = fileName[1];
												
												var downloader = that.createFileDownloader(that, App.getConfig('serviceUrl') + 'datasync/data/' + dataDir + fileName, cordova.file.externalDataDirectory + 'data/' + dataDir + fileName);
												// Add to queue
												that.downloadQueue.enqueue(downloader);
											}
										}
                                    }
									
									// OK, we know what files to grab, start processing the queue
									that.processDownloads();

									if (evt.target.result) {
										console.log('Result Event - ', evt);
									} else {
										console.log('Error. - ', evt);
									}
								};
								reader.readAsText(file);
							},
							function (error) {
								console.log('File Read cannot complete on File System - ', error);
							}
						);
					}, function (error) {
						console.log('Reader cannot read from the File System - ', error);
					}
				);
			}, function (error) {
				console.log('Error - ', error);
			});
		},
		function (error) {
			console.log('FileEntry Cannot be retrieved - ', error);
		});
	},
	getAttribute: function (productData, groupName, attributeName) {
		var productAttributeGroups,
			productAttributeGroup,
			productAttributes,
			productAttribute = false;
		
		if (typeof productData.get('attribute_groups') !== 'undefined') {
			productAttributeGroups = productData.get('attribute_groups').toJSON();
			$.each(productAttributeGroups, function (idx, attributeGroup) {
				if (attributeGroup.hasOwnProperty('name') && attributeGroup.name === groupName) {
					productAttributeGroup = attributeGroup;
					
					return false; // Exit loop
				}
			});
			
			if (typeof productAttributeGroup !== 'undefined' && productAttributeGroup.hasOwnProperty('attribute')) {
				productAttributes = productAttributeGroup.attribute;
				
				$.each(productAttributes, function (idx, attribute) {
					if (attribute.hasOwnProperty('name') && attribute.name === attributeName) {
						productAttribute = attribute;
						
						return false; // Exit loop
					}
				});
			}
		}
		
		return productAttribute;
	},
	// TODO: Generic implementation of these attribute methods
	// Move to some sort of OpenCart mixin?
	getDataFolderAttribute: function (productData) {
		var that = this;
		return that.getAttribute(productData, 'Data Config', 'Server Data Folder');
	},
	getTrackCodeAttribute: function (productData) {
		var that = this;
		return that.getAttribute(productData, 'Data Config', 'Fixed Track Code');
	},
	getExternalDateOptionAttributes: function (productData) {
		var that = this,
			attributes;
		
		attributes = {
			url: that.getAttribute(productData, 'Product Config', 'Date Option URL'),
			params: that.getAttribute(productData, 'Product Config', 'Date Option Params')
		};
		
		for (var attribute in attributes) {
			if (attributes[attribute] && attributes[attribute].hasOwnProperty('text')) {
				attributes[attribute] = App.Helpers.String.unescapeHtml(attributes[attribute].text);
			}
		}
		
		return (attributes.url !== false) ? attributes : false;
	},
	getExternalProductAttributes: function (productData) {
		var that = this,
			attributes;
		
		attributes = {
			url: that.getAttribute(productData, 'Product Config', 'Product Option URL'),
			params: that.getAttribute(productData, 'Product Config', 'Product Option Params')
		};
		
		for (var attribute in attributes) {
			if (attributes[attribute] && attributes[attribute].hasOwnProperty('text')) {
				attributes[attribute] = App.Helpers.String.unescapeHtml(attributes[attribute].text);
			}
		}
		
		return (attributes.url !== false) ? attributes : false;
	},
	productRequiresCheckout: function (productData) {
		var that = this,
			requiresCheckout = true,
			attribute;
			
		attribute = that.getAttribute(productData, 'Product Config', 'Requires Checkout');
		if (attribute !== false && attribute.hasOwnProperty('text')) {
			if (attribute.text === 'false') requiresCheckout = false;
		}
		
		return requiresCheckout;
	},
	listFiles: function (path, slug, files) {
		// TODO: Fail if no 'files' ref provided
		//var files = window.files = [];
		window.filesLoaded = false;
		
		path = path || 'default';
		slug = slug || '';

		console.log('attempting to list files at ' + path);
		// in chrome 0 menas temporaray which means data can not be written and 512000 is just size of bytes usable
        // but phonegap works a bit differently so even if the number is 0, the API will still work
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 512000, function (fileSystem) {
        	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + 'data', function (directoryEntry) {
        	//window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory + 'public/data', function (directoryEntry) {
				//to get into a specific directory:
				directoryEntry.getDirectory(path,
					{
						create: true
					},
					function (dir) {
						console.log('found dir');
						console.log(dir);
						dir.createReader().readEntries(function (entries) {
							console.log('found files');
							console.log(entries);
							// for all the entries inside the directory loop the following
							for (var idx in entries) {
								file = entries[idx].name.split('/').slice().pop();
								if (file.search(slug) > -1) files.push(file);
							}

							window.filesLoaded = true;
						});
					},
					function (error) {
						console.log('Error - ', error);
					}
				);

			}, function (error) {
				console.log('Error - ', error);
			});

			return files; // Not sure if this does anything, we're passing in by ref, really...

		}, function(error) {
			console.log('Error - ', error);
		});

		return files; // Not sure if this does anything, we're passing in by ref, really...
	},
	displayDownload: function () {
		var	that = this,
			dataSources = that.getDataSources(),
			dashboardViewModel = that.getModule('module_customerDashboard_1').getViewModel();
			
		// TODO: Let's make sure this is the only module?
		var productDownloads = dashboardViewModel.get('product_downloads');
		var files = [];

		productDownloads.forEach(function (parts, idx) {
			var folderPath = parts.get('folder_path'),
				dateCode = parts.get('date_code'),
				trackCode = parts.get('track_code');

			trackCode.forEach(function (code, idx) {
				// TODO: Detect trailing slashes everywhere!
				files.push(folderPath + '/' + code + dateCode + '.pdf');
			});
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
	},
	formatTrackDate: function (date) {
		var months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
		return ('0' + date.getDate()).slice(-2) + months[date.getMonth()];
	},
	parseTrackCodes: function (string) {
		var matches = /\[(.*)\]/.exec(string.substring(string.indexOf('[')));
		if (typeof matches !== null && matches.length > 1) return matches[1].split(',');

		return false;
	},
	parseTrackName: function (string) {
		return string.substring(string.indexOf('['), 0).trim();
	},
	events: {
		initialized: function () {
			var that = this;
			that.formatTrackDate = that.getConfig().formatTrackDate;
			that.parseTrackCodes = that.getConfig().parseTrackCodes;
			that.parseTrackName = that.getConfig().parseTrackName;
			that.displayDownload = that.getConfig().displayDownload;
			that.listFiles = that.getConfig().listFiles;
			that.getControlFileName = that.getConfig().getControlFileName;
			that.getAttribute = that.getConfig().getAttribute;
			that.getDataFolderAttribute = that.getConfig().getDataFolderAttribute;
			that.getTrackCodeAttribute = that.getConfig().getTrackCodeAttribute;
			that.getExternalDateOptionAttributes = that.getConfig().getExternalDateOptionAttributes;
			that.getExternalProductAttributes = that.getConfig().getExternalProductAttributes;
			that.productRequiresCheckout = that.getConfig().productRequiresCheckout;
			that.syncFiles = that.getConfig().syncFiles;
			that.downloadFile = that.getConfig().downloadFile;
			that.readRemoteFiles = that.getConfig().readRemoteFiles;
			that.createFileDownloader = that.getConfig().createFileDownloader;
			that.processDownloads = that.getConfig().processDownloads;
			that.downloadQueue = App.Utilities.Queue();
			that.maxActiveDownloads = 30;
			that.activeDownloads = 0;
		},
		loaded: function (e) {
			var that = this,
				page = App.getCurrent(),
				block = page.getBlock(that.getPrimaryBlockName()),
				viewModel = block.getViewModel(),
				validator = block.getValidator(),
				widgetTypes = App.Config.Widgets.defaults(),
				widgets;
			
			// Maps PanelBar menu items to their corresponding tabs
			$('.entityPopupMenu').each(function (idx, obj) {
				var menu = $(obj).data('kendoPanelBar'),
					tabs = $(obj).parent().find('.entityPopupTabs').first().data('kendoSemanticTabStrip');
					// TODO: Semantic vs. standard tabs
				
				menu.bind('select', function (e) {
					var panelIndex = menu.element.find('li').index($(e.item));
					tabs.select(panelIndex);
				});
			});
			
			// Get customer dashboard
			var dashboard = that.getModule('module_customerDashboard_1'),
				dashboardEventHandler = dashboard.getEventHandler();
				
			dashboardEventHandler.addEventListener('rendered', function () {
				console.log('tabs yo');
				that.contentTabs = contentTabs = $(document.body).find('#contentTabs').first().data('kendoSemanticTabStrip');
				that.customerTabs = $('[id^=module_customerDashboard]').find('#customer-tabs').first().data('kendoSemanticTabStrip');
			});

			var nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>');
			
			// TODO: Something is wrong with the Kendo Grid hierarchy rendering...
			// For now, just add the missing columns/cells
			var grids = $('#autoplusPolicyClaimsGrid'),
				grid;
			
			$.each(grids, function (idx, el) {
				grid = $(el);
				
				grid.find('.k-grid-header colgroup, .k-grid-content colgroup').prepend('<col class="k-hierarchy-col">');
				grid.find('.k-grid-header thead tr').first().prepend('<th class="k-hierarchy-cell k-header"></th>');
				grid.find('.k-grid-content tbody tr.k-master-row').prepend('<th class="k-hierarchy-cell"></th>');
			});
			
			var nestedDetailGridDetail = $('.nestedDetailGridDetail').wrap('<script id="nestedDetailGridDetailScript" type="text/x-kendo-template"></script>');
		},
		isLoaded: function () {
			var that = this,
				page = App.getCurrent(),
				loader = page.getLoader(),
				block = page.getBlock(that.getPrimaryBlockName()),
				dataSources = page.getDataSources(),
				viewModel = block.getViewModel(),
				validator = block.getValidator(),
				contentTabs = that.contentTabs,
				customerTabs = that.customerTabs;
				
			// TODO: Not sure what's up with the login rendering
			$('#header').find('[id^=module]').each(function () {
				module = page.getModule($(this).attr('id'));
				if (!module.isRendered()) module.render();
				console.log('just tried rendering the login module wtf');
			});
			
			// TODO: Not sure what's up with the login rendering
			$('#left-pane').find('[id^=module]').each(function () {
				module = page.getModule($(this).attr('id'));
				if (!module.isRendered()) module.render();
				console.log('just tried rendering the login module wtf');
			});
				
			var tabs = contentTabs.tabGroup.children();
			
			contentTabs.bind('activate', function (e) {
				var module = null;
				
				//resizeGrid($(e.contentElement).find('[id^=module] > .k-grid'));
				$(e.contentElement).find('[id^=module]').each(function () {
					module = page.getModule($(this).attr('id'));
					if (!module.isRendered()) module.render();
				});
			});
			
			// TODO: Do we need some sort of config parameter that will hide the target tabs?
			contentTabs.tabGroup.css({ display: 'none' })
				.siblings('[role=tabpanel]')//.css({ marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: 0, border: 'none' })
				.find('h3').css({ boxSizing: 'border-box', padding: '20px 1.5rem 10px', margin: 0, width: '100%', background: '#555', color: 'white', zIndex: 1000, /*position: 'fixed'*/ });
				/*.each(function () {
					//$(this).after('<span class="heading-spacer" style="display: block; height: ' + $(this).outerHeight(true) + 'px"></span>');
					//return h;
				});*/
			
			$(window).on('resize', function () {
				App.Widgets.Helpers.Grid.resizeFullPane($(contentTabs.element).find('[id^=module] > .k-grid').first(), $(contentTabs.element).closest('.pane-content'));
			});
			
			/*var initSplitter = function () {
				var splitterElement = $('#horizontal'),
					maxHeight = 0,
					h;
				splitterElement.css('visibility', 'hidden');	
				splitterElement.find('.pane-content').parent().each(function (idx, pane) {
					console.log(pane);
					h = $(pane).height();
					maxHeight = (h > maxHeight) ? h : maxHeight;
					console.log(maxHeight);
				});
				
				var splitter = splitterElement.kendoSplitter({
					panes: [
						{ collapsible: true, collapsed: true, scrollable: false, resizable: true, size: '18%' },
						{ collapsible: false, scrollable: false },
						{ collapsible: true, collapsed: true, scrollable: false, resizable: true, size: '20%' }
					]
				}).data('kendoSplitter');
				splitter.wrapper.add(splitter.wrapper.children()).each(function (idx, el) {
					console.log(el);
					$(el).height(maxHeight);
					console.log($(el).height());
					console.log('------');
				});
				splitter.wrapper.css('visibility', 'visible');
			};
			
			initSplitter();*/
			
			var loginModule = page.getModule('module_login_1'); // Any instance will do
			
			var customerEntryBlocks = $('[id^=block_customerEntry_]');
			console.log('customerEntryBlocks');
			console.log(customerEntryBlocks);
			customerEntryBlocks.each(function (idx, block) {
				var buttons = $(block).find('button[name=loginButton]');
				buttons.each(function (idx, el) {
					var button = $(el).data('kendoButton');
					button.bind('click', function (e) {
						console.log(viewModel.get('email'));
						console.log(viewModel.get('password'));
						if (loginModule.doLogin(viewModel.get('email'), viewModel.get('password'))) {
							contentTabs.select(1);
							customerTabs.select(2);
						}
					});
				});
				
				$(block).find('.forgotPasswordLink').click(function (e) {
					var resetWindow = $('[name=resetPopup]').first().data('kendoWindow');
					console.log('forgot password');
					console.log(e);
					resetWindow.center();
					resetWindow.wrapper.css({ top: 0 });
					resetWindow.open();
				});
				
				// Wrap each registration form in a form element
				$(block).find('[id^=block_register]').each(function (idx, el) {
					var blockElement = $(el),
						block = page.getBlock(blockElement.attr('id')),
						form = blockElement.wrap('<form id="' + blockElement.attr('id') + '_form" style="width: 100%"></form>');
					
					// TODO: Namespace values so there aren't collisions later
					// I should look at this again later
					console.log('form element');
					console.log(form);
					// Ok this is gonna have to do for now
					// TODO: Make this configurable
					
					var regButton = blockElement.find('[name=registerButton]').first().data('kendoButton');
					regButton.bind('click', function (e) {
						// Register user
						$.ajax({
							url: App.getConfig('serviceUrl') + 'api/rest/register/',
							data: JSON.stringify({
								address_1: 'Suite 123',
								address_2: '123 Jasper Ave',
								city: 'Edmonton',
								company_id: 'Company',
								company: 'Company',
								country_id: '38',
								email: viewModel.get('email'),
								fax: '+18001234568',
								firstname: viewModel.get('firstname'),
								lastname: viewModel.get('lastname'),
								postcode: 'T5W4S9',
								tax_id: 1,
								telephone: '+18001234567',
								zone_id: 602,
								password: viewModel.get('password'),
								confirm: viewModel.get('password'),
								agree: 1, 
							}),
							type: 'POST',
							dataType: 'json',
							contentType: 'application/json',
							async: false, // No async login
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
								loader.setMessage('Please wait while we create your account...').open();
							},
							success: function (response, status, xhr) {
								if (response.success) {
									if (response.hasOwnProperty('data')) {
										// OK the response isn't the same as the actual return when you fetch a customer after login
										// Why? I have no idea, but i will fix it in *my* REST implementation - good job 3rd party devs
										$.ajax({
											url: App.getConfig('serviceUrl') + 'api/rest/account/',
											type: 'GET',
											dataType: 'json',
											contentType: 'application/json',
											beforeSend: function (request) {
												request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
											},
											success: function (response, status, xhr) {
												// Create new customer model
												// TODO: Define these in app config
												var Entity = kendo.data.Model.define({
													id: 'customer_id'
												});
												
												var model = new Entity();
												
												// We can specify a target observable as the second param
												block.setData(response.data, model);
												console.log(model);
												dataSources.set('customer.entity', model);
												console.log('persisting customer entity...');
												console.log(dataSources.get('customer.entity'));
												
												// TODO: Better please... events maybe?
												var customerModule = page.getModule('module_customer_1');
												customerModule.setCustomer(model);
											}
										});
										
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
										
										// TODO: This kind of sucks but I need to add and test core methods to fix block data-binding
										viewModel.set('password', '');
										viewModel.set('firstname', '');
										viewModel.set('lastname', '');
										viewModel.set('email', '');
										
										if (loginModule.doLoginCheck() !== false) {
											// TODO: Clear select on other elements
											contentTabs.select(1);
											customerTabs.select(2);
										}
									}
								}
								
								//that.doLoginCheck();
							},
							complete: function (response, status) {
								console.log('xhr response', response);
								console.log('status', status);
								
								// TODO: hasOwnProperty checks, etc. - make this more robust
								if (response.success === false || response.responseJSON.success === false) {
									// TODO: Fix checkuser route/action in OpenCart API -- this is fucking stupid
									// Having to base my action on text returned is weak
									if (response.responseJSON.error === 'User already is logged') {
										loader.setMessage('Sorry, you can\'t register for an account while logged in').open();
									
										setTimeout(function () {
											loader.close();
										}, 3000);
									} else {
										loader.setMessage(response.responseJSON.error.warning).open();
										
										viewModel.set('password', '');
									
										setTimeout(function () {
											loader.close();
										}, 3000);
									}
								} else {
									loader.close();
								}
							} 
						});
					});
				});
				
				addressModules = $('[id^=block_customerEntry]').find('[data-module=address]');
				console.log('address modules in customer entry forms');
				console.log(addressModules);
				addressModules.each(function () {
					var id = $(this).attr('id');
					addressModule = page.getModule(id);
					
					addressModule.render();
				});
			});
			
			//resizeGrid($(tabstrip.element).find('[id^=module] > .k-grid').first());
			
			// This probably belongs in the login module, but we can do that later
			var loginHandler = function (e) {
				// TODO: There has to be a better way than a hardcoded reference
				var loginWindow = $('#loginPopup').data('kendoWindow');
				loginWindow.center();
				loginWindow.wrapper.css({ top: 0 });
				loginWindow.open();
			};
			
			var toolbar = $('#toolbar').kendoToolBar({
				items: [
					{ template: '<h3 style="text-align: left; padding-left: 1em; padding-right: 1em;">VEST Racing</h3>' },
					{ 
						type: 'button', 
						text: '  Home', 
						spriteCssClass: 'fa fa-home',
						click: function (e) {
							contentTabs.select(0);
						}
					},
					{
						type: 'buttonGroup',
						buttons: [
							{ 
								group: 'areas', 
								id: 'menu-button-products',
								text: '  Browse',
								togglable: true,
								spriteCssClass: 'fa fa-th-list'
							},
							{
								group: 'areas',
								id: 'menu-button-dashboard',
								text: '  My Dashboard',
								togglable: true,
								spriteCssClass: 'fa fa-dashboard'
							}
						]
					},
					{
						type: 'splitButton',
						text: '  My Account',
						spriteCssClass: 'fa fa-user',
						attributes: {
							style: 'float: right'
						},
						/*click: function (e) {
							// TODO: This isn't specific enough for a module, but whatever for now
							if (e.target.text() === 'My Account') {
								if (loginModule.doLoginCheck() !== false) {
									// TODO: Clear select on other elements
									contentTabs.select(1);
									tabs.select(2);
								} else {
									loginHandler({}); // The login handler probably belongs in the login module, but we can do that later
								}
							}
						},*/
						menuButtons: [
							{ text: '  Sign In', id: 'menu-button-sign-in', spriteCssClass: 'fa fa-sign-in', click: loginHandler },
							{ text: '  My Account', id: 'menu-button-account', spriteCssClass: 'fa fa-user' },
							//{ text: '  My Customer Account', spriteCssClass: 'fa fa-user' }, // This is going to have to be moved
							//{ text: '  Manage Users', spriteCssClass: 'fa fa-users' },
							{ text: '  Change Accounts', id: 'menu-button-change-account', spriteCssClass: 'fa fa-sign-in', click: loginHandler },
							{ 
								text: '  Sign Out', 
								id: 'menu-button-sign-out',
								spriteCssClass: 'fa fa-sign-out',
								click: function (e) {
									var login = page.getModule($(document.body).find('[id^=module_login_]').first().attr('id'));
									console.log('login module');
									console.log(login);
									
									login.doLogout();
									
									viewModel.set('email', '');
									viewModel.set('password', '');
									
									// TODO: Add success callback handler for login model -- we're gonna cheat and trigger this manually for nowcontentTabs.select(1);
									contentTabs.select(0);
									customerTabs.select(1);
								}
							}
						]
					},
					{
						type: 'splitButton',
						text: '  My Cart',
						spriteCssClass: 'fa fa-shopping-cart',
						attributes: {
							style: 'float: right'
						},
						click: function (e) {
							// TODO: This isn't specific enough for a module, but whatever for now
							$('[name=cartTrigger]').trigger('click');
						},
						menuButtons: [{ text: '  My Shopping Cart', spriteCssClass: 'fa fa-shopping-cart' }]
					},
					/*{
						type: 'splitButton',
						text: 'Stores',
						attributes: {
							style: 'float: right'
						},
						menuButtons: [
							{ text: 'Online Store', spriteCssClass: 'fa' },
							{ text: 'Service Provider', spriteCssClass: 'fa' },
							{ text: 'Property Rentals', spriteCssClass: 'fa' },
							{ text: 'Membership Site', spriteCssClass: 'fa' }
						]
					}*/
					{ 
						type: 'button', 
						text: '  Help', 
						spriteCssClass: 'fa fa-support',
						click: function (e) {
							contentTabs.select(0);
						}
					},
					{ 
						type: 'button', 
						text: '  Reload', 
						spriteCssClass: 'fa fa-refresh',
						click: function (e) {
							window.location.reload(true);
						}
					}
				],
				// TODO: See toggle below... same deal here
				// This whole thing could be reusable... I remember doing something similar for Pipefitters
				click: function(e) {
					// TODO: This isn't specific enough for a module, but whatever for now
					if (e.target.text() === '  My Account') {
						if (loginModule.doLoginCheck() !== false) {
							// TODO: Clear select on other elements
							contentTabs.select(1);
							customerTabs.select(2);
						} else {
							loginHandler({}); // The login handler probably belongs in the login module, but we can do that later
						}
					}
				},
				toggle: function(e) {
					// TODO: How to target a specific buttongroup?
					// TODO: Word, we shouldn't have to add spaces here... fix the css spacing
					// TODO: Also, let's not base this on text; match indexes instead
					if (e.target.text() === '  Browse' && e.checked) {
						contentTabs.select(1);
						customerTabs.select(0);
					}
					else if (e.target.text() === '  My Dashboard' && e.checked) {
						// TODO: Let's select this a little better :) events need to be in sequence
						contentTabs.select(1);
						customerTabs.select(1);
					}
				}
			}).data('kendoToolBar');
			console.log('toolbar');
			console.log(toolbar);
			
			// Show/hide menu buttons
			// TODO: This should be part of the menu module?
			// I don't like hardcoding dependencies but here will just have to do for now...
			// 'Cause it's faster :)
			/*toolbar.hide($('#menu-button-dashboard'));
			toolbar.hide($('#menu-button-account'));
			toolbar.hide($('#menu-button-sign-out'));
			toolbar.hide($('#menu-button-change-account'));*/
			$('#menu-button-dashboard').hide();
			$('#menu-button-account').closest('li').hide();
			$('#menu-button-sign-out').closest('li').hide();
			$('#menu-button-change-account').closest('li').hide();
			
			toolbar.resize(true);
			
			// TODO: Wrap in function, and this can be improved a bit (check filesystem to see if folders exist in case of manual delete)
			var currentDateTime = new Date(),
				lastSyncRun = localStorage.getItem('lastSyncRun') || false;
			
			console.log(lastSyncRun);
			if (lastSyncRun) {
				console.log('last synchronized on ' + lastSyncRun);
				lastSyncRun = new Date(lastSyncRun); // Convert to date
				
			} else {
				console.log('device data has never been loaded');
			}
			
			if (!lastSyncRun || !(lastSyncRun.setMinutes(lastSyncRun.getMinutes() + 30) > currentDateTime.getTime())) {
				console.log('----------- SYNCHRONIZING FILES -----------');
				//that.syncFiles(currentDateTime, 'california_tablet');
				localStorage.setItem('lastSyncRun', currentDateTime);
				that.syncFiles(null, 'california_tablet');
			}
			
			var customerModule = that.getModule('module_customer_1'); // TODO: Let's not hardcode if possible
			// Is the user logged in? If so, load the account...
			if (that.getAuthHandler().doLoginCheck() !== false) customerModule.getAccount();
		}
	},
	validation: {
		validateOnBlur: true,
		messages: {
		},
		rules: {
		}
	},
    layout: [
		{
            block: 'top-pane',
			templates: {
				sections: [
					{
						tag: 'section',
						id: 'header',
						children: [
							{
								block: 'autorow',
								config: {
									params: {
										style: 'margin-top: 0'
									},
									items: [
										{
											tag: 'div',
											id: 'toolbar',
											style: 'max-width: 100%'
										},
										{
											module: 'cart',
											config: {
												autoRender: true,
												autoBind: true
											}
										},
										/*{
											block: 'social'
										},*/
										{
											module: 'login',
											// TODO: Gotta fix this yo
											config: {
												autoRender: true,
												autoBind: true
											}
										},
										/*{
											block: 'social'
										}*/
									]
								}
							}
						]
					}
				]
			}
		},
        {
            block: 'center-pane',
			primary: true,
			templates: {
				sections: [
					{
						tag: 'div',
						class: 'nestedDetailGridDetail',
						// TODO: For some reason I can't use my kendoSemanticTabStrip widget...
						parts: [
							{
								tag: 'div',
								fields: [
									{
										tag: 'div',
										class: 'nestedDetailGrid'
									}
								]
							}
						]
					},
					{
						module: 'ajaxLoader',
						config: {
							autoRender: true,
							autoBind: true
						}
					},
					{
						
						tag: 'div',
						id: 'contentTabs',
						data: {
							// TODO: Update SemanticTabStrip widget
							role: 'semantictabstrip'
							//role: 'tabstrip'
						},
						tabs: ['Splash', 'Dashboard', 'Products', 'Categories', /*'Manufacturers', 'Distributors',*/ 'Customers'/*, 'Vendors', 'Sales Orders', 'Cash Sales', 'Purchase Orders', 'Reviews', 'Customer Groups', 'Countries', 'Feeds', 'Affiliates', 'Resellers', 'Accounts', 'Pages', 'Page Categories'*/],
						fieldsets: [
							// Splash
							{
								tag: 'fieldset',
								children: [
									{
										tag: 'div',
										style: 'display: flex; flex-flow: row wrap',
										children: [
											/*{
												tag: 'h3',
												text: '{Track Name/Location, City Here}'
											},
											{
												tag: 'p',
												text: 'This is your management dashboard...'
											},*/
											{ block: 'customerEntry' }, 
											{ module: 'swipeRegions', config: { autoRender: true } }
										]
									}
									
								]
							},
							// Dashboard
							{
								tag: 'fieldset',
								children: [
									/*{
										tag: 'h3',
										text: '{Track Name/Location, City Here}'
									},
									{
										tag: 'p',
										text: 'This is your management dashboard...'
									},*/
									{
										block: 'pageActionsToolbar'
									},
									{
										module: 'customerDashboard', config: { autoRender: true }
									}
								]
							},
							// Products - make sure the modules don't need to load the whole damn catalog please
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Products' }, { module: 'catalogProducts', config: { autoRender: false } }]
							},
							// Categories - make sure the modules don't need to load the whole damn catalog please
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Categories' }, { module: 'catalogCategories', config: { autoRender: false } }]
							},
							/*{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Brands, Models & Inventory' }, { module: 'inventoryManufacturers', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Add/Remove Distributors' }, { module: 'distributors', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Customers' }, { module: 'customers', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Vendors' }, { module: 'vendors', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Sales Orders' }, { module: 'orders', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Cash Sales' }, { module: 'sales', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Purchase Orders' }, { module: 'purchases', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Reviews' }, { module: 'reviews', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Customer Groups' }, { module: 'customerGroups', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Countries' }, { module: 'countries', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Feeds' }, { module: 'inventoryFeeds', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Affiliates' }, { module: 'affiliates', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Resellers' }, { module: 'resellers', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Users' }, { module: 'users', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Pages' }, { module: 'contentArticles', config: { autoRender: false } }]
							},
							{
								tag: 'fieldset',
								children: [{ tag: 'h3', text: 'Manage Page Categories' }, { module: 'contentCategories', config: { autoRender: false } }]
							}*/
						]
					}
				]
			}
        },
		{
			block: 'left-pane',
			templates: {
				tag: 'section',
				id: 'sidebar-a',
				children: [
					/*{
						block: 'stickySidebar'
					}*/
					/*{
						module: 'mainmenu'
					}*/
					/*{
						tag: 'section',
						id: 'layout-toc',
						children: [
							{
								tag: 'div',
								id: 'tocTreeView',
								data: {
									role: 'treeview',
									autoBind: false
								}
							}
						]
						
					}*/
				]
			}
		},
		/*{
			block: 'right-pane',
			templates: {
				tag: 'section',
				id: 'sidebar-b',
				panels: [
					{
						module: 'errorPanel'
					}
				]
			}
		}*/
    ] // END layout
}; });