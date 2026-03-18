<?php
if ($method == 'GET') {
    $query = "SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.id DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    
} elseif ($method == 'PUT') {
    if($id && isset($input_data['status'])) {
        $stmt = $conn->prepare("UPDATE orders SET status = :status WHERE id = :id");
        $stmt->bindParam(':status', $input_data['status']);
        $stmt->bindParam(':id', $id);
        if($stmt->execute()) echo json_encode(["message" => "Đổi trạng thái thành công"]);
    }
}
?>