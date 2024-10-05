<?php
require 'config.php'; // Incluye la conexión a la base de datos

function obtenerPreguntas($pdo) {
    $sql = "SELECT id, pregunta, imatge FROM preguntes";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Muestra las preguntas como JSON
header('Content-Type: application/json');
echo json_encode(obtenerPreguntas($pdo));
?>
