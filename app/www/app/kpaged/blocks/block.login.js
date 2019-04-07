define({
    name: 'login',
	id: 'login',
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
		class: 'login-form',
		children: [
			{
				block: 'autorow',
				config: {
					style: 'text-align: center',
					items: [
						{
							id: 'email',
							name: 'email',
							label: 'E-mail Address or Customer Card Number',
							placeholder: 'E-mail/Customer Card Number',
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
				tag: 'a',
				class: 'forgotPasswordLink',
				text: 'Forgot your password?'
			},
			{
				block: 'autorow',
				config: {
					params: {
						style: 'display: flex; justify-content: center'
					},
					items: [
						{
							id: 'loginButton',
							class: 'loginButton',
							name: 'loginButton',
							tag: 'button',
							type: 'button',
							text: 'Sign In',
							class: 'k-button cta primary',
							data: {
								role: 'button'
							}
						}
					]
				}
			},
			{
				tag: 'div',
				children: [
					{
						tag: 'div',
						name: 'resetPopup',
						class: 'entityPopup',
						//style: 'display: none',
						data: {
							role: 'window',
							//appendTo: '#center-pane',
							modal: true,
							visible: false,
							resizable: false,
							draggable: true,
							title: 'Reset Password',
							width: '35%'
						},
						children: [
							{
								tag: 'p',
								text: 'If you lost your password don\'t worry. Simply fill in your e-mail address or Customer Card number and we\'ll send you a link to reset it.'
							},
							{
								block: 'autorow',
								config: {
									params: {
										style: 'display: flex; justify-content: center'
									},
									items: [{
										id: 'email',
										name: 'email',
										label: 'E-mail Address or Customer Card Number',
										placeholder: 'E-mail/Customer Card Number',
										tag: 'input',
										type: 'text',
										class: 'large k-textbox',
										data: {
											bind: 'email'
										}
									}]
								}
							},
							{
								block: 'autorow',
								config: {
									params: {
										style: 'display: flex; justify-content: center'
									},
									items: [
										{
											tag: 'button',
											type: 'button',
											text: 'Send Reset Link',
											class: 'k-button cta resetButton',
											name: 'resetButton',
											data: {
												role: 'button'
											}
										}
									]
								}
							},
						]
					}
				]
			}
		]
	}
});