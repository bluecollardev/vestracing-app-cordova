define({
    name: 'customerEntry',
	id: 'customerEntry',
	autoRender: true,
	autoBind: true,
	/**
	 * Override the default setBlocks function
	 * 
	 * @element String: A valid HTML5 element or DOM DocumentFragment
	 * @attributes Object: An object containing key-value pairs of attributes and values
	 * @ref DOM Node: A reference node for inserting the new node
	 *
	 * @return DOMBuilder: this
	 */
	setLayout: function () {
		this._layout = this.layout;
	},
	layout: {
		tag: 'div',
		//style: 'flex: 0 0 100%; position: fixed; left: 240px; top: 144px; z-index: 10000; padding: 0.2em; border: 1px solid #f2f2f2',
		children: [																
			{
				tag: 'div',
				class: 'customer-entry-tabs',
				name: 'customer-entry-tabs',
				//class: 'content-box-only',
				data: {
					role: 'semantictabstrip',
					animation: false
				},
				tabs: ['Sign in', 'Register now!'],
				style: 'background: rgba(242, 242, 242, 0.888)',
				fieldsets: [
					{
						tag: 'fieldset',
						children: [
							{
								tag: 'div',
								style: 'display: flex !important; flex-flow: row wrap; width: 100%; height: 100%; justify-content: space-around',
								children: [{ block: 'login' }]
							}
						]
					},
					{
						tag: 'fieldset',
						children: [
							{
								tag: 'div',
								style: 'display: flex !important; flex-flow: row wrap; width: 100%; height: 100%; justify-content: space-around',
								children: [{ block: 'register' }]
							}
						]
					}
				]
			}
		]
	}
});