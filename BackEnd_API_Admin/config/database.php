<?php
// ==========================================
// 1. TẮT HIỂN THỊ LỖI HTML ĐỂ ÉP CHUẨN JSON 
// ==========================================
ini_set('display_errors', 0);
error_reporting(E_ALL);

// ==========================================
// 2. CẤU HÌNH CORS "VŨ TRANG TẬN RĂNG" 
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
$host = "sql200.epizy.com"; 
$db_name = "if0_41272069_webdienthoai"; 
$username = "if0_41272069"; 
$password = "wTDwbqvwyNL"; 

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
// 5. CÁC ĐẦU MỐI API (ROUTER)
// ==========================================
$method = $_SERVER['REQUEST_METHOD'];
$request_path = isset($_GET['request']) ? $_GET['request'] : '';
$request = explode('/', trim($request_path, '/'));
$endpoint = isset($request[0]) && $request[0] !== '' ? $request[0] : ''; 
$id = isset($request[1]) ? $request[1] : null;
$input_data = json_decode(file_get_contents("php://input"), true);

switch ($endpoint) {
    case 'users':
        if ($method == 'GET') {
            if ($id) {
                $stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = :id");
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($user ? $user : ["message" => "Không tìm thấy user"]);
            } else {
                $stmt = $conn->prepare("SELECT id, name, email, role FROM users ORDER BY id DESC");
                $stmt->execute();
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
        } elseif ($method == 'POST') {
            // ... (Đoạn POST user)
            if(isset($input_data['name']) && isset($input_data['email'])) {
                $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':name', $input_data['name']);
                $stmt->bindParam(':email', $input_data['email']);
                $stmt->bindParam(':password', $input_data['password']); 
                $stmt->bindParam(':role', $input_data['role']);
                if($stmt->execute()) echo json_encode(["message" => "Thêm thành công"]);
            }
        } elseif ($method == 'PUT') {
            // ... (Đoạn PUT user)
            if($id && isset($input_data['name'])) {
                $query = "UPDATE users SET name = :name, email = :email, role = :role WHERE id = :id";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':name', $input_data['name']);
                $stmt->bindParam(':email', $input_data['email']);
                $stmt->bindParam(':role', $input_data['role']);
                $stmt->bindParam(':id', $id);
                if($stmt->execute()) echo json_encode(["message" => "Cập nhật thành công"]);
            }
        } elseif ($method == 'DELETE') {
            // ... (Đoạn DELETE user)
            if($id) {
                $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
                $stmt->bindParam(':id', $id);
                if($stmt->execute()) echo json_encode(["message" => "Xóa thành công"]);
            }
        }
        break;

    case 'products':
        if ($method == 'GET') {
            $query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    default:
        http_response_code(200);
        echo json_encode(["message" => "API Backend đang chạy mượt mà. Vui lòng gọi đúng endpoint (/users, /products...)."]);
        break;
}
?>