<?php
if ($method == 'GET') {
    if ($id) {
        $query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($product ? $product : ["message" => "Không tìm thấy sản phẩm"]);
    } else {
        $query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
} elseif ($method == 'POST') {
    if (isset($input_data['name']) && isset($input_data['price']) && isset($input_data['category_id'])) {
        $query = "INSERT INTO products (name, price, description, image, category_id, created_at) VALUES (:name, :price, :description, :image, :category_id, :created_at)";
        $stmt = $conn->prepare($query);
        $description = isset($input_data['description']) ? $input_data['description'] : null;
        $image = isset($input_data['image']) ? $input_data['image'] : null;
        $stmt->bindParam(':name', $input_data['name']);
        $stmt->bindParam(':price', $input_data['price']);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':image', $image);
        $stmt->bindParam(':category_id', $input_data['category_id']);

        $createdAt = isset($input_data['created_at']) ? $input_data['created_at'] : date('Y-m-d H:i:s');
        $stmt->bindParam(':created_at', $createdAt);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Thêm sản phẩm thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Lỗi thêm sản phẩm"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Thiếu thông tin sản phẩm"]);
    }
} elseif ($method == 'PUT') {
    if ($id && isset($input_data['name']) && isset($input_data['price']) && isset($input_data['category_id'])) {
        $query = "UPDATE products SET name = :name, price = :price, description = :description, image = :image, category_id = :category_id WHERE id = :id";
        $stmt = $conn->prepare($query);
        $description = isset($input_data['description']) ? $input_data['description'] : null;
        $image = isset($input_data['image']) ? $input_data['image'] : null;
        $stmt->bindParam(':name', $input_data['name']);
        $stmt->bindParam(':price', $input_data['price']);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':image', $image);
        $stmt->bindParam(':category_id', $input_data['category_id']);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Cập nhật sản phẩm thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Lỗi cập nhật sản phẩm"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Thiếu thông tin cập nhật"]);
    }
} elseif ($method == 'DELETE') {
    if ($id) {
        $stmt = $conn->prepare("DELETE FROM products WHERE id = :id");
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Xóa sản phẩm thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Không thể xóa sản phẩm này"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Thiếu ID sản phẩm"]);
    }
}
?>
