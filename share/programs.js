var par = require('./paramerters.js'),
	$ = require('enderscore'),
	Parameter = par.Parameter,
	Collection = par.Collection,
	path = require('path'),
	conf = require(path.join(__dirname, 'config.js')),
	knex = require('knex'),
	db = knex({
		client: 'sqlite3',
		connection: {
			filename: conf.dbFilePath
		}
	});


var turbineSpeeds = [30, 40, 50, 60, 70, 80, 90, 100];

exports.schedule = {
	lib: {
		filters: ['timeS', 'timeE'],
		toMin: function(h, m){
			return m+h*60;
		},
		fromMin: function(min){
			var rest = min,
				h, m;

			h = Math.floor(rest/60);
			rest -= h*60;
			m = rest;

			return {
				h: h,
				m: m
			};
		},
		inFilter: function(data){
			var self = this.lib,
				keys;

			self.lib.filters.map(function(name){
				if($.isArray(data[name]))
					keys = [0, 1];
				else
					keys = ['h', 'm'];

				if(name in data)
					data[name] = self.toMin(data[name][keys[0]], data[name][keys[1]]);
			});
		},
		outFilter: function(data){
			var self = this.lib;

			self.lib.filters.map(function(name){
				if(name in data)
					data[name] = self.fromMin(data[name]);
			});
		}
	},
	schema: {
		id: 'increments',
		name: 'string',
		dateS: 'integer',
		dateE: 'integer',
		timeS: 'integer',
		timeE: 'integer',
		program: 'string',
		active: 'boolean',
		editable: 'boolean'
	},
	register: function(cb){
		var self = this;

		db.schema.dropTableIfExists(conf.dbSchT)
		.then(function(){
			db.schema.createTable(conf.dbSchT, function (table) {
				for(var i in self.schema){
					if(i === 'editable')
						table[self.schema[i]](i).defaultTo(true);
					else
						table[self.schema[i]](i);
				}
			}).exec(cb);
		});
	},
	insertBasic: function(cb){
		var lib = this.lib,
			list = Object.keys(self.constructor[0].def).map(function(name){
			return {
				name: name,
				dateS: 0,
				dateE: 6,
				timeS: lib.toMin(0, 0),
				timeE: lib.toMin(23, 59),
				program: name,
				active: false,
				editable: false
			};
		});

		db(conf.dbSchT).insert(list).exec(cb);
	},
	activate: function(name, cb){
		db.transaction(function(trx) {
			return db(conf.dbSchT)
				.transacting(trx)
				.update('active', false)
				.where('active', true)
				.then(function(){
					return db(conf.dbSchT)
						.update('active', true)
						.where('name', name)
				})
				.then(trx.commit)
				.then(trx.rollback);
		})
		.exec(cb);
	},
	add: function(name, data, cb){
		data.name = name;

		this.lib.inFilter(data);

		db(conf.dbSchT)
			.insert(data)
			.exec(cb);
	},
	remove: function(id, cb){
		db(conf.dbSchT)
			.del()
			.where('id', id)
			.exec(cb);
	},
	update: function(id, data, cb){
		this.lib.inFilter(data);

		db(conf.dbSchT)
			.update(data)
			.where('id', id)
			.exec(cb);
	},
	loadCurr: function(cb){
		var self = this,
			date = new Date(),
			day = date.getDay(),
			time = date.getHours()*60+date.getMinutes();

		db(conf.dbSchT)
			.select('*')
			.where('startAtDay', '<', day)
			.andWhere('stopAtDay', '>', day)
			.andWhere('startAtTime', '>', time)
			.andWhere('stopAtTime', '<', time)
			.andWhere('actual', true)
			.tab(self.lib.outFilter)
			.exec(cb);
	},
	loadByName: function(name, cb){
		db(conf.dbSchT)
			.select('*')
			.where('name', name)
			.map(function(rec){
				self.lib.outFilter(rec);
				return rec;
			})
			.exec(cb);
	},
	list: function(cb){
		db(conf.dbSchT)
			.select('name')
			.groupBy('name')
			.exec(cb);
	}
};

exports.programs = {
	//temp, cycTemp, coTemp, helixWork, helixStop, helixOffStop, turbineWork
	constructor: [
		{
			name: 'temp',
			printName: 'pokojowa',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			step: 1,
			min: 0,
			max: 26
		},
		{
			name: 'cycTemp',
			printName: 'kotła',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			step: 1,
			min: 0,
			max: 90
		},
		{
			name: 'coTemp',
			printName: 'co',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			step: 1,
			min: 0,
			max: 90
		},
		{
			name: 'helixWork',
			printName: 'czas podawania',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			step: 1,
			min: 0,
			max: 240
		},
		{
			name: 'helixStop',
			printName: 'przerwa podawania',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			step: 1,
			min: 0,
			max: 240
		},
		{
			name: 'helixOffStop',
			printName: 'przerwa podtrzymania',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			step: 1,
			min: 0,
			max: 240
		},
		{
			name: 'turbineWork',
			printName: 'turbina',
			type: 'switch',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			}
		},
		{
			name: 'turbinSpeed',
			printName: 'prędkosc turbiny',
			type: 'list',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			list: turbineSpeeds
		},
		{
			name: 'cycWork',
			printName: 'czas pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'cycStop',
			printName: 'przerwa pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'coWork',
			printName: 'czas pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'coStop',
			printName: 'przerwa pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'cwuWork',
			printName: 'czas pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		},
		{
			name: 'cwuStop',
			printName: 'przerwa pompy',
			type: 'range',
			def: {
				day: 0,
				night: 0,
				water: 0,
				standby: 0,
				stop: 0
			},
			min: 0,
			max: 240
		}
	],
	register: function(cb){
		var self = this;

		db.schema.dropTableIfExists(conf.dbProT).then(function() {
			db.schema.createTable(conf.dbProT, function (table) {

				table.string('name').unique();

				self.constructor.forEach(function (ele) {
					var type = (self.constructor.type === 'switch') ? 'boolean' : 'integer';
					table[type](ele.name);
				});

			}).exec(cb);
		});
	},
	insertBasic: function(cb){
		var self = this;

		db(conf.dbProT).insert(Object.keys(self.constructor[0].def).map(function(name){
			var prog = {name: name};

			self.constructor.reduce(function(prog, ele){
				prog[ele.name] = ele.def[name];

				return prog;
			}, prog);

			return prog;
		})).exec(cb);
	},
	creator: function(data){
		var self = this,
			one = false,
			ret;

		if(!$.isArray(data)){
			one = true;
			data = [data];
		}

		ret = data.map(function(data){
			return new par.Collection(data.name, {
				printName: data.printName,
				collection: self.constructor.map(function(ele){
					var param = $.omit(ele, 'def');
					param.def = data[ele.name];

					return new par.Parameter(ele.name, param);
				})
			});
		});

		return one? ret[0] : ret;
	},
	load: function(name, cb){
		var self = this,
			query = db(conf.dbProT).select('*');

		if(cb)
			query = query.where('name', name);
		else
			cb = name;

		query.exec(function(err, res){
			if(err)
				return cb(err);

			res = self.creator(res);

			cb(null, res);
		});
	},
	loadAll: function(cb){
		this.load(cb);
	},
	update: function(prog, cb){
		var self = this;

		db(conf.dbProT).update(prog.export()).where('name', prog.name).exec(cb);
	},
	toDefault: function(prog) {
		var self = this,
			name = prog.name;

		self.constructor.forEach(function (prog, ele) {
			prog[ele.name] = ele.def[name];
		});
	},
	setProgram: function(){
		//TODO
	}
};

//module.exports = main;

exports.manual = function(){
	return new Collection('manual', {
		printName: 'praca ręczna',
		collection: [
			new Parameter('speed', {
				type: 'list',
				printName: 'predkosc turbiny',
				def: 30,
				list: turbineSpeeds
			}),
			new Parameter('turbine', {
				type: 'switch',
				printName: 'turbina',
				def: false
			}),
			new Parameter('helix', {
				type: 'switch',
				printName: 'podajnik',
				def: false
			}),
			new Parameter('cycle', {
				type: 'switch',
				printName: 'pompa cykulacyjna',
				def: false
			}),
			new Parameter('co', {
				type: 'switch',
				printName: 'pompa co',
				def: false
			}),
			new Parameter('cwu', {
				type: 'switch',
				printName: 'pompa cwu',
				def: false
			})
		]
	});
};