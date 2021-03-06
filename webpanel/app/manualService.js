angular.module('manualService', ['ngResource', 'models'])
	.factory('ManualFactory', ['$resource', '$interval', 'status-model', 'command-model', function($resource, $interval, StatusModel, CommandModel){
		var Manual = $resource('/manual', null, {'update': { method:'PUT' }}),
			Stats = $resource('/stats'),
			Condition = $resource('/stats/condition'),
			ret = {
				loaded: false,
				status: StatusModel.toDefault({}),
				unit: CommandModel.toDefault({}),
				statusView: StatusModel.getViews(['text', 'type', 'category', 'enum', 'show']),
				unitView: CommandModel.getViews(['text', 'type', 'category', 'enum', 'show']),
				unitLinks: {},
				statusLinks: {},
				unitHistory: [],
				statusHistory: [],
				history: function(mode, cb){
					Condition.get({mod: mode}, function(data){
						var status = [],
							res = {
								status: status
							};

						ret.statusView.forEach(function(ele){
							if(ele.category==='none')
								return;

							var label = {
									label: ele.text,
									data: []
								},
								list = label.data;

							status.push(label);

							for(var i=0; i<data.sensors.length; i++){
								list.push([data.sensors[i].time, data.sensors[i][ele.name]]);
							}
						});

						cb(res);
					});
				},
				refresh: function(){
					Stats.get(function(data){
						var time = Date.now(),
							limit = 120;

						ret.unitView.forEach(function(ele){
							if(!(ele.name in ret.unitLinks))
								return;

							var dataList = ret.unitLinks[ele.name].data;

							var val = ret.unit[ele.name] = data.units[ele.name];

							if(dataList.unshift([time, val])>limit)
								dataList.pop();
						});

						ret.statusView.forEach(function(ele){
							if(!(ele.name in ret.statusLinks))
								return;

							var dataList = ret.statusLinks[ele.name].data;

							var val = ret.status[ele.name] = data.sensors[ele.name];

							if(dataList.unshift([time, val])>limit)
								dataList.pop();
						});
					});
				},
				reset: function(){
					//CommandModel.toDefault(ret.unit);
				},
				update: function(){
					Manual.update(ret.unit);
				},
				start: function(){
					Manual.save(ret.unit);
				},
				stop: function(){
					Manual.delete();
				}
			};

		ret.statusView.forEach(function(ele){
			if(ele.category==='none')
				return;

			var label = {
				label: ele.text,
				data: []
			};

			ret.statusLinks[ele.name] = label;
			ret.statusHistory.push(label)
		});

		ret.unitView.forEach(function(ele){
			if(ele.category==='none')
				return;

			var label = {
				label: ele.text,
				data: []
			};

			ret.unitLinks[ele.name] = label;
			ret.unitHistory.push(label);
		});

		$interval(function(){
			ret.refresh();
		}, 5000);
		ret.refresh();

		return ret;
	}]);