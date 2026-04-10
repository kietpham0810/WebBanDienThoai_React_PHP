<?php
declare(strict_types=1);
require_once __DIR__ . '/../../models/User.php';

// Headers + DB required for standalone access
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

function respond(int $status, mixed $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonBody(): array
{
    $body = file_get_contents('php://input');
    if (!$body) {
        return [];
    }
    $data = json_decode($body, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        respond(400, ['error' => 'Invalid JSON body']);
    }
    return is_array($data) ? $data : [];
}

try {
    $pdo = Database::getConnection();
} catch (PDOException $e) {
    error_log('DB Connection Error: ' . $e->getMessage());
    respond(500, ['error' => 'Database connection failed']);
}

try {
    $userModel = new User();
} catch (PDOException $e) {
    error_log('User Model Init Error: ' . $e->getMessage());
    respond(500, ['error' => 'Database connection failed']);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                $item = $userModel->getById($id);
                if (!$item) respond(404, ['error' => 'User not found']);
                unset($item['password']);
                respond(200, $item);
            }
            $users = $userModel->getAll();
            foreach ($users as &$user) unset($user['password']);
            respond(200, $users);

        case 'POST':
            $data = getJsonBody();
            foreach (['name', 'email', 'password'] as $field) {
                if (empty($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            $created = $userModel->create($data);
            unset($created['password']);
            respond(201, $created);

        case 'PUT':
        case 'PATCH':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $data = getJsonBody();
            if (empty($data)) respond(422, ['error' => 'Request body is required']);
            $updated = $userModel->update($id, $data);
            if (!$updated) respond(404, ['error' => 'User not found']);
            unset($updated['password']);
            respond(200, $updated);

        case 'DELETE':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $ok = $userModel->delete($id);
            respond($ok ? 204 : 404, $ok ? [] : ['error' => 'User not found']);

        default:
            respond(405, ['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    respond(500, ['error' => 'Database error', 'detail' => $e->getMessage()]);
}
