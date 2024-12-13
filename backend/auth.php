<?php
require 'db.php';
session_start();
header('Content-Type: application/json');

// 读取并解析 JSON 请求体
$data = json_decode(file_get_contents('php://input'), true);

// 登录功能
if (isset($data['action']) && $data['action'] == 'login') {
    $username = $data['username'];
    $password = $data['password'];

    // 调试日志：检查用户名和密码是否正确传递
    error_log("Login attempt with username: $username, password: $password");

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // // 调试日志：检查查询结果
    // if ($user) {
    //     error_log("User found: " . print_r($user, true));
    // } else {
    //     error_log("User not found: $username");
    // }

    if ($user && $password === $user['password']) {
        $_SESSION['user_id'] = $user['id'];
        echo json_encode([
            'status' => 'success',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'avatar' => $user['avatar'] ?? null,
            ],
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid username or password.']);
    }
    exit;
}

// 检查是否已登录
if (isset($_GET['action']) && $_GET['action'] == 'check_login') {
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("SELECT id, username, avatar FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode([
                'status' => 'logged_in',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'avatar' => $user['avatar'],
                ],
            ]);
            exit;
        }
    }
    echo json_encode(['status' => 'not_logged_in']);
    exit;
}

// 退出登录功能
if (isset($data['action']) && $data['action'] == 'logout') {
    session_destroy();
    echo json_encode(['status' => 'success']);
    exit;
}

// 注册功能
if (isset($data['action']) && $data['action'] == 'register') {
    $username = $data['username'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);
    $email = $data['email'];

    $stmt = $pdo->prepare("INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$username, $password, $email]);

    echo json_encode(['status' => 'success', 'message' => 'Registration successful!']);
    exit;
}
?>