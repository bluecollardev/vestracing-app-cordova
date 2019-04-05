$(document).ready(function () {
    // Initialize panes
    $('#vertical').kendoSplitter({
        orientation: 'vertical',
        panes: [
            /*{ collapsible: false, collapsed: false, resizable: false, size: '80px' },*/
            { collapsible: false },
            /*{ collapsible: true, collapsed: true, size: '80px' },*/
            
		]
    });

    $('#horizontal').kendoSplitter({
        panes: [
			{ collapsible: true, collapsed: true, resizable: true, size: '18%' },
			{ collapsible: false, scrollable: true },
			{ collapsible: true, collapsed: true, resizable: true, size: '20%' }
		]
    });
});