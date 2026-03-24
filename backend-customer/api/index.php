<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../error.log');

// CORS + JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

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

// Parse REQUEST_URI: /backend-customer/api/users → users
// Or fallback to query param: /api/index.php?resource=users&id=1
$uri = $_SERVER['REQUEST_URI'] ?? '/';
// Remove query string
$uri = explode('?', $uri)[0];

$resource = null;
$id = null;

// Case 1: /api/users or /api/users/1 pattern
if (preg_match('#/api/([a-z_-]+)(?:/([0-9]+))?/?$#i', $uri, $matches)) {
    $resource = strtolower($matches[1]);
    $id = isset($matches[2]) ? (int)$matches[2] : null;
}
// Case 2: /api/index.php?resource=users pattern
elseif (preg_match('#/api/index\.php$#i', $uri)) {
    $resource = $_GET['resource'] ?? null;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
}

if (!$resource) {
    respond(404, ['error' => 'No resource specified. Use /api/{resource} or /api/index.php?resource=...']);
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($resource) {
        case 'users':
            require __DIR__ . '/users.php';
            break;
        case 'products':
            require __DIR__ . '/products.php';
            break;
        case 'categories':
            require __DIR__ . '/categories.php';
            break;
        case 'orders':
            require __DIR__ . '/orders.php';
            break;
        case 'order_details':
        case 'order-details':
            require __DIR__ . '/order_details.php';
            break;
        default:
            respond(404, ['error' => 'Resource not found']);
    }
} catch (Throwable $e) {
    error_log('API Error [' . $resource . ']: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
    respond(500, ['error' => 'Internal server error', 'message' => $e->getMessage()]);
}


