<?php
// FILE: api/orders.php

if ($method == 'GET') {
    if ($id) {
        // Lấy chi tiết 1 đơn hàng
        $stmt = $conn->prepare("SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } else {
        $query = "SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.id DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
} elseif ($method == 'POST') {
    // Khách hàng đặt hàng mới
    if (isset($input_data['user_id']) && isset($input_data['total_price'])) {
        $query = "INSERT INTO orders (user_id, total_price, status, created_at) VALUES (:user_id, :total_price, 'pending', NOW())";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $input_data['user_id']);
        $stmt->bindParam(':total_price', $input_data['total_price']);
        
        if ($stmt->execute()) {
            http_response_code(201);
            // Trả về ID của đơn hàng vừa tạo để Front-end biết
            echo json_encode(["message" => "Đặt hàng thành công", "order_id" => $conn->lastInsertId()]);
        } else {
            http_response_code(500); echo json_encode(["message" => "Lỗi tạo đơn hàng"]);
        }
    } else {
        http_response_code(400); echo json_encode(["message" => "Thiếu thông tin đặt hàng"]);
    }
} elseif ($method == 'PUT') {
    if ($id && isset($input_data['status'])) {
        $stmt = $conn->prepare("UPDATE orders SET status = :status WHERE id = :id");
        $stmt->bindParam(':status', $input_data['status']);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) echo json_encode(["message" => "Đổi trạng thái thành công"]);
    }
}
?>