/*globals define, brackets, Mustache */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */
define(function (require, exports, module) {
    'use strict';
    var Dialogs             = brackets.getModule("widgets/Dialogs");
    var DefaultDialogs      = brackets.getModule("widgets/DefaultDialogs");
    var Strings             = require("common/strings");
    var DialogTemplate      = require("text!common/html/notification-dialog.html");

    function createHightlightMarkup(text) {
        return "<span class='label label-important'>" + text + "</span>";
    }

    function showMessage(title, messages, buttonText) {
        var templateVars = {
            dlgClass: DefaultDialogs.DIALOG_ID_ERROR,
            title:    title   || "",
            messages:  messages || [""],
            buttons: [{ className: Dialogs.DIALOG_BTN_CLASS_PRIMARY, id: Dialogs.DIALOG_BTN_OK, text: buttonText }]
        };
        var template = Mustache.render(DialogTemplate, templateVars);
        return Dialogs.showModalDialogUsingTemplate(template, true);

    }

    exports.showMessage = showMessage;
    exports.createHighlightMarkup = createHightlightMarkup;
});
