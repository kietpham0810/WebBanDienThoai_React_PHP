<?php
if ($method == 'GET') {
    $stmt = $conn->prepare("SELECT * FROM categories");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>