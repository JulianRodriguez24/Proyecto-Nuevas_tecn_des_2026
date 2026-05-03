<?php
header("Content-Type: application/json");
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = $conn->real_escape_string($data["name"]);
$email = $conn->real_escape_string($data["email"]);
$password = $conn->real_escape_string($data["password"]);
$role = $conn->real_escape_string($data["role"]);

$sql = "INSERT INTO users (name,email,password,role)
        VALUES ('$name','$email','$password','$role')";

if ($conn->query($sql)) {
    echo json_encode(["success"=>true]);
} else {
    echo json_encode(["success"=>false]);
}
?>