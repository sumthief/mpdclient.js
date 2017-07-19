# mpdclient.js [![Build Status](https://travis-ci.org/sumthief/mpdclient.js.svg?branch=master)](https://travis-ci.org/sumthief/mpdclient.js)

Upcoming Promise-based MPD client for NodeJS.

# Init

```sh
$ npm i
```

Alternate variant via yarn:

```sh
$ yarn install
```


# Build

```sh
$ npm run build
```

# Usage

#### Import module:
```js
// Import MPDClient.js module.
const mpdclient = require('mpdclient.js');
```

#### Create connection with MPD server:
```js
// Create connection with MPD server.
const client = new mpdclient.MPDClient('localhost', 6600);
```

#### Prepare command (or command list) for execute:
```js
// Create command.
const command = new mpdclient.MPDCommand('status');
```

```js
// Or you can create chain of commands.
const commands = [
  new mpdclient.MPDCommand('play'),
  new mpdclient.MPDCommand('status')
];
// You can pass the mode for eval command list.
const commandList = new mpdclient.MPDCommandList(commands, mpdclient.MPDCommandList.COMMAND_LIST_OK_BEGIN);
```

#### Execute command or command list:
```js
// As MPDClient.js provides Promise-based API it means
// that there are 2 callbacks for handle execution result:
client.execute(command).then(
  response => {
    // Handle parsed response object.
  },
  error => {
    // Handle error.
  }
);
```

#### Completed example
```js
const mpdclient = require('mpdclient.js');
const client = new mpdclient.MPDClient('localhost', 6600);

const command = new mpdclient.MPDCommand('status');
client.execute(command)
  .then(response => console.log(response))
  .catch(error => console.log(error));
```