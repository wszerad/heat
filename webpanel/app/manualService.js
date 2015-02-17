angular.module('manualService', ['ngResource', 'models'])
	.factory('ManualFactory', ['$resource', '$interval', 'status-model', 'command-model', function($resource, $interval, StatusModel, CommandModel){
		var Manual = $resource('/manual'),
			Stats = $resource('/stats'),
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
				refresh: function(){
					Stats.get(function(data){
						var time = Date.now(),
							limit = 120;

						ret.unitView.forEach(function(ele){
							if(!(ele.name in ret.unitLinks))
								return;

							var dataList = ret.unitLinks[ele.name].data;

							ret.unit[ele.name] = data[ele.name];

							if(dataList.unshift([time, data[ele.name]])>limit)
								dataList.pop();
						});

						ret.statusView.forEach(function(ele){
							if(!(ele.name in ret.statusLinks))
								return;

							var dataList = ret.statusLinks[ele.name].data;

							ret.status[ele.name] = data[ele.name];

							if(dataList.unshift([time, data[ele.name]])>limit)
								dataList.pop();
						});
					});
				},
				reset: function(){
					//CommandModel.toDefault(ret.unit);
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