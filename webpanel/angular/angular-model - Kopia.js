'use strict';
(function() {
	angular.module('ngModel', ['ng']).
		factory('$model', ['$log', function($log){
			return function(schema){

				var Schema = function(schema){
					this.raw = schema;
				};



				var ObjectManipulator = function(obj){
					this.getRange = function(name){
						var range = schema[name].enum || schema[name].range || false;

						if(!range){
							range = {};
							range.min = schema[name].min;
							range.max = schema[name].max;
							range.step = schema[name].step || 1;
						}

						return range;
					};

					this.next = function(name, carusel){
						var now = obj[name],
							range = this.getRange(name);

						if(now===undefined)
							$log('Attribute has no initial value');

						if(angular.isArray(range)) {
							var idx = range.indexOf(now);

							if(++idx<range.length){
								now = range[idx];
							} else if(carusel){
								now = range[0];
							}
						} else {
							now = now+range.step;
							if(range.max && now>range.max)
								now = range.max;
						}

						obj[name] = now;
						return now;
					};

					this.prev = function(name){
						var now = obj[name],
							range = this.getRange(name);

						if(now===undefined)
							$log('Attribute has no initial value');

						if(angular.isArray(range)) {
							var idx = range.indexOf(now);

							if(--idx>0){
								now = range[idx];
							} else if(carusel){
								now = range[range.length-1];
							}
						} else {
							now = now-range.step;
							if(range.min && now<range.min)
								now = range.max;
						}

						obj[name] = now;
						return now;
					};

					this.toDefault = function(){
						ObjectManipulator.toDefault(obj, arguments[0]);
					};
				};
			
				ObjectManipulator.toDefault = function(obj, names){
					if(names)
						names = [].concat(names);
					else
						names = ObjectManipulator.getAttributes();

					names.forEach(function(name){
						if(schema[name] && schema[name].default!==undefined)
							obj[name] = schema[name].default;
					});
				};
				
				//ObjectManipulator.prototype.getTexts =
				ObjectManipulator.getTexts = function(names){
					if(names)
						names = [].concat(names);
					else
						names = ObjectManipulator.getAttributes();
					
					return name.map(function(name){
						return ObjectManipulator.getText(name);
					});
				};
				
				//ObjectManipulator.prototype.getText =
				ObjectManipulator.getText = function(name){
					return schema[name].text;
				};
				
				//ObjectManipulator.prototype.getTypes =
				ObjectManipulator.getTypes = function(names){
					if(names)
						names = [].concat(names);
					else
						names = ObjectManipulator.getAttributes();
					
					return name.map(function(name){
						return ObjectManipulator.getTtype(name);
					});
				};
				
				///ObjectManipulator.prototype.getType =
				ObjectManipulator.getType = function(name){
					return schema[name].type;
				};
				
				//ObjectManipulator.prototype.getAttributes =
				ObjectManipulator.getAttributes = function(){
						return Object.keys(schema);
					};

				//ObjectManipulator.prototype.getView =
				ObjectManipulator.getView = function(name, props){
					if(props)
						props = [].concat(props);
					else
						props = ObjectManipulator.getAttributes();
					
					var ret = {
						name: name
					};

					props.forEach(function(prop){
						ret[prop] = schema[name][prop];
					});

					return ret;
				};

				//ObjectManipulator.prototype.getViews =
				ObjectManipulator.getViews = function(props){
					var self = ObjectManipulator;
					return self.getAttributes().map(function(name){
						return self.getView(name, props);
					});
				};
				
				return ObjectManipulator;
			}
		}]);
})();