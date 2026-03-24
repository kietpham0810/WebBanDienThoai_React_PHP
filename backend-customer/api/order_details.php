<?php
declare(strict_types=1);
require_once __DIR__ . '/../models/OrderDetail.php';

// $orderDetailModel, $id, $method, $pdo, respond(), getJsonBody() defined by api/index.php

try {
    $orderDetailModel = new OrderDetail();
} catch (PDOException $e) {
    error_log('OrderDetail Model Init Error: ' . $e->getMessage());
    respond(500, ['error' => 'Database connection failed']);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                $item = $orderDetailModel->getById($id);
                if (!$item) respond(404, ['error' => 'Order detail not found']);
                respond(200, $item);
            }
            respond(200, $orderDetailModel->getAll());

        case 'POST':
            $data = getJsonBody();
            foreach (['order_id', 'product_id', 'quantity', 'price'] as $field) {
                if (!isset($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            $created = $orderDetailModel->create($data);
            respond(201, $created);

        case 'PUT':
        case 'PATCH':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $data = getJsonBody();
            foreach (['order_id', 'product_id', 'quantity', 'price'] as $field) {
                if (!isset($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            $updated = $orderDetailModel->update($id, $data);
            if (!$updated) respond(404, ['error' => 'Order detail not found']);
            respond(200, $updated);

        case 'DELETE':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $ok = $orderDetailModel->delete($id);
            respond($ok ? 204 : 404, $ok ? [] : ['error' => 'Order detail not found']);

        default:
            respond(405, ['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    respond(500, ['error' => 'Database error', 'detail' => $e->getMessage()]);
}