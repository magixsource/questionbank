/*
 * GET home page.
 */

// exports.index = function(req, res){
//   res.render('index', { title: 'Express makkt' });
// };
var crypto = require('crypto'),
    User = require('./../model/User.js'),
    Role = require('./../model/Role.js'),
    Question = require('./../model/Question.js'),
    Answer = require('./../model/Answer.js'),
    Robot = require('./../util/robot.js');
// we need the fs module for moving the uploaded files
var fs = require('fs');

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index', {
            title:'QuestionBank',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.get("/prefile", function (req, res) {
        if (!req.session.user) {
            req.flash("error", "un-auth");
            return res.redirect("/");
        }
        res.render('prefile', {
            title:'QuestionBank',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post("/prefile", function (req, res) {
        if (!req.session.user) {
            req.flash("error", "un-auth");
            return res.redirect("/");
        }
        var tmp_path = req.files.user.head.path;
        var file_name = req.files.user.head.name;
        var target_path = './public/images/head/' + file_name;

        if (file_name) {
            fs.rename(tmp_path, target_path, function (err) {
                if (err) throw err;
                fs.unlink(tmp_path, function () {
                    if (err) throw err;
                    //-----------------
                    User.findOne("_id", req.session.user._id).exec(function (err, user) {
                        user.set("head", file_name);
                        user.save(function (err, user) {
                            req.session.user = user;
                            req.flash("success", "修改个人信息成功");
                            return res.redirect("/prefile");
                        });
                    });
                });
            });
        } else {
            return res.redirect("/prefile");
        }


    });

    // makkt auth module
    app.get('/signup', function (req, res) {
        Role.find().where("name").ne("admin").exec(function (err, roles) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('signup', {
                title:'signup',
                user:req.session.user,
                roles:roles,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        });

    });

    //create a new user
    app.post('/signup', function (req, res) {
        if (req.body['repeat-password'] != req.body.user.password) {
            req.flash('error', 'password different');
            return res.redirect('/signup');
        }

        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.user.password).digest('base64');

        User.findOne({ 'name':req.body.user.username }, function (err, u) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/signup');
            }
            if (u) {
                req.flash('error', 'this user is exist');
                return res.redirect('/signup');
            }

            var newUser = new User({name:req.body.user.username, password:password});
            if (req.body.user.organization) {
                newUser.set("organization", req.body.user.organization);
            }
            if (req.body.user.role) {
                newUser.set("role", req.body.user.role);
            }
            newUser.save(function (err, newUser) {
                if (err) {
                    req.flash('error', 'Fail to signup');
                    return res.redirect('/signup');
                }
                req.flash('success', 'Success signup');
                return res.redirect('/');
            });

        });


    });

    //find a user
    app.get('/signin', function (req, res) {
        res.render('signin', {
            title:'signin',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    //find
    app.post('/signin', function (req, res) {
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.user.password).digest('base64');

        User.findOne({'name':req.body.user.username}, function (err, u) {
            if (err) {
                console.log("Error get user");
                return res.redirect('/signin');
            }
            if (!u) {
                console.log("No user found");
                return res.redirect('/signin');
            }

            if (u.password != password) {
                req.flash('error', 'password error');
                return res.redirect('/signin');
            }
            req.session.user = u;
            req.flash('success', 'success signin');
            return res.redirect('/');
        });

    });

    app.get('/signout', function (req, res) {
        req.session.user = null;
        req.flash('success', 'Success signout!');
        return res.redirect('/');
    });

    app.get('/assign', function (req, res) {
        User.where('name').ne('admin').exec(function (err, users) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('assign', {
                title:'role assign',
                user:req.session.user,
                users:users,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        });

    });

    app.get('/manager/:who', function (req, res) {
        if (!req.session.user || req.session.user.name != 'admin') {
            req.flash('error', 'un-auth');
            return res.redirect('/');
        }
        User.findOneAndUpdate({"_id":req.params.who}, {"role":"manager"}, function (err, user) {
            if (err) {
                req.flash('error', err);
                console.log(err);
            } else {
                req.flash('success', 'success assign manager');
            }
            console.log(user);
            return res.redirect('/assign');
        });
    });

    app.get('/customer/:who', function (req, res) {
        if (!req.session.user || req.session.user.name != 'admin') {
            req.flash('error', 'un-auth error');
            return res.redirect('/');
        }
        User.findOneAndUpdate({"_id":req.params.who}, {"role":"customer"}, function (err, user) {
            if (err) {
                req.flash('error', err);
                console.log(err);
            } else {
                req.flash('success', 'success assign customer');
            }
            return res.redirect('/assign');
        });
    });

    app.get('/user/update/:who', function (req, res) {
        User.findOne({"name":req.params.who}).exec(function (err, who) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/assign');
            }
            Role.find().where("name").ne("admin").exec(function (err, roles) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/assign');
                }

                res.render('user', {
                    title:'user modify',
                    user:req.session.user,
                    who:who,
                    roles:roles,
                    success:req.flash('success').toString(),
                    error:req.flash('error').toString()
                });

            });
        });

    });

    app.post('/user/save', function (req, res) {
        User.findOne({name:req.body.who.name}, function (err, who) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/user/update/' + req.body.who.name);
            }

            who.set('role', req.body.who.role);

            who.save(function (err, who) {
                if (err) {
                    req.flash('error', err);
                } else {
                    req.flash('success', 'success save');
                }
                return res.redirect('/user/update/' + req.body.who.name);
            });
        });
    });


    //role module
    app.get('/role/create', function (req, res) {

        if (!req.session.user) {
            req.flash('error', 'un-auth error');
            return res.redirect('/');
        }

        Role.find(function (err, roles) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }

            res.render('role/create', {
                title:'role create',
                user:req.session.user,
                roles:roles,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        });


    });

    app.post('/role/save', function (req, res) {
        if (!req.body.role.name) {
            req.flash('error', 'role name can not be empty');
            return res.redirect('/');
        }

        Role.findOne({name:req.body.role.name}, function (err, role) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            if (role) {
                req.flash('error', 'role name is exist.');
                return res.redirect('/role/create');
            }

            var parent = req.body.role.parent ? req.body.role.parent : -1;
            var newRole = new Role({name:req.body.role.name, parent:parent});
            newRole.save(function (err, newRole) {
                if (err) {
                    req.flash('error', 'Fail to save');
                    return res.redirect('/role/create');
                }
                req.flash('success', 'Success save');
                return res.redirect('/');
            });
        });

    });

    app.get('/role/list', function (req, res) {
        Role.find(function (err, roles) {
            res.render('role/list', {
                title:'role list',
                user:req.session.user,
                roles:roles,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        });
    });

    //role view
    app.get('/role/:name', function (req, res) {
        //step:1 find role
        Role.findOne({name:req.params.name}, function (err, role) {
            if (err) {
                req.flash('error', 'Role not found');
                return res.redirect('/role/create');
            }

            Role.find(function (err, roles) {
                if (err) {
                    req.flash('error', 'Fail to get roles');
                    return res.redirect('/role/create');
                }
                res.render('role/view', {
                    title:'role view',
                    user:req.session.user,
                    role:role,
                    roles:roles,
                    success:req.flash('success').toString(),
                    error:req.flash('error').toString()
                });
            });

        });
    });


    app.get('/:model/:name/view', function (req, res) {
        var lowerCase = req.params.model.toLowerCase();
        if (!Robot.isModel(lowerCase)) {
            req.flash('error', 'model not found');
            return res.redirect('/');
        }
        var model = Robot.getModel(lowerCase);
        model.findOne({name:req.params.name}, function (err, _model) {
            if (err) {
                req.flash('error', err);
                // redirect to list view
                return res.redirect('/' + lowerCase + '/list');
            }

            res.render(lowerCase + '/view', {
                title:'view',
                user:req.session.user,
                model:_model,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });

        });
    });

    //-----------------------------question-------------
    app.get("/question", function (req, res) {
        if (!req.session.user) {
            req.flash('error', 'un-auth');
            return res.redirect('/');
        }
        Question.total(req.session.user._id, function (err, total) {
            if (err) throw err;
            Question.totalRight(req.session.user._id, function (err, totalRight) {
                if (err) throw err;

                if (req.session.lastQuestion) {

                    var race = 0;
                    if (total != 0) {
                        race = Math.round(totalRight / total * 100, 5);
                    }
                    req.flash("error", "骚年，刷新也没用，要答题，哈哈哈哈！");
                    res.render('question/index', {
                        title:'Sandbox',
                        user:req.session.user,
                        question:req.session.lastQuestion,
                        answerTotal:total,
                        answerRight:totalRight,
                        answerRate:race,
                        success:req.flash('success').toString(),
                        error:req.flash('error').toString()
                    });
                } else {
                    Question.random(req.session.user._id, function (err, question) {
                        req.session.lastQuestion = question;
                        var race = 0;
                        if (total != 0) {
                            race = Math.round(totalRight / total * 100, 5);
                        }
                        res.render('question/index', {
                            title:'Sandbox',
                            user:req.session.user,
                            question:question,
                            answerTotal:total,
                            answerRight:totalRight,
                            answerRate:race,
                            success:req.flash('success').toString(),
                            error:req.flash('error').toString()
                        });
                    });
                }

            });
        });

    });

    app.get("/question/create", function (req, res) {
        if (!req.session.user) {
            req.flash('error', 'un-auth');
            return res.redirect('/');
        }
        res.render('question/create', {
            title:'Sandbox',
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post("/question/save", function (req, res) {
        if (!req.body.answer.isRight || !req.body.answer.content) {
            req.flash('error', '少年，请填写答案项并选择正确答案后再提交~');
            return res.redirect("/question/create");
        }

        var tmp_path = req.files.question.imgLink.path;
        var file_name = req.files.question.imgLink.name;
        var target_path = './public/images/' + file_name;
        if (!file_name) {
            req.flash('error', '少年，说好的图片呢');
            return res.redirect("/question/create");
        }

        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            fs.unlink(tmp_path, function () {
                if (err) throw err;
                //-----------------
                var newQuestion = new Question({name:req.body.question.name, imgLink:file_name, isMulti:req.body.question.isMulti});

                var isRightArray = req.body.answer.isRight;
                for (var i = 0; i < req.body.answer.content.length; i++) {
                    newQuestion.answers.push({content:req.body.answer.content[i], isRight:Robot.arrayContains(isRightArray, i + 1)});
                }

                newQuestion.save(function (err, newQuestion) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect("/");
                    }
                    req.flash('success', 'save question ok');
                    //all save ok
                    return res.redirect("/question/create");
                });

            });
        });
    });

    app.post("/question/answer", function (req, res) {

        if (!req.body.answer.answerItemId) {
            req.flash('error', '骚年,请选择答案 ！');
            return res.redirect('/question');
        }
        Answer.findOne({question:req.body.answer.questionId, answerer:req.session.user._id}).exec(function (err, answer) {
            if (err) throw err;
            if (answer) {
                req.flash('error', '您已经答过这道题了!要乖，不要作弊.');
                return res.redirect('/question');
            }

            Question.findOne({_id:req.body.answer.questionId}).exec(function (err, question) {
                if (err) throw err;
                var answersArray = question.answers;
                var ok = false;

                for (var i = 0; i < answersArray.length; i++) {
                    if (answersArray[i].isRight && answersArray[i]._id == req.body.answer.answerItemId) {
                        ok = true;
                        break;
                    }
                }

                var newAnswer = new Answer({question:req.body.answer.questionId, answerer:req.session.user._id});
                newAnswer.set('isRight', ok);
                newAnswer.save(function (err, newAnswer) {
                    if (err) throw err;
                    if (ok) {
                        // answer is right
                        User.pointAdd(req.session.user._id, function (err, user) {
                            if (err) throw err;
                            req.session.user = user;
                            req.session.lastQuestion = null;
                            req.flash('success', '好牛逼呀，你居然他妈的答对了。继续加油！');
                            return res.redirect('/question');
                        });

                    } else {
                        req.flash('error', '我擦，这题居然答错了。再接再励，加油！');
                        req.session.lastQuestion = null;
                        return res.redirect('/question');
                    }

                });

            });
        });


    });

    app.get("/about", function (req, res) {
        res.render('about', {
            title:'About',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });


}