var express = require('express');
var router = express.Router();
var User = require('../schema/user');
var Task = require('../schema/task');
const logging = require('../config/logging');
/* GET home page. */

const mongooseErrorFormatter = (rawErrors) => {
    const errors = {}
    const details = rawErrors.errors
    for (const key in details) {
        errors[key] = [details[key].message]
    }
    return errors
}


/* GET register page. */
router.get('/register', checkNotAuthenticated, function (req, res) {
    if(req.session.user)
    {
        return res.redirect('/users/dashboard');
    }
    res.render('register', { title: 'Register' });
});

/* GET login page. */
router.get('/login', checkNotAuthenticated, function (req, res) {
    // console.log(req.session.user)
    if(req.session.user)
    {
        return res.redirect('/users/dashboard');
    }
    res.render('login', { title: 'Login', errorMsg: req.flash('errorMsg'), successMsg: req.flash('successMsg') });
});

/* REGISTER USER. */
router.post('/register', checkNotAuthenticated, function (req, res) {
    // logging.info(req.body)
    var data = new User(req.body);
    data.save(function (err) {
        if (err) {
            let errors = mongooseErrorFormatter(err);
            console.log( errors)
            const fnameErr = typeof errors.firstname != 'undefined'  ? errors.firstname : '';
            const lnameErr = typeof errors.lastname != 'undefined'  ? errors.lastname : '';
            const usernameErr = typeof errors.username != 'undefined'  ? errors.username : '';
            const passErr = typeof errors.password != 'undefined' ?  errors.password : '' ;
            const emailErr =  typeof errors.email != 'undefined' ? errors.email : '';
            res.render('register', { message: 'Invalid request!', usernameErr, passErr, emailErr, fnameErr, lnameErr });
        } else {
            req.flash('successMsg', 'User registered successfully!');
            return res.redirect("/users/login");
        }
    });
});

/**Login User */
router.post('/login', checkNotAuthenticated, function (req, res) {
    logging.info(req.body)
    if(req.body.email=='' || req.body.password==''){
        req.flash('errorMsg', 'Please fill the credentials.');
        return res.redirect("/users/login");
    }

    User.findOne({email:req.body.email}, function(err, user) {
        if (err) {
            let errors = mongooseErrorFormatter(err);
            console.log( errors)
            const emailErr =  typeof errors.email != 'undefined' ? errors.email : '';
            res.render('login', { message: 'Invalid User!',emailErr });
        }
        logging.info(user)
        if(user===null){
            res.render('login', { message: 'Invalid User!', emailErr:""});
        }else{
            user.comparePassword(req.body.password, function (err, isMatch) {
                console.log(user._id)
                if (isMatch && !err) {
                    req.session.user = user;
                    console.log(req.session.user)
                    req.flash('success', 'LoggedIn Successfully.');
                    return res.redirect("/users/dashboard");
                }else{
                    console.log("NOt match")
                    return res.render('login', { message: 'Invalid User!' });
                }
            });
        }
        
    });
});

/* GET Logout. */
router.get('/logout', function (req, res) {
    req.session.destroy();
    req.flash('successMsg', 'Logout Successfully.');
    return res.redirect('/users/login');
});

/**Showing task listing */
router.get('/dashboard', function (req, res) {
    if(!req.session.user)
    {
        return res.redirect('/users/login');
    }
    Task.find({user_id: req.session.user._id}, function (err, tasks) {
        if (err) {
            console.log(err);
        } else {
            res.render('task', { successMsg: req.flash('successMsg'), errorMsg: req.flash('errorMsg'), tasks: tasks });
        }
    }).sort({ priority: 1, created_at:-1 });
});

/* Add New Task. */
router.get('/addtask', function (req, res) {
    if(!req.session.user)
    {
        return res.redirect('/users/login');
    }
    res.render('addtask', { title: 'Add New Task' });
});

/* Add New Task. */
router.post('/addtask', function (req, res) {
    // logging.info(req.body)
    req.body["user_id"] = req.session.user._id;
    var data = new Task(req.body);
    data.save(function (err) {
        if (err) {
            let errors = mongooseErrorFormatter(err);
            console.log( errors)
            const tasknameErr = typeof errors.taskname != 'undefined'  ? errors.taskname : '';
            const deadlineErr = typeof errors.deadline != 'undefined'  ? errors.deadline : '';
            const priorityErr = typeof errors.priority != 'undefined'  ? errors.priority : '';
            const descriptionErr = typeof errors.description != 'undefined' ?  errors.description : '' ;
            const task_timeline_typeErr = typeof errors.task_timeline_type != 'undefined' ?  errors.task_timeline_type : '' ;
            
            res.render('addtask', { message: 'Invalid request!', priorityErr, tasknameErr, deadlineErr, descriptionErr, task_timeline_typeErr });
        } else {
            req.flash('successMsg', 'New Task created successfully!');
            return res.redirect("/users/dashboard");
        }
    });
});

/* GET SINGLE Task BY ID */
router.get('/edit/:id', function (req, res) {
    if(!req.session.user)
    {
        return res.redirect('/users/login');
    }
    Task.findById(req.params.id, function (err, task) {
        if (err) {
            console.log(err);
        } else {
            res.render('edittask', { errorMsg: req.flash('errorMsg'), successMsg: req.flash('successMsg'), taskDetail: task });
        }
    });
});

router.get('/changestatus/:id/:status', function (req, res) {
    if(!req.session.user)
    {
        return res.redirect('/users/login');
    }
    Task.findByIdAndUpdate(req.params.id, { status: (req.params.status == "incomplete") ? "complete":"incomplete"},  function (err, task) {
        if (err) {
            console.log(err);
        } else {
            req.flash('successMsg', 'Status Changed successfully!');
            return res.redirect("/users/dashboard");
        }
    });
});

/* UPDATE Task */
router.post('/edit/:id', function (req, res) {
    Task.findByIdAndUpdate(req.params.id, req.body, function (err) {
        if (err) {
            console.log(err)
            req.flash('errorMsg', 'Something went wrong! Task could not updated.');
            res.redirect('/users/edit/' + req.params.id);
        } else {
            req.flash('successMsg', 'Task updated successfully.');
            res.redirect('/users/dashboard');
        }
    });
});

/* DELETE Task BY ID */
router.get('/destroy/:id', function (req, res) {
    Task.findByIdAndRemove(req.params.id, function (err, project) {
        if (err) {
            req.flash('errorMsg', 'Task not deleted successfully.');
            res.redirect('/users/dashboard');
        } else {
            req.flash('successMsg', 'Task deleted successfully.');
            res.redirect('/users/dashboard');
        }
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/users/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/users/dashboard')
    }
    next()
}
module.exports = router;
