var path = require('path'),
	conf = require('../../share/config.js'),
	Share = require('../../share/share.js'),
	share = Share.System(),
	Command = Share.Command,
	Promise = require("bluebird"),
	command;

share.start();

var api = {};
var manual = api.manual = {};

manual.start = function(req, res){
	var data = req.body;

	if(command)
		command.stop();

	command = Command();
	command.setUnit(data);
	command.start();
	console.log('command start');

	res.json({status: 'done'});
};

manual.update = function(req, res){
	var data = req.body;

	if(command)
		command.setUnit(data);

	res.json({status: 'done'});
};

manual.stop = function(req, res){
	if(command)
		command.stop();

	res.json({status: 'done'});
};

/*
commands.change = function(req, res){
	var name = req.query.name,
		value = req.query.value;//,
	//	status = manual.set(name, value);

	//command.set(manual.export());
	res.json({done: status});
};*/

//programs
var programs = api.programs = {};

programs.list = function (req, res) {
	var name = req.query.name,
		next = function(err, data){
			res.json(data);
		};

	if(!name)
		conf.ProgramModel.list(next);
	else
		conf.ProgramModel.list(name, next);
};

programs.insert = function(req, res, next){
	var data = req.body;

	if('id' in data)
		delete data.id;

	conf.ProgramModel.forge(data).save()
		.then(function(data){
			res.json(data);
		})
		.catch(function(err){
			next(err);
		});
};

programs.update = function(req, res, next){
	var data = req.body;

	conf.ProgramModel.forge(data).save()
		.then(function(data){
			share.sendEvent('program', data.id);
			res.json(data);
		})
		.catch(function(err){
			next(err);
		});
};

programs.delete = function(req, res, next){
	var id = req.query.id;
	conf.ProgramModel.forge({id: id}).destroy()
		.tap(function(){
			conf.knex('events')
				.where('program_id', id)
				.del();
		})
		.then(function(data){
			res.json(data);
		})
		.catch(function(err){
			next(err);
		});
};

//schedule
var schedule = api.schedule = {};

schedule.list = function (req, res, next) {
	var id = req.query.id;

	if(!id){
		conf.ScheduleModel.forge()
			.fetchAll({
				withRelated: ['events']
			})
			.then(function(data){
				res.json(data.toJSON());
			})
			.catch(function(err){
				next(err);
			});
	} else {
		conf.ScheduleModel.forge({id: id})
			.fetch({
				withRelated: ['events']
			})
			.then(function(data){
				res.json(data);
			})
			.catch(function(err){
				next(err);
			});
	}
};

schedule.insert = function(req, res, next){
	var data = req.body;

	if('id' in data)
		delete data.id;

	conf.ScheduleModel.forge(data).save()
		.then(function(data){
			res.json(data);
		})
		.catch(function(err){
			next(err);
		});
};

schedule.update = function(req, res, next){
	var data = req.body;

	conf.ScheduleModel.forge(data).save()
		.then(function(data){
			share.sendEvent('schedule', data.id);
			res.json(data);
		})
		.catch(function(err){
			next(err);
		});
};

schedule.delete = function(req, res, next){
	var id = req.query.id;

	conf.ScheduleModel.forge({id: id}).destroy()
		.tap(function(data){
			conf.knex('events')
				.where('schedule_id', id)
				.del();
		})
		.then(function(data){
			res.json(data);
		})
		.catch(function(err){
			next(err);
		});
};

schedule.attach = function(req, res, next){
	var data = req.body;

	conf.EventModel.forge(data).save()
		.then(function(data){
			res.json(data);
		})
		.catch(function(err){
			next(err);
		});
};

schedule.detach = function(req, res, next){
	var id = req.query.id;

	conf.EventModel.forge({id: id}).destroy()
		.then(function(data){
			res.json(data);
		})
		.catch(function(err){
			next(err);
		});
};

schedule.reattach = function(req, res, next){
	var data = req.body;

	conf.EventModel.forge(data).save()
		.then(function(data){
			res.json(data);
		})
		.catch(function(err){
			next(err);
		});
};

//stats
var stats = api.stats = {};

stats.stats = function (req, res) {
	res.json(share.stats());
};

stats.condition = function (req, res) {
	var results = {
			sensors: [],
			units: []
		},
		type = req.query.type || 'hour',
		start = parseInt(req.query.time) || Date.now(),
		sensors = conf.StatusKnex.select('co', 'cycle', 'helix', 'fuse', 'inside', 'time'),
		end, plus;

	switch (type){
		case 'day':
			plus = 1000*60*60*24;
			sensors.where('m', 'in', [0,15,30,45]);
			break;
		case 'week':
			plus = 1000*60*60*24*7;
			sensors.where('m', 0);
			break;
		default :
			plus = 1000*60*60;
			sensors.where('m', 0);
	}

	if(start+plus>Date.now()){
		start = Date.now()-plus;
	}

	end = new Date(start+plus);
	start = new Date(start);

	sensors.
		where('time', '>=', start).
		where('time', '<', end);

	if(type == 'hour'){
		var units = conf.CommandKnex
			.select('turbine', 'cycle', 'co', 'helix', 'cwu', 'fan','turbine','time')
			.where('time', '>=', start)
			.where('time', '<', end);

		Promise.join(units, sensors, function(uni, sen){
			results['sensors'] = sen;
			results['units'] = uni;

			res.json(results);
		});
	} else {
		sensors.exec(function (err, data) {
			results['sensors'] = data;
			res.json(results);
		})
	}
};

//logs
var log = api.log = {};

log.cat = function(req, res){
	var levels = conf.LogsKnex.select('level').groupBy('level'),
		modules = conf.LogsKnex.select('label').groupBy('label'),
		ret = {
			filters: [],
			modules: []
		};

	levels.then(function(data){
		ret.filters = data.map(function(row){
			return {name: row.level, type: row.level};
		});

		modules.then(function(data){
			ret.modules = data.map(function(row){
				return {name: row.label, type: row.label};
			});

			res.json(ret);
		});
	});
};

log.logs = function (req, res) {
	var mod = req.query.mod,
		filter = req.query.filter;
	/*time = req.query.time,
	 start = new Date(time.getFullYear(), time.getMonth(),  time.getDate(), 0),
	 end = new Date(time.getFullYear(), time.getMonth(),  time.getDate(), 24),
	 limit = req.query.limit || 20,
	 offset = req.query.offset || 0;*/

	var query = conf.LogsKnex.select('*');

	if(mod && mod!='all')
		query.where('label', mod);

	if(filter && filter!='all')
		query.where('level', filter);

	/*if(time)
	 query.where('time', '>=', start).where('time', '<', end);*/

	query.
		//	limit(limit).
		//	offset(offset).
		exec(function(err, data){
			res.json(data);
		});
};

log.clear = function(req, res){
	var mod = req.query.mod,
		filter = req.query.filter;

	var query = conf.LogsKnex.del();

	if(mod && mod!='all')
		query.where('label', mod);

	if(filter && filter!='all')
		query.where('filter', filter);

	query.exec(function(){
		res.json({status: 'done'});
	});
};

module.exports = api;