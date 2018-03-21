<?php
// database.php

  $mysqli = new mysqli('localhost', 'calenbae', 'calenbae', 'calenday');

  if($mysqli->connect_errno) {
  	printf("Connection Failed: %s\n", $mysqli->connect_error);
  	exit;
  }
?>
