<?php
// FILE: api/products.php
// Lưu ý: Các biến $conn, $method, $input_data, $id đã được truyền sẵn từ file index.php sang.

if ($method == 'GET') {
    // ---------------------------------------------------------
    // API LẤY DANH SÁCH SẢN PHẨM (CÓ LỌC THEO TRẠNG THÁI)
    // ---------------------------------------------------------
    if ($id) {
        $query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($product ? $product : ["message" => "Không tìm thấy sản phẩm"]);
    } else {
        // Nếu Front-end truyền thêm ?status=1 (Ví dụ trang Khách hàng chỉ muốn xem đồ đã duyệt)
        if (isset($_GET['status'])) {
            $status = $_GET['status'];
            $query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = :status ORDER BY p.id DESC";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':status', $status);
        } else {
            // Admin xem toàn bộ (cả chờ duyệt lẫn đã duyệt)
            $query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC";
            $stmt = $conn->prepare($query);
        }
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

} elseif ($method == 'POST') {
    // ---------------------------------------------------------
    // API THÊM SẢN PHẨM (MẶC ĐỊNH SẼ LÀ CHỜ DUYỆT - STATUS = 0)
    // ---------------------------------------------------------
    if (isset($input_data['name']) && isset($input_data['price']) && isset($input_data['category_id'])) {
        // Thêm trường status vào câu SQL (nếu Front-end gửi status thì nhận, không thì mặc định là 0)
        $query = "INSERT INTO products (name, price, stock, description, category_id, image, status) 
                  VALUES (:name, :price, :stock, :description, :category_id, :image, :status)";
        $stmt = $conn->prepare($query);
        
        $stock = isset($input_data['stock']) ? $input_data['stock'] : 0;
        $description = isset($input_data['description']) ? $input_data['description'] : '';
        $image = isset($input_data['image']) ? $input_data['image'] : '';
        $status = isset($input_data['status']) ? $input_data['status'] : 0; // Mặc định 0: Chờ duyệt

        $stmt->bindParam(':name', $input_data['name']);
        $stmt->bindParam(':price', $input_data['price']);
        $stmt->bindParam(':stock', $stock);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':category_id', $input_data['category_id']);
        $stmt->bindParam(':image', $image);
        $stmt->bindParam(':status', $status);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Thêm sản phẩm thành công. Đang chờ duyệt."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Lỗi khi thêm sản phẩm vào CSDL"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Thiếu thông tin bắt buộc (name, price, category_id)"]);
    }

} elseif ($method == 'PUT') {
    // ---------------------------------------------------------
    // API SỬA THÔNG TIN & DUYỆT SẢN PHẨM
    // ---------------------------------------------------------
    if ($id) {
        // TRƯỜNG HỢP 1: NẾU CHỈ GỬI LÊN 'STATUS' -> LÀ LỆNH DUYỆT SẢN PHẨM CỦA ADMIN
        if (isset($input_data['status']) && !isset($input_data['name'])) {
            $query = "UPDATE products SET status = :status WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':status', $input_data['status']);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Cập nhật trạng thái duyệt thành công!"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi khi duyệt sản phẩm"]);
            }
        } 
        // TRƯỜNG HỢP 2: CẬP NHẬT TOÀN BỘ THÔNG TIN SẢN PHẨM
        elseif (isset($input_data['name'])) {
            $query = "UPDATE products SET name = :name, price = :price, stock = :stock, description = :description, category_id = :category_id, image = :image, status = :status WHERE id = :id";
            $stmt = $conn->prepare($query);
            
            $stock = isset($input_data['stock']) ? $input_data['stock'] : 0;
            $description = isset($input_data['description']) ? $input_data['description'] : '';
            $image = isset($input_data['image']) ? $input_data['image'] : '';
            $status = isset($input_data['status']) ? $input_data['status'] : 0;

            $stmt->bindParam(':name', $input_data['name']);
            $stmt->bindParam(':price', $input_data['price']);
            $stmt->bindParam(':stock', $stock);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':category_id', $input_data['category_id']);
            $stmt->bindParam(':image', $image);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':id', $id);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Cập nhật sản phẩm thành công"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi khi cập nhật sản phẩm"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Dữ liệu cập nhật không hợp lệ"]);
        }
    } else {
         http_response_code(400);
         echo json_encode(["message" => "Thiếu ID sản phẩm cần cập nhật"]);
    }

} elseif ($method == 'DELETE') {
    // ---------------------------------------------------------
    // API XÓA SẢN PHẨM
    // ---------------------------------------------------------
    if ($id) {
        $stmt = $conn->prepare("DELETE FROM products WHERE id = :id");
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Xóa sản phẩm thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Lỗi khi xóa sản phẩm"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Thiếu ID sản phẩm cần xóa"]);
    }
}
?>