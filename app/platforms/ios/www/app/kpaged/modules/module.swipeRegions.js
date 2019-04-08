define({
	name: 'swipeRegions',
	id: 'swipeRegions', // This can be improved... the double ID reference isn't the greatest
	autoBind: false, // If the autoBind parameter is set to false, the module will be bound to the Page's view-model instead of its own
	autoRender: true,
	events: {
		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
		},
		rendered: function (e) {
			var that = this,
				moduleElement = $('#' + that.getId()),
				page = that.getPage(),
				block = page.getBlock(page.getPrimaryBlockName()),
				viewModel = block.getViewModel(),
				validator = block.getValidator(),
				widgetTypes = App.Config.Widgets.defaults(),
                widgets;
				
			that.dataBind();
				
			//$('#menu').kendoMenu();
			
			/*$('.phone-search').on('click', function (e) {
				e.preventDefault();
				$('#searchModal').data('kendoWindow').center().open();
			});*/
			
			// Click events
			/*$('nav#sticky-footer ul.menu li:not(.phone-search)').on('click', function (e) {
				// They've been promoted to pages
				/*var hash = $(this).find('a').attr('href');
				$(hash + '.region').siblings().hide().end().show();
				window.location.hash = hash;*/
				
				//window.location = $(this).find('a').attr('href');
			//});
			
			/*var hasher = App.getRouter().adapter().hasher(),
				hashChanged;
				
			hashChanged = function (newHash, oldHash) {
				var selectedItem = $('nav#sticky-footer ul.menu li a[href=#' + newHash + ']');
				if (selectedItem.length > 0) {
					selectedItem.parent('li').siblings().removeClass('selected').end().addClass('selected');
				}
			}
			
			hasher.changed.add(hashChanged); //add hash change listener
			hasher.initialized.add(hashChanged);*/
			
			// Slider - bam!
			Swipe($('#learn')[0], {
				speed: 900,
				auto: 7000,
				continuous: true,
				disableScroll: false,
				stopPropagation: false
			});
			
			// TODO: This is fixed for tablet size, but I am gonna have to modify this later
			
			var resizeBanners = function () {
				var width = $('#' + App.getPrimaryBlockName()).width();
				
				console.log('attempting to resize banners');
				console.log('resizing to width: ' + width);
				$('#learn').width(width);
				
				$('#learn .swipe-wrap > section > .intro').each(function (idx, banner) {
					var height = 0,
						offsetTop = 0;
					
					// This is if we have a sticky header and/or footer
					/*offsetTop = parseInt($(banner).offset().top);
					height = parseInt($(window).height() - offsetTop);
					console.log('offset: ' + JSON.stringify($(banner).offset()));
					console.log('window height: ' + $(window).height());
					console.log('resizing to height: ' + height);*/
					
					if ($(window).width() < $(window).height()) {
						// Portrait mode
						height = parseInt(($(window).innerHeight() / 2) - 76); // This is the height of the heading bar
					} else {
						height = parseInt($(window).innerHeight() - 76); // This is the height of the heading bar
					}
					
					$(banner).height(height);
				});
			};
			
			resizeBanners();
			
			$(window).resize(resizeBanners);
			
			$('section.introduction, footer.sticky').each(function () {
				$(this).detach().appendTo('#learn').slideDown();
			});
			
			$('[name=startButton]').each(function (idx, button) {
				var widget = $(button).data('kendoButton');
				widget.bind('click', function (e) {
					window.location.hash = '#unlock';
				});
			});
		}
	},
	layout: {
		templates: {
			tag: 'div',
			id: 'regions',
			children: [
				{
					tag: 'section',
					id: 'learn',
					class: 'swipe region col-xs-12',
					children: [
						{
							tag: 'div',
							class: 'swipe-wrap row',
							children: [
								{
									tag: 'section',
									//class: 'region',
									children: [
										{
											tag: 'div',
											class: 'intro',
											style: 'background: url(images/banners/360/yellow-gal.jpg)',
											children: [
												{
													tag: 'div',
													class: 'content dark',
													children: [
														{
															tag: 'h2',
															class: 'row',
															text: 'Programs available here!'
														},
														{
															tag: 'div',
															class: 'block',
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
																				text: 'Touch screen to operate.',
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
																				id: 'productButton',
																				name: 'productButton',
																				class: 'accent cta',
																				type: 'button',
																				text: 'Single race programs now available',
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
												}
											]
										}
									]
								},
								{
									tag: 'section',
									//class: 'region',
									children: [
										{
											tag: 'div',
											class: 'intro',
											style: 'background: url(images/banners/vest/results-01.jpg)',
											children: [
												{
													tag: 'div',
													class: 'content dark',
													children: [
														{
															tag: 'h2',
															class: 'row',
															text: 'Scratches and results provided by'
														},
														{
															tag: 'div',
															class: 'block',
															children: [
																{
																	tag: 'img',
																	src: 'http://www.unitedtote.com/sites/all/themes/utote_theme/logo.png'
																},
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
																				text: 'On time and online',
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
																				id: 'productButton',
																				name: 'productButton',
																				class: 'accent cta',
																				type: 'button',
																				text: 'Changes & Scratches',
																				data: {
																					role: 'button'
																				}
																			},
																			{
																				tag: 'button',
																				id: 'productButton',
																				name: 'productButton',
																				class: 'accent cta',
																				type: 'button',
																				text: 'Results',
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
												}
											]
										}
									]
								},
								{
									tag: 'section',
									//class: 'region',
									children: [
										{
											tag: 'div',
											class: 'intro',
											style: 'background: url(images/banners/vest/shutterstock_140850265.jpg)',
											children: [
												{
													tag: 'div',
													class: 'content dark',
													children: [
														{
															tag: 'h2',
															class: 'row',
															text: 'How do I add more credits?'
														},
														{
															tag: 'div',
															class: 'block',
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
																				text: 'Contact your local track staff.',
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
																				id: 'addCreditsButton',
																				name: 'addCreditsButton',
																				class: 'accent cta',
																				type: 'button',
																				text: 'Buy credits',
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