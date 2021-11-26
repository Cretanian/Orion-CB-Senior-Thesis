const request = require('request');
const my_IP = "192.168.1.2";

var PromiseGetISLrooms = () => {
    return new Promise((resolve, reject) => {
        request(GetISLrooms(), function(error, body_response) {
            if (error) 
                reject(error);
            else
                resolve(body_response.body);
        });
    })
}

function GetISLrooms(){
    return {
               method: "GET",
               url: 'http://' + my_IP + ':1026/v2/entities/',
               qs: { 
                     options: "count",
                           q: "refZone==urn:ngsi-ld:Zone:001",
                        type: "Room",
                       attrs: "id"
                },
               headers: {
                   'fiware-service': 'buildings',
                   'fiware-servicepath': '/ITE'
               },
               json: true
           };
}

var PromiseGetOccupancyInISL = (ID) => {
    return new Promise((resolve, reject) => {
        request(GetOccupancyInISL(ID), function(error, body_response) {
            if (error) 
                reject(error);
            else{
                resolve(body_response.body[0][0]);
            }
        });
    })
}

function GetOccupancyInISL(ROOM){
    return {
            method: "GET",
            url: 'http://' + my_IP + ':1026/v2/entities/',
            qs: { 
                    options: "values",
                        q: "refRoom==" + ROOM,
                    attrs: "occupancy",
                     type: "Device",
            },
            headers: {
                'fiware-service': 'buildings',
                'fiware-servicepath': '/ITE'
            },
            json: true
        };
}

setTimeout(async function(){
    var sum_occupancy = 0;

    var body_res = await PromiseGetISLrooms();
   
    for(var i = 0; i < body_res.length; ++i)
        sum_occupancy += await PromiseGetOccupancyInISL(body_res[i].id);

    console.log("Total number of occupancy in ISL: " + sum_occupancy);
    

}, 1000);