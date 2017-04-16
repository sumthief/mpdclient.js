# mpdclient.js

Yet another MPD client for NodeJS.

Provides Promise-based API for interaction with MPD server.

# Build

Build via tsc:
```
tsc src/*.ts --outDir dist/src
```

Or use gulpfile.js from repo:
```
gulp default
```

# Usage

```ecmascript 6
const mpdclient = require('mpdclient.js');

let client = new mpdclient.MPDClient('localhost', 6600),
  // Also you can create CommandList via mpdclient.MPDCommandList.
  command = new mpdclient.MPDCommand('status');
client.execute(command).then(
  response => {
    // Handle parsed response object.
  },
  error => {
    // Handle error.
  }
);
```
