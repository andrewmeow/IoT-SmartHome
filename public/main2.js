document.addEventListener('DOMContentLoaded', function () {
    const roomsSection = document.querySelector('.rooms');
    const devicesSection = document.querySelector('.device-container'); 
    const countersSection = document.querySelector('.counters');
    const settingsSection = document.querySelector('.settings');

    const roomsBtn = document.getElementById('roomsBtn');
    const devicesBtn = document.getElementById('devicesBtn');
    const countersBtn = document.getElementById('countersBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    const addRoomForm = document.getElementById('addRoomForm');
    const roomList = document.getElementById('roomList');
    const errorMessage = document.getElementById('errorMessage');

    const addDeviceForm = document.getElementById('addDeviceForm');
    const deviceContainer = document.querySelector('.device-container');
    const errorDeviceMessage = document.getElementById('errorDeviceMessage');

    roomsBtn.addEventListener('click', function () {
        toggleActive(roomsBtn);
        toggleActive(devicesBtn, false);
        //toggleActive(countersBtn, false);р
        toggleActive(settingsBtn, false);
        showSection(roomsSection);
        hideSection(devicesSection);
        hideSection(countersSection);
        hideSection(settingsSection);
    });

    devicesBtn.addEventListener('click', function () {
        toggleActive(devicesBtn);
        toggleActive(roomsBtn, false);
        //toggleActive(countersBtn, false);
        toggleActive(settingsBtn, false);
        showSection(devicesSection);
        hideSection(roomsSection);
        hideSection(countersSection);
        hideSection(settingsSection);
    });


    settingsBtn.addEventListener('click', function () {
        toggleActive(settingsBtn);
        toggleActive(roomsBtn, false);
        toggleActive(devicesBtn, false);
        //toggleActive(countersBtn, false);
        showSection(settingsSection);
        hideSection(roomsSection);
        hideSection(devicesSection);
        hideSection(countersSection);
    });

    addRoomForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new URLSearchParams(new FormData(addRoomForm)).toString();
        const response = await fetch('/add-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        const message = await response.text();
        if (response.ok) {
            updateRoomList();
            // Очищаем поле ввода
            addRoomForm.reset();
        } else {
            errorMessage.textContent = message;
        }
    });

    addDeviceForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new URLSearchParams(new FormData(addDeviceForm)).toString();
        const response = await fetch('/add-device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        const message = await response.text();
        if (response.ok) {
            updateDeviceList();
            // Очищаем поле ввода
            addDeviceForm.reset();
        } else {
            errorDeviceMessage.textContent = message;
        }
    });

    async function updateRoomList() {
        try {
            const response = await fetch('/rooms');
            if (!response.ok) {
                throw new Error('Failed to fetch rooms.');
            }

            const rooms = await response.json();
            const roomSelect = document.getElementById('roomSelect');
            roomList.innerHTML = '';
            roomSelect.innerHTML = '';

            rooms.forEach(room => {
                const option = document.createElement('option');
                option.textContent = room.name;
                option.value = room.id;
                roomSelect.appendChild(option);
                const li = document.createElement('li');
                li.textContent = room.name;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-room');
                deleteButton.dataset.roomId = room.id;

                li.appendChild(deleteButton);
                roomList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching rooms:', error);
            alert('Failed to fetch rooms. Please try again later.');
        }
    }

async function updateDeviceList() {
    try {
        const response = await fetch(`/user-devices`);
        if (!response.ok) {
            throw new Error('Failed to fetch devices.');
        }

        const devices = await response.json();
        deviceContainer.innerHTML = '';

        devices.forEach(device => {
            // Создаем блок для устройства
            const deviceBlock = document.createElement('div');
            deviceBlock.classList.add('device-block');
            const deviceImage = document.createElement('img');
            // Создаем картинку устройства (если есть)
            switch(device.device_type){
                case 1:
                    deviceImage.src = '/lamp.jpg';
                    break;
                case 2:
                    deviceImage.src = '/air_conditioner.jpg';
                    break;
                case 3:
                    deviceImage.src = '/smart_socket.jpg';
                    break;
                case 4:
                    deviceImage.src = '/smart_lock.jpg';
                    break;      
                default:
                    break;  
            }
            
            //deviceImage.src = '/lamp.jpg'; // Путь к изображению устройства
            deviceImage.width = 100; // Ширина изображения (в пикселях)
            deviceImage.height = 100; // Высота изображения (в пикселях)
            deviceBlock.appendChild(deviceImage);

            // Создаем название устройства
            const deviceName = document.createElement('p');
            deviceName.textContent = device.device_name;
            deviceBlock.appendChild(deviceName);

            // Создаем кнопку "Toggle"
            const toggleButton = document.createElement('button');
            toggleButton.textContent = 'Off';
            toggleButton.classList.add('toggle-button');
            toggleButton.dataset.deviceId = device.id;
            toggleButton.addEventListener('click', async () => {
                try {
                    const currentText = toggleButton.textContent.trim();

        // Меняем текст кнопки в зависимости от текущего состояния
                    toggleButton.textContent = currentText === 'Off' ? 'On' : 'Off';
                    // В этом месте мы должны отправить запрос на сервер для переключения состояния устройства
                    // и обновить UI после успешного выполнения запроса
                    console.log(`Toggling device with ID ${device.id}`);
                } catch (error) {
                    console.error('Error toggling device:', error);
                    alert('Failed to toggle device. Please try again later.');
                }
            });
            deviceBlock.appendChild(toggleButton);

            // Добавляем созданный блок в контейнер устройств
            deviceContainer.appendChild(deviceBlock);
        });
    } catch (error) {
        console.error('Error fetching devices:', error);
        alert('Failed to fetch devices. Please try again later.');
    }
}

    logoutBtn.addEventListener('click', async function () {
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });

            if (response.ok) {
                window.location.href = '/'; // Redirect to login page
            } else {
                alert('Failed to log out.');
            }
        } catch (error) {
                     console.error('Error logging out:', error);
            alert('Failed to log out. Please try again later.');
        }
    });

    function toggleActive(element, active=true) {
        if (active) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    }

    function showSection(section) {
        section.style.display = 'block';
    }

    function hideSection(section) {
        section.style.display = 'none';
    }



    // Обновляем список комнат и устройств при загрузке страницы
    updateRoomList();
    updateDeviceList();
});