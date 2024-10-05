<?php
// Conexión a la base de datos
$host = 'localhost';
$dbname = 'db';
$username = 'root';  
$password = '';      

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error en la conexión: " . $e->getMessage());
}

// Función para obtener preguntas y respuestas
function obtenerPreguntas($pdo) {
    $sql = "SELECT id, pregunta, imatge FROM preguntes";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $preguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($preguntas as &$pregunta) {
        $pregunta['respostes'] = obtenerRespuestas($pregunta['id'], $pdo);
    }
    
    return $preguntas;
}

// Función para obtener respuestas de una pregunta
function obtenerRespuestas($idPregunta, $pdo) {
    $sql = "SELECT id, resposta, correcta FROM respostes WHERE pregunta_id = :idPregunta";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':idPregunta', $idPregunta, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Verificar si se recibe la solicitud correctamente
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Llama a la función para obtener preguntas
    $preguntas = obtenerPreguntas($pdo);
    
    // Si no se encontraron preguntas, retornamos un error
    if (empty($preguntas)) {
        echo json_encode(['error' => 'No se encontraron preguntas.']);
        exit;
    }
    
    // Retorna las preguntas como JSON
    header('Content-Type: application/json');
    echo json_encode($preguntas);
} else {
    // Si la solicitud no es POST, retorna un error
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
