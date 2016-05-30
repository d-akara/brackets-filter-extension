/*globals define, brackets */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */
define(function (require, exports, module) {
    'use strict';
    var _                   = brackets.getModule('thirdparty/lodash');
    var PreferencesManager  = brackets.getModule('preferences/PreferencesManager');

    function shouldSendNotificationWhenPreferenceChanged(newValue, oldValue, newScope, oldScope) {
        var valueChangedAndSameScope = !_.isEqual(newValue, oldValue) && (newScope.scope === oldScope.scope);
        var scopeChanged = newScope !== oldScope;
        return valueChangedAndSameScope || scopeChanged;
    }

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
        var loadedLocation;
        var definedPreferences = preferences.definePreference(key, type, defaultValue);
        if (fnOnChange) {
            definedPreferences.on("change", function () {
                if (!originalPreference) {return; }  // preferences not yet loaded
                // We will get notified for other brackets.json files
                // Only pay attention to the location we are using
                var location = preferences.getPreferenceLocation(key);
                var newValue = preferences.get(key, PreferencesManager.CURRENT_PROJECT);
                if (shouldSendNotificationWhenPreferenceChanged(newValue, currentPreference, location.scope, loadedLocation.scope)) {
                    fnOnChange(preferences.get(key, PreferencesManager.CURRENT_PROJECT));
                }
            });
        }

        return {
            load: function () {
                var preferences = PreferencesManager.getExtensionPrefs(extensionId);
                currentPreference = preferences.get(key, PreferencesManager.CURRENT_PROJECT);
                originalPreference = originalPreference || currentPreference;
                loadedLocation = preferences.getPreferenceLocation(key);
                return currentPreference;
            },
            set: function (value) {currentPreference = value; },
            get: function () {return currentPreference || this.load(); },
            save: function () {preferences.set(key, currentPreference); },
            restore: function () {this.set(originalPreference); },
            filePath: function () {return preferences.base._scopes[loadedLocation.scope].storage.path; }
        };
    }

    exports.createExtensionPreferenceManager = createExtensionPreferenceManager;
});
