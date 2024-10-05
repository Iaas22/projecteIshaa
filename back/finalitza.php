<?php
require 'config.php'; // Incluir la conexión a la base de datos

// Obtener los datos enviados por el frontend
$data = json_decode(file_get_contents('php://input'), true);
$puntuacio = $data['puntuacio'];
$totalPreguntes = $data['totalPreguntes'];
$respostes = $data['respostes'];  // Arreglo con las respuestas

// Aquí podrías guardar los resultados si es necesario

// Responder con un resumen de los resultados
$response = [
    'puntuacio' => $puntuacio,
    'totalPreguntes' => $totalPreguntes
];

echo json_encode($response);

mysqli_close($conn);
?>
