var par = require('./paramerters.js'),
	Parameter = par.Parameter,
	Collection = par.Collection,path = require('path'),
	conf = require(path.join(__dirname, 'config.js')),
	knex = require('knex'),
	db = knex({
		client: 'sqlite3',
		connection: {
			filename: conf.dbFilePath
		}
	});


var turbineSpeeds = [30, 40, 50, 60, 70, 80, 90, 100];

exports.programs = {
	cache: null,
	//temp, cycTemp, coTemp, helixWork, helixStop, helixOffStop, turbineWork
	constructor: [
		{
			name: 'temp',
			printName: 'temperatury, pokojowa',
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
			printName: 'temperatury, kotła',
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
			printName: 'temperatury, co',
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
			printName: 'podajnik, czas podawania',
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
			printName: 'podajnik, przerwa podawania',
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
			printName: 'podajnik, przerwa podtrzymania',
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
			printName: 'turbina, turbina',
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
			name: 'turbineWork',
			printName: 'turbina, prędkosc turbiny',
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
			printName: 'pompa cyrkulacyjna, czas pompy',
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
			printName: 'pompa cyrkulacyjna, przerwa pompy',
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
			printName: 'pompa co, czas pompy',
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
			printName: 'pompa co, przerwa pompy',
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
			printName: 'pompa cwu, czas pompy',
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
			printName: 'pompa cwu, przerwa pompy',
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
	schema: function(cb){
		var self = this;

		db.schema.dropTableIfExists(conf.dbProT).then(function(){
			db.schema.createTable(conf.dbProT, function (table) {

				table.string('name').unique() ;

				self.constructor.forEach(function(ele){
					var type = (self.constructior.type==='switch')? 'boolean' : 'integer';
					table[type](ele.name);
				});

			}).then(function(){
				db(conf.dbProT).insert(Object.keys(self.constructor[0].def).map(function(name){
					var prog = {name: name};

					self.constructor.reduce(function(prog, ele){
						prog[ele.name] = ele.def[name];

						return prog;
					}, prog);

					return prog;
				})).exec(cb);
			});
		});
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

					return new par.Parameter(param);
				})
			});
		});

		return one? ret[0] : ret;
	},
	loadCurrent: function(cb){
		var self = this,
			date = new Date(),
			day = date.getDay(),
			time = date.getHours()*60+date.getMinutes();

		db(conf.dbSchT).select('name', 'date').where('startAtDay', '<', day).andWhere('stopAtDay', '>', day).andWhere('startAtTime', '>', time).andWhere('stopAtTime', '<', time).andWhere('actual', true).exec(function(err, res){
			if(err)
				return cb(err);

			//TODO
			if(!res.some(function(prog, index){
				if(prog.date && prog.date === date){
					cb(null, self.creator(ret[index]));
					return true;
				}

				return false;
			})){
				cb(null, self.creator(res[0]));
			}
		});
	},
	load: function(name, cb){
		var self = this,
			query = db(conf.dbProT).select('*');

		if(name)
			query = query.where('name', name);

		query.exec(function(err, res){
			if(err)
				return cb(err);

			res = self.creator(res);

			self.cache[res.name] = res;
			cb(null, res);
		});
	},
	loadAll: function(cb){
		this.load(null, cb);
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