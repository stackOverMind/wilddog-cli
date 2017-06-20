var assert = require('assert');
var manager = require('../src/manager')


var secret = "spN1uMmRq7Z2LWuUqoldcL31Vk2MRDLNuLIiN0k9"
var appid = "test123"

describe('rule', () => {
    var token = manager.generateToken(secret)

    describe('testRules', () => {
        it('test rules', (done) => {
            manager.testRule("test123", token, {
                rules: {
                    "rules": {
                        ".write": true,
                        ".read": true
                    }
                },
                "auth": {
                    "provider": "custom",
                    "uid": "vbBbji1199uLbYHdhElzjTXhHhqg"
                },
                action: "read",
                data: null,
                path: "/222",

            }, function (err) {
                assert(err == null)
                done()
            })
        })
    })
    describe('getRules', () => {
        it('should get current rule', (done) => {
            manager.getRule("test123", token, (err, rule) => {
                assert.equal(err, null)
                assert(typeof rule.rules == 'object')
                done()
            })
        })
    })
    describe('setRules', () => {
        it('should return no error', (done) => {
            var ruleObj = {
                "rules": {
                    '.write': 'auth!=null',
                    ".read": 'auth.uid ==' + Math.floor(Math.random() * 1000),
                }
            }
            manager.setRule("test123", token, ruleObj, (err) => {
                assert(err == null)
                manager.getRule('test123', token, (err, rule) => {
                    assert(err == null);
                    console.log(rule)
                    done()
                })
            })
        })
    })
})

