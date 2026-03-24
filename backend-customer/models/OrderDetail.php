<?php
declare(strict_types=1);
require_once __DIR__ . '/BaseModel.php';

class OrderDetail extends BaseModel
{
    protected string $table = 'order_details';

    public function create(array $data): array
    {
        $stmt = $this->db->prepare(
            "INSERT INTO order_details (order_id, product_id, quantity, price)
             VALUES (:order_id, :product_id, :quantity, :price)"
        );
        $stmt->execute([
            'order_id' => $data['order_id'],
            'product_id' => $data['product_id'],
            'quantity' => $data['quantity'],
            'price' => $data['price']
        ]);
        return $this->getById((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): ?array
    {
        $stmt = $this->db->prepare(
            "UPDATE order_details SET order_id = :order_id, product_id = :product_id, quantity = :quantity, price = :price WHERE id = :id"
        );
        $stmt->execute([
            'id' => $id,
            'order_id' => $data['order_id'],
            'product_id' => $data['product_id'],
            'quantity' => $data['quantity'],
            'price' => $data['price']
        ]);
        return $this->getById($id);
    }
}