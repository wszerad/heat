var express = require('express'),
	simulate = require('./dataInsert.js'),
	//system = require('../../share/share.js'),
	//share = system.System,
	//Command = system.Command,
	//Promise = require("bluebird"),
	app = express(),
	path = require('path'),
	api = require('routes/api.js'),
	prog = require('../../share/programs.js'),
	programs = prog.programs,
	conf = require(path.join(__dirname, '../../share', 'config.js')),
	db = conf.db;

//commands
//var command = new Command(),
//	manual = prog.manual();

app.put('/command/start', function(req, res){
	//command.start();
	res.json({status: 'done'});
});

app.put('/command/stop', function(req, res){
	//command.stop();
	res.json({status: 'done'});
});

app.put('/command/change', function(req, res){
	var name = req.query.name,
		value = req.query.value;//,
	//	status = manual.set(name, value);

	//command.set(manual.export());
	res.json({done: status});
});

//programs
app.get('/programs', function (req, res) {
	var name = req.query.name,
		next = function(err, data){
			res.json(data);
		};

	if(!name)
		programs.loadAll(next);
	else
		programs.load(name, next);
});

app.put('programs/delete', function(req, res){
	var name = req.query.name;

	programs.del()
});

app.put('programs/edit', function(req, res){
	var name = req.query.name;

	programs.del()
});

app.put('programs/new', function(req, res){
	var name = req.query.name;

	programs.del()
});

app.put('programs/reset', function(req, res){
	var name = req.query.name;

	programs.del()
});

//stats
app.get('/stats', function (req, res) {
	res.json(simulate.stats());
	//res.json(share.stats());
});

app.get('/stats/condition', function (req, res) {
	var results = {
			sensors: [],
			units: []
		},
		type = req.query.type || 'hour',
		start = parseInt(req.query.time) || Date.now(),
		sensors = db(conf.dbStatsT).select('co', 'cycle', 'helix', 'fuse', 'inside', 'time'),
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
		var units = db(conf.dbComT).
			select('turbine', 'cycle', 'co', 'helix', 'cwu', 'fan','turbine','time').
			where('time', '>=', start).
			where('time', '<', end);

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
});

//logs
app.get('/log/cat', function(req, res){
	var levels = db(conf.dbLogT).select('level').groupBy('level'),
		modules = db(conf.dbLogT).select('label').groupBy('label'),
		ret = {
			filters: [],
			modules: []
		};

	levels.exec(function(){
		console.log(arguments);
	});

	levels.then(function(data){
		ret.filters = data;
		modules.then(function(data){
			ret.modules = data;
			res.json(ret);
		});
	});
});

app.get('/log', function (req, res) {
	var mod = req.query.mod,
		filter = req.query.filter;
		/*time = req.query.time,
		start = new Date(time.getFullYear(), time.getMonth(),  time.getDate(), 0),
		end = new Date(time.getFullYear(), time.getMonth(),  time.getDate(), 24),
		limit = req.query.limit || 20,
		offset = req.query.offset || 0;*/

	var query = db(conf.dbLogT).select('*');

	if(mod && mod!='all')
		query.where('label', mod);

	if(filter && filter!='all')
		query.where('filter', filter);

	/*if(time)
		query.where('time', '>=', start).where('time', '<', end);*/

	query.
	//	limit(limit).
	//	offset(offset).
		exec(function(err, data){
			res.json(data);
		});
});

app.put('/log/clear', function(req, res){
	var mod = req.query.mod,
		filter = req.query.filter;

	var query = db(conf.dbLogT).del();

	if(mod && mod!='all')
		query.where('label', mod);

	if(filter && filter!='all')
		query.where('filter', filter);

	query.exec(function(){
		res.json({status: 'done'});
	});
});

app.use(express.static(path.join(__dirname, '..', '/dist')));
app.listen(3000);