<?php
require 'db.php'; // 数据库连接

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT comments.content, comments.created_at, users.username 
                         FROM comments 
                         JOIN users ON comments.user_id = users.id 
                         ORDER BY comments.created_at DESC");
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['comments' => $comments]);
} catch (PDOException $e) {
    echo json_encode(['error' => '加载留言失败: ' . $e->getMessage()]);
}