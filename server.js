var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db1 = mongojs('powercommands', ['powercommands']);
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var myutil = require('./public/dist/js/bputils.js');

var postFile = 'logs/test-POST.csv';
var getFile = 'logs/test-GET.csv';
var lastTime = 0;


app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/power', function (req, res) {
	console.log("Received a GET request for /power");

	db1.powercommands.find(function (err, docs) {
		res.json(docs);
	});
});


app.post('/power', function(req, res) {
	console.log(req.body);
	db1.powercommands.insert(req.body, function(err, doc) {
		res.json(doc);
	});
});


app.delete('/power/:id', function (req, res) {
	var id = req.params.id;
	console.log(id);
	db1.powercommands.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
		res.json(doc);
	});
});

app.get('/power/:id', function (req, res) {
	var id = req.params.id;
	console.log(id);
	db1.powercommands.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
		res.json(doc);
		console.log("Response from query");
		console.log(doc);
	});
});

app.put('/power/:id', function (req, res) {
	var id = req.params.id;
	console.log(req.body.id);
	db1.powercommands.findAndModify({query: {_id: mongojs.ObjectId(id)},
		update: {$set: {pstatus: req.body.pstatus, powindicator: req.body.powindicator}},
		new: true}, function (err, doc) {
			console.log(doc);
			res.json(doc);
	});
});

app.post('/incoming', function(req, res) {
	var timeDiff = 0;
	req.body.timeStamp = new Date();
	console.log("Received a POST request from user-" + req.body.id + " to /incoming");
	var category = myutil.category(req.body.diastolic, req.body.systolic);
	db1.powercommands.findAndModify({query: {id: req.body.id},
		update: {$set: {diastolic: req.body.diastolic, systolic: req.body.systolic, timeStamp: req.body.timeStamp, bpcategory: category, bpcatcolor: myutil.catColor(category)}},
		new: true}, function (err, doc) {
			timeDiff = doc.timeStamp.getTime() - lastTime;
			lastTime = doc.timeStamp.getTime();
			myutil.timeLogs(postFile, doc.timeStamp.toLocaleString(), timeDiff, doc.id, doc.pstatus, doc.diastolic, doc.systolic, doc.bpcategory);
			if (doc.pstatus == "OFF") {
				res.send("$");
			} else {
				res.send("%");
			}
	});
	io.emit('new bpEntry', req.body);
});

app.get('/powerRequest/:id', function(req,res) {
	var id = req.params.id;
	console.log("Received a GET request from user-" + id);
	db1.powercommands.findOne({id: id}, function (err, docs) {
		myutil.timeLogs(getFile, docs.timeStamp, docs.id, docs.pstatus, docs.diastolic, docs.systolic, docs.bpcategory);
		if (docs.pstatus == "OFF") {
			res.send("$");
		} else {
			res.send("%");
		}
	});
});


io.on('connection', function(socket) {
	console.log('a user connected');
});

http.listen(3000);
console.log("Server running on port 3000");