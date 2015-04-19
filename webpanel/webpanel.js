var conf = require('../share/config.js');

var express = require('express'),
	path = require('path'),
	app = express(),
	api = require('./routes/api.js'),
	bodyParser = require('body-parser');

app.use(bodyParser.json());
app.post('/manual', api.manual.start);
app.put('/manual', api.manual.update);
app.delete('/manual', api.manual.stop);

//programs
app.get('/program', api.programs.list);
app.put('/program', api.programs.update);
app.post('/program', api.programs.insert);
app.delete('/program', api.programs.delete);

//harmonogram
app.post('/schedule/activate', api.schedule.activate);
app.get('/schedule', api.schedule.list);
app.put('/schedule', api.schedule.update);
app.post('/schedule', api.schedule.insert);
app.delete('/schedule', api.schedule.delete);
app.post('/schedule/event', api.schedule.attach);
app.delete('/schedule/event', api.schedule.detach);
app.put('/schedule/event', api.schedule.reattach);

//stats
app.get('/stats', api.stats.stats);
app.get('/stats/condition', api.stats.condition);

//logs
app.get('/log', api.log.logs);
app.get('/log/cat', api.log.cat);
app.delete('/log', api.log.clear);

app.use(express.static(path.join(__dirname, '.', '/')));

app.use(function(err, req, res, next){
	if(err){
		console.error(err);
		console.error(err.stack);
		res.status(500).json({
			url: req.path,
			query: req.query,
			message: err.message
		});
	}else{
		next();
	}
});

//nasłuch na adresie lokalnym, port 1337
app.listen(conf.webPort);