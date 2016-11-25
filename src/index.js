#!/usr/bin/env node
var program = require('commander');
var co = require('co');
var prompt = require('co-prompt');
var wilddog = require('wilddog')
var manager = require('./manager')
var fs = require('fs')
var main = function () {
    program
        .version('0.0.1')
        .option('--token <token>', 'use a token to login')

        .command('set [appid] [path] [data]')
        .option('--priority <priority>', 'set with a priority')

        .description('set data to the target path')
        .action(function (appid, path, data, options) {
            assertAppId(appid)
            var token = options.token
            if (options.priority != null) {
                var _d = { '.value': tryParse(data), '.priority': tryParse(options.priority) }
                opData(appid, token, path, tryParse(data), 'setWithPriority', function (err) {
                    if (err) {
                        console.error(err)
                    }
                    else {
                        console.log('success')
                    }
                    process.exit(0)
                })
            }
            else {
                opData(appid, token, path, tryParse(data), 'set', function (err) {
                    if (err) {
                        console.error(err)
                    }
                    else {
                        console.log('success')
                    }
                    process.exit(0)
                })
            }
        })
    program
        .command('update [appid] [path] [data]')
        .description('merge data to the target path')
        .action(function (appid, path, data, options) {
            assertAppId(appid)
            var token = options.token
            opData(appid, token, path, tryParse(data), 'update', function (err) {
                if (err) {
                    console.error(err)
                }
                else {
                    console.log('success')
                }
                process.exit(0)

            })
        })
    program
        .command('push [appid] [path] [data]')
        .description('add one child with an automate generated key')
        .action(function (appid, path, data, options) {
            assertAppId(appid)
            var token = options.token
            opData(appid, token, path, tryParse(data), 'push', function (err, newRef) {
                if (err) {
                    console.error(err)
                }
                else {
                    console.log('new reference:')
                    console.log(newRef.toString())
                    console.log('success')
                }
                process.exit(0)

            })
        })
    program
        .command('remove [appid] [path]')
        .description('remove data')
        .action(function (appid, path, options) {
            assertAppId(appid)
            var token = options.token
            opData(appid, token, path, null, 'remove', function (err) {
                if (err) {
                    console.error(err)
                }
                else {
                    console.log('success')
                }
                process.exit(0)

            })
        })
    program
        .command('query [appid] [path]')
        .option('-o --one', 'once')
        .option('-e --event <event>', 'event type,the value can be one of :value, child_added, child_changed, child_moved,child_removed')
        .option('--orderByChild <child>', 'orderByChild')
        .option('--orderByValue', 'orderByValue')
        .option('--orderByPriority', 'orderByPriority')
        .option('--startAt <start>', 'start Position')
        .option('--endAt <end>', 'end Position')
        .option('--equalTo <eq>', 'equal to a value')
        .option('--limitToFirst <number>', 'limit to first')
        .option('--limitToLast <number>', 'limit to last')

        .action(function (appid, path, options) {
            assertAppId(appid)
            var token = options.token
            query(appid, token, path, options, function (err, snapshot) {
                if (err) {
                    console.error(err)
                    process.exit(0)
                }
                showSnapshot(snapshot)
            })
        })
    program
        .command('rules [appid]')
        .option('--secret <secret>', 'secret')
        .option('--set <file>', 'set rule with a json file')
        .action(function (appid, options) {
            if (appid == null) {
                program.outputHelp('rules')
                return;
            }
            if (!options.secret || typeof options.secret != 'string' || options.secret.length < 40) {
                console.log("secret required: --secret <secret>")
                return;
            }
            var secret = options.secret
            var token = manager.generateToken(secret)
            if (options.set == null) {
                manager.getRule(appid, token, (err, data) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log(JSON.stringify(data, null, 4))
                    }
                })
            }
            else {
                var filePath = options.set
                fs.readFile(filePath, (err, data) => {
                    if (err) throw err;
                    var newRule = null;
                    try {
                        newRule = JSON.parse(data.toString())
                    }
                    catch (e) {
                        throw e
                    }
                    manager.setRule(appid, token, newRule, function (err) {
                        if(err){
                            console.log(err)
                        }
                        else{
                            console.log('success')
                        }
                    })
                });
            }
        })
    program.on('--help', function () {
        console.log('wilddog doc: https://docs.wilddog.com');
        console.log('github: https://github.com/stackOverMind/wilddog-cli');
        console.log('');
    });
    program.parse(process.argv);
    if (!process.argv.slice(2).length) {
        console.log('wilddog --help for more information')
        process.exit(0)
    }
}


var initApp = function (appid, token, cb) {
    var app = wilddog.initializeApp({
        "syncURL": "https://" + appid + '.wilddogio.com',
        "authDomain": appid + '.wilddog.com'
    })
    if (token != null) {
        app.auth().signInWithCustomToken(token, function (err, user) {
            if (err) {
                cb(err)
            }
            else {
                cb(null, app)
            }
        })
    }
    else {
        cb(null, app)
    }
}

var opData = function (appid, token, path, data, op, cb) {
    initApp(appid, token, function (err, app) {
        if (err) {
            cb(err)
        }
        else {
            var ref = app.sync().ref(path);
            switch (op) {
                case 'set':
                    ref.set(data, function (err) {
                        cb(err)
                    })
                    break;
                case 'push':
                    var ref2 = ref.push(data, function (err) {
                        cb(err, ref2)
                    })
                    break;
                case 'update':
                    ref.update(data, function (err) {
                        cb(err)
                    })
                    break;
                case 'remove':
                    ref.remove(function (err) {
                        cb(err)
                    })
                    break;
                case 'setWithPriority':
                    ref.setWithPriority(data, function (err) {
                        cb(err)
                    })
                    break;
            }
        }
    })
}
var query = function (appid, token, path, options, cb) {
    initApp(appid, token, function (err, app) {
        if (err) {
            cb(err)
        }
        else {
            var ref = app.sync().ref(path);
            ref = parseOrder(ref, options)
            ref = parsePosition(ref, options)
            ref = parseLimit(ref, options)
            var event = parseEventType(options)
            if (options.one) {
                ref = ref.once(event, function (snapshot) {
                    cb(null, snapshot)
                    process.exit(0)
                })
            }
            else {
                ref = ref.on(event, function (snapshot) {
                    cb(null, snapshot)
                })
            }

        }
    })
}
var showSnapshot = function (snapshot) {
    var key = snapshot.key();
    var value = snapshot.val();
    console.log('key:', key)
    console.log('value:', JSON.stringify(value, null, 2))
}
/**以乐观的方式解析 */
var tryParse = function (str) {
    var res = str;
    try {
        res = JSON.parse(str)
    } catch (e) {
    }
    return res;
}
var parseOrder = function (ref, options) {
    var _ref = ref
    if (options.orderByChild != null) {
        _ref = ref.orderByChild(options.orderByChild)
    }
    else if (options.orderByKey) {
        _ref = ref.orderByKey()
    }
    else if (options.orderByValue) {
        _ref = ref.orderByValue()
    }
    return _ref
}
var parsePosition = function (ref, options) {
    var _ref = ref;
    if (options.startAt) {
        _ref = ref.startAt(tryParse(options.startAt))
    }
    else if (options.endAt) {
        _ref = ref.endAt(tryParse(options.endAt))
    }
    else if (options.equalTo) {

        _ref = ref.equalTo(tryParse(options.equalTo))
    }
    return _ref
}
var parseLimit = function (ref, options) {
    var _ref = ref
    if (options.limitToFirst) {
        _ref = ref.limitToFirst(tryParse(options.limitToFirst))
    }
    else if (options.limitToLast) {
        _ref = ref.limitToLast(tryParse(options.limitToLast))
    }
    return _ref
}
var parseEventType = function (options) {
    var e = 'value'
    if (options.event) {
        if (['value', 'child_added', 'child_changed', 'child_removed', 'child_moved'].indexOf(options.event) >= 0) {
            e = options.event
        }
    }
    return e;
}
var assertAppId = function (appId) {
    if (appId == null) {
        console.error('no appId provided')
        process.exit(0)
    }
}
main()