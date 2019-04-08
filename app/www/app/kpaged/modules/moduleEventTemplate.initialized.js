		initialized: function () {
			var that = this,
				page = that.getPage(),
				dataSources = page.getDataSources();
				
			if (!dataSources.has('')) {
				// Initialize datasources
				dataSources.set('', new kendo.data.DataSource({
				}));
			}
		},