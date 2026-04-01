<?php
// FILE: api/categories.php

if ($method == 'GET') {
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
} elseif ($method == 'POST') {
    if (isset($input_data['name'])) {
        $stmt = $conn->prepare("INSERT INTO categories (name, description) VALUES (:name, :description)");
        $desc = isset($input_data['description']) ? $input_data['description'] : '';
        $stmt->bindParam(':name', $input_data['name']);
        $stmt->bindParam(':description', $desc);
        if ($stmt->execute()) echo json_encode(["message" => "Thêm danh mục thành công"]);
    } else {
        http_response_code(400); echo json_encode(["message" => "Thiếu tên danh mục"]);
    }
} elseif ($method == 'PUT') {
    if ($id && isset($input_data['name'])) {
        $stmt = $conn->prepare("UPDATE categories SET name = :name, description = :description WHERE id = :id");
        $desc = isset($input_data['description']) ? $input_data['description'] : '';
        $stmt->bindParam(':name', $input_data['name']);
        $stmt->bindParam(':description', $desc);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) echo json_encode(["message" => "Cập nhật danh mục thành công"]);
    }
} elseif ($method == 'DELETE') {
    if ($id) {
        $stmt = $conn->prepare("DELETE FROM categories WHERE id = :id");
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) echo json_encode(["message" => "Xóa danh mục thành công"]);
    }
}
?>