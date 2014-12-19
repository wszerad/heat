var path = require('path'),
	conf = require(path.join(__dirname, '../../share', 'config.js')),
	knex = require('knex'),
	db = knex({
		client: 'sqlite3',
		connection: {
			filename: conf.dbFilePath
		}
	});

var stats = exports.stats = function(){
	var date = new Date(),
		day = date.getDate(),
		min = date.getMinutes(),
		i = 0;

	return {
		units: {
			id: 'idx'+(i++),
			time: date,
			owner: 'my',
			level: 1,
			turbine: (day<7)? 40 : 60,
			cycle: min%2==1,
			co: (min%20>5),
			helix: !(min%4>2),
			cwu: (min%4>2),
			fan: (min%10>5)
		},
		sensors: {
			time: date,
			type: 'stats',
			m: date.getMinutes(),
			cycle: Math.round(40+Math.random()*30),
			co: Math.round(50+Math.random()*20),
			helix: Math.round(18+Math.random()*1),
			fuse: Math.round(16+Math.random()*1),
			inside: Math.round(20+Math.random()*2)
		}
	}
};

setInterval(function(){
	var data = stats();

	db(conf.dbStatsT).insert(data.sensors).exec(function(){
		//console.log(arguments);
	});
	db(conf.dbComT).insert(data.units).exec(function(){
		//console.log(arguments);
	});
}, 1000);

//stats
/*
var data = [];

for(var day=0; day<14; day++){
	for(var hour=0; hour<24; hour++){
		for(var min=0; min<60; min++){
			data.push({
				time: new Date(2014, 10, 16+day, hour, min),
				type: 'stats',
				m: min,
				cycle: Math.round(40+Math.random()*30),
				co: Math.round(50+Math.random()*20),
				helix: Math.round(18+Math.random()*1),
				fuse: Math.round(16+Math.random()*1),
				inside: Math.round(20+Math.random()*2)
			});
		}
		db(conf.dbStatsT).insert(data).exec(function(){
			console.log(arguments);
		});
		data = [];
	}
}*/


/*
//comends
var data = [],
	i = 0;

for(var day=0; day<14; day++){
	for(var hour=0; hour<24; hour++){
		for(var min=0; min<60; min++){
			data.push({
				id: i++,
				time: new Date(2014, 10, 16+day, hour, min),
				owner: 'my',
				level: 1,
				turbine: (day<7)? 40 : 60,
				cycle: min%2==1,
				co: (min%20>5),
				helix: !(min%4>2),
				cwu: (min%4>2),
				fan: (min%10>5)
			});
		}
		db(conf.dbComT).insert(data).exec(function(){
			console.log(arguments);
		});
		data = [];
	}
}*/