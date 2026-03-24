<?php
declare(strict_types=1);
require_once __DIR__ . '/../models/Product.php';

// $productModel, $id, $method, $pdo, respond(), getJsonBody() defined by api/index.php

try {
    $productModel = new Product();
} catch (PDOException $e) {
    error_log('Product Model Init Error: ' . $e->getMessage());
    respond(500, ['error' => 'Database connection failed']);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                $item = $productModel->getById($id);
                if (!$item) respond(404, ['error' => 'Product not found']);
                respond(200, $item);
            }
            respond(200, $productModel->getAll());

        case 'POST':
            $data = getJsonBody();
            foreach (['name', 'price', 'category_id'] as $field) {
                if (empty($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            $created = $productModel->create($data);
            respond(201, $created);

        case 'PUT':
        case 'PATCH':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $data = getJsonBody();
            foreach (['name', 'price', 'category_id'] as $field) {
                if (empty($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            $updated = $productModel->update($id, $data);
            if (!$updated) respond(404, ['error' => 'Product not found']);
            respond(200, $updated);

        case 'DELETE':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $ok = $productModel->delete($id);
            respond($ok ? 204 : 404, $ok ? [] : ['error' => 'Product not found']);

        default:
            respond(405, ['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    respond(500, ['error' => 'Database error', 'detail' => $e->getMessage()]);
}