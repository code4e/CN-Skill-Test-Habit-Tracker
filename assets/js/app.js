(function () {

    const AddNewHabbit = e => newHabitForm.submit();

    const daysBetween = (one, another) => Math.round(Math.abs((+one) - (+another)) / 8.64e7);

    let addNewHabbitBtn = $('#add-new-habbit-form-btn');
    addNewHabbitBtn.click(AddNewHabbit);

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
        <div class="card-body">
          <h5 class="card-title">${habit.title}</h5>
          <div id=carousel-${habit._id} class="carousel carousel-dark slide" data-bs-interval="false" data-bs-ride="" data-bs-wrap="false">
            <div class="carousel-inner">`;

        for (let page = 1; page <= Math.ceil(habit.dates.length / 7); page++) {
            habitHTMLString += `<div class="carousel-item ${page == 1 ? " active" : ""}">
                  <div class="week-cont">`;

            for (let d = (7 * (page - 1)); d <= ((7 * page) - 1); d++) {
                if (d < habit.dates.length) {

                    habitHTMLString += `<div class="day-cont ${habit._id}" id="day-${habit.dates[d]._id}">
                          <span>
                            ${new Date(habit.dates[d].date).toLocaleString('en-us', {
                        weekday: "short",
                        month: "short", day: "numeric",
                    })}
                          </span>
                          <i class="day-ico bi bi-${(habit.dates[d].status == "None" ? "" : (habit.dates[d].status == "Done" ? "check-" : "x-"))}circle-fill"></i>
                        </div>`;

                }
            }
            habitHTMLString += `</div>
                </div>`;
        }
        habitHTMLString += `</div>
            <button class="carousel-control-prev" type="button" data-bs-target=#carousel-${habit._id} data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target=#carousel-${habit._id} data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>
          <div class="delete-icon-cont">
            <a href="#" id="streak-${habit._id}" class="btn btn-primary get-best-streak-btn" data-bs-trigger="hover focus" data-toggle="popover" title="Click on the button to get your best streak" data-content="Some content inside the popover">Get Best Streak</a>
            <i class="bi bi-trash-fill" id="delete-${habit._id}"></i>
          </div>
        </div>
      </div>`;

        let habitHTML = $(habitHTMLString);
        $('.habit-list-cont').append(habitHTML);

        //attach button popover to the newly added habit
        $('[data-toggle="popover"]').popover();
        $('[data-toggle="popover"]').mouseout(e => $('[data-toggle="popover"]').popover('hide'));
    }





    function getFormDates(formData) {
        let paramsArr = formData?.split("&");
        let start = new Date(paramsArr[2]?.split("=")[1]);
        let end = new Date(paramsArr[3]?.split("=")[1]);
        return [start, end];
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

    function updateHabit(element) {
        let dayId = element?.parentElement?.id?.split("-")[1];
        let currentStatus = element?.classList[2]?.includes("check") ? "Done" : element?.classList[2]?.includes("x") ? "NotDone" : "None"
        let parentId = element?.parentElement?.classList[1];
        $.ajax({
            method: "PATCH",
            url: "/update",
            data: { dayId, currentStatus, parentId },
            success: function (data) {
                // console.log('Day status Updated', data?.data?.date?.status);
                let newStatus = data?.data?.date?.status;
                if (newStatus === "Done") {
                    $(element).removeClass("bi-x-circle-fill");
                    $(element).removeClass("bi-circle-fill");
                    $(element).addClass("bi-check-circle-fill");

                } else if (newStatus === "NotDone") {
                    $(element).removeClass("bi-check-circle-fill");
                    $(element).removeClass("bi-circle-fill");
                    $(element).addClass("bi-x-circle-fill");
                }
                else if (newStatus === "None") {
                    $(element).removeClass("bi-x-circle-fill");
                    $(element).removeClass("bi-check-circle-fill");
                    $(element).addClass("bi-circle-fill");
                }

                let streakSpan = $(`#streak-${parentId}`);
                if (streakSpan.text() != "Get Best Streak") {
                    streakSpan.text(data?.data?.streak);
                }

                //show noty for sucessfull update
                $.getScript("/js/notifications.js", function () {
                    showSucessNotification(data?.message);
                });

            },
            error: function (error) {
                $.getScript("/js/notifications.js", function () {
                    showErrorNotification(error.responseJSON?.message);
                })
            }
        });
    }

    function getBestStreak(element) {
        let id = element?.id?.split("-")[1];
        $.ajax({
            method: "GET",
            url: `/get-best-streak/${id}`,
            success: (data) => {
                let jqueryElement = $(element);
                jqueryElement.text(data?.streak);
                jqueryElement.removeAttr('title');
                jqueryElement.attr('title', "Your best streak so far");
            },
            error: (error) => {
                console.log(error);
            }
        });

    }


    $(".habit-list-cont").click(e => {
        let element = e.target;
        if (element.tagName == "I" && element.classList.contains("bi-trash-fill")) {
            deleteHabit(element);
        } else if (element.tagName == "I" && element.classList.contains("day-ico")) {
            updateHabit(element);
        } else if (element.tagName == "A" && element.classList.contains("get-best-streak-btn")) {
            e.preventDefault();
            getBestStreak(element);
        }
    });





    $("#Daily-view").click((e => {
        var a = document.createElement('a');
        a.href = "/show-daily";
        a.click();
    }));


})();