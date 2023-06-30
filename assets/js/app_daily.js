(function () {

    let editHabitId;

    $("#Weekly-view").click((e => {
        var a = document.createElement('a');
        a.href = "/";
        a.click();
    }));



    const AddNewHabbit = e => newHabitForm.submit();

    const daysBetween = (one, another) => Math.round(Math.abs((+one) - (+another)) / 8.64e7);

    let addNewHabbitBtn = $('#add-new-habbit-form-btn');
    addNewHabbitBtn.click(AddNewHabbit);

    function getFormDates(formData) {
        let paramsArr = formData?.split("&");
        let start = new Date(paramsArr[2]?.split("=")[1]);
        let end = new Date(paramsArr[3]?.split("=")[1]);
        return [start, end];
    }

    let newHabitForm = $('#new-habbit-form').submit(event => {
        event.preventDefault();
        let [start, end] = getFormDates(newHabitForm.serialize());

        if (start > end) {
            alert("Start date cannot lie after end date")
        } else if (+daysBetween(start, end) > 90) {
            alert("Period cannot be more than 90 days")
        } else {

            $.ajax({
                type: "POST",
                url: "/add",
                data: newHabitForm.serialize(),// serializes the form data i.e. converts the form data into json
                success: data => {
                    console.log('Habit added to the database');
                    $('#form-close-btn').click();
                    appendNewHabitHTML(data?.data?.habit);
                    // location.reload();
                    //show noty for sucessfull habit creation
                    $.getScript("/js/notifications.js", function () {
                        showSucessNotification(data?.message);
                    });
                },
                //show failure notification
                error: error => {
                    // console.log(error.responseJSON?.message);
                    $.getScript("/js/notifications.js", function () {
                        showErrorNotification(error.responseJSON?.message);
                    })
                }
            });
        }


    })

    function appendNewHabitHTML(habit) {
        let habitHTMLString = `<div class="card w-75 m-1" id="card-${habit._id}">
        <div class="card-body" habit-title="${habit.title}" habit-description="${habit.description}" habit-start="${habit.start}" habit-end="${habit.end}">
            <h5 class="card-title">
                ${habit.title}
            </h5>
            <h6 class="card-subtitle mb-2 text-muted start-date-cont">
                ${new Date(habit.start).toLocaleString('en-us', {
            weekday: "short",
            month: "short", day: "numeric"
        })}
            </h6>
            <p class="card-text">${habit.description}</p>
            <div class="delete-icon-cont">
                <i class="bi bi-pencil-square" id="edit-${habit._id}"></i>
                <i class="bi bi-trash-fill" id="delete-${habit._id}"></i>
            </div>
        </div>
    </div>`;

        let habitHTML = $(habitHTMLString);
        $('.habit-list-cont').append(habitHTML);
    }


    // show-add-new-modal

    $('.habit-list-cont').click(editOrDeleteHabit);


    function editOrDeleteHabit(e) {
        let element = e?.target;
        if (element.tagName == "I" && element.classList.contains("bi-trash-fill")) {
            deleteHabit(element);
        } else if (element.tagName == "I" && element.classList.contains("bi-pencil-square")) {
            editHabit(element);
        }
    }


    function deleteHabit(element) {
        let id = element?.id?.split("-")[1];
        $.ajax({
            url: `/delete/${id}`,
            type: 'DELETE',
            success: function (data) {
                $(`#card-${id}`).remove();
                //show noty for deletion
                $.getScript("/js/notifications.js", function () {
                    showSucessNotification(data?.message);
                });
            },
            error: function (error) {
                console.log('unable to delete');
                $.getScript("/js/notifications.js", function () {
                    showErrorNotification(error.responseJSON?.message);
                })
            }
        });
    }

    let editHabitForm = $('#edit-habit-form').submit(event => {
        event.preventDefault();
        let [start, end] = getFormDates(editHabitForm.serialize());
        if (start > end) {
            alert("Start date cannot lie after end date")
        } else if (+daysBetween(start, end) > 90) {
            alert("Period cannot be more than 90 days")
        } else {
            $.ajax({
                method: "PATCH",
                url: `/edit-habit/${editHabitId}`,
                data: editHabitForm.serialize(),
                success: function (data) {
                    $("#edit-form-close-btn").click();
                    editHabitHTML(data?.data?.habit, editHabitId);
                    // console.log(data?.data?.habit);
                    //show noty for sucessfull update
                    $.getScript("/js/notifications.js", function () {
                        showSucessNotification(data?.message);
                    });

                },
                error: function (error) {
                    console.log(error.responseText);
                    $.getScript("/js/notifications.js", function () {
                        showErrorNotification(error.responseJSON?.message);
                    })
                }
            });
        }
    });


    $('#edit-habit-form-btn').click(e => editHabitForm.submit());

    function editHabit(element) {
        editHabitId = element?.id?.split("-")[1];
        let card = $(element?.parentElement?.parentElement);
        let title = card.attr('habit-title');
        let description = card.attr('habit-description');
        let start = card.attr('habit-start');
        let end = card.attr('habit-end');
        let formData = {
            title,
            description,
            start,
            end
        };
        fillFormData(formData);
        $("#show-edit-modal").click();
    }

    function fillFormData(data) {
        let titleInput = editHabitForm[0][0];
        let descriptionInput = editHabitForm[0][1];
        let startInput = editHabitForm[0][2];
        let endInput = editHabitForm[0][3];
        titleInput.value = data.title;
        descriptionInput.value = data.description;
        startInput.valueAsDate = new Date(data.start);
        endInput.valueAsDate = new Date(data.end);
    }


    function editHabitHTML(habit, id) {
        let card = $(`#card-${id}`);
        let titleElement = card.find('.card-title');
        let startDateElement = card.find('.start-date-cont');
        let descriptionElement = card.find('.card-text');
        let cardBodyElement = card.find('.card-body');
        cardBodyElement.attr('habit-title', habit.title);
        cardBodyElement.attr('habit-description', habit.description);
        cardBodyElement.attr('habit-start', habit.start);
        cardBodyElement.attr('habit-end', habit.end);


        titleElement.text(habit.title);
        startDateElement.text(new Date(habit.start).toLocaleString('en-us', {
            weekday: "short",
            month: "short", day: "numeric"
        }));
        descriptionElement.text(habit.description);
    }



})();