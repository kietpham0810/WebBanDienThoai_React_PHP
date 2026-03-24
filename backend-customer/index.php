<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/error.log');

// CORS + JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(204);
    exit;
}

if (!file_exists(__DIR__ . '/config/database.php')) {
    http_response_code(500);
    echo json_encode(['error' => 'Database config not found']);
    exit;
}

require_once __DIR__ . '/config/database.php';

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

$rawUri = $_SERVER['REQUEST_URI'] ?? '/';
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
$request = preg_replace('#^' . preg_quote(rtrim($scriptDir, '/'), '#') . '#', '', $rawUri);
$request = trim($request, '/');

if (strpos($request, 'api/') === 0) {
    $request = substr($request, 4);
}

$parts = array_values(array_filter(explode('/', $request), fn($p) => $p !== ''));

if (empty($parts)) {
    respond(404, ['error' => 'Endpoint not found']);
}

$resource = strtolower($parts[0]);
$id = isset($parts[1]) && ctype_digit($parts[1]) ? (int)$parts[1] : null;
$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = Database::getConnection();
} catch (PDOException $e) {
    error_log('DB Connection Error: ' . $e->getMessage());
    respond(500, ['error' => 'DB connection error', 'message' => 'Unable to connect database']);
}

if ($resource === 'users') {
    require_once __DIR__ . '/models/User.php';
    $model = new User();
    
    if ($id === null) {
        if ($method === 'GET') {
            $stmt = $pdo->query('SELECT id, name, email, role FROM users ORDER BY id');
            respond(200, $stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        if ($method === 'POST') {
            $data = getJsonBody();
            if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
                respond(422, ['error' => 'name,email,password required']);
            }

            $stmt = $pdo->prepare('INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)');
            $stmt->execute([
                ':name' => $data['name'],
                ':email' => $data['email'],
                ':password' => password_hash($data['password'], PASSWORD_DEFAULT),
                ':role' => $data['role'] ?? 'user',
            ]);

            respond(201, ['id' => (int)$pdo->lastInsertId(), 'name' => $data['name']]);
        }

        respond(405, ['error' => 'Method not allowed']);
    }

    if (!in_array($method, ['GET', 'PUT', 'PATCH', 'DELETE'], true)) {
        respond(405, ['error' => 'Method not allowed']);
    }

    $stmt = $pdo->prepare('SELECT id, name, email, role FROM users WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        respond(404, ['error' => 'Not found']);
    }

    if ($method === 'GET') {
        respond(200, $user);
    }

    if (in_array($method, ['PUT', 'PATCH'], true)) {
        $data = getJsonBody();
        if (empty($data['name']) || empty($data['email'])) {
            respond(422, ['error' => 'name,email required']);
        }

        $sql = 'UPDATE users SET name = :name, email = :email, role = :role';
        $params = [
            ':id' => $id,
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':role' => $data['role'] ?? 'user',
        ];
        if (!empty($data['password'])) {
            $sql .= ', password = :password';
            $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        $sql .= ' WHERE id = :id';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        respond(200, ['message' => 'Updated']);
    }

    if ($method === 'DELETE') {
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
        $stmt->execute([':id' => $id]);
        respond(200, ['message' => 'Deleted']);
    }

    respond(405, ['error' => 'Method not allowed']);
}

$apiFile = __DIR__ . '/api/' . $resource . '.php';
if (file_exists($apiFile)) {
    try {
        require_once $apiFile;
        exit;
    } catch (Throwable $e) {
        error_log('API Error [' . $resource . ']: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
        respond(500, ['error' => 'Internal server error', 'debug' => $e->getMessage()]);
    }
}

respond(404, ['error' => 'Endpoint not found - API fallback']);


