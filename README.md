# mpdclient.js

Yet another MPD client for NodeJS.

Provides Promise-based API for interaction with MPD server.

# Init

```sh
npm i
```

Alternate variant via yarn:

```sh
yarn install
```


# Build

```sh
npm run build
```

# Usage

```ecmascript 6
const mpdclient = require('mpdclient.js'),
  client = new mpdclient.MPDClient('localhost', 6600),
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
