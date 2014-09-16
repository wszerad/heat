var fs = require('fs'),
	net = require('net'),
	util = require('util'),
	path = require('path'),
    argv = require('minimist')(process.argv.slice(2)),
	winston = require('winston'),
	Emitter = require('events').EventEmitter,
    co = require('co'),
	//thunk = require('thunkify'),
	knex = require('knex'),
	$ = require('enderscore'),
	conf = require('./config.js'),
	db;

var System = function(){
	this.options = {
		level: argv.l,
		master: argv.m,
		name: argv.n,
		clean: argv.c
	};

	this.channel = null;
	this.connections = [];

	this.logger = null;

	this.active = false;
	this.working = false;
	this.isUpdate = false;

	this.slaveTimer = null;

	this.sensors = [0, 0, 0, 0, 0, 0, 0, 0];
	this.sensorsNames = [];
	this.units = [false, false, false, false, false, false, false, false];
	this.unitsNames = [];

	this.owner = null;
	this.ownerLevel = null;

	Emitter.call(this);
};
util.inherits(System, EventEmitter);

//TODO test multiprocess one file logger
System.prototype.start = function(callback){
	var self = this;
	this.working = true;

	//logger
	self.logger = new winston.Logger({
		transports: [
			new winston.transports.File({
				handleExceptions: true,
				json: true,
				maxsize: 1,
				maxFiles: 120,
				filename: path.join(self.options.runTemp, 'logs', self.options.name)
			})],
		exitOnError: false
	});

	//connection with master
	process.on('message', function(data){
		switch (data.type){
			case 'ping':
				process.send({type: 'ping', name: self.options.name, ram: process.memoryUsage()});
				clearTimeout(self.slaveTimer);

				self.slaveTimer = setTimeout(function(){
					process.exit(0);
				}, conf.slavePing);
				break;
			case 'register':
				self.activate();
				break;
		}
	});

	if(self.options.master) {
		db = knex({
			client: 'sqlite3',
			connection: {
				filename: path.join(self.options.runTemp, 'db.sqlite')
			}
		});

		//channel
		var chan = self.channel = net.createServer();

		chan.on('connection', function(c){
			c.setEncoding('utf8');

			c.on('data', function(data){
				data = JSON.parse(data);

				if(data.type==='command')
					self.handleCommand(data);
			});

			c.on('end', function(){
				self.log('info', 'Channel ended')
			});

			chan.on('error', function(err){
				self.log('error', err);
			});

			self.connections.push(c);
		});

		chan.on('error', function(err){
			self.log('error', err);
		});

		chan.listen(self.options.socket, function() { //'listening' listener
			process.send({type: 'register', name: self.options.name});
			callback();
		});
	} else {
		process.send({type: 'register', name: self.options.name});
		callback();
	}
};

//TODO close socket and database
System.prototype.stop = function(){
	this.working = false;


};

System.prototype.send = function(data){
	data = JSON.parse(data);

	if(this.options.master) {
		this.connections.forEach(function(channel){
			channel.write(data);
		});
	} else {
		this.channel.write(data);
	}
};

//connection with master
System.prototype.register = function(){
	var self = this;

	process.send({type: 'register', name: self.options.name});

	process.on('message', function(data){
		switch (data.type){
			case 'ping':
				process.send({type: 'ping', name: self.options.name, ram: process.memoryUsage()});
				clearTimeout(self.slaveTimer);

				self.slaveTimer = setTimeout(function(){
					process.exit(0);
				}, conf.slavePing);
				break;
			case 'register':
				self.activate();
				break;
		}
	});
};

System.prototype.prepareDB = function(callback){
	var self = this;

	//stats
	var stats = co(function *(){
		var hasStats = yield db.schema.hasTable(conf.dbStatsT);

		if(hasStats)
			yield db.schema.dropTable(conf.dbStatsT);

		yield db.schema.createTable(conf.dbStatsT, function (table) {
			table.timestamp('time');
			table.enu('type', ['change', 'stats']);

			self.sensorsNames.forEach(function(name){
				table.boolean(name);
			});
		});
	});

	//commands
	var commands = co(function *(){
		var hasStats = yield db.schema.hasTable(conf.dbComT);

		if(hasStats)
			yield db.schema.dropTable(conf.dbComT);

		yield db.schema.createTable(conf.dbComT, function (table) {
			table.string('id').unique();
			table.timestamp('time');
			table.string('owner');
			table.number('level');
			table.boolean('renewable');

			self.unitsNames.forEach(function(name){
				table.number(name);
			});
		});
	});

	co(function *(){
		yield [stats, commands];
	})(callback);
};

//connect to socket
System.prototype.activate = function(){
	var self = this;
	this.active = true;

	if(!this.options.master){
		var chan = self.channel = net.connect(this.options.socket);

		chan.setEncoding('utf8');

		chan.on('data', function(data){
			data = JSON.parse(data);

			if(data.type==='status') {
				self.handleStats(data);
				if(data.owner===self.options.name)
					self.emit('accept', data.id);
			} else if(data.type==='reject' && data.owner===self.options.name) {
				self.emit('reject', data.id);
			} else if(data.type==='command') {
				self.handleCommand(data);
			}
		});

		chan.on('error', function(err){
			self.log('error', err);
		});
	}
};

System.prototype.sensor = function(name){
	var index = this.sensorsNames.indexOf(name);

	if(index===-1)
		return;

	return this.sensors[index];
};

System.prototype.setSensor = function(sensor, value){
	var self = this,
		sensors = {};

	if($.isString(sensor)){
		sensors[unit] = value;
	}else {
		$.extend(sensors, sensor);
	}

	this.handleStats(sensors);
};

System.prototype.unit = function(name){
	var index = this.unitsNames.indexOf(name);

	if(index===-1)
		return this.log('error', new Error('Unknown unit name!'));

	return this.units[index];
};

System.prototype.setUnit = function(unit, state){
	var self = this,
		units = {};

	if(this.ownerLevel<=this.options.level)
		return this.log('info', 'This process not have permission');

	if($.isString(unit)){
		units[unit] = state;
	}else {
		$.extend(units, unit);
	}

	this.handleCommand(units);
};

//status - data recived or time status dump indicator
System.prototype.handleStats = function(stats){
	var self = this;

	function loadStats(stats){
		var sensorsChange = false;
		self.isUpdate = true;
		self.emit('update');

		self.sensorsNames.forEach(function(sensor, index){
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
		var timeStats = !stats,
			data = {
				type: !stats? 'stats' : 'change',
				time: new Date()
			};

		if(timeStats)
			stats = {};

		$.default(stats, $.unpairs(self.sensorsNames, self.sensors));
		$.extend(data, stats);

		db(conf.dbStatsT).insert(data).exec(function(err){
			if(err)
				self.log('error', err);
		});

		loadStats(stats);

		//send stats
		if(!timeStats)
			self.send(data);
	} else {
		loadStats(stats);
	}
};

System.prototype.handleCommand = function(command){
	var self = this;

	function idGenerator(){
		return self.options.name+':'+Date.now();
	}

	function loadCommand(command){
		var unitChange = false;

		self.owner = command.owner;
		self.ownerLevel = command.level;

		self.unitsNames.forEach(function(unit, index){
			if(!$.has(command, unit))
				return;

			var curr = command[unit],
				prev = self.units[index];

			if(prev!==curr){
				unitChange = true;
				self.units[index] = curr;
				self.emit('unit', index, curr, prev);
			}
		});

		if(unitChange)
			self.emit('units');
	}

	if(self.options.master) {
		if (command.level < self.ownerLevel || !self.active) {
			return self.channel.write({
				id: command.id,
				owner: command.owner,
				type: 'reject'
			});
		}

		loadCommand(command);

		//log into database
		db(conf.dbComT).insert(command).exec(function (err) {
			if (err)
				self.log('error', err);
		});

		//send command
		self.send(command);
	} else if(!command.id){
		var data = {
			id: idGenerator(),
			type: 'command',
			owner: self.owner,
			level: self.ownerLevel,
			time: new Date()
		};

		$.default(command, $.unpairs(self.unitsNames, self.units));
		$.extend(data, command);

		//send to master
		self.send(command);
	} else {
		loadCommand(command);
	}
};

System.prototype.log = this.logger.log;

module.exports = new System(argv);