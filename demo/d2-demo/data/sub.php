<?php
header('content-type:application/json;charset=gbk');

$id = $_GET['id'];

include_once('sub-'.$id.'.json');
?>