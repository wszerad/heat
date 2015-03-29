module.exports = function(){
	var Constructor = function(data, schema){
		this.name = data.name;
		this.attributes = {};
		this.previous = {};
		this.schema = schema;

		var value;

		for(var i in schema){
			if(data.attributes[i]!==undefined)
				value = data.attributes[i];
			else if(schema[i].define && schema[i].define[this.name]){
				value = schema[i].define[this.name];
			} else if(schema[i].default){
				value = schema[i].default;
			}else{
				break;
			}

			this.set(i, value);
		}
	};

	Constructor.prototype.printName = function(name){
		if(name in this.schema)
			return this.schema[name].printName;
		else
			return this.name;
	};

	Constructor.prototype.get = function(name){
		return this.attributes[name];
	};

	Constructor.prototype.next = function(name, carusel){
		if(this.schema[name].step && this.schema[name].max<=this.attributes[name]+this.schema[name].step) {
			this.attributes[name] += this.schema[name].step;
		} else if(this.schema[name].enum) {
			var idx = this.schema[name].enum.indexOf(this.attributes[name]);

			if(++idx<this.schema[name].enum.length){
				this.attributes[name] = this.schema[name].enum[idx];
			} else if(carusel){
				this.attributes[name] = this.schema[name].enum[0];
			}
		}

		return this.attributes[name];
	};

	Constructor.prototype.prev = function(name, carusel){
		if(this.schema[name].step && this.schema[name].min>=this.attributes[name]-this.schema[name].step) {
			this.attributes[name] -= this.schema[name].step;
		} else if(this.schema[name].enum) {
			var idx = this.schema[name].enum.indexOf(this.attributes[name]);

			if(--idx>0){
				this.attributes[name] = this.schema[name].enum[idx];
			} else if(carusel){
				this.attributes[name] = this.schema[name].enum[this.schema[name].enum.length-1];
			}
		}

		return this.attributes[name];
	};

	Constructor.prototype.toString = function(name){
		var pre = this.schema[name].pre || '',
			post = this.schema[name].post || '';

		return pre+this.attributes[name]+post;
	};

	Constructor.prototype.default = function(name){
		function setter(name){
			if(this.name in this.schema[name].def){
				this.set(name, this.schema[name].def[this.name]);
			}else if(this.schema[name].default !== undefined){
				this.set(name, this.schema[name].default);
			}
		}

		if(name){
			setter(name);
		}else{
			for(var i in this.schema){
				setter(i);
			}
		}
	};

	Constructor.prototype.getList = function(){
		return this.schema[name].enum;
	};

	Constructor.prototype.set = function(name, value){
		var changed = false;

		if(!(name in this.schema))
			return false;

		if(this.step) {
			if(value>=this.schema[name].min && value<=this.schema[name].max) {
				this.attributes[name] = value;
				changed = true;
			}
		} else if(this.schema[name].enum){
			var idx = this.schema[name].enum.indexOf(value);

			if(idx !== -1) {
				this.attributes[name] = this.values[idx];
				changed = true;
			}
		}

		return changed;
	};

	Constructor.prototype.backup = function(name){
		if(name)
			this.attributes[name] = this.previous[name];
		else{
			for(name in this.previous){
				this.attributes[name] = this.previous[name];
			}
		}
	};

	Constructor.prototype.keep = function(name){
		if(name)
			this.previous[name] = this.attributes[name];
		else{
			for(name in this.previous){
				this.previous[name] = this.attributes[name];
			}
		}
	};

	Constructor.prototype.isChanged = function(name){
		if(name)
			return (this.previous[name] !== this.attributes[name]);
		else{
			for(name in this.previous){
				if(this.previous[name] !== this.attributes[name])
					return true;
			}
		}

		return false;
	};

	return Constructor;
};

