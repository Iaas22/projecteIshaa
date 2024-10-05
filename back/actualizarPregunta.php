<?php
require 'config.php'; // Incluye la conexión a la base de datos

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data['id'];
    $pregunta = $data['pregunta'];
    $imatge = $data['imatge'];

    $sql = "UPDATE preguntes SET pregunta = :pregunta, imatge = :imatge WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':pregunta' => $pregunta, ':imatge' => $imatge, ':id' => $id]);

    echo json_encode(['success' => true]);
}
?>
