/**
 * Created with JetBrains WebStorm.
 * User: linpeng
 * Date: 13-8-19
 * Time: 下午7:49
 */
var mongoose = require('mongoose');
var config = require('./../config');

var nameProperty = { type: String, index: true};
var questionSchema = mongoose.Schema({
    name:nameProperty
    ,asker:{type:mongoose.Schema.Types.ObjectId, ref: 'user'}
    ,isMulti:{type:Boolean,default:false}
    ,answers:[{content:String,isRight:Boolean}]
    ,imgLink:String
});

questionSchema.statics.total = function(userId,callback){
    var answer = this.model("answer");

    answer.count({answerer:userId}).exec(function(err,count){
        if (err) {
            return callback(err);
        }
        callback(null,count);
    });
};

questionSchema.statics.totalRight = function(userId,callback){
    var answer = this.model("answer");
    answer.count({answerer:userId,isRight:true}).exec(function(err,count){
        if (err) {
            return callback(err);
        }
        callback(null,count);
    });
};


questionSchema.statics.random = function(userId,callback){
    var answer = this.model("answer");
    var $this = this;
    answer.find({answerer:userId},"question").exec(function(err,questions){
        if (err) {
            return callback(err);
        }
        var newArray = [];
        for(var i=0;i<questions.length;i++){
            newArray.push(questions[i].question);
        }
        $this.count().where("_id").nin(newArray).exec(function(err,count){
            if (err) {
                return callback(err);
            }
            var rand = Math.floor(Math.random() * count);
            this.findOne().where("_id").nin(newArray).skip(rand).exec(callback);
        }.bind($this));
    });

};

questionSchema.statics.next = function(callback){
    var model = this.model("question");
    model.findOne().where("_id").gt(this._id).exec(function(err,next){
        if (err) throw err;
        if (next) {
            callback(null, next);
        } else {
            model.findOne(callback);
        }
    });
};

var Question = mongoose.model('question',questionSchema);
module.exports = Question;

