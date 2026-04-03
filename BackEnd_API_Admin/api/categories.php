<?php
switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM categories WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $category = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($category ? $category : ["message" => "Không tìm thấy danh mục"]);
        } else {
            $stmt = $conn->prepare("SELECT * FROM categories ORDER BY id DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        if (!empty($input_data['name'])) {
            $stmt = $conn->prepare("INSERT INTO categories (name) VALUES (:name)");
            $stmt->bindParam(':name', $input_data['name']);
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "Thêm danh mục thành công"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi thêm danh mục"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu tên danh mục"]);
        }
        break;

    case 'PUT':
        if ($id && !empty($input_data['name'])) {
            $stmt = $conn->prepare("UPDATE categories SET name = :name WHERE id = :id");
            $stmt->bindParam(':name', $input_data['name']);
            $stmt->bindParam(':id', $id);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Cập nhật danh mục thành công"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi cập nhật danh mục"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu thông tin cập nhật (name)"]);
        }
        break;

    case 'DELETE':
        if ($id) {
            try {
                $stmt = $conn->prepare("DELETE FROM categories WHERE id = :id");
                $stmt->bindParam(':id', $id);
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Xóa danh mục thành công"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Lỗi hệ thống khi xóa danh mục"]);
                }
            } catch (PDOException $e) {
                http_response_code(409); 
                echo json_encode(["message" => "Không thể xóa: Danh mục này đang chứa sản phẩm!"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu ID danh mục"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Phương thức không được hỗ trợ"]);
        break;
}
?>