const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/task-manager");

const User = mongoose.model('User', {
    name: {
        type: String,
        required:true
    },
    age: {
        type: Number,
        required:true,
        validate(value){
            if(value<0){
                throw new Error('Age must be Postive')
            }
        }
    }
});

const me = new User({
    name: "Rajdip Banerjee",
    age: 24
});

me.save().then(() => {
    console.log(me);
}).catch((error) => {
    console.log(error);
})