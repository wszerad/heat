angular.module('debuggerService', ['ngResource'])
	.factory('debuggerServ', ['$resource', function($resource){
		var Debugger = $resource('/log', null, {
					filters: {
						method: 'GET',
						url: '/log/cat'
					}
				}),
			loading = [],
			ret ={
				list: [],
				modules: [{type: 'all', name: 'Brak'}],
				filters: [{type: 'all', name: 'Wszystkie'}],
				load: function(cb){
					if(loading!==false&& !loading.length){
						ret.list = Debugger.query(function(){
							loading.forEach(function(fuu){
								fuu()
							});
							loading=false;
						});
					}

					if(loading===false)
						cb();
					else
						loading.push(cb);
				},
				checkFilters: function(){
					Debugger.filters(function(data){
						ret.filters.splice.apply(ret.filters, [1, ret.filters.length].concat(data.filters));
						ret.modules.splice.apply(ret.modules, [1, ret.modules.length].concat(data.modules));
					});
				},
				search: function(mod, filter){
					Debugger.query({
							mod: mod,
							filter: filter
						},
						function(data){
							angular.copy(data, ret.list);
					});
				},
				clear: function(mod, filter){
					var params;

					if(mod || filter){
						params = {};
					}else{
						params = {
							mod: mod,
							filter: filter
						};
					}

					Debugger.delete(params, function(){
						ret.list.splice(0, ret.list.length);
					});
				}
			};

		return ret;
	}]);