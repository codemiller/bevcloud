var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8080';
 
var calcStandardDrinks = function(volumeMl, alcoholPc, quantity) {
    return volumeMl / 1000 * alcoholPc * 0.789 * quantity;
}

var renderResult = function(drink, volumeMl, alcoholPc) {
    return function(req, res){
        var standardDrinks = req.params.quantity && calcStandardDrinks(volumeMl, alcoholPc, req.params.quantity);
        if (standardDrinks && standardDrinks > 0) {
            res.render('result', { standardDrinks: standardDrinks, drinkType: drink });
        } else {
            res.render('error', { message: 'Invalid quantity' });
        }
    }
}

var renderIndex = function(req, res) {
    res.render('index');
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// Routes
app.get('/', renderIndex);
app.get('/beer/:quantity', renderResult('beer', 300, 5));
app.get('/cider/:quantity', renderResult('cider', 450, 6));
app.get('/white/:quantity', renderResult('white-wine', 150, 11.5));
app.get('/red/:quantity', renderResult('red-wine', 150, 13));
app.get('/cocktail/:quantity', renderResult('cocktail', 250, 30));
app.get('/rose/:quantity', renderResult('rose', 150, 10));
app.get('/other/:quantity', renderResult('other', 150, 20));

// Catch 404s
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handling
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(port, ip_addr, function() {
    console.log('BevCloud listening on port %d', server.address().port); 
});
