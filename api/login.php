<?php
header("Content-Type: application/json");
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success"=>false, "error"=>"No data"]);
    exit;
}

$email = $conn->real_escape_string($data["email"]);
$password = $data["password"];

$sql = "SELECT * FROM users WHERE email='$email'";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();

 
    if ($user["password"] == $password) {
        echo json_encode([
            "success" => true,
            "user" => $user
        ]);
    } else {
        echo json_encode(["success" => false, "error"=>"Password incorrect"]);
    }

} else {
    echo json_encode(["success" => false, "error"=>"User not found"]);
}