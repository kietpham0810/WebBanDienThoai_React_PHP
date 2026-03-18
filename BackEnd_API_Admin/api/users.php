<?php
// Các biến $conn, $method, $id, $input_data tự động có sẵn từ index.php truyền qua
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
    if(isset($input_data['name']) && isset($input_data['email']) && isset($input_data['password']) && isset($input_data['role'])) {
        $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':name', $input_data['name']);
        $stmt->bindParam(':email', $input_data['email']);
        $stmt->bindParam(':password', $input_data['password']);
        $stmt->bindParam(':role', $input_data['role']);
        
        if($stmt->execute()) echo json_encode(["message" => "Thêm người dùng thành công"]);
        else echo json_encode(["message" => "Lỗi thêm người dùng"]);
    } else {
        http_response_code(400); echo json_encode(["message" => "Thiếu thông tin người dùng"]);
    }
} elseif ($method == 'PUT') {
    if($id && isset($input_data['name']) && isset($input_data['email']) && isset($input_data['role'])) {
        $query = "UPDATE users SET name = :name, email = :email, role = :role WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':name', $input_data['name']);
        $stmt->bindParam(':email', $input_data['email']);
        $stmt->bindParam(':role', $input_data['role']);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) echo json_encode(["message" => "Cập nhật user thành công"]);
        else echo json_encode(["message" => "Lỗi cập nhật user"]);
    } else {
        http_response_code(400); echo json_encode(["message" => "Thiếu thông tin cập nhật"]);
    }
} elseif ($method == 'DELETE') {
    if($id) {
        $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
        $stmt->bindParam(':id', $id);
        if($stmt->execute()) echo json_encode(["message" => "Xóa người dùng thành công"]);
        else echo json_encode(["message" => "Không thể xóa user này"]);
    }
}
?>