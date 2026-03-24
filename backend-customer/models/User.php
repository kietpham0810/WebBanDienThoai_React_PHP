<?php
declare(strict_types=1);
require_once __DIR__ . '/BaseModel.php';

class User extends BaseModel
{
    protected string $table = 'users';

    public function create(array $data): array
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (name, email, password, role)
             VALUES (:name, :email, :password, :role)"
        );
        $stmt->execute([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role'] ?? 'user'
        ]);

        return $this->getById((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): ?array
    {
        $sql = "UPDATE users SET name = :name, email = :email, role = :role";
        if (!empty($data['password'])) {
            $sql .= ", password = :password";
        }
        $sql .= " WHERE id = :id";

        $params = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'] ?? 'user',
            'id' => $id
        ];
        if (!empty($data['password'])) {
            $params['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $this->getById($id);
    }
}