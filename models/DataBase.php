<?php
    class DataBase{
        #Conexion Local
        public static function connection(){
            $hostname = "localhost";
            $port = "3306";
            $database = "db_inventory";
            $username = "root";
            $password = "";
            $pdo = new PDO("mysql:host=$hostname;$port;dbname=$database;charset=utf8",$username,$password)
            $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
        }
    }
?>