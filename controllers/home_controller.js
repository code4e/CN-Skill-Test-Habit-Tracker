const Habit = require('../models/habit');


module.exports.getBestStreak = async (req, res) => {
    let { id } = req.params;
    try {
        let habit = await Habit.findById(id);
        let statuses = habit.dates.map(d => d.status);
        let bestStreak = subarray(statuses);
        return res.status(200).json({
            message: "Best Streak fetched sucessfully",
            streak: `${bestStreak} / ${statuses.length}`
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports.home = async (req, res) => {
    //take out all the habits that exist in the database
    try {
        let habits = await Habit.find({}).sort({ createdAt: 1 });
        return res.render('default_view', {
            habits,
            view: "Daily"
        });
    } catch (error) {
        console.log(error, 'Error in fetching the habits found');
    }

}


module.exports.delete = async (req, res) => {
    let { id } = req?.params;
    try {
        //check if habit exists
        let habit = await Habit.findById(id);
        if (habit) {
            await Habit.findByIdAndDelete(id);

            return res.status(200).json({
                message: "Habit deleted successfully",
                habit
            })
        } else {
            return res.status(500).json({
                message: "Habit not found!"
            });
        }
    } catch (error) {
        return res.status(401).json({
            error: error,
            message: "Unable to delete the habit"
        });
    }
}



//add new habit the database
module.exports.add = async (req, res) => {
    let { start, end, title, description } = req.body;
    let dates = createDatesArray(start, end);
    try {
        let habit = await Habit.create({
            title,
            description,
            start: new Date(start),
            end: new Date(end),
            dates
        });
        return res.status(200).json({
            message: "Successfully added the habit",
            data: {
                habit
            }
        });

    } catch (error) {
        // console.log(error);
        // res.redirect('back');
        return res.status(401).json({
            message: "Failed to add the habit",
            error
        });
    }

}


//update the habit day status
module.exports.update = async (req, res) => {
    let { dayId, currentStatus, parentId } = req.body;
    let newStatus;

    if (currentStatus === "None") newStatus = "Done";
    else if (currentStatus === "Done") newStatus = "NotDone"
    else if (currentStatus === "NotDone") newStatus = "None"

    try {

        let habit = await Habit.findOneAndUpdate({ _id: parentId, dates: { $elemMatch: { _id: dayId } } },
            {
                $set: {
                    'dates.$.status': newStatus,
                }
            }, // list fields you like to change
            { 'new': true, 'safe': true, 'upsert': true });

        let date = await habit.dates.id(dayId);

        let bestStreak = subarray(habit.dates.map(h => h.status));
        // console.log(streak);

        return res.status(200).json({
            message: "Day status updated sucessfully",
            data: {
                date,
                streak : `${bestStreak} / ${habit.dates.length}`
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: `Error occured in updating the habit with id, ${dayId}`,
            error
        });
    }
}

function createDatesArray(startDate, endDate, steps = 1) {
    const dateArray = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
        dateArray.push({
            date: new Date(currentDate),
            status: 'None'
        });
        // Use UTC date to prevent problems with time zones and DST
        currentDate.setUTCDate(currentDate.getUTCDate() + steps);
    }

    return dateArray;
}


module.exports.homeDaily = async (req, res) => {
    try {
        let habits = await Habit.find({}).sort({ createdAt: 1 });
        return res.render('daily_view', {
            habits,
            view: "Weekly"
        });
    } catch (error) {
        console.log(error, 'Error in fetching the habits found');
    }
}


module.exports.editHabit = async (req, res) => {
    let { id } = req?.params;
    let { title, description, start, end } = req.body;

    try {
        let currentHabit = await Habit.findById(id);
        let updateObj = {};
        updateObj.title = title;
        updateObj.description = description;
        if ((new Date(start)).toString() != currentHabit.start.toString()) updateObj.start = start;
        if ((new Date(end)).toString() != currentHabit.end.toString()) updateObj.end = end;
        if ((new Date(start)).toString() != currentHabit.start.toString() || (new Date(end)).toString() != currentHabit.end.toString()) {
            updateObj.dates = createDatesArray(start, end);
        }

        let habit = await Habit.findByIdAndUpdate(id, updateObj);
        let updatedHabit = await Habit.findById(id);

        return res.status(200).json({
            message: "Habit updated sucessfully",
            data: {
                habit: updatedHabit
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: `Error occured in updating the habit with id, ${id}`,
            error
        });
    }
}

function subarray(arr) {

    if(arr?.every(elem => elem != "Done")) return 0;

    let ans = 1, temp = 1;

    // Traverse the array
    for (let i = 1; i < arr.length; i++) {

        // If element is same as
        // previous increment temp value
        if (arr[i] == arr[i - 1] && arr[i] == 'Done') {
            ++temp;
        }
        else {
            ans = Math.max(ans, temp);
            temp = 1;
        }
    }
    ans = Math.max(ans, temp);

    // Return the required answer
    return ans;
}
