/**
 * Created with JetBrains WebStorm.
 * User: linpeng
 * Date: 13-8-9
 * Time: AM 11:55
 */
var mongoose = require('mongoose');
var url = "mongodb://localhost/makkt";
exports.url = url;
exports.secret = "makkt";
exports.db = "db";
exports.conn = mongoose.connect(url);