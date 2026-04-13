// ===== NAVIGATION =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Active link highlighting
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== DOWNLOAD BUTTON DROPDOWN =====
const downloadBtn = document.getElementById('downloadBtn');
const downloadOptions = document.getElementById('downloadOptions');
const downloadDirect = document.getElementById('downloadDirect');
const downloadGithub = document.getElementById('downloadGithub');

if (downloadBtn && downloadOptions) {
    // Показать/скрыть опции скачивания
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadOptions.classList.toggle('active');
    });

    // Закрыть при клике вне
    document.addEventListener('click', (e) => {
        if (!downloadOptions.contains(e.target) && e.target !== downloadBtn) {
            downloadOptions.classList.remove('active');
        }
    });

    // Прямое скачивание с сайта
    downloadDirect.addEventListener('click', (e) => {
        e.preventDefault();
        const jarUrl = 'downloads/fixifiedtranslator-1.3.0.jar';
        
        const a = document.createElement('a');
        a.href = jarUrl;
        a.download = 'fixifiedtranslator-1.3.0.jar';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        downloadOptions.classList.remove('active');
        showNotification('✅ Загрузка FixifiedTranslator v1.3.0 началась!');
    });
}

// ===== MODAL WINDOW =====
const detailsBtn = document.getElementById('detailsBtn');
const modModal = document.getElementById('modModal');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');
const modalDownloadDirect = document.getElementById('modalDownloadDirect');

if (detailsBtn && modModal) {
    // Открыть модалку
    detailsBtn.addEventListener('click', () => {
        modModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Закрыть модалку
    function closeModal() {
        modModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Закрыть по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Скачивание из модалки
    if (modalDownloadDirect) {
        modalDownloadDirect.addEventListener('click', (e) => {
            e.preventDefault();
            const jarUrl = 'downloads/fixifiedtranslator-1.3.0.jar';
            
            const a = document.createElement('a');
            a.href = jarUrl;
            a.download = 'fixifiedtranslator-1.3.0.jar';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            closeModal();
            showNotification('✅ Загрузка FixifiedTranslator v1.3.0 началась!');
        });
    }
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #7c3aed 0%, #10b981 100%);
        color: white;
        padding: 15px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to cards
document.querySelectorAll('.mod-card, .about-feature, .contact-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// ===== NAVBAR SCROLL EFFECT =====
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// ===== ADD CSS ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('FixifiedMods website loaded successfully! 🎮');

// ===== REVIEWS SLIDER =====
const reviewsTrack = document.querySelector('.reviews-track');
const prevBtn = document.querySelector('.slider-prev');
const nextBtn = document.querySelector('.slider-next');
let currentSlide = 0;

if (reviewsTrack && prevBtn && nextBtn) {
    const totalSlides = document.querySelectorAll('.review-card').length;

    function updateSlider() {
        reviewsTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    });

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlider();
    });

    // Auto-slide every 5 seconds
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    }, 5000);
}
