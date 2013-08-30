/**
 * Created with JetBrains WebStorm.
 * User: linpeng
 * Date: 13-8-9
 * Time: PM 2:11
 */
var mongoose = require('mongoose');
var config = require('./../config');

var nameProperty = { type: String, index: { unique: true }};

var userSchema = mongoose.Schema({
    name:nameProperty, password:String,
    head:String,
    point:{type:Number,default:0},
    role:{type:String,index:true}
});

userSchema.statics.pointAdd = function(userId,callback){
    var model = this.model("user");
    model.findOne({"_id":userId}).exec(function(err,user){
        user.point = user.point+1;
        user.save(function(err,user){
            if(err) callback(err);
            model.findOne({"_id":user._id}).exec(callback);
        }.bind(this));
    });

};

var User = mongoose.model('user',userSchema);
module.exports = User;

