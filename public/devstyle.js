document.addEventListener('DOMContentLoaded', () => {
    const temperature = (Math.random() * 15 + 10).toFixed(1); // Температура от 10 до 25
    const humidity = (Math.random() * 50 + 30).toFixed(1); // Влажность от 30 до 80
    const energy = (Math.random() * 10).toFixed(1); // Энергопотребление от 0 до 10


});

// Функция для управления устройствами
async function controlDevice(device, state) {
    try {
        const response = await fetch('/control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ device, state })
        });
        const message = await response.text();
        console.log(message);
    } catch (error) {
        console.error('Error:', error);
    }
};
pool.query('INSERT INTO sensor_readings (temperature, humidity, energy) VALUES ($1, $2, $3)', 
[temperature, humidity, energy], (err, res) => {
    if (err) {
        console.error('Error inserting sensor data:', err);
    } else {
        console.log('Sensor data inserted successfully:', { temperature, humidity, energy });
    }
});

setInterval(generateRandomSensorData, 10000);