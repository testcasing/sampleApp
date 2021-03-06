var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var Jimp = require("jimp");
var bodyParser = require('body-parser')
//const imgURL = "https://ichef.bbci.co.uk/news/660/cpsprodpb/37B5/production/_89716241_thinkstockphotos-523060154.jpg"

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
})); 



app.get('/api', function api(req, res) {
    res.json({
        description: 'My API. Please authenticate!'
    });
});

app.post('/api/login', function(req, res) {
	userId = req.body.username;
	password = req.body.password;
    // insert code here to actually authenticate, or fake it
    const user = {
        id: 3
    };

    // then return a token, secret key should be an env variable
    const token = jwt.sign({
        user: user.id
    }, 'secret_key_goes_here');
    res.json({
        message: 'Authenticated! Use this token in the "Authorization" header',
        token: token
    });
});


app.get('/api/protected', ensureToken, function(req, res) {
    jwt.verify(req.token, 'secret_key_goes_here', function(err, data) {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                description: 'Protected information. Congrats!'
            });
        }
    });
});


app.get('/api/resizeimage/', ensureToken, function(req, res) {
    jwt.verify(req.token, 'secret_key_goes_here', function(err, data) {
        if (err) {
            res.sendStatus(403);
        } else {
            Jimp.read(req.query.imgURL, function(err, img) {
                if (err) throw err;
                img.resize(50, 50).getBase64(Jimp.AUTO, function(e, img64) {
                    if (e) throw e
                    res.send('<img src="' + img64 + '">')
                });
            });
        }
    });
});

function ensureToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

app.listen(3000, function() {
    console.log('App listening on port 3000!');
});
