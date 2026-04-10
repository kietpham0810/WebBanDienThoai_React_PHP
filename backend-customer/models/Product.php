<?php
declare(strict_types=1);
require_once __DIR__ . '/BaseModel.php';

class Product extends BaseModel
{
    protected string $table = 'products';

    public function create(array $data): array
    {
        $stmt = $this->db->prepare(
            "INSERT INTO products (name, price, description, image, category_id, created_at, stock, status)
             VALUES (:name, :price, :description, :image, :category_id, :created_at, :stock, :status)"
        );

        $stmt->execute([
            'name' => $data['name'],
            'price' => $data['price'],
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null,
            'category_id' => $data['category_id'],
            'created_at' => $data['created_at'] ?? date('Y-m-d H:i:s'),
            'stock' => $data['stock'] ?? 0,
            'status' => $data['status'] ?? 0
        ]);

        return $this->getById((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): ?array
    {
        $stmt = $this->db->prepare(
            "UPDATE products SET name = :name, price = :price, description = :description,
             image = :image, category_id = :category_id, stock = :stock, status = :status WHERE id = :id"
        );

        $stmt->execute([
            'name' => $data['name'],
            'price' => $data['price'],
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null,
            'category_id' => $data['category_id'],
            'stock' => $data['stock'] ?? 0,
            'status' => $data['status'] ?? 0,
            'id' => $id
        ]);

        return $this->getById($id);
    }
}