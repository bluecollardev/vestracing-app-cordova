define({
    name: 'stickySidebar',
	id: 'stickySidebar',
	autoRender: true,
	autoBind: false,
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
		tag: 'nav',
		//class: 'dark',
		id: 'sticky-sidebar',
		children: [
			{
				tag: 'div',
				class: 'logo',
			},
			{
				block: 'social'
			}
		]
	}
});