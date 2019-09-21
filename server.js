// server.js
// newark version

//standard requirements////////////////////
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser')
const express = require('express');
const app = express();


//custom requirements/////////////////////
require('./partRequest.js')();
require('./userAuth.js')();


//digikey auth credentials///////////////
const authCred = {
	dgkey_id: '8696d448-db79-46b4-98d9-b3b89482d860',
	dgkey_secret: 'X1wQ2uU1bX5jL1nK6sC2eM0sB6eG8fX7wV2sK5jW7xX6xS7sJ1',
	redirect: '/oauth/redirect',
	auth_uri: 'https://localhost:8080/oauth/redirect',
	grant: 'authorization_code'
};


//ssl///////////////////////////////////
const options = {
	key: fs.readFileSync('certs/client-key.pem'),
	cert: fs.readFileSync('certs/client-cert.pem')
};


//assignments/////////////////////////
var authTokens = {};
var partData = {};
var partNumbers = [];
var partList = [];
 

//settings//////////////////////////////
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))


//server////////////////////////////////
https.createServer(options, app).listen(8080);
app.listen(8000, function () {
	console.log('listening port: 8080')
});


//callbacks/////////////////////////////
function tokenCall(tokens){
	authTokens = tokens;
	console.log('\n got tokens:', authTokens);
	fs.writeFileSync('tokens.json', JSON.stringify(authTokens, null, 2));
}
function searchCall(data){
	partData = data;
	console.log('\nsearch got data');
	partList.push(partData);
	console.log('partList grew');
}


// index
app.get('/', function(req, res){
	// check if we already have tokens
	if(fs.existsSync('./tokens.json')){
		console.log('GET / tokens already exist');
		fs.readFile('./tokens.json', (err, data) => {
			if(err) throw err;
			authTokens = JSON.parse(data);
			console.log('authTokens:', authTokens);
			res.render('search');
		});
	} else {
		res.render('index');
		console.log('GET / rendered index');
		console.log('need tokens');
	}
});


// initial redirect authorization 
app.get(authCred.redirect, function(req, res){
	const authCode = req.query.code;
	console.log('redirect received, auth code:', authCode);
	var postStr = `code=${authCode}&client_id=${authCred.dgkey_id}&client_secret=${authCred.dgkey_secret}&redirect_uri=${authCred.auth_uri}&grant_type=${authCred.grant}`;
	getTokens(postStr, authCred, tokenCall);
	console.log('render search');
	res.render('search');
});


// sanitize parameters and search
app.post('/search', function(req, res){
	parts = req.body.part//.replace(/\s/g, '');
	partNumbers = parts.split(' ');
	console.log('POST / search param:', partNumbers);

	for(i=0; i<partNumbers.length; i++){
		search(partNumbers[i], authCred.dgkey_id, authTokens, searchCall);
	}
	//wait and render
	console.log('loading results...');
	console.log(partList);
	setTimeout(function(){
		res.redirect('result');
	}, 10000);
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