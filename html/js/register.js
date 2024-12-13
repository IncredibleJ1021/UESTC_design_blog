document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // 防止表单默认提交行为

    // 获取表单中的值
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    // 验证输入是否符合要求
    if (!username || !email || !password || !confirmPassword) {
        alert("请填写完整的注册信息！");
        return;
    }

    if (password !== confirmPassword) {
        alert("两次输入的密码不一致！");
        return;
    }

    try {
        // 发送注册请求
        const response = await fetch('/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'register',
                username: username,
                password: password,
                email: email,
            }),
        });

        const result = await response.text(); // 假设服务器返回文本信息
        if (response.ok) {
            alert("注册成功！请前往登录页面登录。");
            // 跳转到登录页面
            window.location.href = '/login.html';
        } else {
            // 显示服务器返回的错误信息
            alert("注册失败：" + result);
        }
    } catch (error) {
        console.error("网络错误：", error);
        alert("注册失败，网络错误，请稍后再试！");
    }
});