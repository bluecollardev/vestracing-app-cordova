define({
	name: 'customerDashboard',
	id: 'customerDashboard',
	autoBind: true,
	autoRender: false,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources(),
				stringHelpers = App.Helpers.String;
				
			if (!dataSources.has('browser.product')) {
				// Initialize datasources
				dataSources.set('browser.product', new kendo.data.DataSource({
					transport: {
						read: {
							url: App.getConfig('serviceUrl') + 'api/rest/products',
							type: 'GET',
							dataType: 'json',
							beforeSend: function (request) {
								request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
							}
						}
					},
					pageSize: 30,
					batch: true,
					schema: {
						model: {
							id: 'id'
						},
						parse: function (response) {
							// Product descriptions can exist for more than one language
							var products = response.data,
								results = [];
							
							$.each(products, function (idx, row) {
								if (row.hasOwnProperty('description')) row.description = stringHelpers.decodeHtmlEntities(row.description);
								results.push(row);
							});
							
							return results;
						}
					}
				}));
			}
		},
		pageLoaded: function (e) {
			var	that = this,
				page = App.getCurrent(),
				eventHandler = that.getEventHandler();
			
			//eventHandler.dispatch('rendered');
		},
		rendered: function (e) {
			var	that = this,
				page = that.getPage(),
				viewModel = that.getViewModel();
			
			that.dataBind(viewModel);
			
			var	customerDashboardPopup = $('#customerDashboardPopup'),
				moduleElement = $('#' + that.getId()),
				addressModules,
				addressModule;
				
			/*addressModules = customerDashboardPopup.find('[data-module=address]');
			addressModules.each(function () {
				var id = $(this).attr('id');
				addressModule = page.getModule(id);
				
				addressModule.getEventHandler().dispatch('pageLoaded');
			});*/
			
			customerModules = $('#' + that.getId()).find('[data-module=customer]');
			
			// All modules should share the same dataset in dashboard view anyway
			customerModules.each(function () {
				var id = $(this).attr('id');
				customerModule = page.getModule(id);
				
				customerModule.render();
				
				// Bind the personal info block to the view-model
				var personalInfoBlock = $('#' + that.getId()).find('[id^=block_personalInfo_]').first();
				//personalInfoBlock.each(function (idx, block) {
					console.log('binding personal info block to customer module\'s view-model');
					console.log(customerModule.getViewModel());
					// TODO: Add param to force dataBind if necesssary
					//page.getBlock($(block).attr('id')).dataBind(customerModule.getViewModel());
					kendo.bind(personalInfoBlock, customerModule.getViewModel());
					
					personalInfoBlock.find('input[type=text]').attr('readonly', 'readonly');
				//});
			});
			
			downloadsModules = $('#' + that.getId()).find('[data-module=downloads]');
			downloadsModules.each(function () {
				var id = $(this).attr('id');
				downloadsModule = page.getModule(id);
				
				downloadsModule.render();
			});
			
			countrySelectorModules = $('#' + that.getId()).find('[data-module=countrySelector]');
			countrySelectorModules.each(function () {
				var id = $(this).attr('id');
				countrySelectorModule = page.getModule(id);
				
				countrySelectorModule.render();
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
			
			$('[name=browseButton]').each(function (idx, el) {
				console.log('browse button...');
				console.log(el);
				var button = $(el).data('kendoButton');
				
				// TODO: This isn't written for multiple module instances
				// TODO: Unbind and rebind
				button.bind('click', function (e) {
					console.log('clicked browse button... switching tabs');
					// TODO: This is going to be reused a lot
					// TODO: There's a better way to access this globally :)
					var contentTabs = $(document.body).find('#contentTabs').first().data('kendoSemanticTabStrip'),
						tabs = $('[id^=module_customerDashboard]').find('#customer-tabs').first().data('kendoSemanticTabStrip');
					
					contentTabs.select(1);
					tabs.select(0);
				});
			});
			
			// TODO: Wrap as module
			var browser;
			var browserListView = $('#browserCatalog').data('kendoListView');
			var browserMenu = $('#browserMenu').data('kendoListView');
			var browserDataSources = page.getDataSources();
			
			// each browser collection
			// product, category, manufacturer, model, option
			// tool, group, network, brand, model, (no options)
			// product, category[harness|thoroughbred|results], track, (no models), race/date
			var browserCollections = [];
			/*var addCollection = function () {
				dataSource
			};*/
			
			// TODO: This shouldn't be called just a temporary solution while I put this together
			var optionsDataSource = new kendo.data.DataSource({
				schema: {
					model: {
						id: 'product_option_id'
					}
				}
			});
			
			var infoWindow = $('#infoPopup').data('kendoWindow');
			
			function Browser (catalog, menu, option) {
				var instance = {
					catalog: catalog,
					menu: menu,
					prev: null,
					config: {},
					steps: [],
					step: 0,
					stepForward: false,
					progressBar: null,
					// I really don't like this in here -- I don't want tracks built in to the browser, but whatever for now
					availableTracks: [],
					availableDates: [],
					updateProgress: function (status, value) {
						var that = this;
						
						if (typeof ellipsisInterval === 'function') {
							clearInterval(ellipsisInterval);
						}
						
						if (that.progressBar instanceof kendo.ui.ProgressBar) {
							value = (typeof value === 'number') ? value : parseInt(that.progressBar.value() + 1);
							that.progressBar.value(value);
						}
					},
					updateProgressText: function (status) {
						if (typeof ellipsisInterval === 'function') {
							clearInterval(ellipsisInterval);
						}
					},
					formatDate: function (date) {
						var that = this;

						console.log('formatting date: ');
						console.log(date);
						if (date instanceof Date) {
							var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
							var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

							var day = days[ date.getDay() ];
							var month = months[ date.getMonth() ];
							console.log('day: ' + day + ', month: ' + month);
						
							return '<td rowspan="1" class="k-scheduler-datecolumn k-first k-last"><em class="k-scheduler-agendaweek">- ' + day + ' -</em><strong class="k-scheduler-agendaday">' + date.getDate().toString() + '</strong><span class="k-scheduler-agendadate">' + month + ', ' + date.getFullYear().toString() + '</span></td>';
						}
						
						return '';
					},
					applyFilters: function (filterValue) {
						var that = this,
							steps = that.steps,
							step = that.step - 1;
						
						//console.log('applying filters for step ' + step);
						if (step === -1) return false;
						
						if (steps[step].hasOwnProperty('filter')) {
							//console.log('step has filter');
							//console.log(steps[step].filter);
							var target = steps[step].filter.target,
								filters = (typeof target.filter() !== 'undefined') ? target.filter().filters : [];
								filter = $.extend(true, steps[step].filter.filter, { value: filterValue });
							
							if (filters.length > 0) {
								var exists = false;
								// TODO: Make a helper? Yeah...
								$.each(filters, function (idx, obj) {
									// TODO: Add customization -- do we append? Or overwrite
									// We can do that some other time
									// TODO: Support multiple filters
									if (obj.field === filter.field) {
										$.extend(true, filters[idx], filter);
										exists = true;
									}
								});
								
								if (!exists) {
									filters.push(filter);
								}
							} else {
								filters.push(filter);
							}
							
							target.filter(filters);
						}
					},
					// TODO: Implement some sort of adapter and add an OpenCart admin var to allow configuration of where to get available dates
					// TODO: This should accept the whole product download config?
					getExternalDates: function (externalDateOptionAttributes, code) {
						externalDateOptionAttributes = externalDateOptionAttributes || false;
						if (!externalDateOptionAttributes) return false; // TODO: Throw error?
						
						// Return all files in the folder
						var that = this,
							params = $.parseJSON(externalDateOptionAttributes.params),
							dates = [], 
							date = new Date(),
							events = [];
						
						// TrackInfo actually returns a calendar displaying the last month with available results
						// We're going to default to the current month here, but maybe I can adjust the calendar behavior later
						date.setDate(1); // Default to first of the month (that's how they do it)
							
						$.ajax({
							type: params.type,
							async: false,
							url: externalDateOptionAttributes.url, // TODO: Better check? Throw error?
							data: { // TODO: Build using attributes
								trackcode: code,
								racedate: kendo.toString(date, 'yyyy-MM-dd')
							},
							success: function (data, status, xhr) {
								var cal = $(data),
									links = cal.find('a.calendar'),
									dates  = [];
								
								var generateEvents = function () {
									links.each(function (idx, link) {
										var regex = /^\d{1,2}$/i,
											text = $(link).text();
										
										if (regex.test(text)) {
											date = new Date();
											//date.setMonth();
											date.setDate(text);
											date.setHours(0,0,0,0);

											if ($.inArray(date.getTime(), dates) === -1) dates.push(date.getTime());
										}
									});

									$.each(dates, function (idx, date) {
										events.push({
											title: 'Available',
											start: new Date(date),
											end: new Date(date),
											isAllDay: true,
											image: ''
										});
									});
								};
								
								// TODO: Let's make this a helper method or something, and make sure to provide a callback mechanism
								// TODO: Consolidate with the code block in getAvailableDates below?
								var interval = setInterval(function () {
									var schedulers = browser.catalog.element.find('.product-option-scheduler-widget');
									if (schedulers.length > 0) {
										generateEvents();

										schedulers.each(function () {
											var scheduler = $(this).data('kendoScheduler');
											scheduler.dataSource.data(events);
										});

										clearInterval(interval);
									}
								}, 333);
							}
						});
					},
					getAvailableDates: function (filePath) {
						// Return all files in the folder
						var that = this,
							filePath = filePath || 'default',
							files = window.files = [],
                            months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'],
							dateRegex = /[a-zA-Z]+([0-9]+)([a-zA-Z]+).pdf$/,
							dates = [], date,
							events = [];

						console.log('--------- GETTING AVAILABLE DATES ---------');
						page.listFiles(filePath, '', files);
						var generateEvents = function () {
							if (typeof files !== 'undefined') {
								$.each(files, function (idx, fileName) {
									var matches = fileName.match(dateRegex);
									if (matches !== null) {
										date = new Date();
										date.setMonth(months.indexOf(matches[2]));
										date.setDate(matches[1]);
										date.setHours(0,0,0,0);

										if ($.inArray(date.getTime(), dates) === -1) dates.push(date.getTime());
									}
								});
							}

							$.each(dates, function (idx, date) {
								events.push({
									title: 'Available',
									start: new Date(date),
									end: new Date(date),
									isAllDay: true,
									image: ''
								});
							});
						};

						// TODO: Let's make this a helper method or something, and make sure to provide a callback mechanism
						var interval = setInterval(function () {
							if (typeof window.filesLoaded !== 'undefined' && window.filesLoaded) {
								generateEvents();

								browser.catalog.element.find('.product-option-scheduler-widget').each(function () {
									var scheduler = $(this).data('kendoScheduler');
									scheduler.dataSource.data(events);
								});

								clearInterval(interval);
							}
						}, 333);
					},
					getAvailableTracks: function (filePath, date) {
						// Return all files in the folder
						var that = this,
							filePath = filePath || 'default',
							files = window.files = [],
							regex = new RegExp('([a-zA-Z]+)' + page.formatTrackDate(date) + '.pdf'),
							results = [];

						console.log('--------- GETTING AVAILABLE TRACKS ---------');
						page.listFiles(filePath, page.formatTrackDate(date), files);
						var getCodes = function () {
							if (typeof files !== 'undefined') {
								$.each(files, function (idx, fileName) {
									var matches = fileName.match(regex);
									if (matches !== null) {
										results.push(matches[1]);
									}
								});
							}
						};

						// TODO: Let's make this a helper method or something, and make sure to provide a callback mechanism
						var interval = setInterval(function () {
							if (typeof window.filesLoaded !== 'undefined' && window.filesLoaded) {
								var filters = [], filter;

								getCodes();

								// TODO: I need to make a property to hold just the codes, or I'll end up matching against the name too
								$.each(results, function (idx, code) {
									filters.push({ field: 'code', operator: 'contains', value: code });
								});
								
								filter = (filters.hasOwnProperty('length') && filters.length > 0) ? [{ logic: 'or', filters: filters }] : [];
								that.catalog.dataSource.filter(filter);

								clearInterval(interval);
							}
						}, 333);
					},
					initSchedulers: function () {
						var that = this;

						// TODO: There's gotta be a better way of doing this
						// I'll figure it out later
						that.catalog.element.find('.product-option-scheduler-widget').each(function () {
							var scheduler = $(this).kendoScheduler({
								//date: new Date(),
								//startTime: new Date(),
								allDaySlot: false,
								date: new Date(),
								//startTime: new Date(),
								//endTime: new Date(),
								max: new Date(), // Today
								dateHeaderTemplate: kendo.template("<strong>#=kendo.toString(date, 'd')#</strong>"),
								editable: false,
								selectable: true,
								eventTemplate: $("#event-template").html(),
								views: [
									{ type: 'agenda', selected: false },
									/*{ type: 'day', selected: false },
									{ type: 'week', selected: false },*/
									{ type: 'month', selected: true }
								],
								change: function (e) {
									//console.log('date selected from scheduler, manually triggering catalog change');
									//console.log(e);
									that.stepForward = true;
									that.catalog.select(that.catalog.element.children().first());
								},
								dataSource: {
									data: []
								}
							}).data('kendoScheduler');
							console.log(scheduler);
						});
					},
					init: function () {
						var that = this,
							loader = page.getLoader(),
							progressBar;
						
						that.updateProgress('initializing browser');
						
						that.progressBar = progressBar = $('#browserProgress').kendoProgressBar({
							// TODO: Wrap this in a block or something
							type: 'chunk',
							max: 2,
							chunkCount: 2,
							value: 0,
							complete: function (e) {
								var widget = this,
									productDataSource = browserDataSources.get('browser.product'),
									doCheckout = true,
									product = null,
									date = null;
								
								// TODO: Cart only if product is not free display
								var productConfig = viewModel.get('product_config'),
									productOptions = productConfig.get('option'),
									cartProduct = {
										product_id: productConfig.get('product_id')
									};
									
								if (typeof productOptions !== 'undefined') {
									cartProduct.option = {};
									productOptions.forEach(function (value, key) {
										console.log(key);
										console.log(value);
										if (value instanceof Date) {
											cartProduct.option[key.replace('product_option_', '')] = date = kendo.toString(value, 'yyyy-MM-dd');
										} else {
											// TODO: Support multiple checkbox/select options
											cartProduct.option[key.replace('product_option_', '')] = [value];
										}
									});
								}
								
								product = productDataSource.get(productConfig.get('product_id'));
								if (typeof product !== 'undefined') {
									doCheckout = page.productRequiresCheckout(product);
								} else {
									// TODO: Throw an error or something?
								}
								
								// TODO: Alter this in some way so it's reusable...
								if (!doCheckout) {
									var productDownloads = viewModel.get('product_downloads'),
										//dateCode, 
										trackCode;

									productDownloads.forEach(function (parts, idx) {
										//dateCode = parts.get('date_code');
										trackCode = parts.get('track_code'); // TODO: (Remove) support for multiple codes
									});
									
									infoWindow.one('refresh', function (e) {
										var popup = infoWindow.wrapper,
											iframe = popup.find('iframe').first()[0],
											doc = iframe.contentDocument;
											
										// Make the font size bigger yo... can barely see it
										$(doc.head).append('<style>body, body a, table a, table td { font-size: 1.35rem !important }</style>');
									});
									
									infoWindow.refresh({
										type: 'GET',
										url: 'http://www.trackinfo.com/hresults/results.jsp?trackcode=' + trackCode.at(0) + '&racedate=' + date
									});
									
									console.log('set window content');
									console.log(infoWindow);
									
									infoWindow.center().open();
									loader.close();
									
									widget.value(0); // Reset progress bar
									browser.reset();
								}
								
								if (doCheckout) {
									console.log('attempting to push product to cart');
									console.log(JSON.stringify(cartProduct));
								
									// TODO: This should be a cart function, move this out of customerDashboard! 
									$.ajax({
										url: App.getConfig('serviceUrl') + 'api/rest/cart/',
										data: JSON.stringify(cartProduct),
										type: 'POST',
										dataType: 'json',
										contentType: 'application/json',
										beforeSend: function (request) {
											request.setRequestHeader('X-Oc-Merchant-Id', 'demo');
											loader.setMessage('Adding product to cart...').open();
										},
										success: function (response, status, xhr) {
											var cartModules, cartModule;
											
											if (response.success) {
												// TODO: There's better ways to make the dashboard module talk to the cart module
												// Whatever we need this to work NOW!
												// TODO: Don't just update the first...
												cartModules = $(document.body).find('[id^=module_cart]');
												cartModules.each(function (idx, obj) {
													var id = $(this).attr('id');
													cartModule = page.getModule(id);
													
													// TEMP: Turn me back on!
													//if (idx === 0) 
														cartModule.cartPopup.data('kendoWindow').center().open();
													
													cartModule.cartGrid.dataSource.read();
												});
												
												if (response.hasOwnProperty('data')) {
												}
												
												widget.value(0); // Reset progress bar
												browser.reset(); // Clear menu selection
											}
										},
										complete: function (response, status) {
											console.log('xhr response', response);
											console.log('status', status);
											
											// TODO: hasOwnProperty checks, etc. - make this more robust
											if (response.success === false || response.responseJSON.success === false) {
												if (response.responseJSON.error.hasOwnProperty('option')) {
													var message = [];
													$.each(response.responseJSON.error.option, function (optionId, err) {
														message.push(err);
													});
												}
												
												loader.setMessage(message.join(' ')).open();
											
												setTimeout(function () {
													loader.close();
												}, 3000);
											} else {
												loader.close();
											}
										}
									});
								}
							}
						}).data('kendoProgressBar');
						
						that.menu.setOptions({
							selectable: true,
							template: kendo.template($('#browser-menu-item-template').html()),
							dataSource: new kendo.data.DataSource({
								data: [],
								schema: {
									model: {
										id: 'step',
										fields: {
											step: { editable: false, nullable: false },
											name: { type: 'string', editable: true, nullable: true },
											image: { type: 'string', editable: true, nullable: true }
										}
									}
								}
							})
						});
						
						return that;
					},
					setSteps: function (steps) {
						var that = this;
						that.config.steps = steps;
					},
					addStep: function (step, index) {
						var that = this,
							index = index || parseInt(that.steps.length), // Append if no index provided
							item;
						
						that.steps[index] = step;
						item = { step: index, name: step.key, type: step.type, image: '' };
						if (typeof that.menu.dataSource.at(index) !== 'undefined') {
							console.log('adding step, but menu item already exists... update instead');
							// Hack to fix zero-index issue
							that.menu.dataSource.data();
						} else {
							that.menu.dataSource.add(item);
						}
						
						console.log('just added. check the data... something is nuts');
						console.log(that.menu.dataSource.data());
					},
					buildSteps: function (startIndex) {
						var that = this;
						startIndex = startIndex || 0,
						deleteCount = 0;
						
						if (!(that.step < startIndex)) {
							for (var idx = that.steps.length - 1; idx > startIndex; idx--) {
								if (typeof that.menu.dataSource.at(idx) !== 'undefined') {
									that.menu.dataSource.remove(that.menu.dataSource.at(idx));
									console.log('just deleted. check the data... something is nuts');
									console.log(that.menu.dataSource.data());
								}
								
								delete that.steps[idx];
								deleteCount++;
							}
						}
						
						// Fix length
						if (deleteCount > 0) that.steps.length = that.steps.length - deleteCount;
						
						$.each(that.config.steps, function (idx, step) {
							if (idx < startIndex) return true; // Offset idx by 1 as steps are zero-indexed
							
							that.addStep(step, idx);
						});
					},
					loadStep: function (step) {
						var that = this,
							steps = that.steps;
							
						that.step = parseInt(step); // TODO: NaN check
						console.log('set step to ' + that.step + '. setting content...');
						
						that.updateProgress('', that.step);
						if (that.step < that.steps.length) {
							that.setContent(steps[that.step].template, steps[that.step].dataSource);
						} else {
							console.log('max reached resetting');
							//that.reset();
						}
						
						// Initialize Kendo widgets
						that.initSchedulers();
					},
					setContent: function (template, dataSource) {
						var that = this;
						
						that.catalog.setOptions({
							template: kendo.template(template),
							selectable: true
						});
						
						that.catalog.setDataSource(dataSource);
					},
					setMenuItem: function (step, item) {
						var that = this,
							menuItem = that.menu.dataSource.at(step), // Data items are zero-indexed
							type = menuItem.type,
							dataItem,
							selector;
							
						// TODO: Keep this logging for debug mode
						console.log(that.menu);
						//console.log('soon to be previous step has index of ' + step);
						console.log('attempting to fetch menu item with datasource index ' + step);
						
						if (typeof menuItem !== 'undefined') {
							console.log('found menu item at step ' + step);
							console.log(menuItem);
						}
						
						selector = '[data-step=' + step + '] ~ [data-step]';
						//console.log('only display menu items matching selector ' + selector);
							
						//console.log('fetching selected catalog item');
						if (type === 'select' || type === 'checkbox') {
							// A selection should have been made already to get to here
							dataItem = that.catalog.dataSource.get(item.attr('data-id'));
							menuItem.set('name', dataItem.name);
							menuItem.set('image', dataItem.image);
							
						} else if (type === 'date' || type == 'time' || type == 'datetime') {
							// Select on click is disabled for date/time types - events are forwarded
							// Manually select first data item
							dataItem = that.catalog.dataSource.at(0);
							menuItem.set('name', 'Race Day');
							menuItem.set('image', null);
							// TODO: This could *not* be a scheduler too, but no time for that right now 
							menuItem.set('date', that.formatDate(item.find('.product-option-scheduler-widget').data('kendoScheduler').select().start));
						}
						
						that.menu.refresh(); // Re-draw first
						
						that.menu.element.find(selector).hide().end()
							.find('[data-step]').not(selector).show();
					},
					next: function () {
						var that = this,
							step = that.step,
							steps = that.steps;
						
						console.log('next() invoked');
						//console.log(item);
						
						if (step > 0 && (step % steps.length === 0)) {
							console.log('we\'re at the end... resetting step to 0');
							that.step = 0;
						} else {
							that.step++;
						}
						
						console.log('ok we are moving to the next step [' + that.step + '] now');
						that.loadStep(that.step);
					},
					reset: function () {
						var that = this;
						
						that.menu.element.find('[data-step]').hide();
						that.start();
					},
					start: function () {
						var that = this;
						that.step = 0;
						
						that.catalog.unbind('change');
						that.catalog.bind('change', function (e) {
							var steps = that.steps,
								step = that.step,
								menuItem = that.menu.dataSource.at(step),
								type = (typeof menuItem !== 'undefined') ? menuItem.type : null,
								item = e.sender.select(),
								id = item.attr('data-id'),
								entityType = item.attr('data-entity'),
								productConfig,
								optionsConfig,
								productOptionId;
							
							console.log('catalog browser change event triggered');
							console.log('selected item item of type: ' + entityType + ' with id: ' + id + '... storing id to view-model');
							console.log(item);
							if (typeof entityType !== 'undefined') {
								// Execute before next
								if (steps.hasOwnProperty(step) && steps[step].hasOwnProperty('before')) {
									productConfig = viewModel.get('product_config');
									
									console.log('applying step callbacks before setting the product...');
									var fn = steps[step].before; // This would be the 'after' event handler callback
									fn({
										viewModel: viewModel,
										product: productConfig || null,
										step: step || false,
										item: item || null
									});
								}
								
								if (entityType === 'category') {
									viewModel.set('category_id', id);
								} else {
									productConfig = viewModel.get('product_config');
									
									// If product configuration does not exist, then create one
									if (typeof productConfig === 'undefined' || !(productConfig instanceof kendo.data.ObservableObject)) {
										productConfig = new kendo.data.ObservableObject();
										viewModel.set('product_config', productConfig);
									}
									
									switch (entityType) {
										case 'product':
											optionsConfig = viewModel.get('product_config.option');
											
											viewModel.set('product_config.product_id', id);
											
											// Changed products, so clear any options if they exist
											if (typeof optionsConfig !== 'undefined' && optionsConfig instanceof kendo.data.ObservableObject) {
												viewModel.set('product_config.option', undefined);
											}
											
											break;
											
										case 'option':
											optionsConfig = viewModel.get('product_config.option');
									
											// If option configuration does not exist, then create one
											if (typeof optionsConfig === 'undefined') {
												optionsConfig = new kendo.data.ObservableObject();
												viewModel.set('product_config.option', optionsConfig);
											}
											
											if (type === 'select' || type === 'checkbox') {
												productOptionId = item.attr('data-product-option-id');
												// We have to add a prefix - kendo datasources use dot notation to reference data items
												optionsConfig.set('product_option_' + productOptionId, id); // Single select
												//optionsConfig.set('product_option_' + productOptionId, id); // TODO: Multiple select
											} else if (type === 'date' || type == 'time' || type == 'datetime') {
												productOptionId = item.attr('data-id');
												
												var scheduler = item.find('.product-option-scheduler-widget').first().data('kendoScheduler');
												var slot = scheduler.select();
												
												// TODO: Validations!
												if (slot.hasOwnProperty('start')) {
													optionsConfig.set('product_option_' + productOptionId, slot.start); // Date												
													// TODO: This isn't necessarily the best place for this but it will suffice for now; it's alright...
													//that.getAvailableTracks(null, slot.start);
												}
											}
											
											break;
									}
								}
							}
							
							//console.log('the current step is ' + that.step + ' so we should increment the step soon after here, but we need to save the current step to the menu first');
							
							//console.log('select on click? ' + steps[step].selectOnClick);
							if ((typeof steps[step] !== 'undefined' && steps[step].hasOwnProperty('selectOnClick') && steps[step].selectOnClick === true) || that.stepForward === true) {
								that.stepForward = false; // Manually step forward - change event was triggered manually
								// Execute before next
								if (steps.hasOwnProperty(step) && steps[step].hasOwnProperty('after')) {
									console.log('applying step callbacks before moving to the next step...');
									var fn = steps[step].after; // This would be the 'after' event handler callback
									fn({
										viewModel: viewModel,
										product: productConfig || null,
										step: step || false,
										item: item || null
									});
								}
								
								catalog.one('dataBound', function (e) {		
									console.log('catalog is databound');
									//console.log(that.catalog);
									
									//console.log('calling applyFilters()');
									that.applyFilters(id);
									if (steps.hasOwnProperty(step) && steps[step].hasOwnProperty('filtersApplied')) {
										console.log('applying filtersApplied callback before moving to the next step...');
										var fn = steps[step].filtersApplied; // This would be the 'after' event handler callback
										fn({
											viewModel: viewModel,
											product: productConfig || null,
											step: step || false,
											item: item || null
										});
									}
									
									// Rebind
									kendo.unbind(that.catalog.element, viewModel);
									kendo.bind(that.catalog.element, viewModel);
								});
								
								console.log('setting menu item');
								that.setMenuItem(step, item);
								console.log('invoking next()');
								
								that.next();
							}
						});
						
						// TODO: This is a little buggy and needs a bit of work
						// If I wrap the browser as a module this would probably work better
						that.menu.unbind('change');
						that.menu.bind('change', function (e) {
							var step = e.sender.select().attr('data-step');
							console.log('menu change event triggered... setting step to ' + step);
							that.loadStep(step);
						});
						
						/*$('#nextButton').data('kendoButton').bind('click', function (e) {
							that.next();
						});*/
						
						that.loadStep(0);
						that.catalog.one('dataBound', function (e) {
							that.catalog.dataSource.filter([]); // Clear any filters
						});
						
						return that;
					}
				};
				
				return instance.init();
			}
			
			page.browser = browser = new Browser(browserListView, browserMenu);
			
			var steps = [
				{
					key: 'categories',
					type: 'select',
					selectOnClick: true, // TODO: Fix this later, for now just define for every step
					template: $('#category-item-template').html(),
					dataSource: browserDataSources.get('catalog.category'),
					filter: {
						target: browserDataSources.get('browser.product'),
						filter: { 
							field: 'category',
							operator: function (item, value) {
								var categories = [];
								$.each(item, function (idx, cat) {
									categories.push(cat.id);
								});
								
								return categories.indexOf(value) > -1;
								
								// This is for REST Admin API
								//return Object.keys(item).indexOf(value) > -1;
							}
						}
					},
					filtersApplied: function (data) {
						var productDataSource = browserDataSources.get('browser.product'),
							products = productDataSource.view();
						
						if (products.length === 1) {
							var productData = products[0],
								windowLauncher = page.getAttribute(productData, 'Product Config', 'Category Window Launcher');
								
							if (windowLauncher !== false) {
								if (windowLauncher.hasOwnProperty('text') && typeof windowLauncher.text === 'string') {
									infoWindow.refresh({
										type: 'GET',
										url: windowLauncher.text
									});
									
									console.log('set window content');
									console.log(infoWindow);
									
									infoWindow.center().open();
									
									browser.progressBar.value(0); // Reset progress bar
									browser.reset();
								}
							}
						}
					}
				},
				/*{
					key: 'manufacturers',
					selectOnClick: true, // TODO: Fix this later, for now just define for every step
					template: $('#manufacturer-item-template').html(),
					dataSource: browserDataSources.get('inventory.manufacturer'),
					filter: {
						target: browserDataSources.get('browser.product'),
						filter: { field: 'manufacturer_id', operator: 'eq' }
					}
				},*/
				/*models: {
					selectOnClick: true, // TODO: Fix this later, for now just define for every step
					template: $('#model-item-template').html(),
					dataSource: browserDataSources.get('inventory.model'),
					filter: { field: 'model', operator: 'eq' } // value: filter value
				},*/
				{
					key: 'products',
					type: 'select',
					selectOnClick: true, // TODO: Fix this later, for now just define for every step
					template: $('#product-grid-item-template').html(),
					dataSource: browserDataSources.get('browser.product'),
					after: function (data) {
						// We use this before callback to set the next steps
						/*console.log('executing product step [' + data.step + '] after callback');
						console.log('product', data.product);
						console.log('view-model', data.viewModel);
						console.log('item', data.item);*/
						
						/*var options = [
						{
							key: 'categories',
							template: $('#category-item-template').html(),
							dataSource: browserDataSources.get('catalog.category'),
							filter: {
								target: browserDataSources.get('browser.product'),
								filter: { 
									field: 'category',
									operator: function (item, value) {
										return Object.keys(item).indexOf(value) > -1;
									}
								}
							}
						},*/
						
						// Rebuild before adding steps
						browser.buildSteps(browser.config.steps.length - 1);
						var selectedProduct,
							dataFolderAttribute,
							trackCodeAttribute,
							options;
						
						selectedProduct = browserDataSources.get('browser.product').get(data.product.get('product_id'));
						options = selectedProduct.get('options').toJSON();
						
						dataFolderAttribute = page.getDataFolderAttribute(selectedProduct) || false;
						trackCodeAttribute = page.getTrackCodeAttribute(selectedProduct) || false;
						externalDateOptionAttributes = page.getExternalDateOptionAttributes(selectedProduct) || false;
						
						var productDownloads = viewModel.get('product_downloads');

						// If product configuration does not exist, then create one
						if (typeof productDownloads === 'undefined' || !(productDownloads instanceof kendo.data.ObservableObject)) {
							productDownloads = new kendo.data.ObservableObject();
							viewModel.set('product_downloads', productDownloads);
						}

						// Wouldn't this be better to use a datasource?
						var productId = viewModel.get('product_config.product_id');
						if (typeof productId !== 'undefined') {
							var downloadInfo = productDownloads.get('product_' + productId);
							if (typeof downloadInfo === 'undefined') {
								downloadInfo = new kendo.data.ObservableObject();
								viewModel.set('product_downloads.product_' + productId, downloadInfo);
							}

							if (dataFolderAttribute.hasOwnProperty('text')) {
								downloadInfo.set('folder_path', dataFolderAttribute.text);
							}
							
							if (trackCodeAttribute.hasOwnProperty('text')) {
								downloadInfo.set('track_code', page.parseTrackCodes(trackCodeAttribute.text));
							}
						}
						
						if (options.hasOwnProperty('length') && options.length > 0) {
							browser.progressBar.options.max = 2;
							browser.progressBar.options.chunkCount = 2;
							
							$.each(options, function (idx, opt) {
								// setOptions doesn't really work after initializing the widget... whatever, reinitialize
								browser.progressBar.options.max = browser.progressBar.options.max + 1,
								browser.progressBar.options.chunkCount = browser.progressBar.options.chunkCount + 1
								
								if (opt.type === 'checkbox' || opt.type == 'select') {
									// Add the product option id to each option value so we can reference it later
									var optionValues = [];
									$.each(opt.option_value, function (idx, value) {
										optionValues[idx] = value;
										optionValues[idx].product_option_id = opt.product_option_id;
										optionValues[idx].option_id = opt.option_id;
										
										// TODO: Add a callback for here so we can filter or alter the datasource/data
										if (opt.hasOwnProperty('name') && opt.name.match(/tracks$/i) !== null) {
											// TODO: This is gross let's use a callback or something, but this is fast for now
											// Parse the codes
											var codes = page.parseTrackCodes(value.name);
											if (codes && codes.length > 0) {
												// No code? We have nothing to search by so delete it from the list
												optionValues[idx].code = codes.join(','); // CSV list
											} else {
												delete optionValues[idx];
											}
											
											if (typeof value.name !== 'undefined') {
												optionValues[idx].name = page.parseTrackName(value.name);
											} else {
												// No name and just a code? The user doesn't know what that is so delete it from the list
												delete optionValues[idx];
											}
										}
									});
									
									browser.addStep({
										key: opt.name,
										type: opt.type,
										selectOnClick: true, // TODO: Fix this later, for now just define for every step
										template: $('#product-option-value-template').html(),
										dataSource: new kendo.data.DataSource({
											data: optionValues,
											schema: {
												model: {
													id: 'product_option_value_id'
												}
											},
											sort: { field: 'name', dir: 'asc' }
										}), 
										// TODO: I'm gonna have to hack this in for now, but really, the whole track code thing needs to be implemented as an event
										// Again, obviously this needs to be wrapped in a f***ing module already
										after: function (data) {
											console.log('executing product step [' + data.step + '] after callback');
											

											var productDownloads = viewModel.get('product_downloads');
											console.log('data product', data.product);
											console.log('data view-model', data.viewModel);
											console.log('data item', data.item);
											
											// If product configuration does not exist, then create one
											if (typeof productDownloads === 'undefined' || !(productDownloads instanceof kendo.data.ObservableObject)) {
												productDownloads = new kendo.data.ObservableObject();
												viewModel.set('product_downloads', productDownloads);
											}

											// Wouldn't this be better to use a datasource?
											var productId = viewModel.get('product_config.product_id');
											if (typeof productId !== 'undefined') {
												var downloadInfo = productDownloads.get('product_' + productId);
												if (typeof downloadInfo === 'undefined') {
													downloadInfo = new kendo.data.ObservableObject();
													viewModel.set('product_downloads.product_' + productId, downloadInfo);
												}

												// Quick hack to turn the code into an array
												downloadInfo.set('track_code', page.parseTrackCodes('[' + data.item.attr('data-code') + ']'));
											}
											
											console.log('view-model', viewModel);
											
											if (externalDateOptionAttributes) {
												browser.getExternalDates(externalDateOptionAttributes, data.item.attr('data-code'));
											}
										}
									}, parseInt(browser.config.steps.length + idx));
								}
								
								if (opt.type === 'date' || opt.type == 'time' || opt.type == 'datetime') {
									browser.addStep({
										key: opt.name,
										type: opt.type,
										selectOnClick: false,
										//template: $('#product-option-date-template').html(),
										template: $('#product-option-scheduler-template').html(),
										dataSource: new kendo.data.DataSource({
											data: [opt],
											schema: {
												model: {
													id: 'product_option_id'
												}
											}
										}),
										after: function (data) {
											console.log('executing product step [' + data.step + '] after callback');
											console.log('product', data.product);
											console.log('view-model', data.viewModel);
											console.log('item', data.item);

											var productDownloads = viewModel.get('product_downloads');

											// If product configuration does not exist, then create one
											if (typeof productDownloads === 'undefined' || !(productDownloads instanceof kendo.data.ObservableObject)) {
												productDownloads = new kendo.data.ObservableObject();
												viewModel.set('product_downloads', productDownloads);
											}

											// Wouldn't this be better to use a datasource?
											var productId = viewModel.get('product_config.product_id');
											if (typeof productId !== 'undefined') {
												var downloadInfo = productDownloads.get('product_' + productId);
												if (typeof downloadInfo === 'undefined') {
													downloadInfo = new kendo.data.ObservableObject();
													viewModel.set('product_downloads.product_' + productId, downloadInfo);
												}

												var date = viewModel.get('product_config.option.product_option_' + data.item.attr('data-product-option-id'));
												downloadInfo.set('date_code', page.formatTrackDate(date));
												
												browser.getAvailableTracks(dataFolderAttribute.text, date);
											}
										}
									}, parseInt(browser.config.steps.length + idx));
									
									if (dataFolderAttribute && dataFolderAttribute.hasOwnProperty('text')) {
										browser.getAvailableDates(dataFolderAttribute.text);
									}
								}
							});
							
							// The setOptions method doesn't really work after initializing the widget
							// This occurs with certain Kendo UI widgets, not just the ProgressBar one
							// I've tried pretty much everything, so whatever, guess we have to destroy and reinitialize
							var progressElement = browser.progressBar.element,
								progressOptions = browser.progressBar.options;
							
							browser.progressBar.destroy(); // First, we have to destroy the widget instance
							progressElement.empty(); // Then empty the container, or it still won't work
							
							browser.progressBar = progressElement.kendoProgressBar(progressOptions).data('kendoProgressBar');
						}
					}
				}
			];
			
			browser.setSteps(steps);
			browser.buildSteps();
			
			browser.start();
			
			// if option type = date
			// if option type = select
			
			// Maps PanelBar menu items to their corresponding tabs
			/*moduleElement.find('.entityPopupMenu').each(function (idx, obj) {
				var menu = $(obj).data('kendoPanelBar'),
					tabs = $(obj).parent().find('.entityPopupTabs').first().data('kendoSemanticTabStrip');
					// TODO: Semantic vs. standard tabs
				
				menu.bind('select', function (e) {
					var panelIndex = menu.element.find('li').index($(e.item));
					tabs.select(panelIndex);
				});
			});*/
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					style: 'display: flex; width: 100%',
					children: [
						{
							tag: 'div',
							class: 'entityPopupContent',
							style: 'width: 100%',
							children: [
								{
									tag: 'div',
									id: 'customer-tabs',
									name: 'customer-tabs',
									class: 'entityPopupTabs content-box-only',
									//class: 'entityPopupTabs',
									data: {
										role: 'semantictabstrip',
										animation: false
									},
									tabs: ['Browse', 'Dashboard', 'My Account'],
									fieldsets: [
										{
											tag: 'fieldset',
											children: [
												/*{
													module: 'countrySelector'
												},*/
												{
													tag: 'div',
													style: 'width: 100%; box-sizing: border-box',
													id: 'browserProgress',
													name: 'browserProgress',
													data: {
														role: 'progressbar'
													}
												},
												{
													tag: 'div',
													id: 'catalogBrowser',
													style: 'display: flex; align-items: stretch',
													children: [
														{
															tag: 'div',
															//style: 'flex: 1 0 20%; display: flex; flex-direction: column; background: #555; height: 100%',
															id: 'browserMenu',
															name: 'browserMenu',
															data: {
																role: 'listview'
															}
														},
														{
															tag: 'div',
															style: '',
															id: 'browserCatalog',
															name: 'browserCatalog',
															data: {
																role: 'listview'
															}
														}
													]
												},
												/*{
													tag: 'button',
													type: 'button',
													id: 'nextButton',
													text: 'Next',
													data: {
														role: 'button'
													}
												}*/
												{
													tag: 'div',
													id: 'infoPopup',
													name: 'infoPopup',
													class: 'entityPopup',
													//style: 'display: none',
													data: {
														role: 'window',
														//appendTo: '#center-pane',
														modal: true,
														visible: false,
														resizable: false,
														draggable: true,
														//iframe: true,
														title: 'Results',
														width: '90%',
														height: '90%'
													}
												}
											]
										},
										{
											tag: 'fieldset',
											children: [
												{
													tag: 'div',
													style: 'display: flex; align-items: stretch',
													children:[
														// TODO: Style attribute isn't working (directly or in config prop) for these blocks
														{
															tag: 'div',
															style: 'flex: 1 1 50%; box-sizing: padding-box; padding: 0px 2rem 0.5rem',
															children: [{ block: 'personalInfo' }]
														},
														{
															tag: 'div',
															style: 'flex: 1 1 50%; box-sizing: padding-box; padding: 0px 2rem 0.5rem; display: none',
															children: [{ block: 'companyInfo' }]
														},
														/*{
															block: 'autorow',
															config: {
																params: {
																	style: 'flex: 2 1 40%'
																},
																items: [
																	{
																		tag: 'input',
																		type: 'number',
																		id: 'balance',
																		name: 'balance',
																		label: 'Your Balance',
																		data: {
																			role: 'numerictextbox'
																		}
																	},
																	{
																		tag: 'div',
																		style: 'max-width: 94%; border: 1px solid #ccc; color: #555; border-radius: 3px; padding: 1rem',
																		text: 'To purchase more credits, please contact your attendant.'
																	}
																]
															}
														},*/
														// TODO: Make this a custom block
														{
															tag: 'div',
															class: 'block',
															style: 'margin: 0; padding-left: 40px; padding-right: 40px; flex: 1 1 25%', 
															children: [
																/*{
																	tag: 'img',
																	src: 'http://www.unitedtote.com/sites/all/themes/utote_theme/logo.png'
																},*/
																{
																	block: 'autorow',
																	config: {
																		items: [
																			{
																				tag: 'div',
																				class: 'icon'
																			},
																			{
																				tag: 'h4',
																				class: 'title-prefix',
																				text: 'To purchase more credits, please contact your attendant.',
																				style: 'color: #fff; display: inline-block; margin: 0'
																			}
																		]
																	}
																},
																{
																	block: 'autorow',
																	config: {
																		items: [
																			/*{
																				tag: 'input',
																				type: 'number',
																				id: 'balance',
																				name: 'balance',
																				label: 'Your Balance',
																				readonly: true,
																				data: {
																					role: 'numerictextbox'
																				}
																			},*/
																			{
																				tag: 'button',
																				id: 'productButton',
																				name: 'productButton',
																				class: 'accent cta',
																				type: 'button',
																				text: 'Purchase Credits',
																				data: {
																					role: 'button'
																				}
																			}
																		]
																	}
																}
															]
														},
														{
															tag: 'div',
															class: 'block',
															style: 'margin: 0; padding-left: 0px; padding-right: 40px; flex: 1 1 25%',
															children: [
																/*{
																	tag: 'img',
																	src: 'http://www.unitedtote.com/sites/all/themes/utote_theme/logo.png'
																},*/
																{
																	block: 'autorow',
																	config: {
																		items: [
																			{
																				tag: 'div',
																				class: 'icon'
																			},
																			{
																				tag: 'h4',
																				class: 'title-prefix',
																				text: 'Browse our selection of race track data products.',
																				style: 'color: #fff; display: inline-block; margin: 0'
																			}
																		]
																	}
																},
																{
																	block: 'autorow',
																	config: {
																		items: [
																			{
																				tag: 'button',
																				name: 'browseButton',
																				class: 'cta primary',
																				type: 'button',
																				text: 'Find Schedules and Results',
																				data: {
																					role: 'button'
																				}
																			}
																		]
																	}
																}
															]
														}
													]
												},
												{
													module: 'downloads',
													config: {
														autoRender: true
													}
												}
											]
										},
										{
											tag: 'fieldset',
											children: [{ module: 'customer' }]
										}
									]
								}		
							]
						}
					]
				}
			]	
		}
	}
});