#!/bin/bash
cp package.json dist/ && cp README.md dist/
cd dist && npm uninstall --save typescript
rm -rf node_modules
json -I -f package.json -e 'this.keywords=this.keywords.filter(item => item !== "typescript")'
echo "'use strict';

module.exports.MPDClient = require('src/Client').MPDClient;
module.exports.MPDCommand = require('src/Command').MPDCommand;
module.exports.MPDCommandList = require('src/CommandList').MPDCommandList;
" > index.js
