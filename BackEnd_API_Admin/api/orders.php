<?php
switch ($method) {
    case 'GET':
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
        break;

    case 'POST':
        if (!empty($input_data['user_id']) && !empty($input_data['total'])) {
            $query = "INSERT INTO orders (user_id, order_date, total, status, shipping_address, payment_method) 
                      VALUES (:user_id, :order_date, :total, :status, :shipping_address, :payment_method)";
            $stmt = $conn->prepare($query);
            
            $order_date = date('Y-m-d H:i:s');
            $status = isset($input_data['status']) ? $input_data['status'] : 'pending';
            $shipping_address = isset($input_data['shipping_address']) ? $input_data['shipping_address'] : null;
            $payment_method = isset($input_data['payment_method']) ? $input_data['payment_method'] : null;
            
            $stmt->bindParam(':user_id', $input_data['user_id']);
            $stmt->bindParam(':order_date', $order_date);
            $stmt->bindParam(':total', $input_data['total']);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':shipping_address', $shipping_address);
            $stmt->bindParam(':payment_method', $payment_method);
            
            if ($stmt->execute()) {
                $last_id = $conn->lastInsertId();
                http_response_code(201);
                echo json_encode(["message" => "Tạo đơn hàng thành công", "order_id" => $last_id]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi tạo đơn hàng"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu thông tin bắt buộc (user_id, total)"]);
        }
        break;

    case 'PUT':
        if ($id && !empty($input_data)) {
            $fields = [];
            $params = [':id' => $id];

            if (isset($input_data['status'])) { $fields[] = "status = :status"; $params[':status'] = $input_data['status']; }
            if (isset($input_data['shipping_address'])) { $fields[] = "shipping_address = :shipping_address"; $params[':shipping_address'] = $input_data['shipping_address']; }
            if (isset($input_data['payment_method'])) { $fields[] = "payment_method = :payment_method"; $params[':payment_method'] = $input_data['payment_method']; }

            if (count($fields) > 0) {
                $query = "UPDATE orders SET " . implode(", ", $fields) . " WHERE id = :id";
                $stmt = $conn->prepare($query);

                if ($stmt->execute($params)) {
                    echo json_encode(["message" => "Cập nhật đơn hàng thành công"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Lỗi cập nhật đơn hàng"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Không có dữ liệu hợp lệ để cập nhật"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu ID hoặc nội dung cập nhật"]);
        }
        break;

    case 'DELETE':
        if ($id) {
            try {
                $stmtDetails = $conn->prepare("DELETE FROM order_details WHERE order_id = :id");
                $stmtDetails->bindParam(':id', $id);
                $stmtDetails->execute();

                $stmt = $conn->prepare("DELETE FROM orders WHERE id = :id");
                $stmt->bindParam(':id', $id);
                
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Xóa đơn hàng thành công"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Lỗi khi xóa đơn hàng"]);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi CSDL khi xóa đơn hàng"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu ID đơn hàng"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Phương thức không được hỗ trợ"]);
        break;
}
?>