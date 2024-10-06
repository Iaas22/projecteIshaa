<?php
$host = 'localhost';
$dbname = 'a23ishamisul_db';
$username = 'a23ishamisul_ishaa';  
$password = 'Ias12222004'; 

$conn = mysqli_connect($host, $username, $password, $dbname);

if (!$conn) {
    die("Error en la conexión a la base de datos: " . mysqli_connect_error());
}
?>
