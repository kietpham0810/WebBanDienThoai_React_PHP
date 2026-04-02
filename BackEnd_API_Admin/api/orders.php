<?php
if ($method == 'GET') {
    if ($id) {
        $orderQuery = "SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = :id";
        $stmt = $conn->prepare($orderQuery);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            echo json_encode(["message" => "Không tìm thấy đơn hàng"]);
            exit();
        }

        $itemsQuery = "SELECT od.*, p.name as product_name, p.image as product_image, p.price as product_price FROM order_details od LEFT JOIN products p ON od.product_id = p.id WHERE od.order_id = :order_id";
        $stmtItems = $conn->prepare($itemsQuery);
        $stmtItems->bindParam(':order_id', $id);
        $stmtItems->execute();
        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "order" => $order,
            "items" => $items
        ]);
    } else {
        $query = "SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.id DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
} elseif ($method == 'PUT') {
    if ($id && isset($input_data['status'])) {
        $stmt = $conn->prepare("UPDATE orders SET status = :status WHERE id = :id");
        $stmt->bindParam(':status', $input_data['status']);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Đổi trạng thái thành công"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Lỗi cập nhật trạng thái"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Thiếu thông tin cập nhật"]);
    }
}
?>
