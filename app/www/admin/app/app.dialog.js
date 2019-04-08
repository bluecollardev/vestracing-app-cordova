$(function () {
    var dialog = $('div#GeneralDialog').kendoWindow({
        //closeOnEscape: false,
        visible: false,
        height: 153,
        width: 530,
        modal: true,
        title: false,
        open: function (event, ui) {
            $(this).parent().appendTo('form');
        }
    });
});

/**
 *  Open a generic dialog (modal) box
 *
 */
function OpenGeneralDialog(text, callback) {
	var dialog = $('div#GeneralDialog').data('kendoWindow');
		
	dialog.element.find('.dialog-text').text(text).prepend('<span class="k-loading-image"></span>');
	dialog.center().open();
};


function OpenErrorDialog(text, callback) {
    var dialog = $('div#GeneralDialog').data('kendoWindow');

    var div = $('<div class="newline right"></div>');
    var button = $('<button class="k-button">Close</button>');
    button.click(function () {
        var dialog = $('div#GeneralDialog').data('kendoWindow');

        dialog.element.find('.dialog-text').text('');
        dialog.center().close();
    });
    div.append(button);
    dialog.element.find('.dialog-text').text(text).prepend('<img src="../Images/kuba_error.png" height="40px" width="40px" style="padding: 0px 10px;"></img>').append(div);
    dialog.center().open();
};

/**
 *  Validate page, and open a generic dialog (modal) box if validation is successful
 *  Retained for backwards compatibility with pages that haven't been converted to Kendo
 *
 */
function OpenValidatedGeneralDialog(text, callback) {
    var isPageValid = true
		dialog;
    
    // check function exists...if not, use default value
    if (typeof(Page_ClientValidate) === 'function') {
        isPageValid = Page_ClientValidate();            
    }

    if (isPageValid) {
        dialog = $('div#GeneralDialog').data('kendoWindow');
		
		dialog.element.find('.dialog-text').text(text).prepend('<span class="k-loading-image"></span>');
        dialog.center().open();

        if (callback && typeof (callback) === 'function') {
            callback();
        }
    }
};

/**
 *  Close a generic dialog (modal) box
 *
 */
function CloseGeneralDialog(callback) {
    var dialog = $('div#GeneralDialog').data('kendoWindow');
		
	dialog.element.find('.dialog-text').text('');
	dialog.center().close();
    

    if (callback && typeof (callback) === 'function') {
        callback();
    }
};