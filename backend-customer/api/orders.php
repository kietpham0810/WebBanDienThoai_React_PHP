<?php
declare(strict_types=1);
require_once __DIR__ . '/../models/Order.php';

// $orderModel, $id, $method, $pdo, respond(), getJsonBody() defined by api/index.php

try {
    $orderModel = new Order();
} catch (PDOException $e) {
    error_log('Order Model Init Error: ' . $e->getMessage());
    respond(500, ['error' => 'Database connection failed']);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                $item = $orderModel->getById($id);
                if (!$item) respond(404, ['error' => 'Order not found']);
                respond(200, $item);
            }
            respond(200, $orderModel->getAll());

        case 'POST':
            $data = getJsonBody();
            foreach (['user_id', 'total'] as $field) {
                if (!isset($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            $created = $orderModel->create($data);
            respond(201, $created);

        case 'PUT':
        case 'PATCH':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $data = getJsonBody();
            foreach (['user_id', 'total', 'status'] as $field) {
                if (!isset($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            $updated = $orderModel->update($id, $data);
            if (!$updated) respond(404, ['error' => 'Order not found']);
            respond(200, $updated);

        case 'DELETE':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $ok = $orderModel->delete($id);
            respond($ok ? 204 : 404, $ok ? [] : ['error' => 'Order not found']);

        default:
            respond(405, ['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    respond(500, ['error' => 'Database error', 'detail' => $e->getMessage()]);
}