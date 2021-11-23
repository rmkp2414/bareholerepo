const express = require('express')
const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const path = require('path');
// const bodyParser = require('body-parser')
// const expressLayout = require('express-ejs-layouts')
//const cors = require('cors')

var app = express();

let inputStream = null;//Fs.createReadStream('./data/_1.csv', 'utf8');



app.get('/', (req, res) => {    
    res.sendFile(path.join(__dirname, '/index.html'));
})

const _private_setRegex = (x) => {
    var REGEX = null;
    switch (x) {
        case "A":
            REGEX = /A=(.*)/
            break;
        case "B":
            REGEX = /B=(.*)/
            break;
        case "QC":
            REGEX = /QC=(.*)/
            break;
        case "FS":
            REGEX = /FS=(.*)/
            break;
        case "U":
            REGEX = /U=(.*)/
            break;
        case "TA":
            REGEX = /TA=(.*)/
            break;
        case "O":
            REGEX = /O=(.*)/
            break;
        case "W":
            REGEX = /W=(.*)/
            break;
        case "AK":
            REGEX = /AK=(.*)/
            break;
        case "AKZ":
            REGEX = /AKZ=(.*)/
            break;
        case "H":
            REGEX = /H=(.*)/
            break;
        default:
        // code block
    }
    return REGEX;
}


const _private_processData =async (x_ax, filename, index) => {
    var REGEX = _private_setRegex(x_ax);
    var yAxis = []
    var xAxis = []
    var start,end= false;



    if (filename == 1) {
        inputStream = Fs.createReadStream('./data/_1.csv', 'utf8');
    }
    if (filename == 2) {
        inputStream = Fs.createReadStream('./data/_2.csv', 'utf8');
    }
    if (filename == 3) {
        inputStream = Fs.createReadStream('./data/_3.csv', 'utf8');
    }

   var result = new Promise((resolve,reject)=>{inputStream
        .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
        .on('data', function (row) {

            if (row[0] == '#') {
                start = true;
            }
            if (start && !end) {


                if (row[0] != '#') {
                    if (row[0] != '#$') {
                        /* consider these rows for y axis */
                        var depth = row[0].match(/D=(.*)/)[1]
                        var x_value = row[Number(index)].match(REGEX)[1]
                        yAxis.push(depth);
                        xAxis.push(x_value);
                    }
                }
            }
            if (row[0] == '#$') {
                /* end considering */
                start = false;
                end = true;
            }
        })
        .on('end', function () {
            console.log('No more rows!');
           // return { xAxis, yAxis };
           resolve({xAxis, yAxis})
        });
    })
    //  res.send(xAndy)
    // res.send({ xAxis,yAxis})
    return result;// { xAxis, yAxis };
}

const _private_process_singleParam= ()=>{

}

const _private_process_CombinedData= ()=>{

}

app.get('/graph',async (req, res) => {
    var x_ax = req.query.q;
    var file = req.query.file;
    var index = req.query.i;
    var graphData =await _private_processData(x_ax, file, index)
    // res.send({hmm})
    console.log(graphData)
    res.send({ graphData })
})

app.listen(process.env.PORT || 3001, function () {
    console.log("Express Server Listening On Port %d in %s mode", this.address().port, app.settings.env);
});