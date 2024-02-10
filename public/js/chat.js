const socket = io();
const $container = document.querySelector('#container');
const $sideBar = $container.querySelector('#sidebar');
const $chatContainer = $container.querySelector('#chat-container');
const $messageFormButton = $chatContainer.querySelector('#send-button');
const $sendLocationButton = $chatContainer.querySelector('#send-location');
const $messages = $chatContainer.querySelector('#chat-messages');
const $messageText = $chatContainer.querySelector('#message-input');

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

$messageText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        $messageFormButton.click();
    }
});

$messageFormButton.addEventListener('click', (e) => {
    e.preventDefault();

    // disable button
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = $messageText.value;
    if (message)
        socket.emit('sendMessage', message, (error) => {
            // enable button when msg delivered or not!
            $messageFormButton.removeAttribute('disabled');
            //this will make text field empty with a placeholder focused for you to start typing.
            $messageText.value = null;
            $messageText.focus();
            if (error)
                return alert(error);
        });
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation)
        return alert('Geolocation sharing is not supported by your browser');
    $sendLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('share-location',
            {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }, (error) => {
                $sendLocationButton.removeAttribute('disabled');
                if (error) alert(error);
            });
    })
})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    // Visible height
    const visibleHeight = $messages.offsetHeight;
    // Height of messages container
    const containerHeight = $messages.scrollHeight;
    // How far have I scrolled?
    //scrollTop is top pointer of messages + length of page gives me to bottom of visible page.
    const scrollOffset = $messages.scrollTop + visibleHeight // how close to bottom we are
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.emit('join', { username, room }, (err) => {
    if (err) {
        alert(err);
        location.href = "/";
    }
});

socket.on('message', (user, senderInfo, message) => {
    const messageTemplate = document.querySelector('#message-template').innerHTML;
    const html = Mustache.render(messageTemplate, { ...user, senderInfo, ...message });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('shareLocationMessage', (user, senderInfo, message) => {
    const locationTemplate = document.querySelector('#location-template').innerHTML;
    const html = Mustache.render(locationTemplate, { ...user, senderInfo, ...message });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('renderSideBar', (users) => {
    const sideBarTemplate = document.querySelector('#siderbar-template').innerHTML;
    const html = Mustache.render(sideBarTemplate, { users });
    $sideBar.innerHTML = html;
});

