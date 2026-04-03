<?php
// Cấu hình Header cho phép CORS (Nếu file chưa có thì nhớ thêm vào)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Gọi kết nối Database của fen vào đây (ví dụ: include_once 'database.php';)
include_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;
$input_data = json_decode(file_get_contents("php://input"), true);

// Câu lệnh gốc dùng chung cho GET (Có JOIN bảng categories siêu xịn của fen)
$base_query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id";

switch ($method) {
    case 'GET':
        if ($id) {
            $query = $base_query . " WHERE p.id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($product ? $product : ["message" => "Không tìm thấy sản phẩm"]);
        } else {
            // Tối ưu: Thêm bộ lọc status để Front-end Khách hàng chỉ lấy sp Đang bán (status = 1)
            if (isset($_GET['status'])) {
                $query = $base_query . " WHERE p.status = :status ORDER BY p.id DESC";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':status', $_GET['status']);
            } else {
                $query = $base_query . " ORDER BY p.id DESC";
                $stmt = $conn->prepare($query);
            }
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        // Cập nhật: Thêm trường stock và status vào lúc tạo mới
        if (isset($input_data['name']) && isset($input_data['price']) && isset($input_data['category_id'])) {
            $query = "INSERT INTO products (name, price, description, image, category_id, created_at, stock, status) 
                      VALUES (:name, :price, :description, :image, :category_id, :created_at, :stock, :status)";
            $stmt = $conn->prepare($query);
            
            $description = isset($input_data['description']) ? $input_data['description'] : null;
            $image = isset($input_data['image']) ? $input_data['image'] : null;
            $createdAt = isset($input_data['created_at']) ? $input_data['created_at'] : date('Y-m-d H:i:s');
            $stock = isset($input_data['stock']) ? $input_data['stock'] : 0;
            $status = isset($input_data['status']) ? $input_data['status'] : 0; // Mặc định 0: Chờ duyệt/Ẩn

            $stmt->bindParam(':name', $input_data['name']);
            $stmt->bindParam(':price', $input_data['price']);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':image', $image);
            $stmt->bindParam(':category_id', $input_data['category_id']);
            $stmt->bindParam(':created_at', $createdAt);
            $stmt->bindParam(':stock', $stock);
            $stmt->bindParam(':status', $status);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "Thêm sản phẩm thành công"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi thêm sản phẩm"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu thông tin bắt buộc (name, price, category_id)"]);
        }
        break;

    case 'PUT':
        // Tối ưu Tối thượng: Cập nhật động (Dynamic Update)
        // Không bắt buộc phải truyền đủ các trường, truyền lên trường nào update trường đó
        if ($id && !empty($input_data)) {
            $fields = [];
            $params = [':id' => $id];

            if (isset($input_data['name'])) { $fields[] = "name = :name"; $params[':name'] = $input_data['name']; }
            if (isset($input_data['price'])) { $fields[] = "price = :price"; $params[':price'] = $input_data['price']; }
            if (isset($input_data['description'])) { $fields[] = "description = :description"; $params[':description'] = $input_data['description']; }
            if (isset($input_data['image'])) { $fields[] = "image = :image"; $params[':image'] = $input_data['image']; }
            if (isset($input_data['category_id'])) { $fields[] = "category_id = :category_id"; $params[':category_id'] = $input_data['category_id']; }
            if (isset($input_data['stock'])) { $fields[] = "stock = :stock"; $params[':stock'] = $input_data['stock']; }
            if (isset($input_data['status'])) { $fields[] = "status = :status"; $params[':status'] = $input_data['status']; }

            if (count($fields) > 0) {
                $query = "UPDATE products SET " . implode(", ", $fields) . " WHERE id = :id";
                $stmt = $conn->prepare($query);

                if ($stmt->execute($params)) {
                    echo json_encode(["message" => "Cập nhật sản phẩm thành công"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Lỗi cập nhật sản phẩm"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Không có dữ liệu hợp lệ để cập nhật"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu ID hoặc nội dung cập nhật"]);
        }
        break;

    case 'DELETE':
        if ($id) {
            // Tối ưu: Bắt lỗi nếu sản phẩm này đã nằm trong đơn hàng (khóa ngoại)
            try {
                $stmt = $conn->prepare("DELETE FROM products WHERE id = :id");
                $stmt->bindParam(':id', $id);
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Xóa sản phẩm thành công"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Không thể xóa sản phẩm này"]);
                }
            } catch (PDOException $e) {
                http_response_code(409); // Xung đột dữ liệu
                echo json_encode(["message" => "Không thể xóa: Sản phẩm này đang nằm trong đơn hàng của khách! Hãy thử Ẩn sản phẩm thay vì Xóa."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu ID sản phẩm"]);
        }
        break;

    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "Phương thức không được hỗ trợ"]);
        break;
}
?>