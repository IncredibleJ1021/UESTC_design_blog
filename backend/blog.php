<?php
require 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 检查 POST 请求中的 action 参数
    if (isset($_POST['action']) && $_POST['action'] == 'publish') {
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Please log in first.']);
            exit;
        }

        $content = $_POST['content'];
        $user_id = $_SESSION['user_id'];

        // 插入新文章
        $stmt = $pdo->prepare("INSERT INTO blog_posts (user_id, content, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$user_id, $content]);

        // 返回成功消息
        echo json_encode(['status' => 'success', 'message' => 'Post published successfully!']);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 检查 GET 请求中的 action 参数
    if (isset($_GET['action']) && $_GET['action'] == 'my_posts') {
        if (!isset($_SESSION['user_id'])) {
            die("Please log in first.");
        }

        $user_id = $_SESSION['user_id'];

        $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);

        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($posts);
        exit; // 避免继续执行其他代码
    }
}

// 如果没有匹配到任何逻辑，则返回错误信息
http_response_code(400); // 返回 400 Bad Request 状态码
echo json_encode(['error' => 'Invalid action or missing parameter']);