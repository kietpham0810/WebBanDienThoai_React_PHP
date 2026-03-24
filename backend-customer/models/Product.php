<?php
declare(strict_types=1);
require_once __DIR__ . '/BaseModel.php';

class Product extends BaseModel
{
    protected string $table = 'products';

    public function create(array $data): array
    {
        $stmt = $this->db->prepare(
            "INSERT INTO products (name, price, description, image, category_id, created_at)
             VALUES (:name, :price, :description, :image, :category_id, :created_at)"
        );

        $stmt->execute([
            'name' => $data['name'],
            'price' => $data['price'],
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null,
            'category_id' => $data['category_id'],
            'created_at' => $data['created_at'] ?? date('Y-m-d H:i:s')
        ]);

        return $this->getById((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): ?array
    {
        $stmt = $this->db->prepare(
            "UPDATE products SET name = :name, price = :price, description = :description,
             image = :image, category_id = :category_id WHERE id = :id"
        );

        $stmt->execute([
            'name' => $data['name'],
            'price' => $data['price'],
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null,
            'category_id' => $data['category_id'],
            'id' => $id
        ]);

        return $this->getById($id);
    }
}