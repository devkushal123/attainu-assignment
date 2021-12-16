var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var User     = require("./user");

var TaskSchema = new Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: User
    },
    taskname: {
        type: String,
        required: [true, 'Taskname is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    deadline: {
        type: Date,
        default: Date.now,
        required: [true, 'Please select Deadline date']
    },
    priority: {
        type: String, 
        enum : {
            values:[1,2,3], // 1->high, 2->medium, 3-> low
            message: 'Please select priority'
        }, 
        default: 3
    },
    task_timeline_type: {
        type: String, 
        enum : {
            values:["overdue","today","upcoming"],
            message: 'Please select Task Timeline Type'
        }, 
        default: "today"
    },
    status: {
        type: String, 
        enum : ['incomplete', 'complete'], 
        default: 'incomplete'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);
