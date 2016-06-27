// simple mongo crud server
//

// database configuration
var connectionString = 'mongodb://localhost/crud';  // connection url and database
var collection = 'things';                          // the collection we use

// initialize mongo client
var dbclient = require('mongodb').MongoClient;  // database client
var db;                                         // global connection handle

// create an express app
var express = require('express');
var app = express();            // create an express app

// configure middleware for automatic parsing of json request bodies
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// configure log middleware logging level: 'combined', 'common', or 'dev'
var logger = require('morgan');
app.use(logger('common'));

// get all items in the collection
app.get('/items', function(req, res) {
    var items = db.collection(collection).find().toArray(function(err, result) {
        if (err) return res.sendStatus(500).send(err);
        console.log('fetched', result.length, 'items');
        return res.send(result);
    });
});

// get one item by itemid
app.get('/items/:itemid', function(req, res) {
    var items = db.collection(collection).find({itemid: req.params.itemid}).toArray(function(err, result) {
        if (err) return res.sendStatus(500).send(err);
        console.log('fetched', req.params.itemid, result);
        return res.send(result);
    });
});

// upsert (create or update) an item by itemid
app.post('/items/:itemid', function(req, res) {
    req.body.itemid = req.params.itemid;
    db.collection(collection).update({itemid: req.params.itemid}, req.body, {upsert: true}, function(err, result) {
        if (err) return res.sendStatus(500).send(err);
        console.log('saved', req.params.itemid, req.body);
        res.sendStatus(200);
    });
});

// delete an item by itemid
app.delete('/items/:itemid', function(req, res) {
    db.collection(collection).remove({itemid: req.params.itemid}, function(err, result) {
        if (err) return res.sendStatus(500).send(err);
        console.log('deleted', req.params.itemid);
        res.sendStatus(200);
    });
});

// static-serve the public folder
app.use('/', express.static(__dirname + '/public'));

// connect to database
dbclient.connect(connectionString, function(err, database) {
    if (err) {
        console.log(err);
        sys.exit(-1);   // exit the program if we can't connect
    }
    db = database;      // save the connection for the database handlers

    // start the web server
    app.listen(3000, function() {
        console.log('Server is up...');
/*
        console.log('_router:', app._router);
        app._router.stack.forEach(function(route) {
            console.log(route.name, route.path, route.keys, route.regexp, route.route);
        });
*/
    });



});
