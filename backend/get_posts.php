<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => '未登录']);
    exit();
}

$mysqli = new mysqli("localhost", "root", "123321", "blog_app");
if ($mysqli->connect_error) {
    echo json_encode(['error' => '数据库连接失败']);
    exit();
}

$user_id = $_SESSION['user_id'];
$result = $mysqli->query("SELECT * FROM blog_posts WHERE user_id = $user_id ORDER BY created_at DESC");
$posts = [];
while ($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

echo json_encode(['posts' => $posts]);
$mysqli->close();