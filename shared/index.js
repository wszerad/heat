/********************************************/
/*                                          */
/*
/*
/*
/****************************************** */

var fs = require('fs'),
	util = require('util'),
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

var System = _.System = function(name, level){
	this.sensorStream = null;
	this.commandStream = null;
	this.commandFile = null;
	this.senorFile = null;
	this.errorFile = null;
	this.active = false;
	this.working = false;
	this.sensors = [0, 0, 0, 0, 0, 0, 0, 0];
	this.decoders = [null, null, null, null, null, null, null, null];
	this.units = [false, false, false, false, false, false, false, false];
	//this.unitsTime = $.fill(this.units.length, Date.now());
	this.lastRecord = null;
	this.lastRecordTime = null;
	this.writer = false;
	this.level = 0;
	this.curentLevel = 0;

	Emitter.call(this);
};
util.inherits(System, EventEmitter);

System.prototype.start = function(){
	this.working = true;

	if(writer){
		this.sensorStream = fs.createWriteStream(this.senorFile);
		this.commandStream = fs.createReadStream(this.commandStream);
	}else{
		this.sensorStream = fs.createReadStream(this.senorFile);
		this.commandStream = fs.createWriteStream(this.commandStream);
	}
	//TODO readstrems
	//TODO write Strems
	//TODO add events
};

System.prototype.stop = function(){
	this.working = false;
};

System.prototype.sendLog = function(){
	var data = [dateFormater(), this.owner, this.ownerLevel].concat(this.readSensors(), this.readUnits()).join('\t') + '\n';
	this.sensorStream.write(data);
};

System.prototype.readSensors = function(){
	var self = this;

	return this.sensors.map(function(sensor, index){
		return (self.decoders[index]? self.decoders[index](sensor) : sensor);
	});
};

System.prototype.readUnits = function(){
	return this.units.slice(0);
};

System.prototype.writeUnit = function(unit, state){
	if(!$.has(this.units, unit) && $.isBoolean(state))
		throw new Error();

	if(this.units[unit]!==state && this.curentLevel<=this.level){
		this.units[unit] = state;
		this.emit('change', 'unit', unit);
		this.sendCommand();
		//TODO emit change
		//TODO send command
	}
};

System.prototype.sendCommand = function(){
	this.commandStream.write([dateFormater(), this.name, this.level].concat(this.units));
};

System.prototype.updateSensors = function(data){
	var self = this;
	var sensorsChange = false;
	var unitsChange = false;

	data = data.split('\n').pop().split('\t');

	this.lastRecordTime = Date.parse(data.pop());
	this.owner = data.pop();
	this.ownerLevel = data.pop()*1;

	this.sensors.forEach(function(prev, index, sensors){
		var curr = data[index];

		if(prev!==curr){
			sensorsChange = true;
			sensors[index] = curr;
			self.emit('sensor', index, curr, prev);
		}
	});

	data = data.slice(8);

	this.units.forEach(function(prev, index, units){
		var curr = data[index];

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

System.prototype.updateCommands = function(data){
	var unitsChange = false;

	data = data.split('\n').pop().split('\t');

	this.lastRecordTime = Date.parse(data.pop());
	this.owner = data.pop();
	this.ownerLevel = data.pop()*1;

	this.units.forEach(function(prev, index, units){
		var curr = data[index];

		if(prev!==curr){
			unitsChange = true;
			units[index] = curr;
			self.emit('unit', index, curr, prev);
		}
	});

	if(unitsChange)
		this.emit('units');
};

System.prototype.writeError = function(err, cb){
	if(!cb)
		cb = noop;

	//TODO error styling, add owner, time add other informations, write each to file

	//fs.writeFile(this.errorFile, err, cb);
};