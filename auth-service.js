const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

//Creating a schema for our database
const userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [
        {
            "dateTime": Date,
            "userAgent": String
        }
    ]
});

//Creating user object using the schema
let User;

//
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://hannah0890:Huyen2008!%40@cluster0.e8twule.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true});

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function(userData) {
    return new Promise(function(resolve, reject)  {
        if(userData.password !== userData.password2){
            reject("Passwords do not match");
        }else{
            //Hashing the password before storing it
            bcrypt.hash(userData.password, 10).then((hash) => {
                userData.password = hash;
                //Saving the user data
                let newUser = new User(userData);
                newUser.save().then(()=>{
                    resolve();                 

                }).catch((err)=>{
                    if(err.code === 11000){
                        reject("User Name already taken")
                    }else{
                        reject("There was an error creating the user: "+ err);
                    }
                })

            })
            .catch((err)=>{
                console.log(err);
                reject("There was an error encrypting the password")
            });
        }
    })
}
//Check if the user's login credentials are right
module.exports.checkUser = function(userData){
    return new Promise(function(resolve, reject) {
        User.find({userName : userData.userName})
        .exec()
        .then((users)=>{
            if(users.length === 0){
                reject("Unable to find user: " + userData.userName);
            }else{
                bcrypt.compare(userData.password, users[0].password).then((result)=>{
                    if(result){
                        users[0].loginHistory.push({dateTime:(new Date()).toString(),userAgent: userData.userAgent});
                        User.updateOne({userName: users[0].userName},
                            {$set: {loginHistory: users[0].loginHistory}}).then(()=>{
                                resolve(users[0]);
                            }).catch((err)=>{
                                reject("There was an error verifying the user: " + err);
                            })
                    }else{
                        reject("Incorrect Password for user: " + userData.userName);
                    }
                }).catch((err)=>{
                    reject("Error comparing hashed password!");
                });
        
            }
        }).catch((err)=>{
            reject("There was an error verifying the user" + userData.userName);
        })
        
    })
}
