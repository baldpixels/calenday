// day_calc.js
// determines day of week based on date (year, month, day)

/*** VARIABLES ***/
const MONTH_KEYS = {
  "January": 1,
  "February": 4,
  "March": 4,
  "April": 0,
  "May": 2,
  "June": 5,
  "July": 0,
  "August": 3,
  "September": 6,
  "October": 1,
  "November": 4,
  "December": 6
};

// CENT_KEYS are determined by
const CENT_KEYS = {
  1: 4, // e.g. 1700's
  2: 2, // e.g. 1800's
  3: 0, // e.g. 1900's
  0: 6 // e.g. 2000's
};

const DAY_KEYS = {
  1: "Sunday",
  2: "Monday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Thursday",
  6: "Friday",
  0: "Saturday"
};

/*** FUNCTIONS ***/
// dayOfWeek() -> function for determining day of week based on date
/* arguments:
  * year (int),
  * month (String),
  * day (int)
*/
function dayOfWeek(year, month, day) {
  // save last two digits of year as yrL
  var yrL = parseInt(year.toString().substr(-2));

  // divide yrL by 4 and Math.floor it
  var yrFloor = Math.floor(yrL / 4.0);

  // add yrFloor, day, and month key
  var sum = yrFloor + day + MONTH_KEYS[month];

  // if month is January or February, subtract 1
  if((month === "Januray") || (month === "February")) {
    sum--;
  }

  // calculate century key
  var relCent = year % 400;
  relCent = Math.floor(relCent / 100.0);

  // add century code and last two digits of year
  sum += CENT_KEYS[relCent];
  sum += yrL;

  // mod by 7 for day of week key
  sum = sum % 7;
  return DAY_KEYS[sum];
}
