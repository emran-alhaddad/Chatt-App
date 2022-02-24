const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.msg_card_body');
const roomName = document.getElementById('roomName');
const usersList = document.getElementById('users');

// Get username and room from URL
let username = "";
const room = "Road Coding Academy";
if (!sessionStorage.getItem('user_name')) {
    username = prompt("Enter Your Name");
    sessionStorage.setItem('user_name', username);
} else username = sessionStorage.getItem('user_name');
let ID = "";
const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('getRoomUsers', ({ room, users }) => {
    outputRoomName(room, users.length);
    outputUsers(users);
});


socket.on('message', (message) => {
    ID = message.id;
    document.querySelector('.msg_card_body').innerHTML += `
    <div class="alertBox">
    <div class="alertMessage" style="font-size: 80%;"> You ${message.text} at: ${message.time}</div>
    </div>
    `;
});

// Get join and leave messages
socket.on('alertMessage', (message) => {
    document.querySelector('.msg_card_body').innerHTML += `
    <div class="alertBox">
    <div class="alertMessage" > ${message.text}</div>
    </div>
    `;
});

// Message from server
socket.on('messageRecive', (message) => {

    console.log(message);
    if (message.id == ID)
        showSendMessage(message);
    else
        showRecivedMessage(message);
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if (!msg) {
        return false;
    }

    // Emit message to server
    socket.emit('chatSendMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output Sent message to DOM
function showSendMessage(message) {
    document.querySelector('.msg_card_body').innerHTML += `
    <div class="d-flex justify-content-end mb-4 message_send">
                            <div class="msg_cotainer_send">
                                ${message.text}
                                <span class="msg_time_send">${message.time}</span>
                            </div>
                            <div class="img_cont_msg">
                                <img src="/user.png" class="rounded-circle user_img_msg">
                                <h6 style="color: #ffffffa3;margin-top: 7px;font-size: 50%;">
                                ${message.username}
                                </h6>
                            </div>
                        </div>`;
}


// Output Recived message to DOM
function showRecivedMessage(message) {
    document.querySelector('.msg_card_body').innerHTML += `
    <div class="d-flex justify-content-start mb-4 message_recive">
                            <div class="img_cont_msg">
                                <img src="/user.png" class="rounded-circle user_img_msg">
                                <h6 style="color: #ffffffa3;margin-top: 7px;font-size: 50%;">
                                ${message.username}
                                </h6>
                            </div>
                            <div class="msg_cotainer">
                            ${message.text}
                                <span class="msg_time">${message.time}</span>
                            </div>
                        </div>`;
}

// Add room name to DOM
function outputRoomName(room, users) {
    roomName.innerText = room;
    document.getElementById('no_usesr').innerHTML = `${users} Active Members`;
}

// Add users to DOM
function outputUsers(users) {
    usersList.innerHTML = '';
    users.forEach((user) => {
        if (user.username == username) user.username = "You"
        usersList.innerHTML += `
                    <li data-filter-item data-filter-name="${user.username.toLowerCase()}">
                        <div class="d-flex bd-highlight">
                            <div class="img_cont">
                                <img src="/user.png" class="rounded-circle user_img">
                                <span class="online_icon"></span>
                            </div>
                            <div class="user_info">
                                <span>${user.username}</span>
                                <p>online</p>
                            </div>
                        </div>
                    </li>`;
    });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = '/';
    } else {}
});



$(document).ready(function() {
    $('#search').keyup(function(e) {

        var searchVal = $(this).val();
        var filterItems = $('[data-filter-item]');

        if (searchVal != '') {
            filterItems.addClass('hidden');
            $('[data-filter-item][data-filter-name*="' + searchVal.toLowerCase() + '"]').removeClass('hidden');
        } else {
            filterItems.removeClass('hidden');
        }
    });
});