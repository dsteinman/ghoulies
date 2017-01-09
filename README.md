`ghoulies` is a headless integration test runner, built on top `mocha` which can run your server and client tests in the same script.

## Installation
---

Prerequisites: ghoulies is intended to be used along with mocha/chai:

```
npm install mocha --save
npm install chai --save
```

Install:

```
npm install ghoulies --save
npm install ghoulie --save
```

## Usage
---

Add ghoulies to your mocha/chai test:

```
var chai = require('chai');
var expect = chai.expect;

// include ghoulies
var ghoulies = require('ghoulies');

// url to local development server
var url = "http://localhost:1337";

before(function (done) {	
	 ghoulies.client({
		url: url,
		globals: true,
		jquery: true
	}, function (window, ghoulie) {
		done();
	});
});

describe('ghoulies', () => {
	it('loads my application', (done) => {
	
		// ghoulies exposes a headless browser window object
		expect(typeof window).to.be.equal('object');
		
		// use jQuery to inspect the DOM
		var myAppNode = $('#myapp');
		expect(myAppNode.length).to.be.equal(1);
		
		// initialize ghoulie at the end of the first test
		ghoulie.init();
		
		done();
	});
});

```

Add ghoulies `npm run` commands to your package.json:



## Run The Ghoulie Tests
---
Run all your ghoulie tests:
```
npm run ghoulies
```

Run all your ghoulie tests re-run when changes occur to the tests:
```
npm run ghoulies:watch
```

## Examples
---

The best example to date of a ghoulie test is the one supplied in the `sails-react-redux-boilerplate` example application.

See:
<a href="https://github.com/jaxcore/sails-react-redux-boilerplate/blob/master/test/ghoulies/todos.test.js">https://github.com/jaxcore/sails-react-redux-boilerplate/blob/master/test/ghoulies/todos.test.js</a>