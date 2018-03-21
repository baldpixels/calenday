<?php
// events_count_ajax.php

/*** HEADER ***/
  session_start();
  header("Content-Type: application/json");

  require('database.php');

  $username = $_SESSION['username'];
  // grab user_id from database
  $stmt = $mysqli->prepare("SELECT id
          FROM
              users
          WHERE
              username = ?");
  $stmt->bind_param('s', $username);
  $stmt->execute();
  $stmt->bind_result($returned_id);
  $stmt->fetch();
  $user_id = $returned_id; // all that for this lil' guy
  $stmt->free_result();
  $stmt->close();

  //$selected_day = $_POST['selected_day'];
  $selected_month = '' . (1 + (int)$_POST['selected_month']);
  // formatting issue (leading 0 on month number)
  if($selected_month < 10) {
    $selected_month = '0' . $selected_month;
  }
  $selected_year = $_POST['selected_year'];

  $month_length = (int)$_POST['month_length'];

  // fill this with count values
  $event_count_array = array();

/*** MAIN RUN ***/
  for($i=1; $i<$month_length+1; $i++) {
    $selected_date = '' . $selected_year . '-' . $selected_month . '-' . $i; // combine date elements

    $stmt = $mysqli->prepare("SELECT id, name, event_time
            FROM
                events
            WHERE owned_by=? AND event_date=?");
    if(!$stmt) {
      $stmt->close();
      // do nothing?
      exit;
    }

    $stmt->bind_param('is', $user_id, $selected_date);

    if($stmt->execute()) {
      $stmt->store_result();

      if($stmt->num_rows == 0) {
        $stmt->free_result();
        $stmt->close();
        array_push($event_count_array, 0);
      }
      else {
        $stmt->bind_result($returned_event_id, $returned_event_name, $returned_event_time);

        $counter = 0;
        while($stmt->fetch()) {
          $counter++;
        };

        array_push($event_count_array, $counter);

        $stmt->free_result();
        $stmt->close();
      }
    }
    else {
      $stmt->close();
      // do nothing?
    	exit;
    }
  }

  echo '{"event_count_array":';
  echo json_encode($event_count_array);
  echo '}';
  exit;

?>
