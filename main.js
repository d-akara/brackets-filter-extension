/*globals define, brackets */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */

define(function (require, exports, module) {

    'use strict';
    var CommandManager      = brackets.getModule('command/CommandManager');
    var Commands            = brackets.getModule('command/Commands');
    var Directory           = brackets.getModule('filesystem/Directory');

    var DirectoryGetContentsPatch           = require('directory');
    var ExtensionPreferencesManagerFactory  = require('ExtensionPreferencesManagerFactory');
    var FileFilter                          = require('FileFilter');

    var PackageJson = JSON.parse(require('text!./package.json'));

    function onPreferenceChanged() {
        FileFilter.reloadFilter();
        CommandManager.execute(Commands.FILE_REFRESH);
    }

    var definedFilterSets   = ExtensionPreferencesManagerFactory.createExtensionPreferenceManager(PackageJson.name, 'filterSets', 'array', [], onPreferenceChanged);
    var definedActiveFilter = ExtensionPreferencesManagerFactory.createExtensionPreferenceManager(PackageJson.name, 'filterSetActive', 'string', 'default', onPreferenceChanged);

    function patchDirectoryGetContents(patchedFunction) {
        Directory.prototype.getContents = patchedFunction;
    }

    FileFilter.configureFilter(definedFilterSets, definedActiveFilter);
    patchDirectoryGetContents(DirectoryGetContentsPatch);
});
