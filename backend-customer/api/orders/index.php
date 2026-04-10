<?php
declare(strict_types=1);
require_once __DIR__ . '/../../models/Order.php';

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
    $orderModel = new Order();
} catch (PDOException $e) {
    respond(500, ['error' => 'Database connection failed']);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                $item = $orderModel->getById($id);
                if (!$item) respond(404, ['error' => 'Order not found']);
                respond(200, $item);
            }
            respond(200, $orderModel->getAll());

        case 'POST':
            $data = getJsonBody();
            foreach (['user_id', 'total'] as $field) {
                if (!isset($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            // status, shipping_address, payment_method là optional
            if (!isset($data['status'])) $data['status'] = 'pending';
            if (!isset($data['shipping_address'])) $data['shipping_address'] = null;
            if (!isset($data['payment_method'])) $data['payment_method'] = null;
            $created = $orderModel->create($data);
            respond(201, $created);

        case 'PUT':
        case 'PATCH':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $data = getJsonBody();
            if (empty($data)) respond(422, ['error' => 'Request body is required']);
            // Set default values nếu không được cung cấp
            if (!isset($data['shipping_address'])) $data['shipping_address'] = null;
            if (!isset($data['payment_method'])) $data['payment_method'] = null;
            if (!isset($data['status'])) $data['status'] = 'pending';
            $updated = $orderModel->update($id, $data);
            if (!$updated) respond(404, ['error' => 'Order not found']);
            respond(200, $updated);

        case 'DELETE':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $ok = $orderModel->delete($id);
            respond($ok ? 204 : 404, $ok ? [] : ['error' => 'Order not found']);

        default:
            respond(405, ['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    respond(500, ['error' => 'Database error', 'detail' => $e->getMessage()]);
}
