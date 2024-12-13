const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const upload = multer({ dest: 'uploads/' });

// 配置中间件
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// 创建数据库连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123321',
    database: 'blog_app',
});
const promisePool = pool.promise();

// 登录接口
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0 || rows[0].password !== password) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        res.json({ message: '登录成功', userId: rows[0].id });  // 确保返回正确的 userId
    } catch (err) {
        console.error('登录失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 注册接口
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const [rows] = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        await promisePool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );

        res.json({ message: '注册成功' });
    } catch (err) {
        console.error('注册失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取博客文章 API
app.get('/get-posts', async (req, res) => {
    try {
        const [posts] = await promisePool.query('SELECT user_id, content, created_at FROM blog_posts ORDER BY created_at DESC');
        const postsWithUsernames = await Promise.all(
            posts.map(async (post) => {
                const [userRows] = await promisePool.query('SELECT username FROM users WHERE id = ?', [post.user_id]);
                return {
                    ...post,
                    username: userRows[0]?.username || '未知用户',
                };
            })
        );
        res.json(postsWithUsernames);
    } catch (error) {
        console.error('获取文章失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 发布博客文章接口
app.post('/post', async (req, res) => {
    const { userId, content } = req.body;

    try {
        await promisePool.query('INSERT INTO blog_posts (user_id, content) VALUES (?, ?)', [userId, content]);
        res.json({ message: '发布成功' });
    } catch (err) {
        console.error('发布文章失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 更新用户信息接口（上传头像）
app.post('/update-profile', upload.single('avatar'), async (req, res) => {
    const { userId, username } = req.body;

    try {
        const updates = [];

        if (username) {
            updates.push(promisePool.query('UPDATE users SET username = ? WHERE id = ?', [username, userId]));
        }

        if (req.file) {
            const avatarPath = `/uploads/${req.file.filename}`;
            updates.push(promisePool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, userId]));
        }

        await Promise.all(updates);

        res.json({ message: '信息更新成功', username, avatar: req.file?.filename });
    } catch (err) {
        console.error('更新用户信息失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 留言接口
app.post('/message', async (req, res) => {
    const { userId, content } = req.body;

    try {
        await promisePool.query('INSERT INTO messages (user_id, content) VALUES (?, ?)', [userId, content]);
        res.json({ message: '留言成功' });
    } catch (err) {
        console.error('留言失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 启动服务
const port = 3000;
app.listen(port, () => {
    console.log(`后端服务已启动，监听端口 ${port}`);
});
