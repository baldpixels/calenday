// month_view.js

$(document).ready(function() {
/***** VARIABLES *****/
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const WEEKDAYS = '<div class="day_of_week">\
            Sunday\
          </div>\
          <div class="day_of_week">\
            Monday\
          </div>\
          <div class="day_of_week">\
            Tuesday\
          </div>\
          <div class="day_of_week">\
            Wednesday\
          </div>\
          <div class="day_of_week">\
            Thursday\
          </div>\
          <div class="day_of_week">\
            Friday\
          </div>\
          <div class="day_of_week">\
            Saturday\
          </div>';

  const REGISTER_FORM = '\
      <input id="username" type="text" name="username" placeholder="username" maxlength="18" />\
      <input id="password" type="password" name="password" placeholder="password" />\
      <input id="password_repeat" type="password" name="password_repeat" placeholder="repeat password" />\
      <button id="register_submit" type="button">submit</button>';

  const LOGIN_FORM = '\
      <input id="username" type="text" name="username" placeholder="username" maxlength="18" />\
      <input id="password" type="password" name="password" placeholder="password" />\
      <button id="login_submit" type="button">submit</button>';

  const ADD_EVENT_FORM = '\
      <input id="event_name" type="text" name="event_name" placeholder="event name" maxlength="48" />\
      <input id="event_date" type="date" name="event_date" />\
      <input id="event_time" type="time" name="event_time" />\
      <button id="add_event_submit" type="button">submit</button>';

const DEFAULT_USER_CONTROLS = '\
      <button id="login" type="button">login</buton>\
      <button id="register" type="button">register</button>';

const LOGGED_IN_USER_CONTROLS = '\
      <button id="logout" type="button">logout</buton>';

const EVENT_CONTROLS = '\
  <button id="add_event" type="button">add event</button>';

  var today = new Date();
  var todayDate = today.getDate();
  var todayYear = today.getFullYear();
  var todayMonth = today.getMonth();

  var selectedMonth = todayMonth;
  var selectedYear = todayYear;
  var selectedDay = todayDate;

  var user_logged_in = false;

  var count_wait = false;
  var events_count = [];

/***** FUNCTIONS *****/
/*** AJAX Functions ***/
  // REGISTER
  function register_ajax(event){
    var username = $('#username').val();
    var password = $('#password').val();
    var password_check = $('#password_repeat').val();

    var dataString = "username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&password_check=" + encodeURIComponent(password_check);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "register_ajax.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xmlHttp.addEventListener("load", function(event) {
      var jsonData = JSON.parse(event.target.responseText);
      if(jsonData.success) {
        // if registration works, then move the floater back up...
        pushup_floater();

        alert("Registration was successful.");

        // and log the new user in!
        login_ajax(event);
      }
      else {
        alert("Registration failed: " + jsonData.message);
      }
    }, false);

    xmlHttp.send(dataString);
  }

  // LOGIN
  function login_ajax(event) {
    var username = $('#username').val();
    var password = $('#password').val();

    var dataString = "username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "login_ajax.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xmlHttp.addEventListener("load", function(event) {
      var jsonData = JSON.parse(event.target.responseText);
      if(jsonData.success) {
        user_logged_in = true;

        // move the floater back up and set controls to 'logged_in'
        pushup_floater();
        set_user_controls('logged_in');
        $('#user_controls').append('<span id="user">' + username + '</span>');

        // update the calendar and load the user's events
        load_events_ajax();
        update_month(selectedMonth, selectedYear);

        alert("You've been Logged In!");

      }
      else {
        alert("You were not logged in.  " + jsonData.message);
      }
    }, false);
    xmlHttp.send(dataString);
  }

  function logout_ajax() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "logout_ajax.php", true);

    xmlHttp.addEventListener("load", function(event) {
      var jsonData = JSON.parse(event.target.responseText);
      if(jsonData.success) {
        user_logged_in = false;

        set_user_controls('default');
        // clear events
        $('#events').html('');
        update_month(selectedMonth, selectedYear);

        alert("You've been logged out.");
      }
      else {
        alert("Logout failed. <<<YOU ARE TRAPPED HERE FOREVER>>>  " + jsonData.message);
      }
    }, false);
    xmlHttp.send(null);
  }

  /* EVENT FUNCTIONS */
  function load_events_ajax() {
    var dataString = "selected_day=" + encodeURIComponent(selectedDay) + "&selected_month=" + encodeURIComponent(selectedMonth) + "&selected_year=" + encodeURIComponent(selectedYear);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "load_events_ajax.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xmlHttp.addEventListener("load", function(event) {
      var jsonData = JSON.parse(event.target.responseText);
      if(jsonData.events_info[0].success) {
        // first, clear events
        $('#events').html('');

        for(var i=0; i<jsonData.events_info[0].events_counter; i++) {
          var curr_event_id = jsonData.events[i].event_id;
          var curr_event_name = jsonData.events[i].event_name;
          var curr_event_time = jsonData.events[i].event_time;

          $('#events').append('<div id="event' + i + '" class="event">\
              <h4 class="event_name">' + curr_event_name + '</h4>\
              <button class="delete_event" type="button" name="' + curr_event_id + '">x</button>\
              <span class="event_time">@ ' + curr_event_time + '</span>\
            </div>');
        }
      }
      else {
        $('#events').html('');
      }
    }, false);
    xmlHttp.send(dataString);
  }

  function add_event_ajax() {
    var inputName = $('#event_name').val();
    var inputDate = $('#event_date').val();
    var inputTime = $('#event_time').val();
    var dataString = "event_name=" + encodeURIComponent(inputName) + "&event_date=" + encodeURIComponent(inputDate) + "&event_time=" + encodeURIComponent(inputTime);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "add_event_ajax.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xmlHttp.addEventListener("load", function(event) {
      var jsonData = JSON.parse(event.target.responseText);
      if(jsonData.success) {
        pushup_floater();
        load_events_ajax();

        update_month(selectedMonth, selectedYear);

        alert("Event created!");
      }
      else {
        alert("Event creation failed. " + jsonData.message);
      }
    }, false);
    xmlHttp.send(dataString);
  }

  function delete_event_ajax(event) {
    var event_db_id = $(event.target).attr('name');

    var dataString = "event_db_id=" + encodeURIComponent(event_db_id);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "delete_event_ajax.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xmlHttp.addEventListener("load", function(event) {
      var jsonData = JSON.parse(event.target.responseText);
      if(jsonData.success) {
        load_events_ajax();

        alert("Event deleted!");
      }
      else {
        alert("Event deletion failed. " + jsonData.message);
      }
    }, false);
    xmlHttp.send(dataString);
  }

  function events_count_ajax(currMonth, currYear, currMonthLength) {
    var dataString = "selected_month=" + encodeURIComponent(currMonth) + "&selected_year=" + encodeURIComponent(currYear) + "&month_length=" + encodeURIComponent(currMonthLength);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "events_count_ajax.php", false);
    count_wait = true;

    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    // issue: xmlHttp gets reset before listener fires
    xmlHttp.addEventListener("load", function(event) {
      var jsonData = JSON.parse(event.target.responseText);
      var events_count_array = jsonData.event_count_array;

      for(var i=0; i<events_count_array.length; i++) {
        events_count[i] = events_count_array[i];
      }

      count_wait = false;
    }, false);

    xmlHttp.send(dataString);
  }

/*** Other Functions ***/
  function update_month(month, year) {
    // resets month_viewer and selected_month header
    resetCalendarView();

    // re-append weekdays
    $('#month_viewer').append(WEEKDAYS);

    // update the month header
    $('#selected_month').append(MONTH_NAMES[month] + ' ' + year);

    var firstDay = new Date(MONTH_NAMES[month] + ' ' + 1 + ' ' + year).getDay();

    var monthLength = new Date(year, month+1, 0).getDate();

    // append days of month
    if(user_logged_in) {
      events_count_ajax(selectedMonth, selectedYear, monthLength);

      while(count_wait) {
        // keep waiting for count
      }
    }

    for(var i = 1; i < monthLength+1; i++) {
      if(user_logged_in) {

        if(events_count[i-1] > 0) {
          $('#month_viewer').append('<div class="day_cell" id="cell' + i + '">\
              <span class="cell_date"></span>\
              <span class="event_counter">' + events_count[i-1] + '</span>\
              </div>');
        }
        else {
          $('#month_viewer').append('<div class="day_cell" id="cell' + i + '">\
              <span class="cell_date"></span>\
              </div>');
        }
      }
      else {
        $('#month_viewer').append('<div class="day_cell" id="cell' + i + '">\
            <span class="cell_date"></span>\
            </div>');
      }
      // append date to freshly added cell
      $('#cell' + i + ' .cell_date').append(i);
    }

    // adjust where the first day of the month is located in the calendar grid
    var startColumn = firstDay + 1;
    $('#cell1').css('grid-column-start', '' + startColumn);
  }

  function update_day(month, year, date) {
    resetEventsView();

    // add 1 to month for standard month number
    month++;
    $('#selected_date').append(month + '/' + date + '/' + year);

    if(user_logged_in) {
      load_events_ajax();
    }
  }

  function resetCalendarView() {
    $('#selected_month').html('');

    $('#month_viewer').html('');
  }

  function resetEventsView() {
    $('#selected_date').html('');
  }

  function pulldown_floater(form, title) {
    if($(this).attr('id') === 'register') {
      fill_floater(REGISTER_FORM, 'Register');
    }
    else if($(this).attr('id') === 'login') {
      fill_floater(LOGIN_FORM, 'Login');
    }
    else if($(this).attr('id') === 'add_event') {
      fill_floater(ADD_EVENT_FORM, 'Add an Event');
    }
    else {

    }

    $('#floater').animate({
      top: '50%'
    }, 500, 'swing');
  }

  function fill_floater(form, title) {
    $('#floater_title').html(title);
    $('#floater_form').html(form);
  }

  function pushup_floater() {
    $('#floater').animate({
      top: '-100%'
    }, 500, 'swing');
  }

  function cell_hover() {
    selectedId = 'cell' + selectedDay;
    if($(this).attr('id') !== selectedId) {
      $(this).css('background-color', '#99ccff')
    }
  }

  function cell_leave() {
    selectedId = 'cell' + selectedDay;
    if($(this).attr('id') !== selectedId) {
      $(this).css('background-color', 'white');
    }
  }

  function cell_click() {
    // change previously selected cell back to white
    $('#cell' + selectedDay).css('background-color', 'white');
    // change currently selected cell to light blue
    $(this).css('background-color', '#ffcccc');
    // update selectedDay
    selectedDay = parseInt($(this).attr('id').replace( /[^\d.]/g, '' ));
    update_day(selectedMonth, selectedYear, selectedDay);
  }

  function next_month() {
    // check for December
    if(selectedMonth == 11) {
      // reset to January
      selectedMonth = 0;
      // and increase year
      selectedYear++;
    }
    else {
      selectedMonth++;
    }

    update_month(selectedMonth, selectedYear);

    update_day(selectedMonth, selectedYear, 1); // default selected day is 1
  }

  function prev_month() {
    // check for January
    if(selectedMonth == 0) {
      // reset to December
      selectedMonth = 11;
      // and decrease year
      selectedYear--;
    }
    else {
      selectedMonth--;
    }

    update_month(selectedMonth, selectedYear);

    update_day(selectedMonth, selectedYear, 1); // default selected day is 1
  }

  function set_user_controls(userType) {
    if(userType === 'default') {
      $('#user_controls').html(DEFAULT_USER_CONTROLS);
      $('#event_controls').html('Login or Register to save events!');
    }
    else if(userType === 'logged_in') {
      $('#user_controls').html(LOGGED_IN_USER_CONTROLS);
      $('#event_controls').html(EVENT_CONTROLS);
    }
    else {
      // do nothing cuz idk how u got here
    }
  }

/***** EVENT LISTENERS *****/
  $('#next_month').click(next_month);

  $('#prev_month').click(prev_month);

  $('#user_controls').on('click', '#login', pulldown_floater);

  $('#user_controls').on('click', '#register', pulldown_floater);

  $('#event_controls').on('click', '#add_event', pulldown_floater);

  $('#events').on('click', '.delete_event', delete_event_ajax);

  $('#floater_cancel').click(pushup_floater);

  $('#floater').on('click', '#register_submit', register_ajax);

  $('#floater').on('click', '#login_submit', login_ajax);

  $('#floater').on('click', '#add_event_submit', add_event_ajax);

  $('#user_controls').on('click', '#logout', logout_ajax);

  for(var i=1; i<32; i++) {
    // add event listeners for each potential cell
    $('#month_viewer').on('mouseover', '#cell' + i, cell_hover);
    $('#month_viewer').on('mouseout', '#cell' + i, cell_leave);
    $('#month_viewer').on('click', '#cell' + i, cell_click);
  }

/***** MAIN RUN *****/
  update_month(todayMonth, todayYear);

  update_day(todayMonth, todayYear, todayDate);

  set_user_controls('default');

  $('#cell' + todayDate).css('background-color', '#ffcccc');

});
