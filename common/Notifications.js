/*globals define, brackets */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */
define(function (require, exports, module) {
    'use strict';
    var Dialogs             = brackets.getModule("widgets/Dialogs");
    var DefaultDialogs      = brackets.getModule("widgets/DefaultDialogs");
    var Strings             = require("common/strings");

    function showMessage(title, message, buttonText) {
        return Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, title, message, [
            {
                className : Dialogs.DIALOG_BTN_CLASS_PRIMARY,
                id        : Dialogs.DIALOG_BTN_OK,
                text      : buttonText
            }]
            );
    }

    exports.showMessage = showMessage;
});
