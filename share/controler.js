var timer = null,
	timeout = null;

function timerHandle(){
	clearTimeout(timer);

	timer = setTimeout(function(){
		process.exit(0);
	}, timeout);
}

module.exports = function(name, to){
	timeout = to;

	process.send({type: 'register', name: name});

	process.on('message', function(data){
		switch (data.type){
			case 'ping':
				process.send({type: 'ping', name: name, ram: process.memoryUsage()});
				timerHandle();
				break;
		}
	});
};

