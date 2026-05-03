<?php
header("Content-Type: application/json");
include "db.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "POST") {

    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = $data["user_id"];
    $sala = $data["sala"];
    $fecha = $data["fecha"];
    $inicio = $data["inicio"];
    $fin = $data["fin"];

    $sql = "INSERT INTO reservas (user_id,sala,fecha,hora_inicio,hora_fin)
            VALUES ('$user_id','$sala','$fecha','$inicio','$fin')";

    echo json_encode(["success"=>$conn->query($sql)]);
}

if ($method === "GET") {

    $user_id = $_GET["user_id"];

    $sql = "SELECT r.*, u.name 
            FROM reservas r
            JOIN users u ON r.user_id = u.id
            WHERE r.user_id='$user_id'";

    $res = $conn->query($sql);

    $data = [];

    while($row = $res->fetch_assoc()){
        $data[] = $row;
    }

    echo json_encode($data);
}
?>