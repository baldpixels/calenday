<?php
// load_events_ajax.php

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

  $selected_day = $_POST['selected_day'];
  $selected_month = '' . (1 + (int)$_POST['selected_month']);
  // formatting issue (leading 0 on month number)
  if($selected_month < 10) {
    $selected_month = '0' . $selected_month;
  }
  $selected_year = $_POST['selected_year'];

  $selected_date = '' . $selected_year . '-' . $selected_month . '-' . $selected_day; // combine date elements

/*** MAIN RUN ***/
  $stmt = $mysqli->prepare("SELECT id, name, event_time
          FROM
              events
          WHERE owned_by=? AND event_date=?");
  if(!$stmt) {
    $stmt->close();

    echo '{"events_info":[';
    echo json_encode(array(
      "success" => false,
      "message" => "stmt prep failed."
    ));
    echo ']}';
    exit;
  }

  $stmt->bind_param('is', $user_id, $selected_date);

  if($stmt->execute()) {
    $stmt->store_result();

    if($stmt->num_rows == 0) {
      $stmt->free_result();
      $stmt->close();

      echo '{"events_info":[';
      echo json_encode(array(
    		"success" => false,
        "message" => "you have no saved events for " . $selected_date . "."
    	));
      echo ']}';
    }
    else {
      $stmt->bind_result($returned_event_id, $returned_event_name, $returned_event_time);

      echo '{"events":[';
      $counter = 0;
      while($stmt->fetch()) {
        if($counter > 0) {
          echo ',';
        }
        echo json_encode(array(
          "event_id" => "" . $returned_event_id,
          "event_name" => "" . $returned_event_name,
          "event_time" => "" . $returned_event_time
        ));
        $counter++;
      };
      echo '],';

      echo '"events_info":[';
      echo json_encode(array(
        "events_counter" => $counter,
        "success" => true
      ));

      $stmt->free_result();
      $stmt->close();

      echo ']}';
      exit;
    }
  }
  else {
    $stmt->close();

    echo '{"events_info":[';
    echo json_encode(array(
  		"success" => false,
      "message" => "stmt failed to execute."
  	));
    echo ']}';
  	exit;
  }

?>
