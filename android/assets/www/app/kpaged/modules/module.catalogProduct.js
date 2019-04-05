define({
	name: 'catalogProduct',
	id: 'catalogProduct', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	// TODO: Make this generic!
	setProduct: function (id) {
		var that = this,
			page = that.getPage(),
			dataSources = page.getDataSources(),
			viewModel = that.getViewModel();
			
		if (dataSources.has('catalog.product.entity')) {
			var entityDataSource = new kendo.data.DataSource($.extend(true, {}, dataSources.get('catalog.product.entity').options, {
				transport: {
					read: {
						url: App.getConfig('serviceUrl') + 'api/rest_admin/products/' + id,
						type: 'GET',
						dataType: 'json',
						beforeSend: function (request) {
							request.setRequestHeader('X-Oc-Restadmin-Id', 'demo');
						}
					}
				}
			}));
			
			entityDataSource.one('change', function () {
				model = entityDataSource.at(0);
				
				// Framework doesn't support attribute binding yet
				$('#' + that.getId()).find('#productImage').attr('data-bind', 'attr: { src: image }');
				
				$('#' + that.getId()).find('[id^=block_]').each(function (idx, block) {
					page.getBlock($(block).attr('id')).dataBind(viewModel);
				});
				
				kendo.bind($('#' + that.getId()), viewModel);
				
				that.setData(model);
			});
			
			console.log('gooooo');
			entityDataSource.read();
		}
	},
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
			
			// Register any custom methods
			that.setProduct = that.getConfig().setProduct;
			
			if (!dataSources.has('catalog.product.entity')) {
				// Initialize datasources
				dataSources.set('catalog.product.entity', new kendo.data.DataSource({
					pageSize: 30,
					schema: {
						//data: 'data',
						model: {
							id: 'product_id'
						},
						parse: function (response) {
							return [response.data];
						}
					}
				}));
				console.log('catalog.product.entity');
				console.log(dataSources.get('catalog.product.entity'));
			}
		},
		pageLoaded: function (e) {
			var	that = this,
				page = App.getCurrent(),
				eventHandler = that.getEventHandler();
			
			//eventHandler.dispatch('rendered');
		},
		rendered: function (e) {			
			this.dataBind();
			
			var that = this,
				moduleElement = $('#' + that.getId());
			
			moduleElement.find('#productPanels').data('kendoPanelBar').setOptions({
				dataSource: [
					{	
						text: 'General',
						spriteCssClass: 'fa fa-info-circle'
					},
					{	
						text: 'Data',
						spriteCssClass: 'fa fa-file-text'
					},
					{	
						text: 'Links',
						spriteCssClass: 'fa fa-external-link'
					},
					{	
						text: 'Attribute',
						spriteCssClass: 'fa fa-table'
					},
					{	
						text: 'Option',
						spriteCssClass: 'fa fa-toggle-on'
					},
					{	
						text: 'Recurring',
						spriteCssClass: 'fa fa-clock-o'
					},
					{	
						text: 'Marketing',
						spriteCssClass: 'fa fa-whatsapp'
					},
					{	
						text: 'Media',
						spriteCssClass: 'fa fa-camera'
					}
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
		}
	},
	layout: {
		templates: {
			tag: 'div',
			children: [
				{
					tag: 'div',
					style: 'display: flex; flex-flow: row wrap',
					children: [
						// Main Image
						// Main Image
						{
							tag: 'div',
							style: 'width: 20%; height: 140px; border: 1px solid grey; display: flex; align-items: center; justify-content: center',
							children: [{
								tag: 'img',
								id: 'productImage'
							}]
						},
						// General
						{
							tag: 'div',
							style: 'width: 53%',
							children: [
								{
									block: 'autorow',
									config: {
										items: [
											{
												tag: 'input',
												type: 'text',
												id: 'Name',
												name: 'Name',
												label: 'Display Name',
												class: 'large k-textbox',
												data: {
													bind: {
														value: 'product_description[1].name'
													}
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
												tag: 'input',
												type: 'text',
												id: 'ID',
												name: 'ID',
												label: 'ID',
												class: 'small k-textbox'
											},
											{
												tag: 'select',
												id: 'itemType',
												name: 'itemType',
												label: 'Type',
												data: {
													role: 'productitemtype'
													/*role: 'dropdownlist',
													bind: {
														source: {
															type: 'custom',
															config: {
																data: [
																	{ Key: '', Value: '' },
																	{ Key: 'product', Value: 'Product' },
																	{ Key: 'accessory', Value: 'Accessory' },
																	{ Key: 'service', Value: 'Service' }
																]
															}
														}
													},
													valuePrimitive: true,
													textField: 'Value',
													valueField: 'Key'*/
												}
											},
											{
												tag: 'input',
												type: 'text',
												id: '',
												name: '',
												label: 'Manufacturer',
												data: {
													role: 'combobox'
												}
											},
											{
												tag: 'input',
												type: 'text',
												id: '',
												name: '',
												label: 'Model',
												data: {
													role: 'combobox'
												}
											}
										]
									}
								}
							]
						},
						{
							tag: 'div',
							style: 'width: 25%',
							children: [
								{
									block: 'autorow',
									config: {
										items: [
											{
												tag: 'input',
												type: 'text',
												name: 'price',
												label: 'Price/Rate',
												data: {
													role: 'numerictextbox',
													bind: 'price'
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
												tag: 'input',
												type: 'text',
												label: 'Quantity',
												data: {
													role: 'numerictextbox',
													bind: {
														value: 'quantity'
													}
												}
											}
										]
									}
								}
							]
						},
						{
							tag: 'ul',
							id: 'productPanels',
							class: 'entityPopupMenu',
							style: 'width: 20%',
							data: {
								role: 'panelbar'
							}
						},
						{
							tag: 'div',
							class: 'entityPopupContent',
							style: 'width: 78%',
							children: [																
								{
									tag: 'div',
									id: 'product-tabs',
									name: 'product-tabs',
									class: 'entityPopupTabs content-box-only',
									data: {
										role: 'semantictabstrip',
										animation: false
									},
									tabs: ['General', 'Data', 'Links', 'Attribute', 'Option', 'Recurring', 'Marketing', 'Media'],
									fieldsets: [
										// General
										{
											tag: 'fieldset',
											children: [
												/*{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'input',
																type: 'text',
																id: 'ProviderID',
																name: 'ProviderID',
																label: 'Provider'
															},
															{
																tag: 'input',
																type: 'text',
																id: 'ProviderCredits',
																name: 'ProviderCredits',
																label: 'Provider Credits'
															},
														]
													}
												},
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'select',
																id: 'Network',
																name: 'Network',
																label: 'Network',
																data: {
																	role: 'dropdownlist'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: 'Price',
																name: 'Price',
																label: 'Price',
																data: {
																	role: 'numerictextbox'
																}
															}
														]
													}
												},*/
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'textarea',
																id: 'Description',
																name: 'Description',
																label: 'Description',
																data: {
																	role: 'editor',
																	bind: 'product_description[1].description'
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
																tag: 'textarea',
																id: 'metaTagTitle',
																name: 'metaTagTitle',
																label: 'Meta Tag Title',
																data: {
																	bind: 'product_description[1].meta_title'
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
																tag: 'textarea',
																id: 'metaTagDescription',
																name: 'metaTagDescription',
																label: 'Meta Tag Description',
																data: {
																	bind: 'product_description[1].meta_description'
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
																tag: 'textarea',
																id: 'metaTagKeywords',
																name: 'metaTagKeywords',
																label: 'Meta Tag Keywords',
																data: {
																	bind: 'product_description[1].meta_keyword'
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
																tag: 'textarea',
																id: 'productTags',
																name: 'productTags',
																label: 'Product Tags',
																data: {
																	role: 'multiselect'
																}
															}
														]
													}
												}
											]
										},
										// Data
										{
											tag: 'fieldset',
											children: [
												{
													block: 'questionrow',
													config: {
														items: [
															{
																tag: 'select',
																id: 'trackQuantity',
																name: 'trackQuantity',
																label: 'I track quantity on hand for this product. This enables inventory cost accounting.',
																data: {
																	role: 'truefalse'
																}
															}
														]
													}
												},
												{
													block: 'questionrow',
													config: {
														items: [
															{
																tag: 'select',
																id: 'isSellable',
																name: 'isSellable',
																label: 'I sell this product/service to my customers.',
																data: {
																	role: 'truefalse'
																}
															}
														]
													}
												},
												{
													block: 'questionrow',
													config: {
														items: [
															{
																tag: 'select',
																id: 'isPurchased',
																name: 'isPurchased',
																label: 'I purchase this product/service from a vendor.',
																data: {
																	role: 'truefalse'
																}
															}
														]
													}
												},
												{ tag: 'h4', text: 'Accounting' },
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'input',
																type: 'text',
																label: 'Income Account',
																data: {
																	role: 'dropdownlist'
																}
															},
															{
																tag: 'input',
																type: 'text',
																label: 'Expense Account',
																data: {
																	role: 'dropdownlist'
																}
															},
															{
																tag: 'input',
																type: 'text',
																label: 'Vendor',
																data: {
																	role: 'dropdownlist'
																}
															},
															{
																tag: 'input',
																type: 'text',
																label: 'Cost',
																data: {
																	role: 'numerictextbox'
																}
															}
														]
													}
												},
												{ tag: 'h4', text: 'Tracking' },
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																label: 'SKU',
																class: 'k-textbox',
																data: {
																	bind: 'sku'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																label: 'UPC',
																class: 'k-textbox',
																data: {
																	bind: 'upc'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																label: 'EAN',
																class: 'k-textbox',
																data: {
																	bind: 'ean'
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
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																label: 'JAN',
																class: 'k-textbox',
																data: {
																	bind: 'jan'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																label: 'ISBN',
																class: 'k-textbox',
																data: {
																	bind: 'isbn'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																label: 'MPN',
																class: 'k-textbox',
																data: {
																	bind: 'mpn'
																}
															}
														]
													}
												},
												{ tag: 'h4', text: 'Measurements' },
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																class: 'small',
																label: 'Length',
																data: {
																	role: 'numerictextbox',
																	bind: 'length'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																class: 'small',
																label: 'Width',
																data: {
																	role: 'numerictextbox',
																	bind: 'width'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																class: 'small',
																label: 'Height',
																data: {
																	role: 'numerictextbox',
																	bind: 'height'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																label: 'Units',
																data: {
																	role: 'dropdownlist'
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
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																class: 'small',
																label: 'Weight',
																data: {
																	role: 'numerictextbox'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: '',
																name: '',
																label: 'Units',
																data: {
																	role: 'dropdownlist'
																}
															}
														]
													}
												}
											]
										},
										// Links
										{
											tag: 'fieldset',
											children: [
												{
													tag: 'div',
													id: 'link-tabs',
													name: 'link-tabs',
													class: 'content-box-only',
													
													data: {
														role: 'semantictabstrip',
														animation: false
													},
													tabs: ['Catalog', 'Downloads', 'Compatibility', 'Feeds'],
													fieldsets: [
														{
															tag: 'fieldset',
															children: [
																{
																	block: 'autorow',
																	config: {
																		items: [
																			{
																				tag: 'input',
																				type: 'text',
																				id: '',
																				name: '',
																				label: 'Select Stores',
																				data: {
																					role: 'multiselect'
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
																				tag: 'input',
																				type: 'text',
																				id: '',
																				name: '',
																				label: 'Select Categories',
																				data: {
																					role: 'multiselect'
																				}
																			}
																		]
																	}
																}
															]
														},
														{
															tag: 'fieldset',
															children: [
																{
																	block: 'autorow',
																	config: {
																		items: [
																			{
																				tag: 'input',
																				type: 'text',
																				id: '',
																				name: '',
																				label: 'Select Downloads',
																				data: {
																					role: 'multiselect'
																				}
																			}
																		]
																	}
																}
															]
														},
														{
															tag: 'fieldset',
															children: [
																{ tag: 'h4', text: 'Product Compatibility' },
																{
																	block: 'questionrow',
																	config: {
																		items: [
																			{
																				tag: 'select',
																				id: 'productCompatibility',
																				name: 'productCompatibility',
																				label: 'This product is compatible with more than one product.',
																				data: {
																					role: 'truefalse'
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
																				tag: 'input',
																				type: 'text',
																				id: '',
																				name: '',
																				label: 'Manufacturer',
																				data: {
																					role: 'combobox'
																				}
																			},
																			{
																				tag: 'input',
																				type: 'text',
																				id: '',
																				name: '',
																				label: 'Model',
																				data: {
																					role: 'combobox'
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
																				tag: 'input',
																				type: 'text',
																				id: '',
																				name: '',
																				label: 'Manufacturers',
																				data: {
																					role: 'multiselect'
																				}
																			},
																			{
																				tag: 'input',
																				type: 'text',
																				id: '',
																				name: '',
																				label: 'Models',
																				data: {
																					role: 'multiselect'
																				}
																			}
																		]
																	}
																},
																// TODO: These need to be implemented as product attributes
																{
																	tag: 'div',
																	id: 'Compatibility',
																	name: 'Compatibility',
																	label: 'Requirements (select all that apply)',
																	/*data: {
																		role: 'listview',
																		selectable: 'multiple',
																		template: {
																			id: 'default-listview-item-template',
																			source: 'default-listview-item.tmpl.htm'
																		},
																		bind: {
																			source: {
																				type: 'custom',
																				config: {
																					data: [
																						{ Key: 'RequiresNetwork', Value: 'Network' },
																						{ Key: 'RequiresMobile', Value: 'Mobile' },
																						{ Key: 'RequiresProvider', Value: 'Provider' },
																						{ Key: 'RequiresPIN', Value: 'PIN' },
																						{ Key: 'RequiresKBH', Value: 'KBH' },
																						{ Key: 'RequiresMEP', Value: 'MEP' },
																						{ Key: 'RequiresPRD', Value: 'PRD' },
																						{ Key: 'RequiresSN', Value: 'SN' },
																						{ Key: 'RequiresSecR0', Value: 'SecR0' },
																						{ Key: 'RequiresReference', Value: 'Reference' },
																						{ Key: 'RequiresServiceTag', Value: 'Service Tag' },
																						{ Key: 'RequiresICloudEmail', Value: 'iCloud Email' },
																						{ Key: 'RequiresICloudPhone', Value: 'iCloud Phone' },
																						{ Key: 'RequiresICloudUDID', Value: 'iCloud UDID' },
																						{ Key: 'RequiresType', Value: 'Type' }
																					]
																				}
																			}
																		}
																	}*/
																}
															]
														},
														{
															tag: 'fieldset',
															children: [
																{
																	tag: 'div',
																	id: 'productFeedGrid',
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
																			refresh: false
																		},
																		selectable: 'row',
																		toolbar: [{ name: 'create', text: 'Add Existing Feed' }],
																		columns: [
																			{
																				field: 'Name',
																				title: 'Product Name',
																				width: 100
																			},
																			{
																				field: 'Provider',
																				title: 'Provider',
																				width: 200
																			},
																			{
																				field: 'Cost',
																				title: 'Cost'
																			},
																			{
																				field: 'Default',
																				title: 'Default'
																			},
																			{ command: [ { text: 'Details' }, { text: 'Default' }, { text: 'Populate' }, { text: 'Unlink', name: 'destroy'} ], title: '&nbsp;', width: '280px' }
																		]
																	}
																}
															]
														}
													]
												}
											]
										},
										// Attribute
										{
											tag: 'fieldset',
											children: [
												{
													tag: 'div',
													id: 'productAttributeGrid',
													data: {
														role: 'grid',
														autoBind: false,
														editable: 'inline',
														filterable: { mode: 'row' },
														sortable: true,
														scrollable: true,
														pageable: {
															pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
															pageSizes: [10, 25, 50],
															refresh: false
														},
														selectable: 'row',
														toolbar: [{ name: 'create', text: 'Add Attribute' }],
														columns: [
															{	
																field: 'Name',
																title: 'Attribute',
																//locked: true,
																//lockable: false,
															},
															{
																field: 'Value',
																title: 'Text'
															},
															{
																field: 'Display',
																title: 'Display',
																width: 200
															},
															{ command: [ { text: 'Quick Edit', name: 'edit'}, { text: 'Details' }, 'destroy'], title: '&nbsp;', width: '250px' }
														]
													}
												},
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'input',
																type: 'text',
																id: 'DeliveryMin',
																name: 'DeliveryMin',
																label: 'Delivery Min.',
																data: {
																	role: 'numerictextbox'
																}
															},
															{
																tag: 'input',
																type: 'text',
																id: 'DeliveryMax',
																name: 'DeliveryMax',
																label: 'Delivery Max.',
																data: {
																	role: 'numerictextbox'
																}
															},
															{
																tag: 'select',
																id: 'DeliveryUnit',
																name: 'DeliveryUnit',
																label: 'Delivery Unit',
																data: {
																	role: 'dropdownlist',
																	bind: {
																		source: {
																			type: 'custom',
																			config: {
																				data: [
																					{ Key: 'Instant', Value: 'Instant' },
																					{ Key: 'Minute', Value: 'Minute' },
																					{ Key: 'Hour', Value: 'Hour' },
																					{ Key: 'Day', Value: 'Day' },
																					{ Key: 'Unknown', Value: 'Unknown' },
																				]
																			}
																		}
																	}
																}
															}
														]
													}
												},
												
											]
										},
										// Option
										{
											tag: 'fieldset',
											children: [
												{
													tag: 'div',
													id: 'productOptionGrid',
													data: {
														role: 'grid',
														autoBind: false,
														editable: 'inline',
														filterable: { mode: 'row' },
														sortable: true,
														scrollable: true,
														pageable: {
															pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
															pageSizes: [10, 25, 50],
															refresh: false
														},
														selectable: 'row',
														toolbar: [{ name: 'create', text: 'Add Option' }],
														columns: [
															{	
																field: 'Name',
																title: 'Option Value',
																//locked: true,
																//lockable: false,
															},
															{
																field: 'Quantity',
																title: 'Quantity'
															},
															{
																field: 'SubtractStock',
																title: 'Subtract Stock',
																width: 200
															},
															{
																field: 'Price',
																title: 'Price',
																width: 200
															},
															{
																field: 'Points',
																title: 'Points',
																width: 200
															},
															{
																field: 'Weight',
																title: 'Weight',
																width: 200
															},
															{ command: [ { text: 'Quick Edit', name: 'edit'}, 'destroy'], title: '&nbsp;', width: '200px' }
														]
													}
												},
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'input',
																type: 'text',
																id: 'Name',
																name: 'Name',
																label: 'Name'
															},
															{
																tag: 'input',
																type: 'text',
																id: 'ID',
																name: 'ID',
																label: 'ID'
															},
															{
																tag: 'input',
																type: 'text',
																id: 'ProviderID',
																name: 'ProviderID',
																label: 'Provider ID'
															}
														]
													}
												}
											]
										},
										// Recurring
										{
											tag: 'fieldset'
										},
										// Marketing
										{
											tag: 'fieldset',
											children: [
												{ tag: 'h4', text: 'Discounts' }, 
												{
													tag: 'div',
													id: 'productDiscountGrid',
													data: {
														role: 'grid',
														autoBind: false,
														editable: 'inline',
														filterable: { mode: 'row' },
														sortable: true,
														scrollable: true,
														pageable: {
															pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
															pageSizes: [10, 25, 50],
															refresh: false
														},
														selectable: 'row',
														toolbar: [{ name: 'create', text: 'Add New Discount' }],
														columns: [
															{
																field: 'CustomerGroup',
																title: 'Customer Group'
															},
															{
																field: 'Quantity',
																title: 'Quantity'
															},
															{
																field: 'Priority',
																title: 'Priority',
																
															},
															{
																field: 'Price',
																title: 'Price'
															},
															{
																field: 'DateStart',
																title: 'Date Start'
															},
															{
																field: 'DateEnd',
																title: 'Date End'
															},
															{
																field: 'Active',
																title: 'Status'
															},
															{ command: [ { text: 'Quick Edit', name: 'edit'}, 'destroy'], title: '&nbsp;', width: '200px' }
														]
													}
												},
												{ tag: 'h4', text: 'Specials' }, 
												{
													tag: 'div',
													id: 'productSpecialGrid',
													data: {
														role: 'grid',
														autoBind: false,
														editable: 'inline',
														filterable: { mode: 'row' },
														sortable: true,
														scrollable: true,
														pageable: {
															pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
															pageSizes: [10, 25, 50],
															refresh: false
														},
														toolbar: [{ name: 'create', text: 'Add New Special' }],
														selectable: 'row',
														columns: [
															{
																field: 'CustomerGroup',
																title: 'Customer Group'
															},
															{
																field: 'Priority',
																title: 'Priority'
															},
															{
																field: 'Price',
																title: 'Price'
															},
															{
																field: 'DateStart',
																title: 'Date Start'
															},
															{
																field: 'DateEnd',
																title: 'Date End'
															},
															{
																field: 'Active',
																title: 'Status'
															},
															{ command: [ { text: 'Quick Edit', name: 'edit'}, 'destroy'], title: '&nbsp;', width: '200px' }
														]
													}
												},
												{ tag: 'h4', text: 'Reward Points' },
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'input',
																type: 'text',
																id: 'purchasePointsNeeded',
																name: 'purchasePointsNeeded',
																label: 'Points Needed',
																data: {
																	role: 'numerictextbox'
																}
															}
														]
													}
												},
												{
													tag: 'div',
													id: 'productPointsGrid',
													data: {
														role: 'grid',
														autoBind: false,
														editable: 'inline',
														filterable: { mode: 'row' },
														sortable: true,
														scrollable: true,
														pageable: {
															pageSize: 10, // The pageSize option must be specified in the datasource configuration (see above) or paging will not work correctly
															pageSizes: [10, 25, 50],
															refresh: false
														},
														selectable: 'row',
														columns: [
															{
																field: 'CustomerGroup',
																title: 'Customer Group'
															},
															{
																field: 'Points',
																title: 'Points',
																width: 200
															}
														]
													}
												}
											]
										},
										// Media
										{
											tag: 'fieldset',
											children: [
												{
													block: 'autorow',
													config: {
														items: [
															{
																tag: 'div',
																id: 'imageBrowser',
																name: 'imageBrowser',
																label: 'Browse Images',
																data: {
																	role: 'imagebrowser'
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
																tag: 'input',
																type: 'file',
																id: 'productImageUpload',
																name: 'productImageUpload',
																label: 'Upload Images',
																data: {
																	role: 'upload'
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
																tag: 'input',
																type: 'file',
																id: 'productDocUpload',
																name: 'productDocUpload',
																label: 'Upload Documentation',
																data: {
																	role: 'upload'
																}
															}
														]
													}
												}
											]
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