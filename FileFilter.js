/*globals define, brackets */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */
define(function (require, exports, module) {
    'use strict';
    var _                   = brackets.getModule('thirdparty/lodash');
    var FileSystem          = brackets.getModule('filesystem/FileSystem');
    var StringUtils         = brackets.getModule("utils/StringUtils");
    var Strings             = require('common/strings');
    var Notifications       = require('common/Notifications');

    var _originalFilter;
    var _definedFilterSets;
    var _definedActiveFilter;
    var _fnNotifyError;

    function getFilterSetByName(filterSetName) {
        return _definedFilterSets.load().filter(function (filterSet) {
            return filterSet.name === filterSetName;
        }).pop();
    }

    var getRegularExpression = _.memoize(function (regex) {
        return new RegExp(regex);
    });


    function isFileIncludedFilter(path, name, fileProperties, filterList) {
        var isExcluded = _.any(filterList, function (filter) {
            var regex = getRegularExpression(filter.regex);
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

    function registerFilter(filter) {
        // store original filter before we modify
        _originalFilter = _originalFilter || FileSystem._FileSystem.prototype._indexFilter;
        // reset filter to original before we attempt to change
        FileSystem._FileSystem.prototype._indexFilter = _originalFilter;

        var filterSetName = _definedActiveFilter.load();
        if (!filterSetName) {return; }

        var filterSettings = getFilterSetByName(filterSetName);
        if (!filterSettings) {
            var messages = [];
            messages.push(StringUtils.format(Strings.FILTERSET_NOT_FOUND, Notifications.createHighlightMarkup(filterSetName)));
            messages.push(StringUtils.format(Strings.PREFERENCES_FILE, Notifications.createHighlightMarkup(_definedActiveFilter.filePath())));
            _fnNotifyError(messages);
            return;
        }

        FileSystem._FileSystem.prototype._indexFilter = function (path, name, fileProperties) {
            return !(!filter(path, name, fileProperties, filterSettings.filters) || !_originalFilter.apply(this, arguments));
        };

    }

    function configureFilter(definedFilterSets, definedActiveFilter, fnNotifyError) {
        _definedFilterSets = definedFilterSets;
        _definedActiveFilter = definedActiveFilter;
        _fnNotifyError = fnNotifyError;
        registerFilter(isFileIncludedFilter);
    }

    function reloadFilter() {
        registerFilter(isFileIncludedFilter);
    }

    exports.configureFilter = configureFilter;
    exports.reloadFilter = reloadFilter;
});
