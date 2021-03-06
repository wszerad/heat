//TODO
//gpio load spi [buffer size in KB] przed zalaczeniem spi

var	$ = require('enderscore'),
	fs = require('fs'),
	util = require("util"),
	bufferIO = new Buffer(1),
	Emitter = require('events').EventEmitter,
	gpioPath = '/sys/class/gpio/';

var exp = {
	version: '0.0.4'
};

var getRev = exp.getRev = function(cb){
	return {version: 'B', revision: 'test'};
};

var mods = {
	INPUT: 0,
	OUTPUT: 1,
	PWM_OUTPUT: 2,
	GPIO_CLOCK: 3,
	LOW: new Buffer('0'),
	HIGH: new Buffer('1'),
	// Pull up/down/none
	PUD_OFF: 0,
	PUD_DOWN: 1,
	PUD_UP: 2,
	// PWM
	PWM_MODE_MS: 0,
	PWM_MODE_BAL: 1,
	// Interrupt levels
	INT_EDGE_NONE: 'none',
	INT_EDGE_SETUP: 0,
	INT_EDGE_FALLING: 'falling',
	INT_EDGE_RISING: 'rising',
	INT_EDGE_BOTH: 'both'
};

var rev = exp.rev = getRev().version;

var virtualPins = exp.virtualPins = {};
var pins = exp.pins = {
	1: {name: '3.3V', able: false},
	2: {name: '5V', able: false},
	3: {name: ['SDA0','GPIO0', 'WPIO8'], gpio: 0, able: true},
	4: {name: '5V', able: false},
	5: {name: ['SCL0','GPIO1', 'WPIO9'], gpio: 1, able: true},
	6: {name: 'ground', able: false},
	7: {name: ['GPIO4', 'WPIO7'], gpio: 4, able: true},
	8: {name: ['TX0','GPIO14', 'WPIO15'], gpio: 14, able: true},
	9: {name: 'ground', able: false},
	10: {name: ['RX0','GPIO15', 'WPIO16'], gpio: 15, able: true},
	11: {name: ['GPIO17', 'WPIO0'], gpio: 17, able: true, pullable: true},
	12: {name: ['PWM0','GPIO18', 'WPIO1'], gpio: 18, able: true, pullable: true},
	13: {name: ['GPIO21', 'WPIO2'], gpio: 21, able: true, pullable: true},
	14: {name: 'ground', able: false},
	15: {name: ['GPIO22', 'WPIO3'], gpio: 22, able: true, pullable: true},
	16: {name: ['GPIO23', 'WPIO4'], gpio: 23, able: true, pullable: true},
	17: {name: '3.3V', able: false},
	18: {name: ['GPIO24', 'WPIO5'], gpio: 24, able: true, pullable: true},
	19: {name: ['MOSI0','GPIO10', 'WPIO12'], gpio: 10, able: true, multiuse: ['SPI']},
	20: {name: 'ground', able: false},
	21: {name: ['MISO0','GPIO9', 'WPIO13'], gpio: 9, able: true, multiuse: ['SPI']},
	22: {name: ['GPIO25', 'WPIO6'], gpio: 25, able: true, pullable: true},
	23: {name: ['SCLK0','GPIO11', 'WPIO14'], gpio: 11, able: true, multiuse: ['SPI']},
	24: {name: ['CE0','GPIO8', 'WPIO10'], gpio: 8, able: true},
	25: {name: 'ground', able: false},
	26: {name: ['CE1','GPIO7', 'WPIO11'], gpio: 7, able: true}
};

//revB
if(rev=='B') {
	$.extend(pins, {
		3: {name: ['SDA0','GPIO2','WPIO8'], gpio: 2, able: true},
		5: {name: ['SCL0','GPIO3','WPIO9'], gpio: 3, able: true},
		13: {name: ['GPIO27','WPIO2'], gpio: 27, able: true, pullable: true},
		//P5
		27: {name: '5V', able: false},
		28: {name: '3.3V', able: false},
		29: {name: ['SDA1','GPIO28','WPIO17'], gpio: 28, able: true},
		30: {name: ['SCL1','GPIO29','WPIO18'], gpio: 29, able: true},
		31: {name: ['GPIO30','WPIO19'], gpio: 30, able: true},
		32: {name: ['GPIO31','WPIO20'], gpio: 31, able: true},
		33: {name: 'ground', able: false},
		34: {name: 'ground', able: false}
	});
} else if(rev=='B+') {
	//revB+
	$.extend(pins, {
		27: {name: 'SD0', able: false},
		28: {name: 'SC0', able: false},
		29: {name: 'GPIO5', gpio: 5, able: true},
		30: {name: 'ground', able: false},
		31: {name: 'GPIO6', gpio: 6, able: true},
		32: {name: 'GPIO12', gpio: 12, able: true},
		33: {name: 'GPIO13', gpio: 13, able: true},
		34: {name: 'ground', able: false},
		35: {name: 'GPIO19', gpio: 19, able: true},
		36: {name: 'GPIO16', gpio: 16, able: true},
		37: {name: 'GPIO26', gpio: 26, able: true},
		38: {name: 'GPIO20', gpio: 20, able: true},
		39: {name: 'ground', able: false},
		40: {name: 'GPIO21', gpio: 21, able: true}
	});
}

function attachPin(gpio, self, special) {
	var pin = gpio;

	if($.isString(pin)) {
		var ret = -1;

		for(var num in pins) {
			if(!$.isArray(pins[num].name)) {
				if(pins[num].name===gpio){
					ret = num;
					break;
				}
			} else {
				ret = pins[num].name.indexOf(gpio);
				if(ret!==-1){
					ret = num;
					break;
				}
			}
		}
		pin = ret;
	}

	if($.has(pins, pin) && pins[pin].able && (!pins[pin].used || (pins[pin].multiuse && pins[pin].multiuse.indexOf(special)!==-1))){
		if(!pins[pin].used)
			pins[pin].used = self;
		else if(!$.isArray(pins[pin].used))
			pins[pin].used = [pins[pin].used, self];
		else
			pins[pin].used.push(self);
	} else if(!$.has(pins, pin) && !$.has(virtualPins, pin)) {
		if(!$.has(virtualPins, pin))
			virtualPins[pin] = self;
		else
			throw Error('Virtual pin '+gpio+' is already reserved!');
	} else
		throw Error('GPIO '+gpio+' is already reserved!');

	return pin;
}

function changeHandler() {
	var self = this;
	this.read(function(err, value) {
		self.emit('change', self);
		if(value)
			self.emit('up', self);
		else
			self.emit('down', self, value);
	});
}

//SimpleGPIO
var SimpleGpio = exp.SimpleGpio = function(gpio, options, cb) {
	var self = this;

	options = options || {};

	$.defaults(options, {
		mode: mods.OUTPUT,
		pull: mods.PUD_OFF,
		state: 0
	});

	$.extend(this, $.pick(options, 'mode', 'pull'));

	this.pin = attachPin(gpio, this);
	this.gpio = (pins[this.pin])? pins[this.pin].gpio : this.pin;
	this.opts = options;

	this.setDirection(options.mode);				//ignore if output
	this.setPull(options.pull);						//ignore if output

	this.read();									//ignore if output
	this.write(options.state);						//ignore if input
};

SimpleGpio.prototype.read = function(cb) {
	var val = 40+Math.random()*100%20;

	if(cb)
		cb(null, val);

	return val;
};

//TODO what when input?
SimpleGpio.prototype.write = function(value, cb) {

	if(cb)
		cb(null, true);

	return true;
};

SimpleGpio.prototype.up = function(cb) {
	this.write(true, cb);
};

SimpleGpio.prototype.down = function(cb) {
	this.write(false, cb);
};

//is necessary fd save?
SimpleGpio.prototype.setDirection = function(dir) {
	//1 for output
	if(dir!==mods.INPUT && dir!==mods.OUTPUT)
		dir = $.toBoolean(dir) ? mods.OUTPUT : mods.INPUT;

	this.mode = dir;
};

SimpleGpio.prototype.direction = function() {
	return (this.isInput())? 'in' : 'out';
};

SimpleGpio.prototype.setPull = function(pud) {
	if(this.isInput) {
		this.pull = pud;
		return 1;
	}

	return -1;
};

SimpleGpio.prototype.isInput = function() {
	return this.mode===mods.INPUT;
};

SimpleGpio.prototype.isOutput = function() {
	return this.mode===mods.OUTPUT;
};

SimpleGpio.prototype.options = function() {
	return this.opts;
};

//GPIO
var Gpio = exp.Gpio = function(gpio, options, cb) {
	var self = this;

	options = options || {};

	$.defaults(options, {
		edge: mods.INT_EDGE_BOTH,
		mode: mods.INPUT,
		pull: mods.PUD_OFF,
		state: 0
	});

	$.extend(this, $.pick(options, 'mode', 'pull'));

	this.pin = attachPin(gpio, this);
	this.gpio = pins[this.pin].gpio;
	this.path = '/sys/class/gpio/gpio'+this.gpio+'/';
	this.opts = options;

	this.setDirection(options.mode);				//ignore if output
	this.setEdge(options.edge);						//ignore if output
	this.setPull(options.pull);						//ignore if output

	this.read();									//ignore if output
	this.write(options.state);						//ignore if input

};


Gpio.prototype.read = function(cb) {
	if(cb)
		cb(null, true);

	return true;
};

//TODO what when input?
Gpio.prototype.write = function(value, cb) {
	if(cb)
		cb(null, true);

	return true;
};

Gpio.prototype.up = function(cb) {
	this.write(true, cb);
};

Gpio.prototype.down = function(cb) {
	this.write(false, cb);
};

Gpio.prototype.setEdge = function(edge) {
	if(this.isInput) {
		this.edge = edge;
		return 1;
	}

	return -1;
};

//is necessary fd save?
Gpio.prototype.setDirection = function(dir) {
	//1 for output
	if(dir!==mods.INPUT && dir!==mods.OUTPUT)
		dir = $.toBoolean(dir) ? mods.OUTPUT : mods.INPUT;

	this.mode = dir;
};

Gpio.prototype.direction = function() {
	return (this.isInput())? 'in' : 'out';
};

Gpio.prototype.setPull = function(pud) {
	if(this.isInput && this.isPullable()) {
		this.pull = pud;
		return 1;
	}

	return -1;
};

Gpio.prototype.isPullable = function() {
	return !!pins[this.pin].pullable;
};

Gpio.prototype.isInput = function() {
	return this.mode===mods.INPUT;
};

Gpio.prototype.isOutput = function() {
	return this.mode===mods.OUTPUT;
};

Gpio.prototype.options = function() {
	return this.opts;
};

//GROUP
var Group = exp.Group = function(gpios) {
	if(!$.isArray(gpios) || !gpios.every(function(gpio){return (gpio instanceof Gpio || gpio instanceof SimpleGpio);}))
		throw new Error('Argument must by array of Gpio');

	this.gpios = gpios;
};

Group.prototype.write = function(values, cb) {
	if(!$.isArray(values))
		values = $.toBits(values, this.gpios.length);

	if(cb) {
		var promise = {cb: cb, count: this.gpios.length};
		this.gpios.forEach(function(gpio, index){
			gpio.write(values[index], (function(err){
				if(err){
					this.cb(err);
					this.count = 0;
				}

				if(!--this.count)
					this.cb(null);
			}).bind(promise));
		});
	} else {
		this.gpios.forEach(function(gpio){
			gpio.write(values[index]);
		});
	}
};

Group.prototype.read = function(value, cb) {
	if(cb) {
		var promise = {cb: cb, count: this.gpios.length, values: []};
		this.gpios.forEach(function(gpio, index){
			gpio.read((function(num, err, value){
				if(err){
					this.cb(err);
					this.count = 0;
				}

				this.values[num] = value;

				if(!--this.count)
					this.cb(null, this.values);
			}).bind(promise, index));
		});
	} else {
		return this.gpios.map(function(gpio){
			return gpio.read();
		});
	}
};

Group.prototype.up = function(cb) {
	this.write($.fill(this.gpios.length, 1), cb);
};

Group.prototype.down = function(cb) {
	this.write($.fill(this.gpios.length, 0), cb);
};

//PWM
var PWM = exp.PWM = function(gpio, options, cb) {
	options = options || {};

	$.defaults(options, {
		clock: 2,
		range: 1024,
		mode: mods.PWM_MODE_BAL,
		duty: 0
	});

	$.extend(this, $.pick(options, 'mode', 'clock', 'range', 'duty'));

	this.pin = attachPin(gpio, this);
	this.gpio = pins[this.pin].gpio;
	this.opts = options;

	this.setClock(this.clock);
	this.setRange(this.range);
	this.setMode(this.mode);

	if(!this.isHW())
		throw new Error('Only available pin for PWM is 18');

	this.write(this.duty);
};

PWM.prototype.isHW = function() {
	return (this.gpio===18);
};

PWM.prototype.setRange = function(range) {
	bind.pwmSetRangeSync(range);
	this.range = range;
};

PWM.prototype.setClock = function(clock) {
	this.clock = clock;
};

PWM.prototype.setMode = function(mode) {
	this.mode = mode;
};

PWM.prototype.write = function(value, cb) {
	var self = this;

	if(cb)
			cb(null);

	return null;
};

PWM.prototype.options = function() {
	return this.opts;
};

PWM.prototype.unexport = function() {
	//TODO??
	return bind.pinModeSync(this.gpio, mods.INPUT);
};

//SPI
var SPI = exp.SPI = function(channel, options, cb) {
	var self = this;

	options = options || {};

	$.defaults(options, {
		channel: 0,
		clock: 1000000,
		preBuffering: null,
		postBuffering: null,
		words: 3
	});

	$.extend(this, $.pick(options, 'channel', 'clock', 'preBuffering', 'postBuffering', 'words'));

	//reserve required pins
	['MOSI0','MISO0','SCLK0'].forEach(function(gpio){attachPin(gpio, self, 'SPI')});
	this.pin = attachPin('CE'+this.channel, this);
	this.gpio = pins[this.pin].gpio;
	this.opts = options;

};

SPI.prototype.options = function() {
	return this.opt;
};

SPI.prototype.write = function(data, arg, cb) {
	this.transfer(data, arg, cb);
};

SPI.prototype.read = function(arg, cb) {
	return this.transfer(this.words, arg, cb);
};

SPI.prototype.transfer = function(data, arg, cb) {
	if($.isFunction(arg)){
		cb = arg;
		arg = null;
	}

	var val = 40+Math.random()*100%20;
	if(cb)
		cb(null, val);

	return val;
};

SPI.prototype.unexport = function() {
	//TODO??
	return -1;
};

/*
//LCD
var LCD = exp.LCD = function(gpios, options, cb) {
	var self = this;

	options = options || {};

	$.defaults(options, {
		rows: 2,
		cols: 16,
		bits: 4,
		rs: null,
		strb : null,
		fd: null,
		data: ''
	});

	$.extend(this, $.pick(options, 'rows', 'cols', 'bits'));

	if((gpios.length-2)!==this.bits) {
		var err = new Error('Number of pins are not equal with bits!');
		if(cb)
			cb(err);
		else
			throw err;
	}

	//reserve required pins
	this.pins = gpios.map(function(gpio){
		return attachPin(gpio, self);
	});
	this.gpios = this.pins.map(function(pin){
		return pins[pin].gpio;
	});
	this.opts = options;
	this.rs = this.gpios[0];
	this.strb = this.gpios[1];

	if(this.gpios.length===6)
		var args = [this.rows, this.cols, this.bits].concat(this.gpios,(this.gpios.length===6? [0,0,0,0] : []));

	this.fd = bind.lcdInitSync.apply(null, args);
};

LCD.prototype.clear = function(cb) {
	if(cb)
		bind.lcdClearAsync(this.fd, cb);
	else
		bind.lcdClearSync(this.fd);
};

LCD.prototype.home = function(cb) {
	if(cb)
		bind.lcdHomeAsync(this.fd, cb);
	else
		bind.lcdHomeSync(this.fd);
};

LCD.prototype.write = function(buffer, cb) {
	if(cb)
		bind.lcdPutsAsync(this.fd, buffer, cb);
	else
		bind.lcdPutsSync(this.fd, buffer);
};

LCD.prototype.setPosition = function(x, y, cb) {
	if(cb)
		bind.lcdPositionAsync(this.fd, x, y, cb);
	else
		bind.lcdPositionSync(this.fd, x, y);
};*/

//MCP23s17
var MCP23s17 = exp.MCP23s17 = function(channel, options, cb) {
	var self = this;

	options = options || {};

	//TODO pin number (basePin) conflict resolver
	$.defaults(options, {
		devId: 0,
		basePin: 128
	});

	$.extend(this, $.pick(options, 'devId', 'basePin'));

	//reserve required pins
	['MOSI0','MISO0','SCLK0'].forEach(function(gpio){attachPin(gpio, self, 'SPI')});
	this.pin = attachPin('CE'+this.channel, this);
	this.gpio = (pins[this.pin])? pins[this.pin].gpio : virtualPins[this.pin];
	this.opts = options;

	this.subPins = [];
	for(var i=0; i<16; i++){
		this.subPins.push(new SimpleGpio(this.basePin+i));
	}
};

MCP23s17.prototype.options = function() {
	return this.opt;
};

//export
$.extend(exp, mods);
module.exports = exp;