<?php
class Database {

    public static function connection() {

        $host = "server-admin-pwa.mysql.database.azure.com";
        $db   = "salas";
        $user = "adminphp";
        $pass = "Julian20667*";

        try {

            $pdo = new PDO(
                "mysql:host=$host;dbname=$db;charset=utf8",
                $user,
                $pass,
                [
                    PDO::MYSQL_ATTR_SSL_CA => __DIR__ . "/../certs/DigiCertGlobalRootG2.crt.pem",
                    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
                ]
            );

            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            return $pdo;

        } catch (PDOException $e) {

            echo json_encode([
                "success" => false,
                "error" => "Error Azure: " . $e->getMessage()
            ]);
            exit;
        }
    }
}
?>