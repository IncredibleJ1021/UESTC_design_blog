<?php
require 'db.php'; // 引入数据库连接

// 响应为 JSON 格式
header('Content-Type: application/json');

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $userId = $_POST['user_id'] ?? null;

    if (!$userId) {
        echo json_encode(['success' => false, 'message' => '缺少用户 ID']);
        exit;
    }

    try {
        // 修改用户名
        if ($action === 'update_username') {
            $newUsername = $_POST['username'] ?? '';
            if (empty($newUsername)) {
                echo json_encode(['success' => false, 'message' => '用户名不能为空']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE users SET username = :username WHERE id = :id");
            $stmt->execute(['username' => $newUsername, 'id' => $userId]);

            echo json_encode(['success' => true, 'message' => '用户名更新成功']);
            exit;
        }

        // 上传头像
        if ($action === 'upload_avatar') {
            if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
                echo json_encode(['success' => false, 'message' => '头像上传失败']);
                exit;
            }

            $file = $_FILES['avatar'];
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (!in_array($file['type'], $allowedTypes)) {
                echo json_encode(['success' => false, 'message' => '文件类型不支持']);
                exit;
            }

            // 设置上传目录为 /var/www/html/uploads
            $uploadDir = '/var/www/html/uploads/'; // 这里修改为实际路径
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);  // 如果目录不存在，创建目录
            }

            // 生成唯一的文件名，避免文件名冲突
            $fileName = uniqid() . '_' . basename($file['name']);
            $filePath = $uploadDir . $fileName;

            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                // 生成相对路径，Web 服务器可访问
                $relativePath = 'uploads/' . $fileName;

                // 更新数据库中的头像路径
                $stmt = $pdo->prepare("UPDATE users SET avatar = :avatar WHERE id = :id");
                $stmt->execute(['avatar' => $relativePath, 'id' => $userId]);

                // 返回上传成功的消息及头像路径
                echo json_encode(['success' => true, 'message' => '头像上传成功', 'avatar_url' => $relativePath]);
                exit;
            } else {
                echo json_encode(['success' => false, 'message' => '头像保存失败']);
                exit;
            }
        }

        echo json_encode(['success' => false, 'message' => '无效的操作']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => '数据库操作失败: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => '无效的请求方法']);
}