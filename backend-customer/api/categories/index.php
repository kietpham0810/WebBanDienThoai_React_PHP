<?php
declare(strict_types=1);
require_once __DIR__ . '/../../models/Category.php';

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
    if (!$body) return [];
    $data = json_decode($body, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        respond(400, ['error' => 'Invalid JSON body']);
    }
    return is_array($data) ? $data : [];
}

try {
    $pdo = Database::getConnection();
} catch (PDOException $e) {
    respond(500, ['error' => 'Database connection failed']);
}

try {
    $categoryModel = new Category();
} catch (PDOException $e) {
    respond(500, ['error' => 'Database connection failed']);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                $item = $categoryModel->getById($id);
                if (!$item) respond(404, ['error' => 'Category not found']);
                respond(200, $item);
            }
            respond(200, $categoryModel->getAll());

        case 'POST':
            $data = getJsonBody();
            if (empty($data['name'])) respond(422, ['error' => 'Name is required']);
            $created = $categoryModel->create((string)$data['name']);
            respond(201, $created);

        case 'PUT':
        case 'PATCH':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $data = getJsonBody();
            if (empty($data['name'])) respond(422, ['error' => 'Name is required']);
            $updated = $categoryModel->update($id, (string)$data['name']);
            if (!$updated) respond(404, ['error' => 'Category not found']);
            respond(200, $updated);

        case 'DELETE':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $ok = $categoryModel->delete($id);
            respond($ok ? 204 : 404, $ok ? [] : ['error' => 'Category not found']);

        default:
            respond(405, ['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    respond(500, ['error' => 'Database error', 'detail' => $e->getMessage()]);
}
