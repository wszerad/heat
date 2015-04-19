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

programs.list = function (req, res, next) {
	var name = req.query.name,
		next = function(err, data){
			if(err)
				next(err);

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

	conf.ProgramModel.getViews(function(curr){return curr.type==='integer'}, []).forEach(function(curr){
		data[curr.name] *= 1;
	});

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

	conf.ProgramModel.getViews(function(curr){return curr.type==='integer'}, []).forEach(function(curr){
		data[curr.name] *= 1;
	});

	conf.ProgramModel.forge(data).save()
		.then(function(data){
			//share.sendEvent('program', data.id);
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

schedule.activate = function (req, res, next) {
	var id = req.body.id;

	conf.ScheduleModel.activate(id, function(err){
		if(err)
			next(err);

		res.json({date: 'done'});
	});
};

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
			//share.sendEvent('schedule', data.id);
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
	/*
  var data = {
		level: 0,
		owner: 'webpanel',
		units: conf.CommandModel.getViews(null, []).reduce(function(obj, ele){obj[ele.name] = false; return obj;}, {}),
		sensors: conf.StatusModel.getViews(null, ['default']).reduce(function(obj, ele){obj[ele.name] = ele.default; return obj;}, {})
	};
	data.units.turbineSpeed = 60;

	res.json(data);*/
	res.json(share.stats());
};

stats.condition = function (req, res, next) {
	var results = {},
		type = req.query.mod || 'hour',
		sensors = conf.StatusKnex.select('*').where('type', 'stats');

	switch (type){
		case 'day':
			sensors.where('m', 'in', [0,15,30,45]);
			break;
		case 'week':
			sensors.where('m', 0);
			break;
	}

	sensors.exec(function (err, data) {
		if(err)
			next(err);

		results['sensors'] = data;
		res.json(results);
	});
	/*
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

			conf.StatusModel.getAttributes(function(ele){return ele.show===true;})
			results['sensors'] = data;
			res.json(results);
		})
	}*/
};

//logs
var log = api.log = {};

log.cat = function(req, res, next){
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
		}).catch(function(err){
			next(err);
		});
	}).catch(function(err){
		next(err);
	});
};

log.logs = function (req, res, next) {
	var mod = req.query.mod,
		filter = req.query.filter,
		where = {};

	if(mod && mod!='all')
		where.label = mod;

	if(filter && filter!='all')
		where.level = filter;

	conf.LogsKnex.select().where(where).
		exec(function(err, data){
			if(err)
				next(err);

			res.json(data);
		});
};

log.clear = function(req, res, next){
	var mod = req.query.mod,
		filter = req.query.filter,
		where = {};

	if(mod && mod!='all')
		where.label = mod;

	if(filter && filter!='all')
		where.filter = filter;

	conf.LogsKnex.del().where(where).exec(function(err){
		if(err)
			next(err);

		res.json({status: 'done'});
	});
};

module.exports = api;