angular.module('scheduleService', ['ngResource'])
	.factory('scheduleServ', ['$resource', function($resource){
		var Schedule = $resource('/schedule', null, {
				'update': {method:'PUT'},
				'activate': {method: 'POST', url:'/schedule/activate'}
			}),
			Event = $resource('/schedule/event', null, {
				'update': {method: 'PUT'}
			}),
			loading = [],
			ret = {
				list: [],
				activate: function(id, cb){
					cb = cb || angular.noop;
					Schedule.activate({id: id}, cb);
				},
				load: function(cb){
					if(loading!==false && !loading.length){
						ret.list = Schedule.query(function(){
							loading.forEach(function(fuu){fuu()});
							loading = false;
						});
					}

					if(loading===false)
						cb();
					else
						loading.push(cb);
				},
				save: function(schedule, cb){
					Schedule.save(schedule, function(save){
						save.events = [];
						ret.list.push(save);
						schedule.id = save.id;

						if(cb)
							cb(save);
					});
				},
				update: function(curr, schedule, cb){
					var update = Schedule.update(schedule, cb);
					angular.extend(schedule, update);
					ret.list[curr.schedule] = update;
				},
				remove: function(curr, cb){
					Schedule.delete({id: ret.list[curr.schedule].id}, cb);
					ret.list.splice(curr.schedule, 1);
				},
				attach: function(curr, event, forEvery){
					var days = [event.day],
						start = event.start;

					if(forEvery)
						days = [0,1,2,3,4,5,6];

					ret.list[curr.schedule].events.some(function(event){
						if(event.start===start)
							days.splice(event.day, 1);
					});

					days.forEach(function(day){
						var schedule = ret.list[curr.schedule];

						event = angular.copy(event);
						event.schedule_id = schedule.id;
						event.day = day;
						Event.save(event, function(save){
							schedule.events.push(save);
							schedule.events.sort(function(x, y ){return x.start>y.start;})
						});
					});
				},
				detach: function(curr, forEvery){
					var cevent = ret.list[curr.schedule].events[curr.event],
						days = [cevent.day],
						start = cevent.start,
						program = cevent.program_id;

					if(forEvery)
						days = [0,1,2,3,4,5,6];

					var index = 0,
						events = ret.list[curr.schedule].events,
						len = events.length,
						event, similar;

					while(index<len){
						event = events[index];
						similar = (days.indexOf(event.day)!==-1);

						if(similar && event.start===start && event.program_id===program){
							Event.delete({id: event.id});
							events.splice(index, 1);

							len--;
							continue;
						}

						index++;
					}
				},
				reattach: function(curr, now, forEvery){
					var prev = ret.list[curr.schedule].events[curr.event],
						days = [prev.day],
						start = prev.start;

					if(forEvery)
						days = [0,1,2,3,4,5,6];

					ret.list[curr.schedule].events.forEach(function(event){
						var similar = (days.indexOf(event.day)!==-1);

						if(similar && event.start===start){
							var update = Event.update(now);
							angular.extend(now, update);
							ret.list[curr.schedule].events[curr.event] = update;
						}
					});
				}
			};

		return ret;
	}]);