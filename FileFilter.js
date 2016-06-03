/*globals define, brackets */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */
define(function (require, exports, module) {
    'use strict';
    var _                   = brackets.getModule('thirdparty/lodash');
    var FileSystem          = brackets.getModule('filesystem/FileSystem');
    var FileUtils           = brackets.getModule('file/FileUtils');
    var StringUtils         = brackets.getModule("utils/StringUtils");
    var Strings             = require('common/strings');
    var Notifications       = require('common/Notifications');

    var _originalFilter;
    var _definedFilterSets;
    var _definedActiveFilter;
    var _fnNotifyError;

    /**
     * Find the filter set by name from the list of filter sets defined in preferences
     * @private
     * @param   {String} filterSetName Name of filter set
     * @returns {Object} Filter set
     */
    function _getFilterSetByName(filterSetName) {
        return _definedFilterSets.load().filter(function (filterSet) {
            return filterSet.name === filterSetName;
        }).pop();
    }

    // Cache regular expressions
    var _getRegularExpression = _.memoize(function (regex) {
        return new RegExp(regex);
    });

    /**
     * File filter implementation.
     * @param   {String}  path           file location
     * @param   {String}  name           file name
     * @param   {object}  fileProperties file type information
     * @param   {Array}   filterList     List of filters to test against file
     * @returns {boolean} true if file should be included, else false
     */
    function _isFileIncludedFilter(path, name, fileProperties, filterList) {
        var isExcluded = _.any(filterList, function (filter) {
            var regex = _getRegularExpression(filter.regex);
            var filterBy = null;
            if ((filter.filterBy === "directory") && (fileProperties.isDirectory)) {
                filterBy = path;
            }
            if ((filter.filterBy === "filename") && (fileProperties.isFile)) {
                filterBy = name;
            }

            // No filter applies.  So do not reject
            if (!filterBy) {return false; }

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
    }

    /**
     * Replaces the Brackets default filter implementation
     * @private
     * @param   {Object} filter Filter implementation to replace default
     */
    function _registerFilter(filter) {
        // store original filter before we modify
        _originalFilter = _originalFilter || FileSystem._FileSystem.prototype._indexFilter;
        // reset filter to original before we attempt to change
        FileSystem._FileSystem.prototype._indexFilter = _originalFilter;

        var filterSetName = _definedActiveFilter.load();
        if (!filterSetName) {return; }

        var filterSettings = _getFilterSetByName(filterSetName);
        if (!filterSettings) {
            var messages = [];
            messages.push(StringUtils.format(Strings.FILTERSET_NOT_FOUND, Notifications.createHighlightMarkup(filterSetName)));
            messages.push(StringUtils.format(Strings.PREFERENCES_FILE, Notifications.createHighlightMarkup(_definedActiveFilter.filePath())));
            _fnNotifyError(messages);
            return;
        }

        FileSystem._FileSystem.prototype._indexFilter = function (path, name, fileProperties) {
            // bypass filtering for anything that is part of brackets
            if (path.indexOf(brackets.app.getApplicationSupportDirectory()) > -1) {return true; }
            // perform filtering using supplied filter
            return !(!filter(path, name, fileProperties, filterSettings.filters) || !_originalFilter.apply(this, arguments));
        };

    }

    /**
     * Install this filter in place of the default Brackets filter.
     * @param {Object} definedFilterSets   ExtensionPreferenceManager of filter sets defined in preferences
     * @param {Object} definedActiveFilter ExtensionPreferenceManager for name of filter set
     * @param {function} fnNotifyError     function accepts array of strings to display to UI
     */
    function configureFilter(definedFilterSets, definedActiveFilter, fnNotifyError) {
        _definedFilterSets = definedFilterSets;
        _definedActiveFilter = definedActiveFilter;
        _fnNotifyError = fnNotifyError;
        _registerFilter(_isFileIncludedFilter);
    }

    /**
     * Reload extensions preferences and reset the filter.
     */
    function reloadFilter() {
        _registerFilter(_isFileIncludedFilter);
    }

    exports._isFileIncludedFilter = _isFileIncludedFilter;

    exports.configureFilter = configureFilter;
    exports.reloadFilter = reloadFilter;
});
