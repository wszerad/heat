//załączenie zależności, odpowiednik "include" dla C/C++
var express = require('express'),
	path = require('path'),
	app = express(),
	api = require('./routes/api.js'),
	bodyParser = require('body-parser');

//formatowanie danych przesyłanych wewnątrz pakietu (POST, PUT, DELETE) 
app.use(bodyParser.json());
app.put('/manual/start', api.manual.start);
app.put('/manual/stop', api.manual.stop);

//programs
app.get('/program', api.programs.list);
app.put('/program', api.programs.update);
app.post('/program', api.programs.insert);
app.delete('/program', api.programs.delete);

//część wszystkich trasowań 
//tutaj dla panelu harmonogramów. Metody określają jakiego typu zapytań oczekują, pierwszy argument to ścieżka (dozwolone sa wyrażenia regularne), ostatnim argumentem jest funkcja obsługi

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
app.get('/log/cat', api.log.cat);
app.get('/log', api.log.logs);
app.delete('/log', api.log.clear);

//dodanie trasowania do plików statycznych
app.use(express.static(path.join(__dirname, '..', '/')));

//obsługa niezakończonych zapytań z podejrzeniem wystąpienia błędu
app.use(function(err, req, res, next){
	if(err){
		//wyświetlenie komunikatów w konsoli środowiska
		console.error(err);
		console.error(err.stack);
		//zakończenie zapytania z błędem typu 'internal error'
		res.status(500).json({
			url: req.path,
			query: req.query,
			message: err.message
		});
	}else{
		next();
	}
});

//nasłuch na adresie lokalnym, port 3000
app.listen(3000);