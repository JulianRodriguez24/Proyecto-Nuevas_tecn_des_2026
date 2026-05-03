<?php
header("Content-Type: application/json");

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "error" => "No data received"
    ]);
    exit;
}

$name = $data["name"] ?? "";
$email = $data["email"] ?? "";
$password = $data["password"] ?? "";
$role = $data["role"] ?? "customer";

if (!$name || !$email || !$password) {
    echo json_encode([
        "success" => false,
        "error" => "Campos incompletos"
    ]);
    exit;
}

try {

    $pdo = Database::connection();

  
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $email, $hash, $role]);

    echo json_encode([
        "success" => true
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}