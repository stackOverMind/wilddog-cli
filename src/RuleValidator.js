var validateRule = function (rules) {
    var msg = [];
    if (rules["rules"] == null || typeof rules["rules"] != 'object') {
        msg.push('Error:key "rules" needed')
        return msg;
    }

    var validExpression = function (key, exp, vars) {
        var msg = [];


    }
    var decentRule = function (key, rule, vars) {
        var msg = []

        Object.keys(rule).forEach(function (subKey) {
            if (subkey in ['.read', '.write', '.validate', '.indexOn']) {
                msg.concat(validExpression(subKey, rule[subKey], vars))
            }
            else if (subKey.startsWith('.')) {
                msg.push('Error: invalid key : ' + subKey)
                return msg;
            }
            else {
                msg.concat(decentRule(subKey, rule[subKey], vars.concat([subkey])))
            }
            return msg;
        })
    }
}



var typePredict = function (types, propertyName, args) {
    var Types = {
        "string": {
            "length": {
                "return": "number"
            },
            "contains": {
                "params": ["string"],
                'return': "boolean"
            },
            "startsWith": {
                "params": ["string"],
                'return': "boolean"
            },
            "endsWith": {
                "params": ["string"],
                'return': "boolean"
            },
            "replace": {
                "params": ["string", "string"],
                'return': "string"
            },
            "toLowerCase": {
                'return': "string"
            },
            "toUperCase": {
                'return': "string"
            },
            "matches": {
                "params": ["string"],
                'return': "boolean"
            },
        },
        "snapshot": {
            'val': {
                'return': ['string', 'number', 'boolean', 'null']
            },
            'child': {
                'params': ['string'],
                'return': 'snapshot'
            },
            'parent': {
                'return': 'snapshot'
            },
            'hasChild': {
                'params': ['string'],
                'return': 'boolean'
            },
            'hasChildren': {
                'params': ['array'],
                'return': 'boolean'
            },
            'exists': {
                'return': 'boolean'
            },
            'getPriority': {
                'return': ['string', 'number', 'boolean', 'null']
            },
            'isNumber': {
                'return': 'boolean'
            },
            'isString': {
                'return': 'boolean'
            },
            'isBoolean': {
                'return': 'boolean'
            },
        }

    }
    var res = [];
    types.forEach(function (element) {
        if (Types[element]) {
            var def = Types[element][propertyName]
            if(def){
                var params = def.params;
                if(args.length == params.length){
                    if(typeof params['return'] == string){
                        res.push(params['return'])
                    }
                    else {
                        res.join(params['return'])
                    }
                }
                else {
                    throw new Error('param number not match: require ' + params.length )
                }
            }
        }
    });
    return res
}

var validateExpression = function (exp, vars, cb) {
    var operators = ["&&", "||", "!", ">", ">=", "<", "<=", "==", "===", "+", "-", "*", "/", "%"],

    var expressionTypes = {
        BinaryExpression: "BinaryExpression",
        Literal: "Literal",
        MemberExpression: "MemberExpression",
        CallExpression: "CallExpression",
        Identifier: "Identifier",
        UnaryExpression: "UnaryExpression"

    }
    //入口
    var validExpression = function (ast, cb) {
        if (ast.type == expressionTypes.BinaryExpression) {// a == b
            validBinaryExpression(ast, cb)
        }
        else if (ast.type == expressionTypes.Literal) {
            validLiteral(ast, cb)
        }
        else if (ast.type == expressionTypes.Identifier) {
            validIdentifier(ast, cb)
        }
        else if (ast.type == expressionTypes.MemberExpression) {//newData.val().b
            validMember(ast, cb)
        }
        else if (ast.type == expressionTypes.CallExpression) { //newData.val()
            validCall(ast, cb)
        }
        else {
            cb(new Error(genErrorMsg("expression invalid")))
        }
    }
    var validBinaryExpression = function (ast, cb) {
        validExpression(ast.left, function (leftError) {
            if (leftError) {
                cb(leftError, null)
                return;
            }
            validExpression(ast.right, function (rightError) {
                if (rightError) {
                    cb(rightError, null)
                    return;
                }
                if (!operators.contains(ast.operator)) {
                    cb(new Error("invalid operator: " + ast.operator))
                    return;
                }
                cb(null)
            });
        })
    }
    var validLiteral = function (ast, cb) {
        var posibleTypes = [];
        if (typeof ast.value == 'boolean') {
            posibleTypes.push('boolean');
            cb(null, posibleTypes)
        }
        else if (typeof ast.value == 'number') {
            posibleTypes.push('number');
            cb(null, posibleTypes)
        } else if (typeof ast.value == 'string') {
            posibleTypes.push('string');
            cb(null, posibleTypes)
        }
        else if (ast.value === null) {
            posibleTypes.push('null');
            cb(null, posibleTypes)
        }
        else {
            cb(new Error("invalid value " + ast.value))
        }
    }
    var validIdentifier = function (ast, cb) {
        switch (ast.name) {
            case "data":
            case "newData":
            case "root":
                cb(null, ["snapshot"]);
                break;
            case "auth":
                cb(null, ['auth']);
                break;
            case "now":
                cb(null, ['number']);
                break;
            default:
                if (vars.contains(ast.name)) {
                    cb(null, ['string'])
                }
                else {
                    cb(new Error("invalid identifier: " + ast.name))
                }
        }
    }
    var validMember = function (ast, cb) {
        var obj = ast.object
        var property = ast.property
        var callback_ = function (err, posibleTypes) {
            if (err) {
                cb(err)
            }
            else {//只有auth 有成员变量
                if (posibleTypes.contains('auth')) {
                    cb(null, ['string', 'number', 'boolean', 'null'])
                }
                else {
                    cb(new Error(obj.name + " have no property:" + property.name))
                }
            }
        }

        if (obj.type == expressionTypes.Identifier) {//auth.uid 
            validIdentifier(obj, callback_)
        }
        else if (obj.type == expressionTypes.MemberExpression) {//data.val().a.b
            validMember(obj, callback_)
        }
        else if (obj.type == expressionTypes.CallExpression) { //data.val().a
            validCall(obj, callback_)
        }
        else if (obj.type == expressionTypes.Literal) { //"122334".length
            validLiteral(obj, callback_)
        }
    }
    var validCall = function (ast, cb) {
        var obj = ast.object
        var property = ast.property
        var callback_ = function (err, objTypes) {
            if (err) {
                cb(err)
            }
            else {
                if (objTypes.contains('snapshot')) {
                    if (['val', 'child', 'parent', 'hasChild', 'hasChildren', 'exists', 'getPriority', 'isNumber', 'isString', 'isBoolean'].contains(property).name) {

                    }
                    else {
                        cb(new Error(obj.name + " have no property function:" + property.name))
                    }
                }

                else {
                    cb(new Error(obj.name + " have no property function:" + property.name))

                }
            }
        }

    }
    var ast = esprima.parse(code);
    validateExpression(ast, cb)

}

module.exports.validateRule = validateRule
module.exports.validateExpression = validateExpression