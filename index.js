const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const PORT = process.env.PORT ||  5000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send({status:'ok'})
    console.log('Get /')
});

app.post('/webhook', (req, res)=>{
    let body = req.body;
    console.log('POST /');
    console.log("body: ");
    console.log(body);
});

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
});

