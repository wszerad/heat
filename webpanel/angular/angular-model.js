'use strict';
(function() {
	angular.module('ngModel', ['ng']).
		factory('$model', ['$log', function($log){
			return function(schema){
				var Schema = function(schema){
					this.schema = schema;
				};

				Schema.prototype.toDefault = function(obj, names){
					var schema = this.schema,
						self = this;

					if(angular.isArray(names))
						names = [].concat(names);
					else if(angular.isFunction(names))
						names = self.getAttributes(names);
					else
						names = self.getAttributes();

					names.forEach(function(name){
						if(schema[name] && schema[name].default!==undefined)
							obj[name] = schema[name].default;
					});
					
					return obj;
				};

				Schema.prototype.validate = function(){

				};

				Schema.prototype.validateAll = function(){

				};

				Schema.prototype.getTexts = function(names){
					var self = this;

					if(angular.isArray(names))
						names = [].concat(names);
					else if(angular.isFunction(names))
						names = self.getAttributes(names);
					else
						names = self.getAttributes();

					return names.map(function(name){
						return self.getText(name);
					});
				};

				Schema.prototype.getText = function(name){
					var schema = this.schema;

					return schema[name].text;
				};

				Schema.prototype.getTypes = function(names){
					var self = this;

					if(angular.isArray(names))
						names = [].concat(names);
					else if(angular.isFunction(names))
						names = self.getAttributes(names);
					else
						names = self.getAttributes();

					return names.map(function(name){
						return self.getType(name);
					});
				};

				Schema.prototype.getType = function(name){
					var schema = this.schema;

					return schema[name].type;
				};

				Schema.prototype.getAttributes = function(filter){
					var schema = this.schema,
						self = this,
						keys = Object.keys(schema);

					if(filter){
						keys = keys.reduce(function(arr, curr){
							if(filter(schema[curr], curr, self)){
								arr.push(curr);
							}

							return arr;
						}, []);
					}

					return keys;
				};

				Schema.prototype.getView = function(name, props){
					var schema = this.schema;

					var ret = {
						name: name
					};

					props.forEach(function(prop){
						ret[prop] = schema[name][prop];
					});

					return ret;
				};

				Schema.prototype.getViews = function(names, props){
					var self = this;

					if(props===undefined){
						props = names;
						names = null;
					}
					
					if(angular.isArray(names))
						names = [].concat(names);
					else if(angular.isFunction(names))
						names = self.getAttributes(names);
					else
						names = self.getAttributes();

					return names.map(function(name){
						return self.getView(name, props);
					});
				};

				return new Schema(schema);
			}
		}]);
})();