<?php
require_once __DIR__ . "/db.php";

header("Content-Type: application/json");

try {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        throw new Exception("No se recibieron datos");
    }

    $email = $data["email"] ?? "";
    $password = $data["password"] ?? "";

    $db = Database::connection();

    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

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
        echo json_encode([
            "success" => false,
            "error" => "Credenciales incorrectas"
        ]);
    }

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}