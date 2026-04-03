<?php
switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT id, name, email, role, phone, address FROM users WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($user ? $user : ["message" => "Không tìm thấy user"]);
        } else {
            $stmt = $conn->prepare("SELECT id, name, email, role, phone, address FROM users ORDER BY id DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        if (isset($input_data['name']) && isset($input_data['email']) && isset($input_data['password'])) {
            $query = "INSERT INTO users (name, email, password, role, phone, address) 
                      VALUES (:name, :email, :password, :role, :phone, :address)";
            $stmt = $conn->prepare($query);
            
            $role = isset($input_data['role']) ? $input_data['role'] : 'user';
            $phone = isset($input_data['phone']) ? $input_data['phone'] : null;
            $address = isset($input_data['address']) ? $input_data['address'] : null;

            $stmt->bindParam(':name', $input_data['name']);
            $stmt->bindParam(':email', $input_data['email']);
            $stmt->bindParam(':password', $input_data['password']);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':address', $address);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "Thêm người dùng thành công"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi thêm người dùng"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu thông tin bắt buộc (name, email, password)"]);
        }
        break;

    case 'PUT':
        if ($id && !empty($input_data)) {
            $fields = [];
            $params = [':id' => $id];

            if (isset($input_data['name'])) { $fields[] = "name = :name"; $params[':name'] = $input_data['name']; }
            if (isset($input_data['email'])) { $fields[] = "email = :email"; $params[':email'] = $input_data['email']; }
            if (isset($input_data['role'])) { $fields[] = "role = :role"; $params[':role'] = $input_data['role']; }
            if (isset($input_data['phone'])) { $fields[] = "phone = :phone"; $params[':phone'] = $input_data['phone']; }
            if (isset($input_data['address'])) { $fields[] = "address = :address"; $params[':address'] = $input_data['address']; }
            if (isset($input_data['password']) && !empty($input_data['password'])) { 
                $fields[] = "password = :password"; $params[':password'] = $input_data['password']; 
            }

            if (count($fields) > 0) {
                $query = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = :id";
                $stmt = $conn->prepare($query);

                if ($stmt->execute($params)) {
                    echo json_encode(["message" => "Cập nhật user thành công"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Lỗi cập nhật user"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Không có dữ liệu hợp lệ để cập nhật"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu ID hoặc thông tin cập nhật"]);
        }
        break;

    case 'DELETE':
        if ($id) {
            try {
                $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
                $stmt->bindParam(':id', $id);
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Xóa người dùng thành công"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Không thể xóa user này"]);
                }
            } catch (PDOException $e) {
                http_response_code(409); 
                echo json_encode(["message" => "Không thể xóa: Người dùng này đã có đơn hàng trong hệ thống!"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu ID user"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Phương thức không được hỗ trợ"]);
        break;
}
?>