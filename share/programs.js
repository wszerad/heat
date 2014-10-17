var path = require('path'),
	conf = require(path.join(__dirname, 'config.js')),
	knex = require('knex'),
	db = knex({
		client: 'sqlite3',
		connection: {
			filename: conf.dbFilePath
		}
	});

exports.programs = {
	loaded: {},
	def: {

	},
	schema: function(cb){
		var self = this;

		db.schema.dropTableIfExists(conf.dbProT).then(function(){
			db.schema.createTable(conf.dbProT, function (table) {

				table.string('name').unique() ;
				table.boolean('turbineWork');
				table.integer('turbineSpeed');
				table.integer('helixWork');
				table.integer('helixStop');
				table.integer('helixOffWork');
				table.integer('helixOffStop');
				table.integer('cycWork');
				table.integer('cycStop');
				table.integer('coWork');
				table.integer('coStop');
				table.integer('cwWork');
				table.integer('cwStop');
				table.integer('temp');
				table.integer('cycTemp');
				table.integer('coTemp');
				table.integer('cwuTemp');

			}).then(function(){
				var insert = Object.keys(self.def).map(function(prog){
					return self.def[prog];
				});

				db(conf.dbProT).insert(insert).exec(cb);
			});
		});
	},
	uploadDefault: function(name, cb){
		var self = this;

		if(name in self.def)
			db(conf.dbProT).update(self.def[name]).where('name', self.def[name].name).exec(cb);
	},
	load: function(name, cb){
		var self = this,
			query = db(conf.dbProT).select('*');

		if(!cb) {
			cb = name;
			name = null;
		}

		if(name)
			query = query.where('name', name);

		query.exec(function(err, res){
			if(err)
				return cb(err);

			cb(null, res.reduce(function(obj, prog){
				self.loaded[prog.name] = prog;
				obj[prog.name] = prog;
				return obj;
			}, ret));
		});
	},
	loadCurrent: function(cb){
		var date = new Date(),
			day = date.getDay(),
			time = date.getHours()*60+date.getMinutes();

		db(conf.dbSchT).select('name', 'date').where('startAtDay', '<', day).andWhere('stopAtDay', '>', day).andWhere('startAtTime', '>', time).andWhere('stopAtTime', '<', time).andWhere('actual', true).exec(function(err, res){
			if(err)
				return cb(err);

			if(!res.some(function(prog, index){
				if(prog.date){
					cb(null, ret[index]);
					return true;
				}

				return false;
			})){
				cb(null, res[0]);
			}
		});
	},
	change: function(now, cb){
		if('name' in now)
			db(conf.dbProT).update(now).where('name', now.name).exec(cb);
	},
	clone: function(name){
		var self = this,
			ret = {};

		if(name in self.def){
			for(var i in self.def[name]){
				ret[i] = self.def[name][i];
			}
		}

		return ret;
	}
};

module.exports = main;