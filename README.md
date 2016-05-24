# Brackets Project File Filter Chains
Extension to enhance project file filtering using chained filtering.
This extension provides filtering capabilities that are useful for very large projects with complex directory structures.

## Key features
1. **Filter Sets**: define groups of filters that you can easily switch between
1. **Chained Filtering**: filters are executed in a pileline series so each filter operates on what was not excluded by previous filter
1. **Include and Exclude**: filters can be either white box or black box mode
1. **Regular Expressions**: filters use regular expression matching
1. **File and Directory Support**: filters can be defined specifically for either files or directories

# Configuration
Configuration is done by editing the brackets.json file.  Changes will occur immediately on save.
### Example configuration
```JSON
    "dakaraphi.project.filefilter.filterSetActive": "java_project",
    "dakaraphi.project.filefilter.filterSets":  [
        {
            "name": "java_project",
            "filters": [
                {
                    "regex": "\\.class",
                    "action": "exclude",
                    "filterBy": "filename"
                }
            ]
        },
        {
            "name": "eclipse_project",
            "filters": [
                {
                    "regex": "\\.js|plugin.xml|\\.html|\\.java|\\.xsl|\\.css",
                    "action": "include",
                    "filterBy": "filename"
                },
                {
                    "regex": "\\.minified",
                    "action": "exclude",
                    "filterBy": "filename"
                },
                {
                    "regex": "bin|.metadata|\\.test.|\\.feature",
                    "action": "exclude",
                    "filterBy": "directory"
                }
            ]
        }        
    ]
```

# Future considerations
1. Provide UI to switch between defined filter sets
1. Provide UI to edit filter sets
