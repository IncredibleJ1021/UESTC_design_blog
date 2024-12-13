<?php
require 'db.php';
session_start();

// 获取用户ID
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => '用户ID不能为空']);
    exit;
}

// 查询用户信息
$stmt = $pdo->prepare("SELECT id, username, avatar FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    // 返回用户信息
    echo json_encode([
        'success' => true,
        'username' => $user['username'],
        'avatar_url' => $user['avatar'] ? "/uploads/avatars/{$user['avatar']}" : null, // 头像路径
    ]);
} else {
    echo json_encode(['success' => false, 'message' => '用户未找到']);
}
?>