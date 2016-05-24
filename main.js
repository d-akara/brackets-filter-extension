define(function (require, exports, module) {

    'use strict';

    var _                   = brackets.getModule('thirdparty/lodash');
    var CommandManager      = brackets.getModule('command/CommandManager');
    var Commands            = brackets.getModule('command/Commands');
    var Directory           = brackets.getModule('filesystem/Directory');
    var FileSystem          = brackets.getModule('filesystem/FileSystem');
    var PreferencesManager  = brackets.getModule('preferences/PreferencesManager');

    var _originalFilter;
    var DirectoryGetContentsPatch = require('directory');

    var PackageJson = JSON.parse(require('text!./package.json'));

    var extensionPreferences = PreferencesManager.getExtensionPrefs(PackageJson.name);

    extensionPreferences.definePreference('filterSetActive', 'string', 'default').on("change", function () {
        console.log("The value of filterSetActive is now", extensionPreferences.get("filterSetActive"));
        registerFilter(isFileIncludedFilter);
        refreshProjectFileList();
    });

    function refreshProjectFileList() {
        CommandManager.execute(Commands.FILE_REFRESH);
    }

    extensionPreferences.definePreference('filterSets', 'array', []);

    function createExtensionPreferenceManager(preferences, key) {
        var currentPreference, originalPreference;
        return {
            load: function() {
                currentPreference = preferences.get(key, PreferencesManager.CURRENT_PROJECT);
                originalPreference = originalPreference | currentPreference;
                return currentPreference;
            },
            set: function(value){currentPreference = value;},
            get: function(){return currentPreference ? currentPreference : this.load();},
            save: function(){preferences.set(key, currentPreference);},
            restore: function(){this.set(originalPreference);}
        }
    }
    var definedFilterSets   = createExtensionPreferenceManager(extensionPreferences, 'filterSets');
    var definedActiveFilter = createExtensionPreferenceManager(extensionPreferences, 'filterSetActive');

    function getFilterSetByName(filterSetName){
        return definedFilterSets.load().filter(function(filterSet){
            return filterSet.name === filterSetName;
        }).pop();
    }

    function refreshProjectFileList() {
        CommandManager.execute(Commands.FILE_REFRESH);
    }

    var getRegularExpression = _.memoize(function(regex){
       return new RegExp(regex);
    });

    function isFileIncludedFilter(path, name, fileProperties, filterList) {
        console.log(fileProperties);
        var isExcluded = _.any(filterList, function (filter) {
            var regex = getRegularExpression(filter.regex);
            var filterBy = null;
            if ((filter.filterBy === "directory" ) && (fileProperties.isDirectory)) {
                filterBy = path;
            }
            if ((filter.filterBy === "filename" ) && (fileProperties.isFile)){
                filterBy = name;
            }

            // No filter applies.  So do not reject
            if (!filterBy) return false;

            var matched = false;
            if (regex.test(filterBy)) {
                matched = true;
            }

            if (filter.action === "include") {
                return !matched;
            }
            if (filter.action === "exclude") {
                return matched;
            }
        });

        return !isExcluded;
    };

    function registerFilter(filter) {
        // store original filter before we modify
        _originalFilter = _originalFilter || FileSystem._FileSystem.prototype._indexFilter;
        // reset filter to original before we attempt to change
        FileSystem._FileSystem.prototype._indexFilter = _originalFilter;

        var filterSetName = definedActiveFilter.load();
        if (!filterSetName) return;

        var filterSettings = getFilterSetByName(filterSetName);
        if (!filterSettings) return;

        console.log("Setting filter ", filterSettings);

        FileSystem._FileSystem.prototype._indexFilter = function (path, name, fileProperties) {
             return !(!filter(path, name, fileProperties, filterSettings.filters) || !_originalFilter.apply(this, arguments));
        };

    }

    function patchDirectoryGetContents(patchedFunction) {
        Directory.prototype.getContents = patchedFunction;
    }

    registerFilter(isFileIncludedFilter);
    patchDirectoryGetContents(DirectoryGetContentsPatch);
});
