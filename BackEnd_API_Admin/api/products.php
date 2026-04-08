<?php
$base_query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id";

// Hàm xử lý upload ảnh (không dùng finfo để tương thích XAMPP)
function handleImageUpload($file_input_name = 'image') {
    $upload_dir = __DIR__ . '/../uploads/products/';
    $allowed_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    // Mime type trình duyệt gửi lên (không dùng finfo_open)
    $allowed_mimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $max_size = 5 * 1024 * 1024; // 5MB

    if (!isset($_FILES[$file_input_name]) || $_FILES[$file_input_name]['error'] === UPLOAD_ERR_NO_FILE) {
        return null; // Không có file upload
    }

    $file = $_FILES[$file_input_name];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["message" => "Lỗi upload ảnh: code " . $file['error']]);
        exit();
    }

    if ($file['size'] > $max_size) {
        http_response_code(400);
        echo json_encode(["message" => "Ảnh quá lớn! Tối đa 5MB."]);
        exit();
    }

    // Kiểm tra extension
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed_exts)) {
        http_response_code(400);
        echo json_encode(["message" => "Chỉ chấp nhận ảnh: JPG, PNG, GIF, WEBP."]);
        exit();
    }

    // Kiểm tra mime type từ $_FILES (browser gửi lên)
    if (!in_array($file['type'], $allowed_mimes)) {
        http_response_code(400);
        echo json_encode(["message" => "File không phải ảnh hợp lệ."]);
        exit();
    }

    // Tạo thư mục nếu chưa có
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Tạo tên file duy nhất
    $filename = uniqid('product_', true) . '.' . $ext;
    $dest = $upload_dir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        http_response_code(500);
        echo json_encode(["message" => "Không thể lưu ảnh. Kiểm tra quyền thư mục uploads/products/"]);
        exit();
    }

    return $filename;
}

// Lấy dữ liệu từ form (hỗ trợ cả JSON và multipart/form-data)
function getInputData($input_data_global) {
    // Nếu có $_POST data (multipart/form-data) thì ưu tiên dùng
    if (!empty($_POST)) {
        return $_POST;
    }
    // Fallback về JSON body
    return $input_data_global;
}

switch ($method) {
    case 'GET':
        if ($id) {
            $query = $base_query . " WHERE p.id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($product ? $product : ["message" => "Không tìm thấy sản phẩm"]);
        } else {
            if (isset($_GET['status'])) {
                $query = $base_query . " WHERE p.status = :status ORDER BY p.id DESC";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':status', $_GET['status']);
            } else {
                $query = $base_query . " ORDER BY p.id DESC";
                $stmt = $conn->prepare($query);
            }
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $data = getInputData($input_data);

        if (isset($data['name']) && isset($data['price']) && isset($data['category_id'])) {
            // Xử lý upload ảnh
            $image_filename = handleImageUpload('image');

            // Nếu không upload file mới, lấy tên ảnh từ text input (nếu có)
            if ($image_filename === null) {
                $image_filename = isset($data['image']) ? $data['image'] : null;
            }

            $query = "INSERT INTO products (name, price, description, image, category_id, created_at, stock, status) 
                      VALUES (:name, :price, :description, :image, :category_id, :created_at, :stock, :status)";
            $stmt = $conn->prepare($query);

            $description = isset($data['description']) ? $data['description'] : null;
            $createdAt = date('Y-m-d H:i:s');
            $stock = isset($data['stock']) ? (int)$data['stock'] : 0;
            $status = isset($data['status']) ? (int)$data['status'] : 0;

            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':image', $image_filename);
            $stmt->bindParam(':category_id', $data['category_id']);
            $stmt->bindParam(':created_at', $createdAt);
            $stmt->bindParam(':stock', $stock);
            $stmt->bindParam(':status', $status);

            if ($stmt->execute()) {
                $new_id = $conn->lastInsertId();
                http_response_code(201);
                echo json_encode([
                    "message" => "Thêm sản phẩm thành công",
                    "id" => $new_id,
                    "image" => $image_filename
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Lỗi thêm sản phẩm"]);
            }
        } else {
            http_response_code(400);
            $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
            echo json_encode([
                "message" => "Thiếu thông tin sản phẩm",
                "received_post" => array_keys($data ?? []),
                "has_files" => !empty($_FILES),
                "content_type" => $contentType
            ]);
        }
        break;

    case 'PUT':
        $data = getInputData($input_data);

        if ($id && !empty($data)) {
            $fields = [];
            $params = [':id' => $id];

            if (isset($data['name']))        { $fields[] = "name = :name";               $params[':name'] = $data['name']; }
            if (isset($data['price']))       { $fields[] = "price = :price";             $params[':price'] = $data['price']; }
            if (isset($data['description'])) { $fields[] = "description = :description"; $params[':description'] = $data['description']; }
            if (isset($data['category_id'])) { $fields[] = "category_id = :category_id"; $params[':category_id'] = $data['category_id']; }
            if (isset($data['stock']))       { $fields[] = "stock = :stock";             $params[':stock'] = (int)$data['stock']; }
            if (isset($data['status']))      { $fields[] = "status = :status";           $params[':status'] = (int)$data['status']; }

            // Xử lý upload ảnh mới (nếu có)
            $new_image = handleImageUpload('image');
            if ($new_image !== null) {
                // Xóa ảnh cũ nếu là ảnh do hệ thống tạo (có prefix product_)
                $old_stmt = $conn->prepare("SELECT image FROM products WHERE id = :id");
                $old_stmt->bindParam(':id', $id);
                $old_stmt->execute();
                $old_product = $old_stmt->fetch(PDO::FETCH_ASSOC);
                if ($old_product && $old_product['image'] && strpos($old_product['image'], 'product_') === 0) {
                    $old_image_path = __DIR__ . '/../uploads/products/' . $old_product['image'];
                    if (file_exists($old_image_path)) {
                        @unlink($old_image_path);
                    }
                }
                $fields[] = "image = :image";
                $params[':image'] = $new_image;
            } elseif (isset($data['image'])) {
                // Cập nhật tên ảnh text nếu không upload file
                $fields[] = "image = :image";
                $params[':image'] = $data['image'];
            }

            if (count($fields) > 0) {
                $query = "UPDATE products SET " . implode(", ", $fields) . " WHERE id = :id";
                $stmt = $conn->prepare($query);

                // THAY ĐỔI Ở ĐÂY: Thêm bẫy rowCount()
                if ($stmt->execute($params)) {
                    if ($stmt->rowCount() > 0) {
                        echo json_encode([
                            "message" => "Cập nhật sản phẩm thành công",
                            "image" => $new_image
                        ]);
                    } else {
                        http_response_code(404);
                        echo json_encode(["message" => "Lỗi: Không tìm thấy sản phẩm với ID này (hoặc dữ liệu chưa được thay đổi)!"]);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Lỗi cập nhật sản phẩm"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Không có dữ liệu hợp lệ để cập nhật"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu ID hoặc nội dung cập nhật"]);
        }
        break;

    case 'DELETE':
        if ($id) {
            try {
                // Xóa ảnh khi xóa sản phẩm
                $old_stmt = $conn->prepare("SELECT image FROM products WHERE id = :id");
                $old_stmt->bindParam(':id', $id);
                $old_stmt->execute();
                $old_product = $old_stmt->fetch(PDO::FETCH_ASSOC);
                if ($old_product && $old_product['image'] && strpos($old_product['image'], 'product_') === 0) {
                    $old_image_path = __DIR__ . '/../uploads/products/' . $old_product['image'];
                    if (file_exists($old_image_path)) {
                        @unlink($old_image_path);
                    }
                }

                $stmt = $conn->prepare("DELETE FROM products WHERE id = :id");
                $stmt->bindParam(':id', $id);
                if ($stmt->execute()) {
                    if ($stmt->rowCount() > 0) {
                        echo json_encode(["message" => "Xóa sản phẩm thành công"]);
                    } else {
                        http_response_code(404);
                        echo json_encode(["message" => "Lỗi: Không tìm thấy sản phẩm với ID này để xóa!"]);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Không thể xóa sản phẩm này"]);
                }
            } catch (PDOException $e) {
                http_response_code(409);
                echo json_encode(["message" => "Không thể xóa: Sản phẩm này đang nằm trong đơn hàng! Hãy thử Ẩn sản phẩm thay vì Xóa."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Thiếu ID sản phẩm"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Phương thức không được hỗ trợ"]);
        break;
}
?>