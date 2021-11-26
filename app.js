const express = require('express')
const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const path = require('path');
var app = express();
let inputStream = null;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

/* Regex to select the param type */
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
        case "C":
            REGEX = /C=(.*)/
            break;
        default:
        // code block
    }
    return REGEX;
}


const _private_processData = async (x_ax, filename, index) => {
    var REGEX = _private_setRegex(x_ax);
    var yAxis = []
    var xAxis = []
    var start, end = false;

    if (filename == 1) {
        inputStream = Fs.createReadStream('./data/_1.csv', 'utf8');
    }
    if (filename == 2) {
        inputStream = Fs.createReadStream('./data/_2.csv', 'utf8');
    }
    if (filename == 3) {
        inputStream = Fs.createReadStream('./data/_3.csv', 'utf8');
    }

    var result = new Promise((resolve, reject) => {
        inputStream
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
            // console.log('end called');
            resolve({ xAxis, yAxis })
        });
    })
    return result;// { xAxis, yAxis };
}

/* method to process single params */
const _private_process_singleGraph = async (x_ax, index) => {
    console.log(x_ax+' requested in 3 files')
    var REGEX = _private_setRegex(x_ax);
    var file2dataSet = []
    var file3dataSet = []
    var file2start, file2end = false;
    var file3start, file3end = false;

    let filestream2 = Fs.createReadStream('./data/_2.csv', 'utf8');;
    let filestream3 = Fs.createReadStream('./data/_3.csv', 'utf8');;

    var promise1 = new Promise((resolve, reject) => {
        filestream2
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {

                if (row[0] == '#') {
                    file2start = true;
                }
                if (file2start && !file2end) {
                    if (row[0] != '#') {
                        if (row[0] != '#$') {
                            /* consider these rows for y axis */
                            var f2Data_value = row[Number(index)].match(REGEX)[1]
                            file2dataSet.push(f2Data_value);
                        }
                    }
                }
                if (row[0] == '#$') {
                    /* end considering */
                    file2start = false;
                    file2end = true;
                }
            })
            .on('end', function () {
                
                resolve({ file2dataSet })
            });
    })

    var promise2 = new Promise((resolve, reject) => {
        filestream3
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
                if (row[0] == '#') {
                    file3start = true;
                }
                if (file3start && !file3end) {
                    if (row[0] != '#') {
                        if (row[0] != '#$') {
                            /* consider these rows for y axis */
                            var f3Data_value = row[Number(index)].match(REGEX)[1]
                            file3dataSet.push(f3Data_value);
                        }
                    }
                }
                if (row[0] == '#$') {
                    /* end considering */
                    file3start = false;
                    file3end = true;
                }
            })
            .on('end', function () {
                
                resolve({ file3dataSet })
            });
    })

    var _tmpResult = Promise.all([promise1, promise2]).then((values) => {
        return values[0].file2dataSet.concat(values[1].file3dataSet)
    })
    return _tmpResult;// { xAxis, yAxis };
}

const _private_process_singleGraphC = async (x_ax, index1, index2) => {
    console.log('C requested in 2 files')
    var REGEX = _private_setRegex(x_ax);
    var file2dataSet = []
    var file3dataSet = []
    var file2start, file2end = false;
    var file3start, file3end = false;
    filestream2 = Fs.createReadStream('./data/_2.csv', 'utf8');
    filestream3 = Fs.createReadStream('./data/_3.csv', 'utf8');

    var promise1 = new Promise((resolve, reject) => {
        filestream2
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
                if (row[0] == '#') {
                    file2start = true;
                }
                if (file2start && !file2end) {
                    if (row[0] != '#') {
                        if (row[0] != '#$') {
                            /* consider these rows for y axis */
                            var f2Data_value = row[Number(index1)].match(REGEX)[1]
                            file2dataSet.push(f2Data_value);
                        }
                    }
                }
                if (row[0] == '#$') {
                    /* end considering */
                    file2start = false;
                    file2end = true;
                }
            })
            .on('end', function () {
                
                resolve({ file2dataSet })
            });
    })

    var promise2 = new Promise((resolve, reject) => {
        filestream3
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {

                if (row[0] == '#') {
                    file3start = true;
                }
                if (file3start && !file3end) {
                    if (row[0] != '#') {
                        if (row[0] != '#$') {
                            /* consider these rows for y axis */
                            var f3Data_value = row[Number(index2)].match(REGEX)[1]
                            file3dataSet.push(f3Data_value);
                        }
                    }
                }
                if (row[0] == '#$') {
                    /* end considering */
                    file3start = false;
                    file3end = true;
                }
            })
            .on('end', function () {
                
                resolve({ file3dataSet })
            });
    })

    var _tmpResult2 = Promise.all([promise1, promise2]).then((values) => {
        //  console.log(values)
        return values[0].file2dataSet.concat(values[1].file3dataSet)
    })
    //  res.send(xAndy)
    // res.send({ xAxis,yAxis})
    return _tmpResult2;// { xAxis, yAxis };
}

const _private_process_singleGraphB = async (x_ax, index1,index2,index3) => {
    console.log('B requested in 3 files')
    var REGEX = _private_setRegex(x_ax);
    var file1dataSet = []
    var file2dataSet = []
    var file3dataSet = []
    var file1start, file1end = false;
    var file2start, file2end = false;
    var file3start, file3end = false;

    filestream1 = Fs.createReadStream('./data/_1.csv', 'utf8');
    filestream2 = Fs.createReadStream('./data/_2.csv', 'utf8');
    filestream3 = Fs.createReadStream('./data/_3.csv', 'utf8');

    var promisex = new Promise((resolve, reject) => {
        filestream1
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
                if (row[0] == '#') {
                    file2start = true;
                }
                if (file1start && !file1end) {
                    if (row[0] != '#') {
                        if (row[0] != '#$') {
                            /* consider these rows for y axis */
                            var f1Data_value = row[Number(index1)].match(REGEX)[1]
                            file1dataSet.push(f1Data_value);
                        }
                    }
                }
                if (row[0] == '#$') {
                    /* end considering */
                    file1start = false;
                    file1end = true;
                }
            })
            .on('end', function () {
                
                resolve({ file1dataSet })
            });
    })

    var promisey = new Promise((resolve, reject) => {
        filestream2
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
console.log('row' + row)
                if (row[0] == '#') {
                    file2start = true;
                }
                if (file2start && !file2end) {
                    if (row[0] != '#') {
                        if (row[0] != '#$') {
                            /* consider these rows for y axis */
                            console.log('asking ' + x_ax )
                            try{
                            var f2Data_value = row[Number(index2)].match(REGEX)[1]
                            file2dataSet.push(f2Data_value);
                            }catch(error)
                            {
console.log(error)
                            }
                        }
                    }
                }
                if (row[0] == '#$') {
                    /* end considering */
                    file2start = false;
                    file2end = true;
                }
            })
            .on('end', function () {
                
                resolve({ file2dataSet })
            });
    })

    var promisez = new Promise((resolve, reject) => {
        filestream3
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {

                if (row[0] == '#') {
                    file3start = true;
                }
                if (file3start && !file3end) {
                    if (row[0] != '#') {
                        if (row[0] != '#$') {
                            /* consider these rows for y axis */
                            var f3Data_value = row[Number(index3)].match(REGEX)[1]
                            file3dataSet.push(f3Data_value);
                        }
                    }
                }
                if (row[0] == '#$') {
                    /* end considering */
                    file3start = false;
                    file3end = true;
                }
            })
            .on('end', function () {
                
                resolve({ file3dataSet })
            });
    })

    var _tmpResult3 = Promise.all([promisex, promisey,promisez]).then((values) => {
        //  console.log(values)
        return values[0].file1dataSet.concat(file2dataSet.concat(values[1].file3dataSet))
    })
    //  res.send(xAndy)
    // res.send({ xAxis,yAxis})
    return _tmpResult3;// { xAxis, yAxis };
}



app.get('/graph', async (req, res) => {
    var x_ax = req.query.q;
    var file = req.query.file;
    var index = req.query.i;
    var sq = req.query.sq
    var graphData = undefined;

    if (sq !== undefined) {
        console.log(req.query.q + '---' + req.query.sq )
        if (sq == 'B') {
            var index1 = req.query.i1;
            var index2 = req.query.i2;
            var index3 = req.query.i3;
            graphData = await  _private_process_singleGraphB(sq, index1, index2,index3)
        }
       
        if (sq == 'C') {
            var index1 = req.query.i1;
            var index2 = req.query.i2;
            graphData = await _private_process_singleGraphC(sq, index1, index2)
        }
        else if(sq == 'A' || sq == 'W'|| sq == 'AK'||sq == 'AKZ') {
            console.log(sq);
            var index = req.query.i;
            graphData = await _private_process_singleGraph(sq, index)
        }
        res.send({ graphData })
        return;

    }
            graphData = await _private_processData(x_ax, file, index)
    res.send({ graphData })
})

const _private_fileWiseParams = async (passed) => {
    var fileParams = [{}]
    var start = false;
    var end = false;
    var j = 0;

    var file = null;
    var params = null;
    if (passed == 1) {
        file = './data/_1.csv';
        params = [/B=(.*?),/]
    }
    if (passed == 2) {
        file = './data/_2.csv';
        params = [/B=(.*?),/, /A=(.*?),/, /W=(.*?),/, /AK=(.*?),/, /AKZ=(.*?),/, /C=(.*?),/]
    }
    if (passed == 3) {
        file = './data/_3.csv';
        params = [/B=(.*?),/, /A=(.*?),/, /W=(.*?),/, /AK=(.*?),/, /AKZ=(.*?),/, /C=(.*?)\r\n/]
    }
    var inputStream = Fs.createReadStream(file, 'utf8');
    var result = new Promise((resolve, reject) => {
        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {

                var rowstring = row.toString();

                if (row[0] == '#') {
                    start = true;
                }
                if (start && !end) {
                    if (row[0] != '#') {
                        if (row[0] != '#$') {
                            //file1data += row+',';
                            /* consider these rows for y axis */
                            var arrayData = new Promise((resolvex, rejectx) => {

                                for (var x = 0; x < params.length; x++) {
                                    var available = rowstring.match(params[x]);
                                    if (available) {
                                        var item = { 'file': passed, 'param': available[0].match(/(.*?)=.*,/)[1], 'val': available[1] }
                                        fileParams.push(item);
                                        j++;
                                    }
                                }
                                resolve(fileParams)
                            })
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
                resolve(fileParams)
            });
    })
    return result;
}

app.get('/single', (req, res) => {
    res.sendFile(path.join(__dirname, '/single.html'));
})

app.get('/singleparam', async (req, res) => {
    var _singleData = []
    var file = req.query.file;
    _singleData = await _private_fileWiseParams(file);
    res.send({ _singleData })
})

app.listen(process.env.PORT || 8080, function () {
    console.log("Express Server Listening On Port %d in %s mode", this.address().port, app.settings.env);
});