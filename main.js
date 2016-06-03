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

    /**
     * Reload values from preferences, apply filter and refresh file list in UI
     */
    function onPreferenceChanged() {
        FileFilter.reloadFilter();
        CommandManager.execute(Commands.FILE_REFRESH);
    }


    // Use this as a default example to create in the user preferences
    // if there is currently no preference already specified
    var defaultFilterExample = [
        {
            "name": "node",
            "filters": [
                {
                    "regex": "node_modules",
                    "action": "exclude",
                    "filterBy": "directory"
                }
            ]
        }
    ];

    var definedFilterSets   = ExtensionPreferencesManagerFactory.createExtensionPreferenceManager(PackageJson.name, 'filterSets', 'array', defaultFilterExample, onPreferenceChanged);
    var definedActiveFilter = ExtensionPreferencesManagerFactory.createExtensionPreferenceManager(PackageJson.name, 'filterSetActive', 'string', '', onPreferenceChanged);

    function showErrorMessage(messages) {
        messages.push(StringUtils.format(Strings.REVIEW_PREFERENCE, Notifications.createHighlightMarkup(PackageJson.name)));
        var dialog = Notifications.showMessage(PackageJson.title, messages, Strings.DISMISS);
    }

    // replace original Brackets function with patched version
    Directory.prototype.getContents = DirectoryGetContentsPatch;

    // Install our filter with definitions defined in preferences
    FileFilter.configureFilter(definedFilterSets, definedActiveFilter, showErrorMessage);
});
