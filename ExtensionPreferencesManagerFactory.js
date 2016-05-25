/*globals define, brackets */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */
define(function (require, exports, module) {
    'use strict';
    var PreferencesManager  = brackets.getModule('preferences/PreferencesManager');

    function createExtensionPreferenceManager(extensionId, key, type, defaultValue, fnOnChange) {
        var preferences = PreferencesManager.getExtensionPrefs(extensionId);

        var definedPreferences = preferences.definePreference(key, type, defaultValue);
        if (fnOnChange) {
            definedPreferences.on("change", function () {
                fnOnChange(preferences.get(key, PreferencesManager.CURRENT_PROJECT));
            });
        }

        var currentPreference, originalPreference;
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
