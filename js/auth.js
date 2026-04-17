const form = document.getElementById('authForm');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const panelTitle = document.getElementById('panelTitle');
const formNote = document.getElementById('formNote');
const submitButton = document.getElementById('submitButton');
const formMessage = document.getElementById('formMessage');
const emailField = document.getElementById('emailField');
const confirmField = document.getElementById('confirmField');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const currentSessionCard = document.getElementById('currentSessionCard');
const currentSessionName = document.getElementById('currentSessionName');
const currentSessionAvatar = document.getElementById('currentSessionAvatar');
const logoutButton = document.getElementById('logoutButton');

let currentMode = 'login';

function readUsers() {
    return accountReadUsers();
}

function writeUsers(users) {
    accountWriteUsers(users);
}

function getCurrentUser() {
    return accountGetCurrentUser();
}

function setCurrentUser(user) {
    accountSetCurrentUser(user);
}

function clearCurrentUser() {
    accountClearCurrentUser();
}

function setMode(mode) {
    currentMode = mode;
    const isRegister = mode === 'register';

    loginTab.classList.toggle('active', !isRegister);
    registerTab.classList.toggle('active', isRegister);
    panelTitle.textContent = isRegister ? 'Создать аккаунт' : 'Войти в аккаунт';
    formNote.textContent = isRegister
        ? 'Создай учётную запись, чтобы подготовить доступ к модам.'
        : 'Войди в существующий аккаунт, чтобы продолжить.';
    submitButton.textContent = isRegister ? 'Зарегистрироваться' : 'Войти';

    emailField.hidden = !isRegister;
    confirmField.hidden = !isRegister;
    emailInput.required = isRegister;
    confirmPasswordInput.required = isRegister;
    passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password';

    formMessage.className = 'form-message';
    formMessage.textContent = '';
}

function setMessage(message, type = '') {
    formMessage.className = `form-message${type ? ` ${type}` : ''}`;
    formMessage.textContent = message;
}

function updateSessionCard() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        currentSessionCard.hidden = true;
        return;
    }

    currentSessionName.textContent = currentUser.username;
    const avatarUrl = accountGetUserAvatarUrl(currentUser);

    if (avatarUrl) {
        currentSessionAvatar.src = avatarUrl;
        currentSessionAvatar.hidden = false;
    } else {
        currentSessionAvatar.hidden = true;
        currentSessionAvatar.removeAttribute('src');
    }

    currentSessionCard.hidden = false;
}

function handleRegister() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (username.length < 3) {
        setMessage('Логин должен содержать минимум 3 символа.', 'error');
        return;
    }

    if (password.length < 6) {
        setMessage('Пароль должен содержать минимум 6 символов.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        setMessage('Пароли не совпадают.', 'error');
        return;
    }

    const users = readUsers();
    const userExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());
    const emailExists = users.some(user => (user.email || '').toLowerCase() === email);

    if (userExists) {
        setMessage('Пользователь с таким логином уже существует.', 'error');
        return;
    }

    if (emailExists) {
        setMessage('Этот email уже используется.', 'error');
        return;
    }

    const newUser = {
        username,
        email,
        password,
        profile: {
            displayName: '',
            nameMcUrl: '',
            minecraftNickname: '',
            avatarUrl: '',
            bodyUrl: '',
            bustUrl: '',
            skinUrl: ''
        }
    };

    users.push(newUser);
    writeUsers(users);
    setCurrentUser(newUser);
    updateSessionCard();
    setMessage('Аккаунт создан. Через секунду верну тебя на главную.', 'success');
    form.reset();

    window.setTimeout(() => {
        window.location.href = 'profile.html';
    }, 1200);
}

function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const users = readUsers();

    const matchedUser = users.find(
        user => user.username.toLowerCase() === username.toLowerCase() && user.password === password
    );

    if (!matchedUser) {
        setMessage('Неверный логин или пароль.', 'error');
        return;
    }

    setCurrentUser(matchedUser);
    updateSessionCard();
    setMessage('Вход выполнен. Через секунду верну тебя на главную.', 'success');
    form.reset();

    window.setTimeout(() => {
        window.location.href = 'profile.html';
    }, 1200);
}

loginTab.addEventListener('click', () => setMode('login'));
registerTab.addEventListener('click', () => setMode('register'));

form.addEventListener('submit', event => {
    event.preventDefault();
    submitButton.disabled = true;

    try {
        if (currentMode === 'register') {
            handleRegister();
        } else {
            handleLogin();
        }
    } finally {
        window.setTimeout(() => {
            submitButton.disabled = false;
        }, 250);
    }
});

logoutButton.addEventListener('click', () => {
    clearCurrentUser();
    updateSessionCard();
    setMessage('Сессия очищена. Теперь можно войти заново.', 'success');
});

setMode('login');
updateSessionCard();
