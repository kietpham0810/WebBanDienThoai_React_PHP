<?php
// FILE: api/users.php

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
    if($id) {
        try {
            $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            // Xóa thành công
            http_response_code(200); 
            echo json_encode(["message" => "Xóa người dùng thành công"]);
            
        } catch (PDOException $e) {
            // Đỡ lỗi khóa ngoại (Lỗi 1451 của MySQL)
            if ($e->getCode() == '23000') {
                http_response_code(409); // 409 Conflict: Xung đột dữ liệu
                echo json_encode(["message" => "Không thể xóa! Người dùng này đang có đơn hàng trên hệ thống."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi hệ thống: " . $e->getMessage()]);
            }
        }
    }
}
?>