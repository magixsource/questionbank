/**
 * Created with JetBrains WebStorm.
 * User: linpeng
 * Date: 13-8-14
 * Time: PM 2:12
 */
var mongoose = require('mongoose');
var config = require('./../config');

var nameProperty = { type: String, index: { unique: true }};
var roleSchema = mongoose.Schema({
    name:nameProperty,
    parent:{type:mongoose.Schema.Types.ObjectId,ref:'role'}
});

var Role = mongoose.model('role',roleSchema);

module.exports = Role;