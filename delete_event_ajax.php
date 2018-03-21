<?php
// delete_event_ajax.php

/*** HEADER ***/
  session_start();
  header("Content-Type: application/json");

  $username = $_SESSION['username'];
  $event_id = $_POST['event_db_id'];

  require('database.php');

/*** MAIN RUN ***/
  $stmt = $mysqli->prepare("DELETE FROM
              events
          WHERE id=?");
  if(!$stmt) {
    $stmt->close();

    echo json_encode(array(
      "success" => false,
      "message" => "stmt prep failed."
    ));
    exit;
  }

  $stmt->bind_param('i', $event_id);

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
