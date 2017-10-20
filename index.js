var jsdom = require('jsdom');
var chalk = require('chalk');
var EventEmitter = require('events').EventEmitter;

function Ghoulies() {
	this.constructor();
	this.version = '0.0.2';
	this.log({ghoulieName: 'ghoulies ' + this.version}, '(c) 2016 Jaxcore', 'MIT Licensed');
}
Ghoulies.prototype = Object.create(EventEmitter.prototype);
Ghoulies.prototype.constructor = EventEmitter;
Ghoulies.prototype.log = function () {
	var args = Array.prototype.slice.call(arguments);
	args = args.map(function (arg, index) {
		if (index === 0 && typeof arg === 'object' && arg.ghoulieName) {
			return chalk.green(arg.ghoulieName);
		}
		if (typeof arg === 'string') {
			if (index >= 2 && typeof args[0] === 'object' && args[0].ghoulieName && typeof args[1] === 'string') return arg;
			return chalk.cyan(arg);
		}
		if (typeof arg === 'number') return chalk.magenta(arg);
		if (arg === null) return chalk.yellow('null');
		if (typeof arg === 'undefined') return chalk.yellow('undefined');
		return arg;
	});
	console.log.apply(null, args);
};
Ghoulies.prototype.client = function (options, callback) {
	if (typeof options === 'string') {
		var url = options;
		options = {
			url: url,
			globals: true,
			jquery: true
		}
	}
	var me = this;
	this.name = options.name || 'ghoulie';
	
	me.jsdom(options, function (window, ghoulie) {
		me.log({ghoulieName: me.name}, 'client loaded', options);
		if (typeof callback === 'function') {
			callback(window, ghoulie);
		}
		else callback();
	});
	
};

Ghoulies.prototype.jsdom = function (options, callback) {
	var scripts = options.scripts || [];
	if (options.jquery) scripts.push('http://code.jquery.com/jquery.js');
	
	var me = this;
	jsdom.env({
		url: options.url,
		scripts: scripts,
		done: function (err, currWindow) {
			if (!currWindow) {
				throw new Error('Ghoulies error: no window');
			}
			if (options.globals) {
				if (typeof window === 'undefined') global.window = currWindow;
				else throw new Error('Ghoulies: global.window already defined');
				if (typeof document === 'undefined') global.document = currWindow.document;
				else throw new Error('Ghoulies: global.document already defined');
				if (typeof $ === 'undefined') global.$ = currWindow.$;
				else throw new Error('Ghoulies: global.$ already defined');
				if (typeof ghoulie === 'undefined') global.ghoulie = currWindow.__ghoulie;
				else throw new Error('Ghoulies: global.ghoulie already defined');
			}
			currWindow.__ghoulie.ghoulies = me;
			callback(currWindow, currWindow.__ghoulie);
		},
		features: {
			FetchExternalResources: ["script"],
			ProcessExternalResources: ["script"],
			SkipExternalResources: false
		}
	});
};

Ghoulies.prototype.getLogger = function(name) {
	return (function(n) {
		return function log() {
			var args = Array.prototype.slice.call(arguments);
			args.unshift({ghoulieName:n});
			Ghoulies.prototype.log.apply(ghoulies, args);
		}
	}(name));
};

var ghoulies = new Ghoulies();

global.__ghoulies = ghoulies;
module.exports = ghoulies;
