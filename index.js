const { MongoClient, ObjectId } = require('mongodb');

const connectionURL = "mongodb://127.0.0.1:27017";

const databaseName = "task-manager";

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log("Unable to Connect with Database");
    }

    const db = client.db(databaseName);

    // db.collection('tasks').insertMany([
    //     {
    //         "task": "Frontend Development",
    //         "completed": false
    //     },
    //     {
    //         "task": "Database Development",
    //         "completed": true
    //     },

    //     {
    //         "task": "Backend Development",
    //         "completed": false
    //     }
    // ], (error, result) => {
    //     if (error) {
    //         return console.log("Unable to save in Database");
    //     }
    //     console.log("Tasks Saved in Database");
    // })

    db.collection("tasks").findOne({ _id:new ObjectId("627f39b8e23b93603156a2be")}, (error, result) => {
        if (error) {
            return console.log("Unable to fetch");
        }
        console.log(result);
    })

    // db.collection('tasks').find({ completed: false }).toArray((error, result) => {
    //     console.log(result);
    // })
})