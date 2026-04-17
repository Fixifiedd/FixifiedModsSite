const ACCOUNT_STORAGE_KEYS = {
    users: 'fixifiedmods_users',
    currentUser: 'fixifiedmods_current_user'
};

function accountReadUsers() {
    try {
        const raw = localStorage.getItem(ACCOUNT_STORAGE_KEYS.users);
        const users = raw ? JSON.parse(raw) : [];
        return Array.isArray(users) ? users : [];
    } catch {
        return [];
    }
}

function accountWriteUsers(users) {
    localStorage.setItem(ACCOUNT_STORAGE_KEYS.users, JSON.stringify(users));
}

function accountGetCurrentUser() {
    try {
        const raw = localStorage.getItem(ACCOUNT_STORAGE_KEYS.currentUser);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function buildCurrentUserSnapshot(user) {
    return {
        username: user.username,
        email: user.email || '',
        profile: user.profile || {}
    };
}

function accountSetCurrentUser(user) {
    localStorage.setItem(
        ACCOUNT_STORAGE_KEYS.currentUser,
        JSON.stringify(buildCurrentUserSnapshot(user))
    );
}

function accountClearCurrentUser() {
    localStorage.removeItem(ACCOUNT_STORAGE_KEYS.currentUser);
}

function accountFindUser(username) {
    return accountReadUsers().find(
        user => user.username.toLowerCase() === String(username || '').trim().toLowerCase()
    ) || null;
}

function accountUpsertUser(updatedUser) {
    const users = accountReadUsers();
    const exists = users.some(
        user => user.username.toLowerCase() === updatedUser.username.toLowerCase()
    );
    const nextUsers = users.map(user => (
        user.username.toLowerCase() === updatedUser.username.toLowerCase() ? updatedUser : user
    ));

    if (!exists) {
        nextUsers.push(updatedUser);
    }

    accountWriteUsers(nextUsers);
    accountSetCurrentUser(updatedUser);
    return updatedUser;
}

function parseNameMcLink(input) {
    const value = String(input || '').trim();

    if (!value) {
        return { valid: false, reason: 'Вставь ссылку на профиль NameMC.' };
    }

    let url;

    try {
        url = new URL(value);
    } catch {
        return { valid: false, reason: 'Ссылка должна быть полной, например https://ru.namemc.com/profile/Nick' };
    }

    const host = url.hostname.toLowerCase();

    if (!host.endsWith('namemc.com')) {
        return { valid: false, reason: 'Поддерживаются только ссылки с сайта NameMC.' };
    }

    const parts = url.pathname.split('/').filter(Boolean);
    const profileIndex = parts.findIndex(part => part.toLowerCase() === 'profile');
    const nickname = profileIndex >= 0 ? parts[profileIndex + 1] : parts[parts.length - 1];

    if (!nickname) {
        return { valid: false, reason: 'Не удалось определить ник из ссылки NameMC.' };
    }

    const cleanedNickname = decodeURIComponent(nickname).trim();

    if (!/^[A-Za-z0-9_]{2,32}$/.test(cleanedNickname)) {
        return { valid: false, reason: 'Ник из ссылки выглядит некорректно.' };
    }

    return {
        valid: true,
        nickname: cleanedNickname,
        profileUrl: url.toString(),
        avatarUrl: `https://mc-heads.net/avatar/${cleanedNickname}/160`,
        bodyUrl: `https://mc-heads.net/body/${cleanedNickname}/240`,
        bustUrl: `https://mc-heads.net/head/${cleanedNickname}/180`,
        skinUrl: `https://mc-heads.net/skin/${cleanedNickname}`
    };
}

function buildMinecraftProfileFromNickname(nickname, profileUrl = '') {
    const cleanedNickname = String(nickname || '').trim();

    if (!/^[A-Za-z0-9_]{2,32}$/.test(cleanedNickname)) {
        return null;
    }

    return {
        nameMcUrl: profileUrl,
        minecraftNickname: cleanedNickname,
        avatarUrl: `https://mc-heads.net/avatar/${cleanedNickname}/160`,
        bodyUrl: `https://mc-heads.net/body/${cleanedNickname}/240`,
        bustUrl: `https://mc-heads.net/head/${cleanedNickname}/180`,
        skinUrl: `https://mc-heads.net/skin/${cleanedNickname}`
    };
}

function accountGetUserAvatarUrl(user) {
    if (!user) {
        return '';
    }

    if (user.profile?.avatarUrl) {
        return user.profile.avatarUrl;
    }

    const nickname = user.profile?.minecraftNickname;

    if (/^[A-Za-z0-9_]{2,32}$/.test(String(nickname || '').trim())) {
        return `https://mc-heads.net/avatar/${String(nickname).trim()}/160`;
    }

    return '';
}
