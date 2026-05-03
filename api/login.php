<?php
require __DIR__ . "/db.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"];
$password = $data["password"];

$db = Database::connection();

$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);

$user = $stmt->fetch();

if ($user && $password === $user["password"]) {
    echo json_encode([
        "success" => true,
        "user" => [
            "name" => $user["name"],
            "email" => $user["email"],
            "role" => $user["role"]
        ]
    ]);
} else {
    echo json_encode(["success" => false]);
}