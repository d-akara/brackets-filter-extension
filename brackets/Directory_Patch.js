/*
 * Copyright (c) 2013 - present Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

define(function (require, exports, module) {
    var Directory = brackets.getModule('filesystem/Directory');

    // Replacement for Directory.js function that passes in EntryStats to the indexFilter
    function getContents(callback) {
        if (this._contentsCallbacks) {
            // There is already a pending call for this directory's contents.
            // Push the new callback onto the stack and return.
            this._contentsCallbacks.push(callback);
            return;
        }

        // Return cached contents if the directory is watched
        if (this._contents) {
            callback(null, this._contents, this._contentsStats, this._contentsStatsErrors);
            return;
        }

        this._contentsCallbacks = [callback];

        this._impl.readdir(this.fullPath, function (err, names, stats) {
            var contents = [],
                contentsStats = [],
                contentsStatsErrors;

            if (err) {
                this._clearCachedData();
            } else {
                // Use the "relaxed" parameter to _isWatched because it's OK to
                // cache data even while watchers are still starting up
                var watched = this._isWatched(true);

                names.forEach(function (name, index) {
                    var entryPath = this.fullPath + name;

                    /********************* Monkey Patched *********************/
                    var entryStats = stats[index];
                    if (this._fileSystem._indexFilter(entryPath, name, entryStats)) {
                    /********************* End Patch **************************/
                        var entry;

                        // Note: not all entries necessarily have associated stats.
                        if (typeof entryStats === "string") {
                            // entryStats is an error string
                            if (contentsStatsErrors === undefined) {
                                contentsStatsErrors = {};
                            }
                            contentsStatsErrors[entryPath] = entryStats;
                        } else {
                            // entryStats is a FileSystemStats object
                            if (entryStats.isFile) {
                                entry = this._fileSystem.getFileForPath(entryPath);
                            } else {
                                entry = this._fileSystem.getDirectoryForPath(entryPath);
                            }

                            if (watched) {
                                entry._stat = entryStats;
                            }

                            contents.push(entry);
                            contentsStats.push(entryStats);
                        }
                    }
                }, this);

                if (watched) {
                    this._contents = contents;
                    this._contentsStats = contentsStats;
                    this._contentsStatsErrors = contentsStatsErrors;
                }
            }

            // Reset the callback list before we begin calling back so that
            // synchronous reentrant calls are handled correctly.
            var currentCallbacks = this._contentsCallbacks;

            this._contentsCallbacks = null;

            // Invoke all saved callbacks
            var callbackArgs = [err, contents, contentsStats, contentsStatsErrors];

            _applyAllCallbacks(currentCallbacks, callbackArgs);
        }.bind(this));
    }

    function _applyAllCallbacks(callbacks, args) {
        if (callbacks.length > 0) {
            var callback = callbacks.pop();
            try {
                callback.apply(undefined, args);
            } finally {
                _applyAllCallbacks(callbacks, args);
            }
        }
    }
    module.exports = getContents;

});
