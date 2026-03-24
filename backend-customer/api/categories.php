<?php
declare(strict_types=1);
require_once __DIR__ . '/../models/Category.php';

// $categoryModel, $id, $method, $pdo, respond(), getJsonBody() defined by api/index.php

try {
    $categoryModel = new Category();
} catch (PDOException $e) {
    error_log('Category Model Init Error: ' . $e->getMessage());
    respond(500, ['error' => 'Database connection failed']);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                $item = $categoryModel->getById($id);
                if (!$item) respond(404, ['error' => 'Category not found']);
                respond(200, $item);
            }
            respond(200, $categoryModel->getAll());

        case 'POST':
            $data = getJsonBody();
            if (empty($data['name'])) respond(422, ['error' => 'Name is required']);
            $created = $categoryModel->create((string)$data['name']);
            respond(201, $created);

        case 'PUT':
        case 'PATCH':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $data = getJsonBody();
            if (empty($data['name'])) respond(422, ['error' => 'Name is required']);
            $updated = $categoryModel->update($id, (string)$data['name']);
            if (!$updated) respond(404, ['error' => 'Category not found']);
            respond(200, $updated);

        case 'DELETE':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $ok = $categoryModel->delete($id);
            respond($ok ? 204 : 404, $ok ? [] : ['error' => 'Category not found']);

        default:
            respond(405, ['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    respond(500, ['error' => 'Database error', 'detail' => $e->getMessage()]);
}