var WilddogTokenGenerator = require("wilddog-token-generator");
var https = require('https')
var querystring = require('querystring');
var generateToken = function (secret) {
    var tokenGenerator = new WilddogTokenGenerator(secret);
    var token = tokenGenerator.createToken({ uid: '0' }, { admin: true, iat: Math.floor(Date.now() / 1000) });
    return token
}

var OP = {
    getRule: 0,
    setRule: 1,
    testRule: 3,
    getSecrets: 5,

}
var getRequestOptions = function (appid, op, token, postData) {
    var getHost = function (appid, op) {
        return appid + '.wilddogio.com'
    }
    var getPath = function (op, token) {
        var path = null;
        switch (op) {
            case OP.getRule:
            case OP.setRule:
                path = '/.settings/rules.json'
                break;
            case OP.testRule:
                path = '/.settings/rules/simulate.json'
                break;
            case OP.getSecrets:
                path = '/.settings/secrets.json'

        }
        return path + '?auth=' + token
    }
    var getMethod = function (op) {
        switch (op) {
            case OP.getRule:
            case OP.getSecrets:
                return 'GET'
            case OP.setRule:
                return 'PUT'
            case OP.testRule:
                return 'POST'
        }
    }
    var option = {
        hostname: getHost(appid, op),
        port: 443,
        path: getPath(op, token),
        method: getMethod(op),
        headers: {
            "accept": "application/json;charset=UTF-8",
            'Content-Type': 'application/json;charset=UTF-8',

        }
    }

    if (getMethod(op) === 'POST' || getMethod(op) === 'PUT') {
        option.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
        option.headers['Content-Length'] = Buffer.byteLength(postData)

    }

    return option

}
var httpRequest = function (ops, data, cb) {
    var req = https.request(ops, (res) => {
        var responseStr = ""
        res.on('data', (d) => {
            responseStr += d;
        })
        res.on('end', () => {
            obj = JSON.parse(responseStr);
            if (obj.error) {
                cb(new Error(responseStr))
            }
            else {
                cb(null, obj)
            }

        });
    })
    if (ops.method == 'POST' || ops.method == 'PUT') {
        req.write(data)
    }
    req.end();
    req.on('error', (e) => {
        cb(e);
    });
}
var getRule = function (appid, token, cb) {
    var options = getRequestOptions(appid, OP.getRule, token)
    httpRequest(options, null, (err, data) => {
        if (err) {
            cb(err)
        }
        else {
            cb(null, data)
        }
    })
}

var setRule = function (appid, token, newRule, cb) {
    var data = JSON.stringify(newRule, null, 4)
    var options = getRequestOptions(appid, OP.setRule, token, data)
    httpRequest(options, data, (err, res) => {
        if (err) {
            cb(err)
        }
        else {
            cb(null)
        }
    })
}


var testRule = function (appid, token, options, cb) {
    var rules = JSON.stringify(options.rules);
    var auth = JSON.stringify(options.auth);
    var action = options.action;
    var path = options.path;
    var data = JSON.stringify(options.data);
    var obj = {};
    if (auth == null) {
        obj.isAuthenticated = false
    }
    else {
        obj.isAuthenticated = true
        obj.tokenPayload = auth;
    }
    obj.rules = rules;
    obj.path = path;
    if (action == "write") {
        obj.data = data
    }
    else {
        obj.data = "";
    }
    obj.action = action;
    obj.isAdmin = false
    var postData = querystring.stringify(obj);
    var httpOptions = getRequestOptions(appid, OP.testRule, token, postData)
    httpRequest(httpOptions, postData, (err, res) => {
        if (err) {
            cb(err)
        }
        else {
            cb()
        }
    })

}

var getSecrets = function (appid, token, cb) {
    var options = getRequestOptions(appid, OP.getSecrets, token)
    httpRequest(options, null, (err, data) => {
        if (err) {
            cb(err)
        }
        else {
            cb(null, data)
        }
    })
}



module.exports.generateToken = generateToken
module.exports.getRule = getRule
module.exports.setRule = setRule
module.exports.testRule = testRule