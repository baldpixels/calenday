<?php
// logout_ajax.php

/*** HEADER ***/
  session_start();
  header("Content-Type: application/json");

/*** MAIN RUN ***/
  unset($_SESSION);
  session_destroy();

  echo json_encode(array(
    "success" => true,
  ));
  exit;
?>
