<?php
require 'config.php'; // Incluye la conexión a la base de datos

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pregunta = $_POST['pregunta'];
    $imatge = $_POST['imatge'];

    $sql = "INSERT INTO preguntes (pregunta, imatge) VALUES (:pregunta, :imatge)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':pregunta' => $pregunta, ':imatge' => $imatge]);

    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}
?>
