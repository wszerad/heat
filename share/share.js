var net = require('net'),
	util = require('util'),
	path = require('path'),
	Emitter = require('events').EventEmitter,
	$ = require('enderscore'),
	conf = require('./config.js'),
	startTime = Date.now(),
	commandCounter = 0;

//init sensors
var def = {
	sensorsNames: conf.StatusModel.getViews(function(sensor){return !!sensor.show;}, []).map(function(sensor){return sensor.name;}),
	unitsNames: conf.CommandModel.getViews(function(unit){return !!unit.isParameter;}, []).map(function(unit){return unit.name;})
};

function loadCommand(command){
	var self = this,
		unitChange = false;

	self.owner = command.owner;
	self.ownerLevel = command.level;

	def.unitsNames.forEach(function(unit, index){
		if(!$.has(command.units, unit))
			return;

		var curr = command.units[unit],
			prev = self.units[index];

		if(prev!==curr){
			unitChange = true;
			self.units[index] = curr;
			self.emit('unit', unit, curr, prev, index);
		}
	});

	if(unitChange)
		self.emit('units');
}

var System = function(){
	this.options = {
		level: process.argv[3],
		master: (process.argv[4]==='master'),
		name: process.argv[2],
		socket: process.argv[5]
	};

	this.channel = null;
	this.connections = [];
	this.active = false;

	this.commands = {};
	this.stack = [];
	this.sensors = $.fill(def.sensorsNames.length, -1);
	this.units =  $.fill(def.unitsNames.length, false);

	this.owner = null;
	this.ownerLevel = 999;

	Emitter.call(this);
};
util.inherits(System, Emitter);

//TODO check stats and command date, isn't updated?
//TODO reconnect to deamon on disconnect

System.prototype.start = function(){
	var self = this;
	console.log(self.options.name+' ready');

	//connection with master
	process.on('message', function(data){
		switch (data.type){
			case 'ping':
				process.send({type: 'ping', name: self.options.name, ram: process.memoryUsage()});
				break;
			case 'ready':
				self.activate();
				break;
		}
	});

	if(self.options.master) {
		//channel
		var chan = self.channel = net.createServer(function(c){
			c.setEncoding('utf-8');

			c.on('data', function(data){
				data.split(/\n/).forEach(function(data){
					if(!data.length)
						return;

					data = JSON.parse(data.toString());

					if(data.type==='command')
						self.handleCommand(data);
					else if(data.type==='recall')
						self.handleRecall(data);
					else if(data.type==='custom'){
						self.emit(data.event, data);
						self.send(data);
					}
				});
			});

			c.on('end', function(){
				self.log('info', 'Channel ended')
			});

			c.on('error', function(err){
				self.log('error', err);
			});

			self.connections.push(c);
		});

		chan.on('error', function(err){
			self.log('error', err);
		});

		chan.listen(conf.socketPort, function() { //'listening' listener
			console.log('Master process listen :'+conf.socketPort);
			process.send({type: 'register', name: self.options.name});
			self.emit('start');
		});
	} else {
		process.send({type: 'register', name: self.options.name});
		self.emit('start');
	}
};

//TODO close socket and database
System.prototype.stop = function(){
	var self = this;

	self.emit('stop');
};

System.prototype.send = function(data){
	data = JSON.stringify(data)+'\n';

	if(this.options.master) {
		this.connections.forEach(function(channel){
			channel.write(data);
		});
	} else {
		this.channel.write(data);
	}
};

System.prototype.sendEvent = function(event, data){
	this.send({
		type: 'custom',
		event: event,
		data: data
	});
};

//connect to socket
System.prototype.activate = function(){
	var self = this;
	this.active = true;

	if(!this.options.master){
		var chan = self.channel = net.connect(conf.socketPort, function(){
			console.log('Connect to master ('+self.options.name+')');
			self.emit('active');
		});

		chan.setEncoding('utf8');

		chan.on('data', function(data){
			data.split(/\n/).forEach(function(data){
				if(!data.length)
					return;

				data = JSON.parse(data.toString());

				if(data.type==='change') {
					self.handleStats(data);
				} else if(data.type==='postponed' && data.owner===self.options.name) {
					self.emit('postpone', data.id);

					if(data.id in self.commands)
						self.commands[data.id].emit('postpone');
				} else if(data.type==='command') {
					self.handleCommand(data);
					if(data.owner===self.options.name) {
						self.emit('accept', data.id);

						if(data.id in self.commands)
							self.commands[data.id].emit('postpone');
					}
				} else if(data.type==='custom'){
					self.emit(data.event, data);
				}
			});
		});

		chan.on('error', function(err){
			self.log('error', err);
		});
	}else{
		self.emit('active');
	}
};

System.prototype.sensor = function(name){
	var index = def.sensorsNames.indexOf(name);

	if(index===-1) {
		throw new Error('Unknown range name.');
	}

	return this.sensors[index];
};

System.prototype.sensorAll = function(){
	var self = this,
		data = {};

	def.sensorsNames.forEach(function(name, index){
		data[name] = self.sensors[index];
	});

	return data;
};

System.prototype.setSensor = function(sensor, value){
	var self = this,
		sensors = {};

	if($.isString(sensor)){
		sensors[sensor] = value;
	}else{
		$.extend(sensors, sensor);
	}

	this.handleStats(sensors);
};

System.prototype.unit = function(name){
	var index = def.unitsNames.indexOf(name);

	if(index===-1)
		throw new Error('Unknown unit name.');

	return this.units[index];
};

System.prototype.unitAll = function(){
	var self = this,
		data = {};

	def.unitsNames.forEach(function(name, index){
		data[name] = self.units[index];
	});

	return data;
};

System.prototype.setUnit = function(unit, state){
	var self = this,
		units = {},
		index;

	if($.isString(unit)) {
		units[unit] = state;
		unit = units;
	}

	for(var i in unit){
		index = def.unitsNames.indexOf(i);
		self.units[index] = unit[i];
	}
};

//status - data recived or time status dump indicator
System.prototype.handleStats = function(stats){
	var self = this;

	function loadStats(stats){
		var sensorsChange = false;
		self.emit('update');

		def.sensorsNames.forEach(function(sensor, index){
			if(!$.has(stats, sensor))
				return;

			var curr = stats[sensor],
				prev = self.sensors[index];

			if(prev!==curr){
				sensorsChange = true;
				self.sensors[index] = curr;
				self.emit('sensor', index, curr, prev);
			}
		});

		if(sensorsChange)
			self.emit('sensors');
	}
	
	if(self.options.master) {
		var date = new Date(),
			data = {
				type: !stats? 'stats' : 'change',
				time: date,
				timeout: date,
				m: date.getMinutes()
			};

		if(data.type==='change'){
			data.timeout += 15*60*1000;
		} else {
			switch (date.m){
				case 0:
					data.timeout += 7*24*60*60*1000;
					break;
				case 15:
				case 30:
				case 45:
					data.timeout += 24*60*60*1000;
					break;
				default :
					data.timeout += 60*60*1000;
					break;
			}
		}

		$.defaults(stats, $.unpairs(def.sensorsNames, self.sensors));
		$.extend(data, stats);

		conf.StatusKnex.insert(data).exec(function(err){
			if(err)
				self.log('error', err);
		});

		//send stats
		if(stats){
			self.send(data);
			loadStats(stats);
		}
	} else {
		loadStats(stats);
	}
};

System.prototype.handleCommand = function(command){
	var self = this;

	if(self.options.master) {
		self.stack.push(command);

		if(command.level > self.ownerLevel || !self.active) {
			self.send({
				id: command.id,
				owner: command.owner,
				type: 'postponed'
			});
			console.log('postpone command');
		} else {
			console.log('receive command');
			self.selectStack(command);
		}
	} else {
		loadCommand.call(self, command);
	}
};

System.prototype.handleRecall = function(recall){
	var self = this;

	if(recall.id in self.stack)
		delete self.stack[recall.id];

	self.selectStack();
};

System.prototype.selectStack = function(command){
	var self = this,
		selected = command || null,
		data = {
			m: new Date().getMinutes()
		},
		curr;

	if(!command)
		for(var i in self.stack){
			curr = self.stack[i];

			if(!selected || curr.level>selected.level || (curr.level==selected.level && curr.time>selected.time))
				selected = curr;
		}

  if(!selected)
      return;
               
	$.extend(data, $.omit(selected, ['type', 'units']));
	$.extend(data, selected.units);
	data.time = new Date(selected.time)*1;
	conf.CommandKnex.insert(data).exec(function (err) {
		if (err)
			self.log('error', err);
	});

	if(self.owner!==selected.owner)
		console.log('Master change command owner: '+selected.owner+' ('+selected.id+')');

	loadCommand.call(self, selected);

	self.send(selected);
};

System.prototype.log = function(level, msg, meta){
	var self = this;

	conf.LogsModel.forge({
			label: self.options.name,
			level: level,
			message: msg,
			meta: (meta)? meta.toString() : '',
			timestamp: Date.now()
		})
		.save()
		.then(function(){
			var isError = msg instanceof Error;

			console.log(level, msg, isError? msg.stack : '');
		});
};

System.prototype.stats = function(){
	//TODO
	var self = this,
		data = {
			level: self.ownerLevel,
			owner: self.owner,
			units: $.unpairs(def.unitsNames, self.units),
			sensors: $.unpairs(def.sensorsNames, self.sensors)
		};

	return data;
};

var Command = function(level){
	function idGenerator(){
		return _System.options.name+':'+startTime+':'+(commandCounter++);
	}

	this.id = idGenerator();
	this.active = false;
	this.startTime = null;
	this.level = level || null;

	var units = {};
	$.extend(units, $.unpairs(def.unitsNames, _System.units));
	this.units = units;

	Emitter.call(this);
};
util.inherits(Command, Emitter);

Command.prototype.start = function(){
	var self = this;

	this.startTime = new Date();
	this.active = true;

	var data = {
		id: self.id,
		type: 'command',
		owner: _System.options.name,
		level: self.level || _System.options.level,
		time: new Date(),
		units: self.units
	};

	//send to master
	_System.commands[this.id] = this;
	_System.send(data);
};

Command.prototype.stop = function(){
	this.active = false;

	var data = {
		id: this.id,
		type: 'recall',
		time: new Date()
	};

	//send to master
	delete _System.commands[this.id];
	_System.send(data);
};

Command.prototype.destroy = function(){
	this.stop();

	if(this.id in _System.commands)
		delete _System.commands[this.id];
};

Command.prototype.unit = function(name){
	var index = def.unitsNames.indexOf(name);

	if(index===-1)
		throw new Error('Unknown unit name.');

	return this.units[index];
};

Command.prototype.unitAll = function(){
	var self = this,
		data = {};

	this.unitsNames.forEach(function(name, index){
		data[name] = self.units[index];
	});

	return data;
};

Command.prototype.setUnit = function(unit, state){
	var self = this,
		changed = false,
		units = {};

	if($.isString(unit)) {
		units[unit] = state;
		unit = units;
	}

	for(var i in unit){
		if(self.units[i] !== unit[i])
			changed = true;

		self.units[i] = unit[i];
	}

	if(self.active && changed)
		self.start();
};

var _System = new System();
exports.System = function(){
	return _System;
};

exports.Command = function(){
	var com = new Command();
	return com;
};