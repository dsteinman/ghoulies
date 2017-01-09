`ghoulies` is a full-stack JavaScript integration test runner that allows you to run a NodeJS server, and a JavaScript client in the same unit test and write BDD-style integration tests in a simple and natural way.

ghoulies works by spawning a headless <a href="https://github.com/tmpvar/jsdom">JSDom</a> pointed to your development NodeJS server application.  The client-side API `ghoulie` exposes an event emitter that can be listened to in your server-side tests.

So far, ghoulies has only been used alongside <a href="http://webpack.github.io/">webpack</a> (to build the app) and <a href="https://mochajs.org/">mocha</a>/<a href="http://chaijs.com/">chai</a> (for running the tests) but should work with other JavaScript test and build systems.  Ghoulies may also be useful for those not even using Node, but are interested in using mocha/jasmine/jest for their client-side integration tests.


## Installation
---

### Prerequisites

Install your test and build systems (mocha, chai, webpack etc.):

```
npm install mocha --save
npm install chai --save
npm install webpack --save -g
```

Install <a href="https://github.com/remy/nodemon">nodemon</a> to watch for file changes:

```
npm install nodemon --save -g
```

### Install

Install both `ghoulies` (server-side interface) and `ghoulie` (client-side interface):

```
npm install ghoulies --save
npm install ghoulie --save
```

## Set Up Your Unit Test (Using Mocha)
---

Make a directory specifically for ghoulie tests:

```
mkdir /test/ghoulie
```

Create a new unit test script (eg. `/test/ghoulies/myghoulie.test.js`):

```
var chai = require('chai');
var expect = chai.expect;

// include ghoulies
var ghoulies = require('ghoulies');

// url of your local development server
var url = "http://localhost:1337";

before(function (done) {	
	 ghoulies.client({
		url: url,
		globals: true,		// make window, document, and jquery global objects
		jquery: true		// (optional) include jquery if it isn't included in the app
	}, function (window, ghoulie) {
		done();
	});
});

describe('ghoulies', () => {
	it('loads a headless client and renders my application', (done) => {
	
		// ghoulies exposes a headless browser window object
		expect(typeof window).to.be.equal('object');
		
		// see if it loaded the app successfully
		console.log(document.body.innerHTML);
		
		// use jQuery to inspect the dom
		var myAppNode = $('#myapp');
		expect(myAppNode.length).to.be.equal(1);
		expect(myAppNode0].nodeName).to.be.equal('DIV');
		
		// initialize ghoulie at the end of the first test
		ghoulie.init();
		
		done();
	});
});

```

As configured above, the `ghoulies.client()` method will instantiate an instance of <a href="https://github.com/tmpvar/jsdom">JSDom</a> and load the entire contents of your web application running on `http://localhost:1337`

In a ghoulie test you can use JQuery or standard DOM operations to just as you would in a browser.  It also exposes an API for emitting events and listening for events used by your unit tests.


## Server-Side Setup
---

Ghoulies requires your webserver be fully booted and ready to go before the test proceeds.  Ghoulies also exposes an EventEmitter to capture when the server is loaded.

Somewhere in your NodeJS server code:

```
var express = require('express')
var app = express()

// include ghoulies
var ghoulies = require('ghoulies');

app.listen(8000, function () {
	
	// emit server event
	ghoulies.emit('SERVER_LOADED', app);

});

```

In your `/test/ghoulies/config.js` bootstrap script, listen for the server event before continuing with the rest of the test suite:

```
before(function(done) {
	ghoulies.on('SERVER_LOADED', function(app) {
		ghoulies.app = app;
		done();
	});
});
```

## Client-To-Server Events
---

The client-side API is exposed by the <a href="https://github.com/jaxcore/ghoulie">ghoulie</a> npm module.  Your client-side application will need to include this module and emit events after important actions take place (eg. after data is loaded or a portion of your app is rendered).  The unit tests use `ghoulies` to spawn the client browser and listen to the events emitted by `ghoulie`.

Somewhere in your JavaScript client-side code emit a client event:

```
// include ghoulie
var ghoulie = require('ghoulie');

// emit client event
var arg1 = 123;
var arg2 = "abc";
ghoulie.emit('CLIENT_LOADED', arg1, arg2);
```

Then add an event listener in your unit test `/test/ghoulies/myghoulie.test.js` to listen for the client event:

```
define("a ghoulie test", function() {
	it("listens for client events", function(done) {
		
		// wait for client event
		ghoulie.on('CLIENT_LOADED', function()arg1, arg2, ...) {
			
			// output useful data in the terminal
			ghoulie.log('CLIENT_LOADED!', arg1, arg2);
			
			expect(arg1).to.be.equal(123);
			expect(arg2).to.be.equal("abc");
			
			done();
		});
		
		// initialize ghoule at the end of the first test
		ghoulie.init();
	
	});
});
```

## Server-to-Client Events
---

You can also emit events from within a ghoulie test and have your client listen and respond to them.  In this manner you can force the client to reload data from the server, render a new part of the application, or some other action:

Somewhere in your unit test emit an event:

```
ghoulie.emit('RELOAD_SOME_DATA')'
```

Somewhere in your client app, listen to the event:

```
ghoulie.on('RELOAD_SOME_DATA', function() {
	
	// fetch data from server
	$.ajax('/api/data', ...);
	
});
```

### Ghoulies NPM Commands
---

The ghoulies npm commands are:

```
npm run ghoulies          # runs the build, then runs the tests
```

```
npm run ghoulies:build    # bundles your client app (eg. webpack/gulp)
```

```
npm run ghoulies:test     # runs your tests (eg. mocha/jasmine)
```

```
npm run ghoulies:watch    # runs your tests and watch for changes (nodemon)
```

These commands will need to be manually added to your project's `package.json` and modified accordingly depending on your build and test systems.

This example is for <a href="http://webpack.github.io/">webpack</a> and <a href="https://mochajs.org/">mocha</a>:

```
...
	"scripts": {
		...
		"ghoulies": "npm run ghoulies:build; npm run ghoulies:test",
		"ghoulies:test": "NODE_ENV=test mocha --timeout 60000 --recursive ./test/ghoulies/config.js ./test/ghoulies",
		"ghoulies:watch": "npm run ghoulies:build; NODE_ENV=test nodemon -w ./test/ghoulies -e js -x npm run ghoulies:test",
		"ghoulies:build": "NODE_ENV=test node node_modules/webpack/bin/webpack.js -p --progress"
	}
...
```

It is recommended to experiment with running `ghoulies:build` and `ghoulies:test` independently and be sure sure they work properly before trying `ghoulies` and `ghoulies:watch`


## Examples
---

The best example to date of a ghoulie test is the one supplied in the <a href="https://github.com/jaxcore/sails-react-redux-boilerplate/blob/master/test/ghoulies/todos.test.js">sails-react-redux-boilerplate</a> example application which uses SailsJS server, ReactJS client, webpack build, and mocha tests.

See:
<a href="https://github.com/jaxcore/sails-react-redux-boilerplate/blob/master/test/ghoulies/todos.test.js">https://github.com/jaxcore/sails-react-redux-boilerplate/blob/master/test/ghoulies/todos.test.js</a>

## To-do
---

- console/REPL client

- listen to react/redux events

- command line interface
 
- stand alone example app (simple expressjs example)

- experiment with multiple client instances
