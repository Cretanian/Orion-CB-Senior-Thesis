const request = require('request');
const my_IP = "192.168.1.2";

var PromiseGetISLzoneLocation = (NAME) => 
{
    return new Promise((resolve, reject) => 
    {
        request(GetISLzoneLocation(NAME), function(error, body_response) 
        {
            if (error) 
                reject(error);
            else
                resolve(body_response.body[0].location.coordinates[0]);
        });
    })
}

function GetISLzoneLocation(NAME)
{
    return {
               method: "GET",
               url: 'http://' + my_IP + ':1026/v2/entities/',
               qs: { 
                     options: "keyValues",
                        type: "Zone",
                       attrs: "location",
                       q: "name ==" + NAME,
                },
               headers: {
                   'fiware-service': 'buildings',
                   'fiware-servicepath': '/ITE'
               },
               json: true
           };
}

var PromiseGetISLroomS = () => 
{
    return new Promise((resolve, reject) => 
    {
        request(GetISLroomS(), function(error, body_response) 
        {
            if (error) 
                reject(error);
            else
                resolve(body_response.body);
        });
    })
}

function GetISLroomS()
{
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

var PromiseGetDevicesNlocation = (ID) => 
{
    return new Promise((resolve, reject) => 
    {
        request(GetDevicesNlocation(ID), function(error, body_response) 
        {
            if (error) 
                reject(error);
            else
                resolve(body_response.body[0]);
        });
    })
}

function GetDevicesNlocation(ID)
{
    return {
               method: "GET",
               url: 'http://' + my_IP + ':1026/v2/entities/',
               qs: { 
                     options: "keyValues",
                           q: "refRoom==" + ID,
                        type: "OxygenDevice",
                       attrs: "location,coverage,Oxygen"
                },
               headers: {
                   'fiware-service': 'buildings',
                   'fiware-servicepath': '/ITE'
               },
               json: true
           };
}

setTimeout(async function()
{

//------------------------
// REQUESTS 
//------------------------
  
    // request ISL location
    var ISLlocation = await PromiseGetISLzoneLocation("ISL");
    var coord_A = ISLlocation[0];
    var coord_B = ISLlocation[1];
    var coord_C = ISLlocation[2];
    var coord_D = ISLlocation[3];


    //request Rooms in ISL
    var body_response = await PromiseGetISLroomS();
   
    //save Devices in ISL
    var Devices = [];
    var DevicesOxygenVal = [];

    for(var i = 0; i < body_response.length; ++i)
        Devices.push(await PromiseGetDevicesNlocation(body_response[i].id));
    

//------------------------
// CALCULATE RESULTS
//------------------------

    var AllDevicePercents = new Map();
    var x = 0;
    var y = 0; 

    //finding X and Y of ISL room
    var DistanceX = coord_B[0] - coord_A[0];
    var DistanceY = coord_D[1] - coord_A[1];
    var GrainMeter = 5;

    const Rows = Math.ceil(DistanceX * GrainMeter);
    const Columns = Math.ceil(DistanceY * GrainMeter);

    const ISLArea = DistanceX * DistanceY;

    //creating 2D array with zeros (0) in cells
    var CoverageVectro = new Array(Rows).fill(0);
    for (var i = 0; i < Rows; i++) 
        CoverageVectro[i] = new Array(Columns).fill(0);
   
    var TotalOnes = 0;
   
    //calculate percentagies
    for(var i = 0; i < Devices.length; ++i)
    {    

       //getting the coordinates of the device
       var DeviceCoordinates = Devices[i].coverage.coordinates;

        //finding coordinates of the boxes inside the ISL room
        if(coord_A[0] > DeviceCoordinates[0][0])
            x = coord_A[0];
        else
            x = DeviceCoordinates[0][0];

        if(coord_A[1] > DeviceCoordinates[0][1])
            y = coord_A[1];
        else
            y = DeviceCoordinates[0][1];

        var _A = [x, y];
        var _B = [DeviceCoordinates[2][0], y];
        var _C = DeviceCoordinates[2];
        var _D =  [x,DeviceCoordinates[2][1]];

        //saving how much % covers each of these device
        var DeviceCoveredArea = ((DeviceCoordinates[2][0] - x) * (DeviceCoordinates[2][1] - y));

        if(DeviceCoveredArea <= 0)
            throw new Error();

        var percent = (DeviceCoveredArea/ISLArea) * 100
        AllDevicePercents.set(Devices[i].id, percent);
        DevicesOxygenVal.push(Devices[i].Oxygen);
 
        //filling the cell of the array that are covered
        var StartY = (x - coord_A[0])* GrainMeter;
        var EndY = (_B[0] - coord_A[0])* GrainMeter;
        
        var StartX = y * GrainMeter;
        var EndX = _D[1] * GrainMeter - 1;

        for(var k = 0 ; k < Columns; ++k)
        {
            for(var j = 0; j < Rows; ++j)
            {
                if(StartY <= k && k <= EndY)
                {
                    if( StartX <= j && j <= EndX)
                    {
                        if(CoverageVectro[k][j] == 0)
                            CoverageVectro[k][j] = 1;
                        else
                            ++TotalOnes;
                    }
                }
            }
        }
        
    }

//------------------------
// PRINT RESULTS
//------------------------

    if(TotalOnes == 0)
        throw new Error();
    
    const TotalZeros = Columns * Rows;
    var PercentageOfDoubles = (TotalOnes/TotalZeros) * 100; 
    var PercentageSum = 0;
    var OxygenSum = 0;
    var iterator = 0;

    for (var [key, value] of AllDevicePercents)
    {
        console.log("The Device with ID: " + key + " has oxygen value: "+ DevicesOxygenVal[iterator] + "% and coverage: " + value.toFixed(2) + "% of the ISL!");
        PercentageSum += value;
        OxygenSum += DevicesOxygenVal[iterator];
        iterator++;
    }

    console.log("\nTotal oxygen value: " + (OxygenSum.toFixed(2)/iterator) + "% and accurasy: " + (PercentageSum - PercentageOfDoubles).toFixed(2) + "%");


}, 1000);
