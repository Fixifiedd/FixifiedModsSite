const currentUser = accountGetCurrentUser();

if (!currentUser?.username) {
    window.location.href = 'auth.html';
}

const profileTitle = document.getElementById('profileTitle');
const profileSubtitle = document.getElementById('profileSubtitle');
const currentUsername = document.getElementById('currentUsername');
const currentEmail = document.getElementById('currentEmail');
const miniAvatar = document.getElementById('miniAvatar');
const displayNameInput = document.getElementById('displayNameInput');
const nameMcInput = document.getElementById('nameMcInput');
const formMessage = document.getElementById('formMessage');
const profileForm = document.getElementById('profileForm');
const logoutButton = document.getElementById('logoutButton');
const clearSkinButton = document.getElementById('clearSkinButton');
const minecraftNickname = document.getElementById('minecraftNickname');
const syncStatus = document.getElementById('syncStatus');
const nameMcProfileLink = document.getElementById('nameMcProfileLink');
const skinAvatar = document.getElementById('skinAvatar');
const skinFallback = document.getElementById('skinFallback');
const skinViewerWrap = document.getElementById('skinViewerWrap');
const skinViewerCanvas = document.getElementById('skinViewerCanvas');
const skinRender = document.getElementById('skinRender');
const renderPlaceholder = document.getElementById('renderPlaceholder');
const rotateToggleButton = document.getElementById('rotateToggleButton');
const animationToggleButton = document.getElementById('animationToggleButton');
const resetViewButton = document.getElementById('resetViewButton');

let skinViewer = null;
let orbitControl = null;
let viewerAnimation = null;
let viewerRotateEnabled = true;
let viewerAnimationEnabled = true;

function setMessage(message, type = '') {
    formMessage.className = `form-message${type ? ` ${type}` : ''}`;
    formMessage.textContent = message;
}

function getActualUser() {
    return currentUser?.username ? accountFindUser(currentUser.username) : null;
}

function getProfileData(user) {
    return user?.profile || {};
}

function normalizeProfile(user) {
    const profile = getProfileData(user);

    if (profile.skinUrl) {
        return profile;
    }

    const byNickname = buildMinecraftProfileFromNickname(
        profile.minecraftNickname,
        profile.nameMcUrl || ''
    );

    if (byNickname) {
        return {
            ...profile,
            ...byNickname
        };
    }

    if (profile.nameMcUrl) {
        const parsed = parseNameMcLink(profile.nameMcUrl);

        if (parsed.valid) {
            return {
                ...profile,
                nameMcUrl: parsed.profileUrl,
                minecraftNickname: parsed.nickname,
                avatarUrl: parsed.avatarUrl,
                bodyUrl: parsed.bodyUrl,
                bustUrl: parsed.bustUrl,
                skinUrl: parsed.skinUrl
            };
        }
    }

    return profile;
}

function updateViewerButtons() {
    rotateToggleButton.textContent = `Автовращение: ${viewerRotateEnabled ? 'вкл' : 'выкл'}`;
    animationToggleButton.textContent = `Анимация: ${viewerAnimationEnabled ? 'вкл' : 'выкл'}`;
}

function resizeViewer() {
    if (!skinViewer || !skinViewerWrap) {
        return;
    }

    const nextWidth = Math.max(280, Math.floor(skinViewerWrap.clientWidth));
    skinViewer.width = nextWidth;
    skinViewer.height = 320;
}

function clearViewer() {
    skinViewerWrap.hidden = true;
    skinRender.hidden = true;
    skinRender.removeAttribute('src');
    renderPlaceholder.hidden = false;
}

function ensureViewer() {
    if (skinViewer || !window.skinview3d) {
        return;
    }

    skinViewer = new window.skinview3d.SkinViewer({
        canvas: skinViewerCanvas,
        width: Math.max(280, Math.floor(skinViewerWrap.clientWidth || 480)),
        height: 320,
        alpha: true
    });

    skinViewer.zoom = 0.8;
    skinViewer.fov = 55;
    skinViewer.autoRotate = viewerRotateEnabled;
    skinViewer.globalLight.intensity = 1.8;
    skinViewer.cameraLight.intensity = 0.7;
    viewerAnimation = new window.skinview3d.WalkingAnimation();
    viewerAnimation.speed = 0.8;
    skinViewer.animation = viewerAnimation;

    if (typeof window.skinview3d.createOrbitControls === 'function') {
        orbitControl = window.skinview3d.createOrbitControls(skinViewer);
        orbitControl.enableRotate = true;
        orbitControl.enableZoom = true;
        orbitControl.enablePan = false;
    }

    window.addEventListener('resize', resizeViewer);
    updateViewerButtons();
}

function renderSkinViewer(profile, displayName) {
    if (!profile.skinUrl) {
        if (profile.bodyUrl) {
            skinViewerWrap.hidden = true;
            skinRender.src = profile.bodyUrl;
            skinRender.hidden = false;
            renderPlaceholder.hidden = false;
            renderPlaceholder.textContent = '3D viewer недоступен, поэтому показывается статичный рендер скина.';
        } else {
            clearViewer();
        }
        return;
    }

    if (!window.skinview3d) {
        skinViewerWrap.hidden = true;
        skinRender.src = profile.bodyUrl || '';
        skinRender.hidden = !profile.bodyUrl;
        renderPlaceholder.hidden = !profile.bodyUrl ? false : false;
        renderPlaceholder.textContent = profile.bodyUrl
            ? '3D viewer не загрузился, поэтому показывается статичный рендер скина.'
            : 'Не удалось загрузить viewer.';
        return;
    }

    ensureViewer();

    if (!skinViewer) {
        skinViewerWrap.hidden = true;
        skinRender.src = profile.bodyUrl || '';
        skinRender.hidden = !profile.bodyUrl;
        renderPlaceholder.hidden = !profile.bodyUrl ? false : false;
        renderPlaceholder.textContent = profile.bodyUrl
            ? '3D viewer не инициализировался, поэтому показывается статичный рендер скина.'
            : 'Не удалось инициализировать viewer.';
        return;
    }

    resizeViewer();

    skinViewerWrap.hidden = false;
    skinRender.hidden = true;
    renderPlaceholder.hidden = true;

    skinViewer.loadSkin(profile.skinUrl).catch(() => {
        skinViewerWrap.hidden = true;
        skinRender.src = profile.bodyUrl || '';
        skinRender.hidden = !profile.bodyUrl;
        renderPlaceholder.hidden = !profile.bodyUrl ? false : false;
        renderPlaceholder.textContent = profile.bodyUrl
            ? 'Скин для 3D viewer не загрузился, поэтому показывается статичный рендер.'
            : 'Не удалось загрузить скин игрока.';
    });
    skinViewer.nameTag = profile.minecraftNickname || displayName;
    skinViewer.autoRotate = viewerRotateEnabled;

    if (viewerAnimation) {
        viewerAnimation.paused = !viewerAnimationEnabled;
    }
}

function renderProfile(user) {
    const profile = normalizeProfile(user);
    const displayName = profile.displayName || user.username;
    const nickname = profile.minecraftNickname || '';
    const initial = (displayName[0] || user.username[0] || 'F').toUpperCase();

    profileTitle.textContent = `Кабинет ${displayName}`;
    profileSubtitle.textContent = nickname
        ? `Профиль синхронизирован с Minecraft-ником ${nickname}.`
        : 'Здесь можно настроить внешний вид профиля и привязать Minecraft-аккаунт через ссылку NameMC.';
    currentUsername.textContent = user.username;
    currentEmail.textContent = user.email || 'Email не указан';
    miniAvatar.textContent = initial;
    displayNameInput.value = profile.displayName || '';
    nameMcInput.value = profile.nameMcUrl || '';

    minecraftNickname.textContent = nickname || 'Не указан';

    if (nickname && profile.nameMcUrl) {
        syncStatus.textContent = 'Синхронизировано';
        nameMcProfileLink.hidden = false;
        nameMcProfileLink.href = profile.nameMcUrl;
    } else {
        syncStatus.textContent = 'Не настроено';
        nameMcProfileLink.hidden = true;
        nameMcProfileLink.removeAttribute('href');
    }

    if (profile.avatarUrl) {
        skinAvatar.src = profile.avatarUrl;
        skinAvatar.hidden = false;
        skinFallback.hidden = true;
    } else {
        skinAvatar.hidden = true;
        skinFallback.hidden = false;
        skinFallback.textContent = initial;
    }

    if (profile.skinUrl || profile.bodyUrl) {
        renderSkinViewer(profile, displayName);
    } else {
        clearViewer();
    }
}

function saveUserProfile(nextProfile) {
    const user = getActualUser();

    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    const updatedUser = {
        ...user,
        profile: {
            ...getProfileData(user),
            ...nextProfile
        }
    };

    accountUpsertUser(updatedUser);
    renderProfile(updatedUser);
}

profileForm.addEventListener('submit', event => {
    event.preventDefault();

    const user = getActualUser();

    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    const displayName = displayNameInput.value.trim();
    const nameMcRaw = nameMcInput.value.trim();

    if (!nameMcRaw) {
        saveUserProfile({
            displayName,
            nameMcUrl: '',
            minecraftNickname: '',
            avatarUrl: '',
            bodyUrl: '',
            bustUrl: '',
            skinUrl: ''
        });
        setMessage('Кабинет сохранён. Привязка NameMC очищена.', 'success');
        return;
    }

    const parsed = parseNameMcLink(nameMcRaw);

    if (!parsed.valid) {
        setMessage(parsed.reason, 'error');
        return;
    }

    saveUserProfile({
        displayName,
        nameMcUrl: parsed.profileUrl,
        minecraftNickname: parsed.nickname,
        avatarUrl: parsed.avatarUrl,
        bodyUrl: parsed.bodyUrl,
        bustUrl: parsed.bustUrl,
        skinUrl: parsed.skinUrl
    });

    setMessage(`Кабинет сохранён. 3D-скин игрока ${parsed.nickname} синхронизирован.`, 'success');
});

clearSkinButton.addEventListener('click', () => {
    const user = getActualUser();

    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    saveUserProfile({
        displayName: displayNameInput.value.trim(),
        nameMcUrl: '',
        minecraftNickname: '',
        avatarUrl: '',
        bodyUrl: '',
        bustUrl: '',
        skinUrl: ''
    });

    setMessage('Привязка NameMC очищена.', 'success');
});

rotateToggleButton.addEventListener('click', () => {
    viewerRotateEnabled = !viewerRotateEnabled;

    if (skinViewer) {
        skinViewer.autoRotate = viewerRotateEnabled;
    }

    updateViewerButtons();
});

animationToggleButton.addEventListener('click', () => {
    viewerAnimationEnabled = !viewerAnimationEnabled;

    if (viewerAnimation) {
        viewerAnimation.paused = !viewerAnimationEnabled;
    }

    updateViewerButtons();
});

resetViewButton.addEventListener('click', () => {
    if (!skinViewer) {
        return;
    }

    skinViewer.zoom = 0.8;
    skinViewer.fov = 55;
    skinViewer.autoRotate = viewerRotateEnabled;

    if (orbitControl?.reset) {
        orbitControl.reset();
    }
});

logoutButton.addEventListener('click', () => {
    accountClearCurrentUser();
    window.location.href = 'auth.html';
});

const initialUser = getActualUser();

if (!initialUser) {
    window.location.href = 'auth.html';
} else {
    const normalizedProfile = normalizeProfile(initialUser);

    if (JSON.stringify(normalizedProfile) !== JSON.stringify(getProfileData(initialUser))) {
        saveUserProfile(normalizedProfile);
    }

    updateViewerButtons();
    renderProfile(initialUser);
}
