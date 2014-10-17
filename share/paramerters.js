var $ = require('enderscore');

var Parameter = function(name, opt){
	this.name = name;
	this.value = opt.def;
	this.prevValue = opt.def;
	this.step = null;
	this.type = opt.type;
	this.printName = opt.printName;

	switch (opt.type){
		case 'switch':
			this.values = [true, false];
			break;
		case 'list':
			this.values = opt.list;
			break;
		case 'range':
		default :
			this.step = opt.step;
			this.values = [opt.min, opt.max];
			this.type = 'range';
	}
};

Parameter.prototype.next = function(){
	if(this.step) {
		if(this.value<this.values[1])
			this.value += this.step;

	} else {
		var idx = this.values.indexOf(this.value);

		if(++idx<this.values.length)
			this.value = this.values[idx];
	}

	return this.value;
};

Parameter.prototype.prev = function(){
	if(this.step) {
		if(this.value>this.values[0])
			this.value -= this.step;

	} else {
		var idx = this.values.indexOf(this.value);

		if(--idx>-1)
			this.value = this.values[idx];
	}

	return this.value;
};

Parameter.prototype.getList = function(){
	if(this.step)
		return null;
	else
		return this.values;
};

Parameter.prototype.set = function(value){
	var changed = false;

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
	this.printName = opt.printName;

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
		if(this.has(i))
			this.collection[i].set(name[i]);
		else
			throw new Error('Collection not contain element such '+i);
	}
};

Collection.prototype.export = function(){
	return $.clone(this.collection);
};

exports.Collection = Collection;
exports.Parameter = Parameter;

//switch
//range
//list