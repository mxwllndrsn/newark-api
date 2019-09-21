// partRequest.js

const request = require('request');

//////////////////////////////////

module.exports = function() {
	this.search = function(partNumber, cred, tokens, callback) {
		console.log('search rcvd tokens:', tokens.access+' '+tokens.refresh);
		// POST and component specific search options
		var options = { 
			method: 'POST',
			url: 'https://api.digikey.com/services/partsearch/v2/keywordsearch',
			json: true, 
			headers: {
				'accept': 'application/json',
				'content-type': 'application/json',
				'authorization': tokens.access,
				//'x-digikey-partner-id': 'REPLACE_THIS_VALUE',
				//'x-digikey-customer-id': 'REPLACE_THIS_VALUE',
				//'x-digikey-locale-shiptocountry': 'REPLACE_THIS_VALUE',
				'x-digikey-locale-currency': 'USD',
				'x-digikey-locale-language': 'en',
				//'x-digikey-locale-site': 'US',
				'x-ibm-client-id': cred
			},
			body: { 
				//SearchOptions: [ 'ExcludeNonStock' ],
				Keywords: partNumber,
				RecordCount: '10',
				RecordStartPosition: '0',
				/*Filters: { 
				 	CategoryIds: [ 63513896 ],
				    FamilyIds: [ 81257876 ],
				    ManufacturerIds: [ 42958018 ],
				    ParametricFilters: [ { ParameterId: '725', Parameter: '7' } ] 
				},*/
			 	Sort: { 
				 	Option: 'SortByUnitPrice',
				    Direction: 'Ascending',
				    SortParameterId: '50' 
				},
				RequestedQuantity: '50' 
			}
		};

		console.log('Sending request...');

		request(options, function (err, res, body) {
			if (err) return console.error('Failed: %s', err.message);
			let partData = body['Parts'][0];
			
			if(partData!=undefined){
				let params = partData['Parameters'];
				console.log(params);
				// log component parameters
				/*for(i=0; i<params.length; i++){
					if (params[i]['ParameterId'] == 2049){
						console.log(params[i]['Parameter'], params[i]['Value']);
					} else if (params[i]['ParameterId'] == 5){
						console.log(params[i]['Parameter'], params[i]['Value']);
					} else if (params[i]['ParameterId'] == 2079){
						console.log(params[i]['Parameter'], params[i]['Value']);
					} else if (params[i]['ParameterId'] == 69){
						console.log(params[i]['Parameter'], params[i]['Value']);
					}
				}*/
			} else {
				partData = {
					'ManufacturerPartNumber': (partNumber +' item not found'),
					'ManufacturerName': {'Text': 'N/A'},
					'DetailedDescription': 'Please check your part number and try again',
					'PrimaryDatasheet': '#',
					'PrimaryPhoto': 'imgs/404.jpg'
				}
			}
			if(!partData['PrimaryPhoto']){
				partData['PrimaryPhoto'] = 'imgs/noimg.png'
			}
			callback(partData);
		});
	}
}