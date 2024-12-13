<?php
require 'db.php'; // 数据库连接文件

header('Content-Type: application/json');

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? null;

    if ($action === 'add_message') {
        // 发布留言
        $userId = $_POST['user_id'] ?? null;
        $content = $_POST['content'] ?? '';

        if (!$userId || empty($content)) {
            echo json_encode(['success' => false, 'message' => '用户 ID 或留言内容不能为空']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO messages (user_id, content) VALUES (:user_id, :content)");
            $stmt->execute(['user_id' => $userId, 'content' => $content]);

            echo json_encode(['success' => true, 'message' => '留言发布成功']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => '数据库错误: ' . $e->getMessage()]);
        }
    } elseif ($action === 'get_messages') {
        // 获取留言
        try {
            $stmt = $pdo->query("SELECT m.id, m.content, m.created_at, u.username FROM messages m 
                                 JOIN users u ON m.user_id = u.id 
                                 ORDER BY m.created_at DESC");
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'messages' => $messages]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => '数据库错误: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => '无效的操作']);
    }
} else {
    echo json_encode(['success' => false, 'message' => '无效的请求方法']);
}