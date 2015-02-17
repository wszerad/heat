angular.module('programService', ['ngResource', 'models'])
	.factory('ProgramFactory', ['$resource', 'program-model', function($resource, ProgramModel){
		var Program = $resource('/program', null,  {
				'update': { method:'PUT' }
			}),
			loading = [],
			ret = {
				list: [],
				load: function(cb){
					if(loading!==false && !loading.length){
						ret.list = Program.query(function(){
							loading.forEach(function(fuu){fuu()});
							loading = false;
						});
					}

					if(loading===false)
						cb();
					else
						loading.push(cb);
				},
				reset: function(){
					angular.copy([], ret.list);
				},
				paramList: function(){
					return ProgramModel.getViews(function(curr){return curr.editable}, ['text','type', 'category', 'enum']);
				},
				save: function(index, program){
					if(index===null && !program.id){
						Program.save(program, function(save){
							program.id = save.id;
							ret.list.push(program);
						});
					}else{
						ret.list[index] = program;
						Program.update(program);
					}
				},
				default: function(program){
					var basic = program.basic,
						name = program.name;

					if(basic){
						ProgramModel.getAttributes().forEach(function(attr){
							if(attr==='name')
								return;

							var def = ProgramModel.getView(attr, 'def').def || false;

							if(def && (name in def)){
								program[attr] = def[name];
							}else{
								ProgramModel.toDefault(program, attr);
							}
						});
					}else
						ProgramModel.toDefault(program);
				},
				delete: function(index){
					Program.delete({id: ret.list[index].id});
					ret.list.splice(index, 1);
				}
			};

		return ret;
	}]);