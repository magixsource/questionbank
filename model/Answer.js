/**
 * Created with JetBrains WebStorm.
 * User: linpeng
 * Date: 13-8-20
 * Time: 上午9:23
 */
var mongoose = require('mongoose');
var config = require('./../config');

var answerSchema = mongoose.Schema({
    question:{type:mongoose.Schema.Types.ObjectId,ref:'question'},
    answerer:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
    answer_time:{type:Date,default:Date.now},
    isRight:{type:Boolean}
});
var Answer = mongoose.model('answer',answerSchema);
module.exports = Answer;