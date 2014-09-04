/********************************************/
/*                                          */
/*
/*
/*
/****************************************** */

var fs = require('fs'),
	net = require('net'),
	util = require('util'),
    argv = require('minimist')(process.argv.slice(2)),
	Emitter = require('events').EventEmitter,
	noop = function(){},
	Parser = require('fixedline'),
	$ = require('enderscore');


var _ = {};

var dateFormater = function(date){
	if(!date)
		date = new Date();

	function extender(num){
		if(num<10)
			return '0'+num;
		else
			return ''+num;
	}

	var data = [date.getFullYear(), date.getMonth()+1, date.getDate()].map(extender).join('/');
	data += ' ';
	data += [date.getHours(), date.getMinutes(), data.getSeconds()].map(extender).join(':');
	return data;
};

var System = _.System = function(opt){
	this.options = opt;
	/*= {
		name: '',
		level: 0,
		master: false,
		socket: 8000,
		runTemp: nul
	};*/

	this.channel = null;
	this.connections = [];

	this.connected = false;
	//this.runTemp = null;
	this.statusLogger = null;

	this.active = false;
	this.working = false;

	this.sensors = [0, 0, 0, 0, 0, 0, 0, 0];
	this.sensorsNames = [];
	this.units = [false, false, false, false, false, false, false, false];
	this.unitsNames = [];

	//this.unitsTime = $.fill(this.units.length, Date.now());
	this.recordTime = null;
	this.owner = null;
	this.ownerLevel = null;

	Emitter.call(this);
};
util.inherits(System, EventEmitter);

//TODO add winston, handle errors, start unit after allmodules working start


System.prototype.start = function(){
	var master = this.options.master;
	var self = this;
	var chan;
	this.working = true;

	if(master){
		//parser
		var scheme = {
			time: {
				type: String,
				size: 19
			},
			owner: {
				type: String,
				size: 8
			},
			ownerLevel: {
				type: Number,
				size: 1
			}
		};

		this.unitsNames.forEach(function(unit){
			scheme[unit] = {
				type: Boolean,
				size: 5
			}
		});

		this.sensorsNames.forEach(function(sensor){
			scheme[sensor] = {
				type: Number,
				size: 3
			}
		});

		this.statusLogger = new Parser(scheme);

		//load last config from log
		var last = this.statusLogger.getLine(this.options.runTemp+'status.log', -1, true);
		if(this.recordTime===null)
			this.updateStatus(last);

		//channel
		chan = this.channel = net.createServer();

		chan.listen(this.options.socket, function() { //'listening' listener
			console.log('server bound');
		});

		chan.on('connection', function(c){
			c.setEncoding('utf8');

			c.on('data', function(data){
				data = JSON.parse(data);

				if(data.type==='command')
					self.executeComamnd(data);
			});

			c.on('end', function(){
				console.log('server disconnected');
			});

			chan.on('error', function(){});

			self.connections.push(c);
		});

		chan.on('error', function(){});
	} else {
		chan = net.connect(this.options.socket, function(){
			self.connected = true;
		});

		chan.setEncoding('utf8');

		chan.on('data', function(data){
			data = JSON.parse(data);

			if(data.type==='status')
				self.updateStatus(data);
		});

		chan.on('close', function(){});

		chan.on('error', function(){});

		this.connections.push(chan);
	}
};

System.prototype.stop = function(){
	this.working = false;
};

System.prototype.sensor = function(name){
	var index = this.sensorsNames.indexOf(name);

	if(index===-1)
		return;

	return this.sensors[index];
};

//TODO warning
System.prototype.unit = function(name){
	var index = this.unitsNames.indexOf(name);

	if(index===-1)
		return;

	return this.units[index];
};

//TODO handle permissions error
System.prototype.setUnit = function(unit, state){
	var unitsCopy = this.units.slice();

	if(this.ownerLevel<=this.options.level)
		return;

	if(!$.isObject(unit)){
		unitsCopy[unit] = state;
	}else if(!$.isArray(unit)){
		this.unitsNames.reduce(function(arr, name, index){
			if($.has(unit, name))
				arr[index] = unit[name];
		}, unitsCopy);
	}

	this.sendCommand(unitsCopy);
};

System.prototype.setSensor = function(sensor, value){
	this.sensors[sensor] = value;

	this.logStatus();
};

System.prototype.sendCommand = function(units){
	function idGenerator(){
		return Date.now()+':'+this.options.name;
	}

	var data = {
		id: idGenerator(),
		type: 'command',
		owner: this.owner,
		level: this.ownerLevel,
		units: this.units.slice(0)
	};

	this.channel.write(JSON.stringify(data));
};

System.prototype.updateStatus = function(data){
	var self = this;
	var sensorsChange = false;
	var unitsChange = false;

	this.recordTime = Date.now();
	this.owner = data.owner;
	this.ownerLevel = data.level;
	this.commandID = data.id;

	this.sensors.forEach(function(prev, index, sensors){
		var curr = data.sensors[index];

		if(prev!==curr){
			sensorsChange = true;
			sensors[index] = curr;
			self.emit('sensor', index, curr, prev);
		}
	});

	this.units.forEach(function(prev, index, units){
		var curr = data.units[index];

		if(prev!==curr){
			unitsChange = true;
			units[index] = curr;
			self.emit('unit', index, curr, prev);
		}
	});

	if(sensorsChange)
		this.emit('sensors');
	if(unitsChange)
		this.emit('units');
};

System.prototype.executeComamnd = function(data){
	if(data.options.level >= this.ownerLevel){
		this.updateStatus(data);
		this.distributeStatus();
		this.logStatus();
		//this.logCommand();
	}
};

//TODO init channel, commandID
System.prototype.distributeStatus = function(){
	var data = {
		id: this.commandID,
		type: 'status',
		owner: this.owner,
		level: this.ownerLevel,
		units: this.units.slice(0),
		sensors: this.sensors.slice(0)
	};

	this.channel.write(JSON.stringify(data));
};

//TODO init statusLogger, statusPath
//TODO handle errors
System.prototype.logStatus = function(){
	var data = this.statusLogger.encode([
		dateFormater(),
		this.owner,
		this.ownerLevel
	].concat(this.units, this.sensors));

	fs.writeFile(this.options.runTemp+'status.log', data, function(err){

	});
};

module.exports = new System(argv);

/*
 //TODO init commandsLogger, commandsPath
 //TODO handle errors
 System.prototype.logCommand = function(){
 var data = this.statusLogger.encode([
 dateFormater(),
 this.owner,
 this.ownerLevel
 ].concat(this.units, this.sensors));

 fs.writeFile(this.statusPath, data, function(err){

 });

 //write log about command
 };*/

/*
System.prototype.writeError = function(err, cb){
	if(!cb)
		cb = noop;

	//TODO error styling, add owner, time add other informations, write each to file

	//fs.writeFile(this.errorFile, err, cb);
};*/