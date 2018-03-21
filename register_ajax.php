<?php
// register_ajax.php

/*** HEADER ***/
  session_start();
  header("Content-Type: application/json");

  $username = $_POST['username'];
  $password = $_POST['password'];
  $password_check = $_POST['password_check'];

  require('database.php');

/*** MAIN RUN ***/
  if(strcmp($password, $password_check) == 0) {
    //submit form to users database
    $stmt = $mysqli->prepare("INSERT INTO
                users(username, password)
            VALUES(?, ?)");
    if(!$stmt) {
      $stmt->close();

      echo json_encode(array(
        "success" => false,
        "message" => "stmt prep failed."
      ));
      exit;
    }

    $stmt->bind_param('ss', $username, password_hash($password, PASSWORD_DEFAULT));

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
  }
  else {
  	echo json_encode(array(
  		"success" => false,
  		"message" => "Passwords do not match."
  	));
  	exit;
  }

?>
