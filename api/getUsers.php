<?php
header("Content-Type: application/json");
include "db.php";

$sql = "SELECT id,name,email,role FROM users";
$res = $conn->query($sql);

$data = [];

while($row = $res->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);
?>