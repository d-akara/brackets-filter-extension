/*globals define, brackets */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */

define(function (require, exports, module) {

    'use strict';
    var AppInit             = brackets.getModule('utils/AppInit');
    var CommandManager      = brackets.getModule('command/CommandManager');
    var Commands            = brackets.getModule('command/Commands');
    var Directory           = brackets.getModule('filesystem/Directory');
    var StringUtils         = brackets.getModule("utils/StringUtils");

    var DirectoryGetContentsPatch           = require('brackets/Directory_Patch');
    var ExtensionPreferencesManagerFactory  = require('common/ExtensionPreferencesManagerFactory');
    var Notifications                       = require('common/Notifications');
    var Strings                             = require('common/strings');
    var FileFilter                          = require('FileFilter');

    var PackageJson = JSON.parse(require('text!./package.json'));

    function onPreferenceChanged() {
        FileFilter.reloadFilter();
        CommandManager.execute(Commands.FILE_REFRESH);
    }

    // replace original Brackets function with patched version
    Directory.prototype.getContents = DirectoryGetContentsPatch;

    AppInit.appReady(function () {
        var definedFilterSets   = ExtensionPreferencesManagerFactory.createExtensionPreferenceManager(PackageJson.name, 'filterSets', 'array', [], onPreferenceChanged);
        var definedActiveFilter = ExtensionPreferencesManagerFactory.createExtensionPreferenceManager(PackageJson.name, 'filterSetActive', 'string', 'default', onPreferenceChanged);

        function showErrorMessage(message) {
            var dialog = Notifications.showMessage(PackageJson.title, [message, StringUtils.format(Strings.REVIEW_PREFERENCE, Notifications.createHighlightMarkup(PackageJson.name))], Strings.DISMISS);
        }
        FileFilter.configureFilter(definedFilterSets, definedActiveFilter, showErrorMessage);
    });
});
