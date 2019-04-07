// Index
define(['marked'], function (marked) { return {
	name: 'Test',
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
		pattern: App.getConfig('baseUrl') + 'test.html',
		autoRead: false,
		read: {
			url: 'Api',
			type: 'GET'
		}
	},
	events: {
		save: function () {
		},
		loaded: function (e) {
			var that = this,
				page = App.getCurrent(),
				block = page.getBlock(that.getPrimaryBlockName()),
				viewModel = block.getViewModel(),
				validator = block.getValidator(),
				widgetTypes = App.Config.Widgets.defaults(),
				widgets;
		},
		isLoaded: function (e) {
			var that = this,
				page = App.getCurrent(),
				block = page.getBlock(that.getPrimaryBlockName()),
				viewModel = block.getViewModel(),
				validator = block.getValidator(),
				widgetTypes = App.Config.Widgets.defaults(),
				widgets;
				
			
			var customBlock = page.getBlock('block_custom_1');
				$('#block_custom_1').replaceWith(customBlock.render().html());
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
						id: 'header'
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
						tag: 'section',
						children: [{
							id: 'test-tabs',
							tag: 'div',
							data: {
								role: 'semantictabstrip'
							},
							tabs: ['Block Tests', 'Module Tests', 'Custom Blocks'],
							fieldsets: [
								{	
									tag: 'fieldset',
									text: 'Block nesting test',
									children: [
										/* Block nesting test */
										{
											block: 'autorow',
											config: {
												items: [
													{
														tag: 'textarea',
														id: 'selectTextTarget',
														name: 'selectTextTarget',
														label: 'Nested Row 1',
														data: {
															bind: 'selectText'
														},
														//show: false
													},
													{
														block: 'autorow',
														config: {
															items: [
																{
																	tag: 'textarea',
																	id: 'selectTextTarget2',
																	name: 'selectTextTarget2',
																	label: 'Nested Row 2',
																	data: {
																		bind: 'selectText'
																	},
																	//show: false
																},
																{
																	block: 'autorow',
																	config: {
																		items: [
																			{
																				tag: 'textarea',
																				id: 'selectTextTarget2',
																				name: 'selectTextTarget2',
																				label: 'Nested Row 3',
																				data: {
																					bind: 'selectText'
																				},
																				//show: false
																			}
																		]
																	}
																}
															]
														}
													}
												]
											}
										},
										{
											tag: 'h3',
											text: 'Only odd blocks should be showing'
										},
										{
											block: 'autorow',
											config: {
												items: [
													{
														tag: 'h4',
														text: '1'
													}
												]
											}
										},
										{
											block: 'autorow',
											autoRender: false,
											config: {
												autoRender: false,
												items: [
													{
														tag: 'h4',
														text: '2'
													}
												]
											}
										},
										{
											block: 'autorow',
											config: {
												items: [
													{
														tag: 'h4',
														text: '3'
													}
												]
											}
										},
										{
											block: 'autorow',
											autoRender: false,
											config: {
												autoRender: false,
												items: [
													{
														tag: 'h4',
														text: '4'
													}
												]
											}
										},
										{
											block: 'autorow',
											config: {
												items: [
													{
														tag: 'h4',
														text: '5'
													}
												]
											}
										}
									]
								},
								{
									tag: 'fieldset',
									text: 'Rendering',
									children: [
										/* Auto-rendering test */
										{
											module: 'test',
											config: {
												autoRender: true
											}
										},
										/* Multiple module instance test */
										{
											module: 'test',
											config: {
												autoRender: true
											}
										}
									]
								},
								{
									tag: 'fieldset',
									text: 'Inline block test with autoRender off/on',
									children: [
										{
											block: 'custom',
											name: 'custom', // What?
											config: {
												autoRender: false,
												layout: {
													tag: 'div',
													children: [
														{
															tag: 'h1',
															text: 'Don\'t render me!'
														}
													]
												}
											}
										},
										{
											block: 'custom',
											name: 'custom', // What?
											config: {
												autoRender: true,
												layout: {
													tag: 'div',
													children: [
														{
															tag: 'h1',
															text: 'Don\'t render #1, I\'m #2!'
														}
													]
												}
											}
										}
									]
								}
							]
						}]
					}
				] // END sections
			}
        },
		{
			block: 'left-pane',
			templates: {
				tag: 'section',
				id: 'sidebar-a',
				children: [
					{
						block: 'autorow',
						config: {
							params: {
								style: 'background-color: orange',
							},
							items: [
								{
									tag: 'div',
									style: 'background: grey; color: white; order: 2',
									text: 'Test Item 2'
								},
								{
									tag: 'div',
									style: 'background: darkgrey; color: white; order: 1',
									text: 'Test Item 1'
								}
							]
						}
					},
					{
						block: 'autorow',
						config: {
							params: {
								style: 'background-color: white',
							},
							items: [
								{
									tag: 'select',
									id: 'selectTest',
									name: 'selectTest',
									label: 'Test Behaviors',
									data: {
										role: 'truefalse',
										bind: {
											value: 'selectTestToggle',
											/*events: {
												pageLoaded: function (e) {
													console.log('pageLoaded event triggered');
													var behavior = App.Widgets.Behaviors.OnSelectDisplayFieldGroup(e, {
														target: $('#selectTextTarget'),
														matches: 'true'
													});
													
													behavior.execute();
													
												},
												change: function (e) {
													var behavior = App.Widgets.Behaviors.OnSelectDisplayFieldGroup(e, {
														target: $('#selectTestTarget'),
														matches: 'true',
														nonMatchCallback: function () {
															var viewModel = App.getCurrent().getBlock('left-pane').getViewModel();
															
															// Clear fields
															viewModel.set('selectText', '');
														}
													});
													
													behavior.execute();
												}
											}*/
										}
									},
									validation: {
										//required: true,
										message: 'Please select Yes or No'
									}
								}
							]
						}
					},
					{
						block: 'autorow',
						config: {
							params: {
								style: 'background-color: orange',
							},
							items: [
								{
									tag: 'div',
									style: 'background: grey; color: white; order: 2',
									text: 'Test Item 3'
								},
								{
									tag: 'div',
									style: 'background: darkgrey; color: white; order: 1',
									text: 'Test Item 4'
								}
							]
						}
					}
				]
			}
		}
    ] // END layout
}; });