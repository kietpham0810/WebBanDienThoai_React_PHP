<?php
declare(strict_types=1);
require_once __DIR__ . '/../models/User.php';

// $userModel, $id, $method, $pdo, respond(), getJsonBody() defined by api/index.php

try {
    $userModel = new User();
} catch (PDOException $e) {
    error_log('User Model Init Error: ' . $e->getMessage());
    respond(500, ['error' => 'Database connection failed']);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                $item = $userModel->getById($id);
                if (!$item) respond(404, ['error' => 'User not found']);
                unset($item['password']);
                respond(200, $item);
            }
            $users = $userModel->getAll();
            foreach ($users as &$user) unset($user['password']);
            respond(200, $users);

        case 'POST':
            $data = getJsonBody();
            foreach (['name', 'email', 'password'] as $field) {
                if (empty($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            $created = $userModel->create($data);
            unset($created['password']);
            respond(201, $created);

        case 'PUT':
        case 'PATCH':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $data = getJsonBody();
            foreach (['name', 'email'] as $field) {
                if (empty($data[$field])) respond(422, ['error' => "$field is required"]);
            }
            $updated = $userModel->update($id, $data);
            if (!$updated) respond(404, ['error' => 'User not found']);
            unset($updated['password']);
            respond(200, $updated);

        case 'DELETE':
            if ($id === null) respond(400, ['error' => 'ID is required']);
            $ok = $userModel->delete($id);
            respond($ok ? 204 : 404, $ok ? [] : ['error' => 'User not found']);

        default:
            respond(405, ['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    respond(500, ['error' => 'Database error', 'detail' => $e->getMessage()]);
}