/*globals define, brackets */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */
define(function (require, exports, module) {
    'use strict';
    var _                   = brackets.getModule('thirdparty/lodash');
    var PreferencesManager  = brackets.getModule('preferences/PreferencesManager');

    /**
     * @param {String} extendsionId name of extension defined in package.json
     * @param {String} key name of preference
     * @param {String} type the JavaScript type for the value
     * @param {Object|String|Array} defaultValue the default value for the preference
     * @param {function} fnOnChange called when the value of the preference has changed
     */
    function createExtensionPreferenceManager(extensionId, key, type, defaultValue, fnOnChange) {
        var preferences = PreferencesManager.getExtensionPrefs(extensionId);
        var currentPreference, originalPreference;

        var definedPreferences = preferences.definePreference(key, type, defaultValue);
        if (fnOnChange) {
            definedPreferences.on("change", function () {
                var newValue = preferences.get(key, PreferencesManager.CURRENT_PROJECT);
                if (!_.isEqual(newValue, currentPreference)) {
                    fnOnChange(preferences.get(key, PreferencesManager.CURRENT_PROJECT));
                }
            });
        }

        return {
            load: function () {
                currentPreference = preferences.get(key, PreferencesManager.CURRENT_PROJECT);
                originalPreference = originalPreference || currentPreference;
                return currentPreference;
            },
            set: function (value) {currentPreference = value; },
            get: function () {return currentPreference || this.load(); },
            save: function () {preferences.set(key, currentPreference); },
            restore: function () {this.set(originalPreference); }
        };
    }

    exports.createExtensionPreferenceManager = createExtensionPreferenceManager;
});
