<?php
// add_event_ajax.php

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

  $event_name = $_POST['event_name'];
  $event_date = $_POST['event_date'];
  $event_time = $_POST['event_time'];

/*** MAIN RUN ***/
  $stmt = $mysqli->prepare("INSERT INTO
              events(name, owned_by, event_date, event_time)
          VALUES(?, ?, ?, ?)");
  if(!$stmt) {
    $stmt->close();

    echo json_encode(array(
      "success" => false,
      "message" => "stmt prep failed."
    ));
    exit;
  }

  $stmt->bind_param('siss', $event_name, $user_id, $event_date, $event_time);

  if($stmt->execute()) {
    $stmt->close();

    echo json_encode(array(
      "success" => true
    ));
    exit;
  }
  else {
    $stmt->close();

    echo json_encode(array(
      "success" => false,
      "message" => "stmt failed to execute."
    ));
    exit;
  }

?>
