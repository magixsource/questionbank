/**
 * Created with JetBrains WebStorm.
 * User: linpeng
 * Date: 13-8-17
 * Time: 下午4:56
 */
var User = require('./../model/User.js'),
    Role = require('./../model/Role.js');

var Robot = function () {
};
Robot.isModel = function (who) {
    var lowerCase = who.toLowerCase();
    if (lowerCase == 'role' || lowerCase == 'user') {
        return true;
    }
    return false;
};

Robot.getModel = function (who) {
    var lowerCase = who.toLowerCase();
    if (lowerCase == 'role') {
        return Role;
    } else if (lowerCase == 'user') {
        return User;
    } else {
        return null;
    }

};

Robot.arrayContains = function(array,obj){
    var _array = new Array();
    if(Array.isArray(array)){
        _array = array;
    }else{
        _array[0] = array;
    }
    var i = _array.length;
    while (i--) {
        if (_array[i] === (obj+'')) {
            return true;
        }
    }
    return false;
};
module.exports = Robot;