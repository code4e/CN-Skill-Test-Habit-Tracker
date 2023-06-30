  // getting-started.js
  //sudo systemctl start mongod -> command to start mongodb daemon on ubuntu
  const mongoose = require('mongoose');

  main().catch(err => console.log(err));

  async function main() {

    //connecting to database
    // await mongoose.connect('mongodb://localhost:27017/habit_tracker_development');
    await mongoose.connect('mongodb+srv://umarsid007:N4rzhlRwVSLuw9KW@cluster0.3olwqe7.mongodb.net/?retryWrites=true&w=majority');
    
    
    // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
  }

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, "Error connection to Habit Tracker db"));

  db.once('open', () => {
      console.log('Connected to Habit Tracker db successfully');
  });