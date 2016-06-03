/*globals define, brackets, beforeEach, describe, it, expect */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, maxerr: 50 */
define(function (require, exports, module) {
    "use strict";
    var FileFilter = require("FileFilter");

    describe("Project File Filter Chains", function () {
        describe("Filter files include algorithm", function () {
            var filterList;
            var fileProperties;

            beforeEach(function () {
                filterList =  [
                    {
                        "regex": "abc",
                        "action": "include",
                        "filterBy": "filename"
                    }
                ];
                fileProperties = {isFile: true, isDirectory: false};
            });


            it("should include exact match of filename", function () {
                var path = "xyz/123";
                var name = "abc";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should include with sub string match of filename", function () {
                var path = "xyz/123";
                var name = "abcdef";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should include when type is directory and no filter specified for directory", function () {
                var path = "xyz/123";
                var name = "xyz";
                fileProperties = {isFile: false, isDirectory: true};
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should include with sub string match of filename", function () {
                var path = "xyz/123";
                var name = "000abcdef";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should not include with no matching sub strings", function () {
                var path = "xyz/123";
                var name = "xyz";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(false);
            });

            it("should not include with no matching sub strings of file, but matching path", function () {
                var path = "abc/abc";
                var name = "xyz";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(false);
            });
        });


        describe("Filter files exclude algorithm", function () {
            var filterList;
            var fileProperties;

            beforeEach(function () {
                filterList =  [
                    {
                        "regex": "abc",
                        "action": "exclude",
                        "filterBy": "filename"
                    }
                ];
                fileProperties = {isFile: true, isDirectory: false};
            });


            it("should exclude exact match of filename", function () {
                var path = "xyz/123";
                var name = "abc";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(false);
            });

            it("should exclude with sub string match of filename", function () {
                var path = "xyz/123";
                var name = "abcdef";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(false);
            });

            it("should include when type is directory and no filter specified for directory", function () {
                var path = "xyz/123";
                var name = "xyz";
                fileProperties = {isFile: false, isDirectory: true};
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should exclude with sub string match of filename", function () {
                var path = "xyz/123";
                var name = "000abcdef";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(false);
            });

            it("should include with no matching sub strings", function () {
                var path = "xyz/123";
                var name = "xyz";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should include with no matching sub strings of file, but matching path", function () {
                var path = "abc/abc";
                var name = "xyz";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });
        });

        describe("Filter directories include algorithm", function () {
            var filterList;
            var fileProperties;

            beforeEach(function () {
                filterList =  [
                    {
                        "regex": "abc",
                        "action": "include",
                        "filterBy": "directory"
                    }
                ];
                fileProperties = {isFile: false, isDirectory: true};
            });


            it("should include exact match of directory", function () {
                var path = "xyz/abc";
                var name = "000";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should include path match of filename", function () {
                var path = "abc/123";
                var name = "000";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should include when type is file and no filter specified for file", function () {
                var path = "xyz/123";
                var name = "000";
                fileProperties = {isFile: true, isDirectory: false};
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should include with sub string match of directory", function () {
                var path = "xyz/123abc123";
                var name = "000";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });

            it("should not include with no matching sub strings", function () {
                var path = "xyz/123";
                var name = "000";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(false);
            });

            it("should not include with no matching sub strings of directory, but matching file", function () {
                var path = "123/xyz";
                var name = "abc";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(false);
            });
        });

        describe("Filter files include if config invalid", function () {
            var filterList;
            var fileProperties;

            beforeEach(function () {
                filterList =  [
                    {
                        "xregex": "abc",
                        "xaction": "include",
                        "xfilterBy": "filename"
                    }
                ];
                fileProperties = {isFile: true, isDirectory: false};
            });


            it("should include exact match of filename", function () {
                var path = "xyz/123";
                var name = "000";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });
        });

        describe("Filter files supports regular expressions", function () {
            var filterList;
            var fileProperties;

            beforeEach(function () {
                filterList =  [
                    {
                        "regex": "xyz.*zzz",
                        "action": "include",
                        "filterBy": "directory"
                    }
                ];
                fileProperties = {isFile: true, isDirectory: false};
            });


            it("should include path matching regular expression", function () {
                var path = "xyz/123/zzz";
                var name = "000";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });
        });

        describe("Filter files supports multiple filter includes", function () {
            var filterList;
            var fileProperties;

            beforeEach(function () {
                filterList =  [
                    {
                        "regex": "xyz",
                        "action": "include",
                        "filterBy": "directory"
                    },
                    {
                        "regex": ".*zzz",
                        "action": "include",
                        "filterBy": "directory"
                    }
                ];
                fileProperties = {isFile: false, isDirectory: true};
            });


            it("should include when both include filters match", function () {
                var path = "xyz/123/zzz";
                var name = "000";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(true);
            });
        });

        describe("Filter files supports multiple filter includes", function () {
            var filterList;
            var fileProperties;

            beforeEach(function () {
                filterList =  [
                    {
                        "regex": "xyz",
                        "action": "include",
                        "filterBy": "directory"
                    },
                    {
                        "regex": "abc",
                        "action": "include",
                        "filterBy": "directory"
                    }
                ];
                fileProperties = {isFile: false, isDirectory: true};
            });


            it("should not include when 2nd include filter does not match", function () {
                var path = "xyz/123/zzz";
                var name = "000";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(false);
            });
        });

        describe("Filter files supports combination filters", function () {
            var filterList;
            var fileProperties;

            beforeEach(function () {
                filterList =  [
                    {
                        "regex": "xyz",
                        "action": "include",
                        "filterBy": "directory"
                    },
                    {
                        "regex": ".*zzz",
                        "action": "include",
                        "filterBy": "directory"
                    },
                    {
                        "regex": "123",
                        "action": "exclude",
                        "filterBy": "directory"
                    }
                ];
                fileProperties = {isFile: false, isDirectory: true};
            });


            it("should exclude filters can filter previous includes", function () {
                var path = "xyz/123/zzz";
                var name = "000";
                var isIncluded = FileFilter._isFileIncludedFilter(path, name, fileProperties, filterList);
                expect(isIncluded).toBe(false);
            });
        });

    });
});
