var validateRule = function (rules) {
    var msg = [];
    if (rules["rules"] == null || typeof rules["rules"] != 'object') {
        msg.push('Error:key "rules" needed')
        return msg;
    }

    var validExpression = function (key, exp, vars) {
        var msg = [];
        var ast = esprima.parse(code);

    }
    var decentRule = function (key, rule, vars) {
        var msg = []

        Object.keys(rule).forEach(function (subKey) {
            if (subkey in ['.read', '.write', '.validate']) {
                msg.concat(validExpression(subKey, rule[subKey], vars))
            }
            else if (subKey.startWith('.')) {
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



var Logics = ["&&", "||", "!", ">", ">=", "<", "<="]
var expressionTypes = {
    BinaryExpression: "BinaryExpression",
    Literal: "Literal",
    MemberExpression: "MemberExpression",
    CallExpression: "CallExpression"

}
//入口
var validExpression = function (ast, cb) {
    if (ast.type == expressionTypes.BinaryExpression) {
        switch (ast.operator) {
            case "==":
            case "===":
            case ">":
            case ">=":
            case "<":
            case "<=":
                // valid number Compare
                
                break;
            case "+":
                //valid string +
                //valid number +
                break;
            case "-":
            case "*":
            case "/":
            case "%":
                //valid number
                break;
            case "||":
            case "&&":
            case "!":
                //boolean
                break;
            default:
                //wrong!!!
                cb({
                    "ast": ast,
                    "msg": "invalid operator:" + ast.operator
                })

        }

    }
    else if (ast.type == expressionTypes.Literal) {
        validLiteral(ast, function (err, pt) {
            if (err) {
                cb(err);
                return;
            }
            if (pt.contains("boolean")) {
                cb(null)
                return;
            }
            else {
                cb(new Error("static type check fail,the expression can't be boolean"))
                return;
            }
        })
    }
    else if (ast.type == expressionTypes.MemberExpression) {//newData.val().b

    }
    else if (ast.type == expressionTypes.CallExpression) { //newData.val()

    }
    else {
        cb(new Error(genErrorMsg("expression invalid")))
    }
}
var validLiteral = function (ast, cb) {
    var posibleTypes = [];
    if (typeof ast.value == 'boolean') {
        posibleTypes.push('boolean');
        cb(null, posibleTypes)
    }
    else if (typeof ast.value == 'number') {
        posibleTypes.push('boolean');
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
        cb(genErrorMsg(ast, "invalid value " + ast.value))
    }
}

var genErrorMsg = function (ast, msg) {
    var start = "line " + ast.loc.start.line + ",column " + ast.loc.start.column;
    return start + ' :' + msg
}
var RuleValidator = function () {

}