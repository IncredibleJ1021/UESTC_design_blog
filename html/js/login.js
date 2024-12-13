document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // 防止表单默认提交行为

    // 获取表单中的值
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // 检查是否为空
    if (!username || !password) {
        alert("请填写完整的用户名和密码！");
        return;
    }

    try {
        // 发送登录请求
        const response = await fetch('/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password,
            }),
        });

        const result = await response.json();  // 这里应该解析为JSON，而不是text

        // console.log(result);

        if (response.ok && result.status === 'success') {
            alert("登录成功！");
            // 登录成功后重定向到首页或用户页面
            localStorage.setItem("user_id", result.user.id);
            window.location.replace('/home.html');  // 使用 replace() 避免保留登录页的历史记录
        } else {
            // 显示服务器返回的错误信息
            alert("登录失败：" + result.message);
        }
    } catch (error) {
        console.error("网络错误：", error);
        alert("登录失败，网络错误，请稍后再试！");
    }
});