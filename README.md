# check-eol
A command line utility to check what line endings are being used in files. Useful for enforcing consisten line endings across an entire project (such as an open source project with both windows and non-windows contributors).

[![build](https://img.shields.io/github/workflow/status/twitchbronbron/check-eol/build.svg?logo=github)](https://github.com/twitchbronbron/check-eol/actions?query=workflow%3Abuild)
[![Coverage Status](https://coveralls.io/repos/github/TwitchBronBron/check-eol/badge.svg?branch=master)](https://coveralls.io/github/TwitchBronBron/check-eol?branch=master)
[![NPM Version](https://badge.fury.io/js/check-eol.svg?style=flat)](https://npmjs.org/package/check-eol)

## Installation
**npm**
```bash
npm install check-eol -g
```

## Usage
`check-eol` inspects the line endings of every matching file and return a nonzero error code if any file has incorrect line endings, as well as printing out the paths of the non-compliant files.

You can specify as many file paths or globs as you wish. They will all be merged into a single unified file list before processing.

## Examples

### verify all files have LF endings
```bash
npx check-eol --eol lf "**/*"
```

### verify all .txt files have CRLF endings
```bash
npx check-eol --eol crlf "**/*.txt"
```

### verify all html and css files have the platform-specific line endings
```bash
npx check-eol --eol platform "**/*.html" "**/*.css"
```

## CLI options
### eol
The type of line ending to enforce. If `"platform"` is selected, then `"crlf"` will be enforced on Windows, and `"lf"` everywhere else.

*Optional:* yes
*Default:* `"lf"`
*Options*: `"lf"`, `"crlf"`, `"platform"`

**example:**
```bash
#enforce lf line endings
npx check-eol --eol lf
```

### cwd
The current working directory where relative paths are relative to

*Optional:* yes
*Default:* `process.cwd()`

**example:**
```bash
npx check-eol --cwd "/usr/JohnSmith/projects/project1"
```


## Changelog
[Click here](CHANGELOG.md) to view the changelog.
