document.addEventListener("DOMContentLoaded", () => {
    const profileForm = document.getElementById("profileForm");
    const usernameInput = document.getElementById("username");
    const avatarInput = document.getElementById("avatar");
    const avatarPreview = document.getElementById("avatarPreview");

    // 获取本地存储的用户ID（假设已经通过登录获取）
    const userId = localStorage.getItem("user_id");

    // 如果用户未登录，跳转到登录页面
    if (!userId) {
        alert("请先登录！");
        window.location.replace("index.html");
        return;
    }

    // 加载用户信息（包括用户名和头像）
    async function loadUserInfo() {
        try {
            const response = await fetch(`/get_user_info.php?user_id=${userId}`);
            const data = await response.json();

            if (data.success) {
                usernameInput.value = data.username || "";
                if (data.avatar_url) {
                    avatarPreview.src = data.avatar_url;
                    avatarPreview.style.display = "block"; // 显示头像预览
                }
            } else {
                alert("加载用户信息失败：" + data.message);
            }
        } catch (error) {
            console.error("加载用户信息失败:", error);
        }
    }

    loadUserInfo();

    // 头像文件选择变化时，进行头像预览
    avatarInput.addEventListener("change", () => {
        const file = avatarInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
                avatarPreview.style.display = "block"; // 显示头像预览
            };
            reader.readAsDataURL(file);
        }
    });

    // 提交表单
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // 阻止默认表单提交

        const formData = new FormData();
        formData.append("user_id", userId); // 将用户ID添加到表单数据中

        // 上传用户名（如果有变化）
        if (usernameInput.value.trim()) {
            formData.append("action", "update_username");
            formData.append("username", usernameInput.value.trim());
        }

        // 上传头像（如果有选择新头像）
        if (avatarInput.files[0]) {
            formData.append("action", "upload_avatar");
            formData.append("avatar", avatarInput.files[0]);
        }

        try {
            const response = await fetch("/update_user.php", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message); // 提示更新成功
                if (result.avatar_url) {
                    avatarPreview.src = result.avatar_url; // 更新头像预览
                    avatarPreview.style.display = "block"; // 显示头像预览
                }
            } else {
                alert("更新失败：" + result.message);
            }
        } catch (error) {
            console.error("更新失败:", error);
            alert("更新失败，请稍后再试！");
        }
    });
});