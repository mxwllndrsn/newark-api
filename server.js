// server.js
// newark version
// no ssl requirements

//standard requirements////////////////////
const fs = require('fs');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser')
const express = require('express');
const app = express();


//custom requirements/////////////////////
require('./newarkRequest.js')();


//newark auth credentials///////////////
var apiKey;

if(fs.existsSync('./key.txt')){
	fs.readFile('./key.txt', 'utf-8', (err, data) => {
		if(err) throw new Error(err);
		apiKey = data;
		console.log('got key:', apiKey);
	});
};


//assignments/////////////////////////

const redirect = 'http://localhost:8080/redirect';
var partData = {};
var partNumbers = [];
var partList = [];


//settings//////////////////////////////
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))


//server////////////////////////////////
http.createServer(app).listen(8080);
app.listen(8000, function () {
	console.log('listening port: 8080')
});


//callbacks/////////////////////////////
function searchCall(data){
	partData = data;
	console.log(
		'\nsearch got data:',
		'\n',partData['displayName'],
		'\n',partData['brandName'],
		'\n',partData['translatedManufacturerPartNumber'],
		'\n',partData['image'],
		'\n',partData['datasheets'][0]['url']
	);

	partList.push(partData);
	console.log('partList grew');
}


// index
app.get('/', function(req, res){
	console.log('GET / render search');
	res.render('search');
});


// response redirect 
app.get(redirect, function(req, res){
	console.log('GET redirect');
});


// sanitize parameters and search
app.post('/search', function(req, res){
	parts = req.body.part//.replace(/\s/g, '');
	partNumbers = parts.split(' ');
	console.log('POST / search param:', partNumbers);

	for(i=0; i<partNumbers.length; i++){
		search(partNumbers[i], apiKey, searchCall);
	}
	//wait and render
	console.log('loading results...');
	/*console.log(partList);
	setTimeout(function(){
		res.redirect('result');
	}, 2000);*/
});


// display results
app.get('/result', function(req, res){
	console.log('GET /result');
	res.render('result', {
		partNumbers: partNumbers,
		partList: partList
		/*
		partNumber: partData['ManufacturerPartNumber'],
		manufacturer: partData['ManufacturerName']['Text'],
		description: partData['DetailedDescription'],
		datasheetURL: partData['PrimaryDatasheet'],
		*/
	});
	//console.log(partList);
});