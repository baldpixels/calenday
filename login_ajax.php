<?php
// login_ajax.php

/*** HEADER ***/
  session_start();
  header("Content-Type: application/json");

  $username = $_POST['username'];
  $password = $_POST['password'];

  require('database.php');

/*** FUNCTIONS ***/
  function begin_user_session($username, $user_id) {
    $_SESSION['username'] = $username;
    $_SESSION['user_id'] = $user_id;
    $_SESSION['token'] = substr(md5(rand()), 0, 10);
  }

/*** MAIN RUN ***/
  // select user info from database
  $stmt = $mysqli->prepare("SELECT id, username, password
          FROM
              users
          WHERE
              username = ?");
  if(!$stmt) {
    $stmt->close();

    echo json_encode(array(
      "success" => false,
      "message" => "stmt prep failed."
    ));
    exit;
  }
  else {
    $stmt->bind_param('s', $username);

    if($stmt->execute()) {
      $stmt->store_result();

      if($stmt->num_rows == 0) {
        $stmt->free_result();
        $stmt->close();

        echo json_encode(array(
      		"success" => false,
          "message" => "username not found."
      	));
      	exit;
      }
      else {
        $stmt->bind_result($returned_id, $returned_username, $returned_password);

        $stmt->fetch();

        // lastly, verify the password
        if(password_verify($password, $returned_password)) {
          // SUCCESS!
          begin_user_session($username, $returned_id);

          $stmt->free_result();
          $stmt->close();

          echo json_encode(array(
        		"success" => true
        	));
        	exit;
        }
        else {
          $stmt->free_result();
          $stmt->close();

          echo json_encode(array(
            "success" => false,
            "message" => "incorrect password."
          ));
          exit;
        }
      }
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

?>
