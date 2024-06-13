
// Функции для управления всплывающими окнами
function toggleCountersModal() {
    var modal = document.getElementById("countersModal");
    modal.style.display = (modal.style.display === "block") ? "none" : "block";
}

function toggleAddDeviceModal() {
    var modal = document.getElementById("addDeviceModal");
    modal.style.display = (modal.style.display === "block") ? "none" : "block";
}

function toggleBluetoothModal() {
    var modal = document.getElementById("bluetoothModal");
    modal.style.display = (modal.style.display === "block") ? "none" : "block";
}

// Добавляем функциональность для управления устройствами
function toggleLight() {
    // Реализация переключения состояния лампочки
}

function changeFanSpeed() {
    // Реализация изменения скорости вентилятора
}

function toggleSpeaker() {
    // Реализация переключения состояния колонки
}

// Функции для работы с Bluetooth
function connectBluetooth() {
    // Реализация подключения по Bluetooth
    document.getElementById("bluetoothStatus").innerText = "Подключено";
}