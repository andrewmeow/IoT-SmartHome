const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./db');
const session = require('express-session');
const app = express();
const port = 3000;
const index = 'index.html';
const register = 'registration.html';
const devices = 'main2.html';

app.use(session({
    secret: '58ebe98f755a492e9abeedbd6832bb7dfe13781b3c11a01a6388ce032c3915703f4bee8032c45504bc2fe89fc33ab0a69004ae6b8cadb4e84356c983d28fbc99',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use((req, res, next) => {
    //console.log('Session ID:', req.sessionID);
    //console.log('User ID:', req.session.userId);
    next();
});

//Настройка body-parser для обработки POST-запросов
app.use(bodyParser.urlencoded({extended:true}));
//Настройка статических файлов(CSS, изображения и т.д)
app.use(express.static('public'));

// Middleware для проверки аутентификации
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.redirect('/');
    }
}

//Маршрут для главной страницы(авторизация)
app.get('/login', (req, res) => {
    //console.log('User ID:', req.session.userId);
    if (req.session && req.session.userId) {
        res.redirect('/devices'); // Если пользователь уже аутентифицирован, перенаправляем на страницу управления устройствами
    } else {
        res.sendFile(path.join(__dirname, 'public', index));
    }
});
//Маршрут для страницы регистрации
app.get('/register', (req, res) => {
    if (req.session && req.session.userId) {
        res.redirect('/devices'); // Если пользователь уже аутентифицирован, перенаправляем на страницу управления устройствами
    } else {
        res.sendFile(path.join(__dirname, 'public', register));
    }
});

// Маршрут для получения списка комнат пользователя
app.get('/rooms', async (req, res) => {
    try {
        const query = 'SELECT * FROM rooms WHERE user_id = $1';
        const values = [req.session.userId];
        const result = await pool.query(query, values);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении комнат:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

//Маршрут для страницы управления устройствами
app.get('/devices',(req,res)=>{
    if (req.session && req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', devices)); // Если пользователь уже аутентифицирован, перенаправляем на страницу управления устройствами
    } else {
        res.redirect('/login');
    }
});


// Маршрут для получения списка устройств пользователя
app.get('/user-devices', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Необходима авторизация' });
        }
        const query = 'SELECT * FROM user_devices WHERE user_id = $1';
        const values = [req.session.userId];
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка устройств:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

//Маршрут для обработки формы авторизации
app.post('/login',async (req,res)=>{
    const{username,password} = req.body;
    try{
        const userRes = await pool.query('SELECT * FROM users WHERE username = $1',[username]);
        if(userRes.rows.length>0){
            const user = userRes.rows[0];
            const isMatch = await bcrypt.compare(password,user.password);
            if(isMatch){
                req.session.userId = user.id;
                res.redirect('/devices');
            } 
            else res.send('Invalid username or password.');
        }else res.send('Invalid username or password.');
    } catch(err){
        console.error(err);
        res.status(500).send('Server error.');
    }
});

// Маршрут для удаления устройства
app.delete('/delete-device/:id', async (req, res) => {
    try {
        const deviceId = req.params.id;
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Необходима авторизация' });
        }
        const query = 'DELETE FROM devices WHERE id = $1 AND user_id = $2 RETURNING *';
        const values = [deviceId, req.session.userId];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Устройство не найдено или не принадлежит пользователю' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при удалении устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

//Маршрут для обработки формы регистрации
app.post('/register', async (req,res)=>{
    const{username,password} = req.body;
    console.log('Received username:', username);
    console.log('Received password:', password);
    if (!username || !password) {
        res.status(400).send('Username and password are required.');
        return;
    }
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username,password) VALUES ($1, $2)',[username,hashedPassword]);
        res.send('Registration successful! You can now <a href="/">login</a>.');
    } catch(err){
        if(err.code ==='23505') res.status(400).send('Это имя пользователя занято.');
        else{
            console.error(err);
            res.status(500).send('Server error.');
        }
    }
})

//Маршрут для добавления комнаты
app.post('/add-room', async (req, res) => {
    try {
        const { roomName } = req.body;
        console.log('Название комнаты: ', roomName);
        // Проверяем, чтобы имя комнаты было не пустым
        if (!roomName || roomName.trim() === '' || !req.session.userId) {
            return res.status(400).json({ error: 'Название комнаты или id пользователя не может быть пустым' });
        }
        // Добавляем комнату в базу данных
        const query = 'INSERT INTO rooms (name, user_id) VALUES ($1, $2) RETURNING *';
        const values = [roomName,req.session.userId];
        const result = await pool.query(query, values);

        // Отправляем информацию о добавленной комнате обратно клиенту
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении комнаты:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Маршрут для добавления устройства
app.post('/add-device', async (req, res) => {
    try {
        const { deviceName,deviceType,room  } = req.body;
        console.log('Название устройства: ', deviceName);
        // Проверяем, чтобы имя устройства было не пустым
        if (!deviceName || !deviceType || !req.session.userId) {
            return res.status(400).json({ error: 'Название устройства или id пользователя не может быть пустым' });
        }
        // Добавляем устройство в базу данных
        const query = 'INSERT INTO user_devices (device_type, user_id,device_name,state,room_id) VALUES ($1, $2, $3,$4,$5) RETURNING *';
        const values = [deviceType,req.session.userId, deviceName, false,room];
        const result = await pool.query(query, values);

        // Отправляем информацию о добавленном устройстве обратно клиенту
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/turn-off-device/:deviceId', async (req, res) => {
    try {
        // Получаем идентификатор устройства из параметров запроса
        const deviceId = req.params.deviceId;

        // Здесь должен быть код для выключения устройства с идентификатором deviceId
        // Например, обновление статуса устройства в базе данных или отправка команды на устройство

        // Отправляем ответ об успешном выполнении
        res.status(200).json({ message: `Device with ID ${deviceId} turned off successfully.` });
    } catch (error) {
        console.error('Error turning off device:', error);
        res.status(500).json({ error: 'Failed to turn off device.' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.clearCookie('connect.sid'); // Очистить cookie сессии (имя cookie может отличаться)
        res.status(200).json({ message: 'Logged out successfully' });
    });
});
//Запуск сервера
app.listen(port,()=>{
    console.log(`Server running http://localhost:${port}/login`);
});
