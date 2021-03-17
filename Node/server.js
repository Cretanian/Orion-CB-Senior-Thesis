//setup
const express = require("express");

const api = express();

const HOST = '(MY IP)'
const PORT = 3001

api.use(express.json());

api.listen(PORT, () => {
    console.log(`API is running at ${HOST}:${PORT}!`)
});


/* IOT AGENT ULTRALIGHT */

api.post("/iot/bell001", (request, response) => {
    console.log("BELL GOT YOUR MESSAGE - UL!");
    response.end('bell001@ring| ring OK');
});

api.post("/iot/lamp001", (request, response) => {
    console.log("LAMP GOT YOUR MESSAGE - UL!");
    response.end('lamp001@on| on OK)');
});

api.post("/iot/door001", (request, response) => {
    console.log("DOOR GOT YOUR MESSAGE - UL!");
    response.end('door001@open| open OK');
});




/* IOT AGENT JSON */

api.post("/iot/bell002", (request, response) => {
    console.log("BELL GOT YOUR MESSAGE - JSON!");
    console.log(request.body);
    response.end('{ "ring": "ring OK" }');
});

api.post("/iot/lamp002", (request, response) => {
    console.log("LAMP GOT YOUR MESSAGE - JSON!");
    response.end('{ "on": "on OK" }');
});

api.post("/iot/door002", (request, response) => {
    console.log("DOOR GOT YOUR MESSAGE - JSON!");
    response.end('{ "open": "open OK" }');
});
