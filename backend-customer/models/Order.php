<?php
declare(strict_types=1);
require_once __DIR__ . '/BaseModel.php';

class Order extends BaseModel
{
    protected string $table = 'orders';

    public function create(array $data): array
    {
        $stmt = $this->db->prepare(
            "INSERT INTO orders (user_id, order_date, total, status)
             VALUES (:user_id, :order_date, :total, :status)"
        );
        $stmt->execute([
            'user_id' => $data['user_id'],
            'order_date' => $data['order_date'] ?? date('Y-m-d H:i:s'),
            'total' => $data['total'],
            'status' => $data['status'] ?? 'pending'
        ]);
        return $this->getById((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): ?array
    {
        $stmt = $this->db->prepare(
            "UPDATE orders SET user_id = :user_id, order_date = :order_date, total = :total, status = :status WHERE id = :id"
        );

        $stmt->execute([
            'id' => $id,
            'user_id' => $data['user_id'],
            'order_date' => $data['order_date'] ?? date('Y-m-d H:i:s'),
            'total' => $data['total'],
            'status' => $data['status'] ?? 'pending'
        ]);

        return $this->getById($id);
    }
}