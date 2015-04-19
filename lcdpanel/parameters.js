var $ = require('enderscore');

var utils = {
	modelToCollection: function(data, schema){
		return new Collection(data.name, {
			text: data.text,
			collection: schema.map(function(ele){
				ele.default = data[ele.name];
				return new Parameter(ele.name, ele);
			})
		});
	}
};

var Parameter = function(name, opt){
	this.name = name;
	this.value = opt.default;
	this.prevValue = opt.default;
	this.step = null;
	this.type = opt.type;
	this.text = opt.text;
	this.isParameter = true;
	this.listeners = [];

	switch (opt.type){
		case 'sign':
		case 'boolean':
			this.values = [true, false];
			break;
		case 'enum':
			this.values = opt.enum;
			break;
		case 'integer':
		default :
			this.step = opt.step;
			this.values = [opt.min, opt.max];
	}
};

Parameter.prototype.next = function(){
	var self = this;

	if(this.step) {
		if(this.value<this.values[1])
			this.value += this.step;

	} else {
		var idx = this.values.indexOf(this.value);
		console.log(idx);
		if(++idx<this.values.length)
			this.value = this.values[idx];
	}

	this.listeners.forEach(function(cb){
		cb(self.name, self.value);
	});

	return this.value;
};

Parameter.prototype.prev = function(){
	var self = this;

	if(this.step) {
		if(this.value>this.values[0])
			this.value -= this.step;

	} else {
		var idx = this.values.indexOf(this.value);

		if(--idx>-1)
			this.value = this.values[idx];
	}

	this.listeners.forEach(function(cb){
		cb(self.name, self.value);
	});

	return this.value;
};

Parameter.prototype.getList = function(){
	if(this.step)
		return null;
	else
		return this.values;
};

Parameter.prototype.set = function(value){
	var self = this,
		changed = false;

	if(this.step) {
		if(value>=this.values[0] && value<=this.values[1]) {
			this.value = value;
			changed = true;
		}
	} else {
		var idx = this.values.indexOf(value);

		if(idx !== -1) {
			this.value = this.values[idx];
			changed = true;
		}
	}

	if(changed)
		this.listeners.forEach(function(cb){
			cb(self.name, self.value);
		});

	return changed;
};

Parameter.prototype.get = function(){
	return this.value;
};

Parameter.prototype.backup = function(){
	this.value = this.prevValue;
};

Parameter.prototype.keep = function(){
	this.prevValue = this.value;
};

Parameter.prototype.isChanged = function(){
	return (this.prevValue===this.value);
};

var Collection =  function(name, opt){
	var self = this;

	this.name = name;
	this.text = opt.text;
	this.isCollection = true;

	this.collection = {};
	opt.collection.forEach(function(ele){
		if(!(ele instanceof Parameter))
			throw new Error('Collection can contain only Parameters');

		self.collection[ele.name] = ele;
	});
};

Collection.prototype.has = function(name){
	return (name in this.collection);
};

Collection.prototype.get = function(name){
	if(this.has(name))
		return this.collection[name].get();
	else
		throw new Error('Collection not contain element such '+name);
};

Collection.prototype.set = function(name, value){
	var sets = {};

	if($.isString(name))
		sets[name] = value;

	name = sets;

	for(var i in name){
		if(this.has(i)) {
			this.collection[i].set(name[i]);
			this.listeners.forEach(function(listener){
				listener(i, name[i]);
			});
		} else
			throw new Error('Collection not contain element such '+i);
	}
};

Collection.prototype.backup = function(){
	for(var i in this.collection){
		this.collection[i].backup();
	}
};

Collection.prototype.keep = function(){
	for(var i in this.collection){
		this.collection[i].keep();
	}
};

Collection.prototype.isChanged = function(){
	for(var i in this.collection){
		if(this.collection[i].isChanged())
			return true;
	}

	return false;
};

Collection.prototype.export = function(){
	var ret = {};

	for(var i in this.collection){
		ret[i] = this.collection[i].value;
	}

	return ret;
};

Collection.prototype.listen = function(cb){
	for(var i in this.collection){
		this.collection[i].listeners.push(cb);
	}
};

Collection.prototype.unlisten = function(cb){
	var item;
	for(var i in this.collection){
		item = this.collection[i];

		for(var j=0;j<item.listeners.length;){
			if(item.listeners[j]===cb){
				item.listeners.splice(j, 1);
			} else {
				j++;
			}
		}
	}
};

exports.Collection = Collection;
exports.Parameter = Parameter;
exports.utils = utils;

//switch
//range
//list