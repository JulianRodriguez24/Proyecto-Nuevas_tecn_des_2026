<?php
class Database {

    public static function connection() {

        $hostname = "server-admin-pwa.mysql.database.azure.com";
        $port     = "3306";
        $database = "salas";

        
        $username = "adminphp";
        $password = "Julian20667*";

       
        $ssl_ca = __DIR__ . "/../certs/DigiCertGlobalRootG2.crt.pem";

        try {
            $pdo = new PDO(
                "mysql:host=$hostname;port=$port;dbname=$database;charset=utf8",
                $username,
                $password,
                [
                    PDO::MYSQL_ATTR_SSL_CA => $ssl_ca,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );

            return $pdo;

        } catch (PDOException $e) {
            throw new Exception("Error Azure: " . $e->getMessage());
        }
    }
}