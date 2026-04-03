<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Cấu hình CORS chung
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-HTTP-Method-Override");

// Chỉ set Content-Type JSON nếu không phải multipart form (upload ảnh)
$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
if (strpos($contentType, 'multipart/form-data') === false) {
    header("Content-Type: application/json; charset=UTF-8");
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200); exit();
}

// Gọi file kết nối Database vào đây
require_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

// Hỗ trợ _method override qua FormData (vì PHP không nhận $_FILES với PUT)
if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$request_path = isset($_GET['request']) ? $_GET['request'] : '';
$request = explode('/', trim($request_path, '/'));
$endpoint = isset($request[0]) ? $request[0] : '';
$id = isset($request[1]) ? $request[1] : null;

$input_data = json_decode(file_get_contents("php://input"), true);

// KIỂM TRA ĐIỀU HƯỚNG
if (empty($endpoint)) {
    echo json_encode(["message" => "Hệ thống Backend API. Các endpoint: /users, /products, /orders, /categories"]);
    exit();
}


$api_file = 'api/' . $endpoint . '.php';

if (file_exists($api_file)) {
    // Nếu tìm thấy file (VD: api/users.php), thì nhúng nó vào chạy
    require_once $api_file;
} else {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint '/$endpoint' không tồn tại!"]);
}
?>