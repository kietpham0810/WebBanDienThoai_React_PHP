<?php
declare(strict_types=1);
require_once __DIR__ . '/BaseModel.php';

class Category extends BaseModel
{
    protected string $table = 'categories';

    public function create(string $name): array
    {
        $stmt = $this->db->prepare("INSERT INTO categories (name) VALUES (:name)");
        $stmt->execute(['name' => $name]);
        return $this->getById((int)$this->db->lastInsertId());
    }

    public function update(int $id, string $name): ?array
    {
        $stmt = $this->db->prepare("UPDATE categories SET name = :name WHERE id = :id");
        $stmt->execute(['name' => $name, 'id' => $id]);
        return $this->getById($id);
    }
}