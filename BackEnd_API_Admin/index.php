<?php
// ==========================================
// 1. TẮT HIỂN THỊ LỖI HTML ĐỂ ÉP CHUẨN JSON 
// ==========================================
ini_set('display_errors', 0);
error_reporting(E_ALL);

// ==========================================
// 2. CẤU HÌNH CORS 
// ==========================================
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Request-Method, Access-Control-Request-Headers");
header("Content-Type: application/json; charset=UTF-8");

// ==========================================
// 3. XỬ LÝ PREFLIGHT REQUEST
// ==========================================
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0); 
}

// ==========================================
// 4. KẾT NỐI DATABASE
// ==========================================
$host = "sql211.infinityfree.com";

$db_name = "if0_41355438_web_ban_dien_thoai";

$username = "if0_41355438";

$password = "wcV7zaKnuW4"; 

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->exec("set names utf8mb4");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi kết nối CSDL: " . $e->getMessage()]);
    exit();
}

// ==========================================
// 5. BỘ ĐỊNH TUYẾN (ROUTER)
// ==========================================
$method = $_SERVER['REQUEST_METHOD'];
$request_path = isset($_GET['request']) ? $_GET['request'] : '';
$request = explode('/', trim($request_path, '/'));
$endpoint = isset($request[0]) && $request[0] !== '' ? $request[0] : ''; 
$id = isset($request[1]) ? $request[1] : null;
$input_data = json_decode(file_get_contents("php://input"), true);

// Đường dẫn tới file xử lý riêng biệt
$api_file = 'api/' . $endpoint . '.php';

// Nếu người dùng có gọi endpoint (vd: /products) và file đó tồn tại
if ($endpoint != '' && file_exists($api_file)) {
    // Kéo file đó vào chạy, truyền luôn các biến $conn, $method, $input_data sang
    require_once $api_file;
} else {
    http_response_code(200);
    echo json_encode(["message" => "Hệ thống API Backend đang chạy. Vui lòng gọi đúng endpoint (Ví dụ: /products)"]);
}
?>