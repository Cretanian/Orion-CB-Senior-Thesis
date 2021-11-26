const request = require('request');
const my_IP = "192.168.1.2";

function UpdateOccupancy(ID, bodyPar){
return {
            method: "PATCH",
            url: 'http://' + my_IP + ':1026/v2/entities/urn:ngsi-ld:Device:'+ ID +'/attrs',
            headers: {
                'Content-Type': 'application/json',
                'fiware-service': 'buildings',
                'fiware-servicepath': '/ITE'
            },
            qs: {
                type: "Device",
            },
            body: bodyPar,
            json: true
        };
}

function UpdateOxygen(ID, bodyPar){
    return {
                method: "PATCH",
                url: 'http://' + my_IP + ':1026/v2/entities/urn:ngsi-ld:Device:'+ ID +'/attrs',
                headers: {
                    'Content-Type': 'application/json',
                    'fiware-service': 'buildings',
                    'fiware-servicepath': '/ITE'
                },
                qs: {
                    type: "OxygenDevice",
                },
                body: bodyPar,
                json: true
            };
    }

var requestLoop1 = setInterval(function(){
    var theRandomNumber;
    var ID;

    for (var i = 1; i < 53; i++) 
    { 
        if(i < 10)
            ID = "00" + i;
        else
            ID = "0" + i;

        theRandomNumber = Math.floor(Math.random() * 5) + 1;

        var JSON_body = {
            occupancy:{
                type: "Integer",
                value: theRandomNumber
            }
        }

        request(UpdateOccupancy(ID,JSON_body), function(error) {
            if (error) throw new Error(error);
        });
    }

    for (var i = 1; i < 7; i++) 
    { 
        ID = "00" + i;
        
        theRandomNumber = Math.floor(Math.random() * 20) + 1;

        var JSON_body = {
            Oxygen:{
                type: "Float",
                value: theRandomNumber
            }
        }

        request(UpdateOxygen(ID,JSON_body), function(error) {
            if (error) throw new Error(error);
        });
    }

}, 1000);