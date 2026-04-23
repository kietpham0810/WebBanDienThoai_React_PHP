<?php
// ==========================================
// 1. KẾT NỐI DATABASE
// ==========================================
ini_set('display_errors', 0);
error_reporting(E_ALL);

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Request-Method, Access-Control-Request-Headers");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ==========================================
// 2. KẾT NỐI DATABASE
// ==========================================
// $host = "sql200.epizy.com";
// $db_name = "if0_41272069_webdienthoai";
// $username = "if0_41272069";
// $password = "wTDwbqvwyNL";


$host = "localhost";
$db_name = "web_ban_dien_thoai";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->exec("set names utf8mb4");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi kết nối CSDL: " . $e->getMessage()]);
    exit();
}
?>