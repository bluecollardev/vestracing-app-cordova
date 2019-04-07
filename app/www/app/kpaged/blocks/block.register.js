define({
    name: 'register',
	id: 'register',
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
		tag: 'nav',
		//class: 'dark',
		class: 'login-form',
		style: 'display: block',
		children: [
			{
				tag: 'div',
				class: 'flex-cols col-2',
				children: [
					{
						tag: 'div',
						class: 'login-info',
						children: [
							{
								block: 'autorow',
								config: {
									style: 'text-align: center',
									items: [
										{
											id: 'email',
											name: 'email',
											label: 'Email or Username',
											placeholder: 'Email or Username',
											tag: 'input',
											type: 'text',
											class: 'large k-textbox',
											data: {
												bind: 'email'
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
											id: 'password',
											name: 'password',
											label: 'Your Password',
											placeholder: 'Your Password',
											tag: 'input',
											type: 'password',
											class: 'large k-textbox',
											data: {
												bind: 'password'
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
											id: 'password',
											name: 'password',
											label: 'Confirm Password',
											placeholder: 'Confirm Password',
											tag: 'input',
											type: 'password',
											class: 'large k-textbox',
											data: {
												bind: 'password_confirm'
											}
										}
									]
								}
							},
							{
								tag: 'div',
								class: 'button-row landscape',
								children: [
									{
										block: 'autorow',
										config: {
											params: {
												style: 'display: flex; justify-content: flex-start'
											},
											items: [
												{
													id: 'registerButton',
													class: 'registerButton',
													name: 'registerButton',
													tag: 'button',
													type: 'button',
													text: 'Register',
													class: 'k-button cta primary',
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
						tag: 'div',
						class: 'button-row portrait',
						children: [
							{
								block: 'autorow',
								config: {
									params: {
										style: 'display: flex; justify-content: center'
									},
									items: [
										{
											id: 'registerButton',
											class: 'registerButton',
											name: 'registerButton',
											tag: 'button',
											type: 'button',
											text: 'Register',
											class: 'k-button cta primary',
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
						class: 'customer-info',
						children: [
							{
								block: 'personalInfo',
								config: {
									autoBind: false,
									autoRender: true
								}
							},
							{
								module: 'address',
								config: {
									// TODO: Ok, I think as a rule a module cannot be set to autoBind or autoRender inside a block?
									autoBind: false,
									autoRender: false // The page renders this module
								}
							}
						]
					}
				]
			}
		]
	}
});