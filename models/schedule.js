var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/schedule.js');

//Relations
require('./event.js');
require('./program.js');

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema);

	var proto = {
		events: function() {
			return this.hasMany('Event', 'schedule_id');
		},
		programs: function(){
			return this.hasMany('Program').through('Event');
		}
	};

	var statc = {},
		_init = Model.init;

	statc.init = function(cb){
		var self = this;

		_init(function(err){
			if(err)
				cb(err);
			else{
				var defs = Bookshelf.Collection.extend({model: self}).forge();

				for(var i in statc.predefined){
					defs.add(statc.predefined[i]);
				}

				defs.mapThen(function(model){
					return model.save(null, {method: 'insert'}).then(function(){return 'ok';});
				}).exec(cb);
			}
		});
	};

	statc.list = function(name, cb){
		var self = this;

		if(!cb){
			cb = name;
			name = null;
		}

		if(!name)
			self.fetchAll().exec(function(err, res){
				if(err)
					return cb(err);

				cb(null, res.toJSON());
			});
		else
			self.where('name', name).fetch().exec(function(err, res){
				if(err)
					return cb(err);

				cb(null, res.toJSON());
			});
	};

	statc.activate = function(id, cd){
		var self = this;
		self.where({active: true}).fetch().then(function(model){
			var next = function(){
				console.log(id, _.isNumber(id));

				if(_.isNumber(id))
					self.where({id: id}).fetch().then(function(model){
						model.save({active: true}).exec(cd);
					});
				else
					self.where({name: id}).fetch().then(function(model){
						model.save({active: true}).exec(cd);
					});
			};

			if(model)
				model.save({active: false}).then(function(){
					next();
				});
			else
				next();
		});
	};

	statc.predefined = {
		1: {id: 1, name: 'off', basic: true, active: false},
		2: {id: 2, name: 'daily', basic: true, active: true}
	};

	return Bookshelf.model('Schedule', Model.extend(proto, statc));
};

