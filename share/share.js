var net = require('net'),
	util = require('util'),
	path = require('path'),
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
		level: process.argv[3],
		master: (process.argv[4]==='master'),
		name: process.argv[2]
	};

	this.channel = null;
	this.connections = [];

	this.logger = null;

	this.active = false;

	this.sensorsNames = ['cycle', 'co', 'helix', 'fuse', 'inside'];
	this.sensors = $.fill(this.sensorsNames.length, -1);

	this.unitsNames = ['cycle', 'co', 'helix', 'cwu', 'fan'];
	this.units = $.fill(this.unitsNames.length, false);

	this.rangesNames = ['turbine'];
	this.ranges = $.fill(this.rangesNames.length, -1);

	this.owner = null;
	this.ownerLevel = 0;

	Emitter.call(this);
};
util.inherits(System, Emitter);

//TODO check stats and command date, isn't updated?
//TODO reconnect to deamon on disconnect
//TODO info log nie działa
//TODO logger config at end

System.prototype.start = function(){
	var self = this;

	//logger
	self.logger = new winston.Logger({
		transports: [
			new winston.transports.File({
				handleExceptions: false,
				json: false,
				maxsize: 1,
				maxFiles: 120,
				prettyPrint: true,
				filename: path.join(conf.runTemp, 'logs', self.options.name+'.log')
			}),
			new (winston.transports.Console)()
		],
		exitOnError: true
	});

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
		db = knex({
			client: 'sqlite3',
			connection: {
				filename: conf.dbFilePath
			}
		});

		//channel
		var chan = self.channel = net.createServer();

		chan.on('connection', function(c){
			c.setEncoding('utf8');

			c.on('data', function(data){
				data.split(/\n/).forEach(function(data){
					if(!data.length)
						return;

					data = JSON.parse(data.toString());

					if(data.type==='command')
						self.handleCommand(data);
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
				table.integer(name);
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
			table.integer('level');

			self.rangesNames.forEach(function(range){
				table.integer(range);
			});

			self.unitsNames.forEach(function(name){
				table.boolean(name);
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
		var chan = self.channel = net.connect(conf.socketPort);
		self.emit('active');

		chan.setEncoding('utf8');

		chan.on('data', function(data){
			data.split(/\n/).forEach(function(data){
				if(!data.length)
					return;

				data = JSON.parse(data.toString());

				if(data.type==='change') {
					self.handleStats(data);
				} else if(data.type==='reject' && data.owner===self.options.name) {
					self.emit('reject', data.id);
				} else if(data.type==='command') {
					self.handleCommand(data);
					if(data.owner===self.options.name)
						self.emit('accept', data.id);
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
	var index = this.sensorsNames.indexOf(name);

	if(index===-1)
		return;

	return this.sensors[index];
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
	var index = this.unitsNames.indexOf(name);

	if(index===-1)
		return this.log('error', new Error('Unknown unit name!'));

	return this.units[index];
};

System.prototype.setUnit = function(unit, state){
	var self = this,
		units = {};

	if(this.ownerLevel>this.options.level)
		return this.log('info', 'This process not have permission');

	if($.isString(unit)){
		units[unit] = state;
	}else{
		$.extend(units, unit);
	}

	this.handleCommand(units);
};

System.prototype.range = function(name){
	var index = this.rangesNames.indexOf(name);

	if(index===-1)
		return this.log('error', new Error('Unknown range name!'));

	return this.ranges[index];
};

System.prototype.setRange = function(range, value){
	var self = this,
		ranges = {};

	if(this.ownerLevel>this.options.level)
		return this.log('info', 'This process not have permission');

	if($.isString(range)){
		ranges[range] = value;
	}else{
		$.extend(ranges, range);
	}

	this.handleCommand(ranges);
};

//status - data recived or time status dump indicator
System.prototype.handleStats = function(stats){
	var self = this;

	function loadStats(stats){
		var sensorsChange = false;
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
		var data = {
				type: !stats? 'stats' : 'change',
				time: new Date()
			};

		$.defaults(stats, $.unpairs(self.sensorsNames, self.sensors));
		$.extend(data, stats);

		db(conf.dbStatsT).insert(data).exec(function(err){
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

	function idGenerator(){
		return self.options.name+':'+Date.now();
	}

	function loadCommand(command){
		var unitChange = false,
			rangeChange = false;

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

		self.rangesNames.forEach(function(range, index){
			if(!$.has(command, range))
				return;

			var curr = command[range],
				prev = self.ranges[index];

			if(prev!==curr){
				rangeChange = true;
				self.ranges[index] = curr;
				self.emit('range', index, curr, prev);
			}
		});

		if(rangeChange)
			self.emit('ranges');
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

		$.defaults(command, $.unpairs(self.unitsNames, self.units));
		$.defaults(command, $.unpairs(self.rangesNames, self.ranges));
		$.extend(command, data);

		//send to master
		self.send(command);
	} else {
		loadCommand(command);
	}
};

System.prototype.log = function(){
	if($.has(this.logger, 'log'))
		return this.logger.log.apply(this, arguments);
};

module.exports = System;