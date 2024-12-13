// 检查用户是否已登录
async function checkLogin() {
    try {
        const response = await fetch('/auth.php?action=check_login', {
            method: 'GET',
            credentials: 'include', // 包含 cookie
        });

        const data = await response.json();
        if (data.status === 'logged_in') {
            // 同步用户信息到 sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user));
            document.getElementById('userName').innerText = data.user.username;
            if (data.user.avatar) {
                document.getElementById('userAvatar').src = data.user.avatar;
            }
        } else {
            // 未登录，清除 sessionStorage 并跳转
            sessionStorage.removeItem('user');
            alert("请先登录！");
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error("登录状态检查失败：", error);
        alert("系统错误，请稍后重试！");
    }
}

// 用户登录
async function loginUser(username, password) {
    try {
        const response = await fetch('/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password }),
        });

        const data = await response.json();
        if (data.status === 'success') {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            alert("登录成功！");
            window.location.href = '/home.html';
        } else {
            alert("登录失败：" + data.message);
        }
    } catch (error) {
        console.error("登录失败：", error);
        alert("系统错误，请稍后重试！");
    }
}

// 退出登录
document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        const response = await fetch('/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' }),
        });

        if (response.ok) {
            sessionStorage.removeItem('user');
            alert("已退出登录");
            window.location.href = '/login.html';
        } else {
            alert("退出失败，请稍后重试！");
        }
    } catch (error) {
        console.error("退出失败：", error);
        alert("系统错误，请稍后重试！");
    }
});

// 页面加载时检查登录状态
window.onload = checkLogin;
document.getElementById('postForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const postContent = document.getElementById('postContent').value.trim();
    if (!postContent) {
        alert("文章内容不能为空！");
        return;
    }

    try {
        const response = await fetch('/blog.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'publish',
                content: postContent,
            }),
        });

        const result = await response.json();  // 解析 JSON 响应
        if (result.status === 'success') {
            // 弹窗提示
            alert(result.message);  
            window.location.replace('/home.html'); // 跳转到首页
        } else {
            alert("发布失败：" + result.message);
        }
    } catch (error) {
        console.error("发布失败：", error);
        alert("网络错误，请稍后再试！");
    }
});