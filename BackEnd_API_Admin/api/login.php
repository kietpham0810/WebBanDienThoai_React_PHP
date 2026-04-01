<?php
// FILE: api/login.php
// API này gọi qua link: /login

if ($method == 'POST') {
    if (isset($input_data['email']) && isset($input_data['password'])) {
        $stmt = $conn->prepare("SELECT id, name, email, role, password FROM users WHERE email = :email");
        $stmt->bindParam(':email', $input_data['email']);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Lưu ý: Đồ án thực tế nên xài password_hash, nhưng ở đây so sánh chuỗi đơn giản cho dễ test
        if ($user && $input_data['password'] === $user['password']) {
            // Xóa password trước khi trả về Front-end để bảo mật
            unset($user['password']); 
            http_response_code(200);
            echo json_encode(["message" => "Đăng nhập thành công", "user" => $user]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Sai email hoặc mật khẩu"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Vui lòng nhập đủ email và mật khẩu"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Chỉ hỗ trợ POST cho login"]);
}
?>