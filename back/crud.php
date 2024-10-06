<?php
// Configuración de la base de datos
$host = 'localhost';
$dbname = 'a23ishamisul_db';
$username = 'a23ishamisul_ishaa';  
$password = 'Ias12222004';    

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error en la conexión: " . $e->getMessage());
}

// Función para obtener todas las preguntas
function obtenerPreguntas($pdo) {
    $sql = "SELECT id, pregunta, imatge FROM preguntes";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Función para agregar una nueva pregunta
function agregarPregunta($pregunta, $imagen, $pdo) {
    $sql = "INSERT INTO preguntes (pregunta, imatge) VALUES (:pregunta, :imagen)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':pregunta', $pregunta);
    $stmt->bindParam(':imagen', $imagen);
    return $stmt->execute();
}

// Función para editar una pregunta existente
function editarPregunta($id, $pregunta, $imagen, $pdo) {
    $sql = "UPDATE preguntes SET pregunta = :pregunta, imatge = :imagen WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':pregunta', $pregunta);
    $stmt->bindParam(':imagen', $imagen);
    return $stmt->execute();
}

// Función para eliminar una pregunta
function eliminarPregunta($id, $pdo) {
    $sql = "DELETE FROM preguntes WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
}

// Comprobación de la solicitud POST para agregar, editar o eliminar
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? null;

    switch ($action) {
        case 'obtener':
            $preguntas = obtenerPreguntas($pdo);
            header('Content-Type: application/json');
            echo json_encode($preguntas);
            exit;

        case 'agregar':
            $pregunta = $_POST['pregunta'] ?? '';
            $imagen = $_POST['imagen'] ?? '';
            agregarPregunta($pregunta, $imagen, $pdo);
            break;

        case 'editar':
            $id = $_POST['id'] ?? '';
            $pregunta = $_POST['pregunta'] ?? '';
            $imagen = $_POST['imagen'] ?? '';
            editarPregunta($id, $pregunta, $imagen, $pdo);
            break;

        case 'eliminar':
            $id = $_POST['id'] ?? '';
            eliminarPregunta($id, $pdo);
            break;
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRUD Preguntas</title>
    <style>
        :root {
            --color1: #ebf2fa; /* Color de fondo */
            --color2: #427aa1; /* Color de fondo del encabezado y botones */
            --color3: #064789; /* Color del texto del encabezado */
            --color-text: #333; /* Color del texto principal */
            --color-button-hover: #064789; /* Color del botón al pasar el mouse */
            --button-border-radius: 8px; /* Radio de borde para botones */
        }

        /* Estilos básicos */
        body {
            font-family: Arial, sans-serif;
            background-color: var(--color1);
            padding: 20px;
        }

        h1, h2 {
            color: var(--color3);
        }

        #formContainer, #listaPreguntasContainer {
            background-color: white;
            padding: 20px;
            border-radius: var(--button-border-radius);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }

        .question-container {
            margin-bottom: 20px;
            border: 1px solid var(--color2);
            padding: 10px;
            border-radius: var(--button-border-radius);
            background-color: white;
        }

        button {
            background-color: var(--color2);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: var(--button-border-radius);
            cursor: pointer;
            transition: background-color 0.3s;
            display: block; /* Cambiado a bloque para ocupar toda la línea */
            margin: 5px 0; /* Margen entre botones */
        }

        button:hover {
            background-color: var(--color-button-hover);
        }

        .hidden {
            display: none;
        }

        .img-quizz {
            max-width: 100%;
            height: auto;
            margin-top: 10px;
        }
    </style>
</head>
<body>

    <h1>Gestión de Preguntas</h1>
    
    <div id="formContainer">
        <h2>Agregar / Editar Pregunta</h2>
        <input type="hidden" id="preguntaId" value="">
        <input type="text" id="pregunta" placeholder="Pregunta" />
        <input type="text" id="imagen" placeholder="URL de la imagen" />
        <button id="guardarPregunta">Guardar Pregunta</button>
        <button id="cancelarEdicion" class="hidden">Cancelar Edición</button>
    </div>

    <div id="listaPreguntasContainer">
        <h2>Lista de Preguntas</h2>
        <button id="cargarPreguntas">Cargar Preguntas</button>
        <div id="listaPreguntas"></div>
    </div>

    <script>
        // Función para cargar preguntas
        document.getElementById('cargarPreguntas').addEventListener('click', cargarPreguntas);

        function cargarPreguntas() {
            fetch('crud.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'obtener'
                })
            })
            .then(response => response.json())
            .then(data => {
                mostrarPreguntas(data);
            })
            .catch(error => console.error('Error en cargar preguntas:', error));
        }

        // Función para mostrar preguntas
        function mostrarPreguntas(preguntas) {
            const listaPreguntas = document.getElementById('listaPreguntas');
            listaPreguntas.innerHTML = '';

            preguntas.forEach(pregunta => {
                listaPreguntas.innerHTML += `
                    <div class="question-container">
                        <p>${pregunta.pregunta}</p>
                        ${pregunta.imatge ? `<img src="${pregunta.imatge}" class="img-quizz" />` : ''}
                        <button onclick="editarPregunta(${pregunta.id}, '${pregunta.pregunta}', '${pregunta.imatge}')">Editar</button>
                        <button onclick="eliminarPregunta(${pregunta.id})">Eliminar</button>
                    </div>
                `;
            });
        }

        // Función para editar una pregunta
        function editarPregunta(id, pregunta, imagen) {
            document.getElementById('preguntaId').value = id;
            document.getElementById('pregunta').value = pregunta;
            document.getElementById('imagen').value = imagen;
            document.getElementById('guardarPregunta').innerText = 'Actualizar Pregunta';
            document.getElementById('cancelarEdicion').classList.remove('hidden');
        }

        // Evento para guardar pregunta (nuevo o editado)
        document.getElementById('guardarPregunta').addEventListener('click', () => {
            const id = document.getElementById('preguntaId').value;
            const pregunta = document.getElementById('pregunta').value;
            const imagen = document.getElementById('imagen').value;

            const action = id ? 'editar' : 'agregar';

            fetch('crud.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: action,
                    id: id,
                    pregunta: pregunta,
                    imagen: imagen
                })
            })
            .then(() => {
                cargarPreguntas(); // Recarga la lista después de agregar/editar
                resetForm();
            })
            .catch(error => console.error('Error al guardar pregunta:', error));
        });

        // Función para eliminar una pregunta
        function eliminarPregunta(id) {
            if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
                fetch('crud.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'eliminar',
                        id: id
                    })
                })
                .then(() => cargarPreguntas())
                .catch(error => console.error('Error al eliminar pregunta:', error));
            }
        }

        // Función para reiniciar el formulario
        function resetForm() {
            document.getElementById('preguntaId').value = '';
            document.getElementById('pregunta').value = '';
            document.getElementById('imagen').value = '';
            document.getElementById('guardarPregunta').innerText = 'Guardar Pregunta';
            document.getElementById('cancelarEdicion').classList.add('hidden');
        }

        // Evento para cancelar la edición
        document.getElementById('cancelarEdicion').addEventListener('click', resetForm);
    </script>
</body>
</html>
