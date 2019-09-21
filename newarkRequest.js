// newarkRequest.js

const request = require('request');

//////////////////////////////////

module.exports = function() {
	this.search = function(partNumber, apiKey, callback) {
		
		// GET and component specific search options
		var options = { 
		method: 'GET',
		url: 'https://api.element14.com/catalog/products',
		headers: { 
			'accept': 'application/json',
			'content-type': 'application/json'
			},
		qs: { 
			'callInfo.responseDataFormat': 'JSON',
			'term': `manuPartNum:${partNumber}`,
			'storeInfo.id': 'www.newark.com',
			'callInfo.apiKey': 'bs8uhffemnsxbjpdbqxaqdut',//apiKey,
			'resultsSettings.offset': '0',
			'resultsSettings.numberOfResults': '1',
			'resultsSettings.responseGroup': 'large' 
			},
		json:true
		};

		console.log('Sending request...');

		request(options, function (err, res, body) {
			if (err) throw new Error(err);
			console.log(body);
			let partData = body['manufacturerPartNumberSearchReturn']['products'][0];
			/*if(partData==undefined){
				partData = {
					'ManufacturerPartNumber': (partNumber +' item not found'),
					'ManufacturerName': {'Text': 'N/A'},
					'DetailedDescription': 'Please check your part number and try again',
					'PrimaryDatasheet': '#',
					'PrimaryPhoto': 'imgs/404.jpg'
				}
			}
			if(!partData['image']){
				partData['PrimaryPhoto'] = 'imgs/noimg.png'
			}			*/
			callback(partData);

		});
	}
}