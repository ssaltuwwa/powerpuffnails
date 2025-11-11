(function() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
    }
    
    document.documentElement.classList.add('theme-loading');
})();

let currentFormStep = 1;

if (typeof PP === 'undefined') {
    window.PP = {};
}


if (!PP.auth) {
    PP.auth = {
        usersKey: 'pp_users_v4',
        currentKey: 'pp_current_user_v2',
        
        get users() { 
            try {
                return JSON.parse(localStorage.getItem(this.usersKey)) || {}; 
            } catch(e) {
                console.warn('Error reading users:', e);
                return {};
            }
        },
        
        set users(data) {
            try {
                localStorage.setItem(this.usersKey, JSON.stringify(data));
            } catch(e) {
                console.error('Error saving users:', e);
            }
        },
        
        get current() {
            try {
                return JSON.parse(localStorage.getItem(this.currentKey)) || null;
            } catch(e) {
                console.warn('Error reading current user:', e);
                return null;
            }
        },
        
        set current(user) {
            try {
                if (user) {
                    localStorage.setItem(this.currentKey, JSON.stringify(user));
                } else {
                    localStorage.removeItem(this.currentKey);
                }
            } catch(e) {
                console.error('Error setting current user:', e);
            }
        },
        
        hash(p) { 
            return btoa(unescape(encodeURIComponent(p + '_powerpuff_salt_2024'))); 
        },
        
        register(userData) {
            try {
                const users = this.users;
                const em = userData.email.toLowerCase().trim();
                const ph = userData.phone ? userData.phone.replace(/\D+/g,'') : '';
                
                for(const existingEmail in users) {
                    const user = users[existingEmail];
                    if (user.email === em) {
                        throw new Error('User with this email already exists');
                    }
                    if (ph && user.phone === ph) {
                        throw new Error('User with this phone number already exists');
                    }
                }
                
                users[em] = { 
                    id: Date.now().toString(),
                    name: userData.name, 
                    phone: ph, 
                    email: em, 
                    password: this.hash(userData.password), 
                    bookings: [],
                    createdAt: new Date().toISOString()
                };
                
                this.users = users;
                this.current = { 
                    id: users[em].id,
                    name: userData.name, 
                    phone: ph, 
                    email: em 
                };
                
                return true;
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
        
        login(credentials) {
            try {
                const users = this.users;
                const em = credentials.email.toLowerCase().trim();
                const u = users[em];
                
                if (!u) {
                    throw new Error('User not found');
                }
                
                if (u.password !== this.hash(credentials.password)) {
                    throw new Error('Incorrect password');
                }
                
                this.current = { 
                    id: u.id,
                    name: u.name, 
                    phone: u.phone, 
                    email: u.email 
                };
                
                return true;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
        
        logout() { 
            this.current = null;
            return true; 
        },
        
        ensure() { 
            if(!this.current) {
                throw new Error('Please log in to your account'); 
            }
        }
    };
}

PP.openAuthModal = PP.openAuthModal || function(type = 'login') {
    console.log('Fallback: Opening auth modal for', type);
    alert(`Please ${type === 'login' ? 'log in' : 'sign up'} to continue`);
};

PP.logout = PP.logout || function() {
    console.log('Fallback: Logging out');
    if (PP.auth) {
        PP.auth.logout();
    }
    window.location.reload();
};

PP.loadProfilePage = PP.loadProfilePage || function() {
    console.log('Fallback: Loading profile page');
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return;
    
    const user = PP.auth ? PP.auth.current : null;
    if (!user) {
        profileContent.innerHTML = `
            <div class="alert alert-info text-center">
                <h4><i class="fas fa-user-lock me-2"></i>Please Log In</h4>
                <p class="mb-3">You need to be logged in to view your profile.</p>
            </div>
        `;
        return;
    }
    
    profileContent.innerHTML = `
        <div class="card">
            <div class="card-header bg-primary text-white">
                <h4><i class="fas fa-user me-2"></i>Profile</h4>
            </div>
            <div class="card-body">
                <p><strong>Name:</strong> ${user.name || 'Not specified'}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${user.phone || 'Not specified'}</p>
                <button class="btn btn-primary mt-3" onclick="PP.logout()">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                </button>
            </div>
        </div>
    `;
};

if (typeof PP === 'undefined') {
    window.PP = {};
    console.log('PP object created');
}

PP.auth = {
    usersKey: 'pp_users_v4',
    currentKey: 'pp_current_user_v2',
    
    get users() { 
        try {
            return JSON.parse(localStorage.getItem(this.usersKey)) || {}; 
        } catch(e) {
            return {};
        }
    },
    
    set users(data) {
        localStorage.setItem(this.usersKey, JSON.stringify(data));
    },
    
    get current() {
        try {
            return JSON.parse(localStorage.getItem(this.currentKey)) || null;
        } catch(e) {
            return null;
        }
    },
    
    set current(user) {
        if (user) {
            localStorage.setItem(this.currentKey, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.currentKey);
        }
    },
    
    hash(p) { 
        return btoa(unescape(encodeURIComponent(p + '_powerpuff_salt_2024'))); 
    },
    
    register({name, phone, email, password}) {
        const users = this.users;
        const em = email.toLowerCase().trim();
        const ph = phone ? phone.replace(/\D+/g,'') : '';
        
        for(const existingEmail in users) {
            const user = users[existingEmail];
            if (user.email === em) {
                throw new Error('User with this email already exists');
            }
            if (ph && user.phone === ph) {
                throw new Error('User with this phone number already exists');
            }
        }
        
        users[em] = { 
            id: Date.now().toString(),
            name, 
            phone: ph, 
            email: em, 
            password: this.hash(password), 
            bookings: [],
            createdAt: new Date().toISOString()
        };
        
        this.users = users;
        this.current = { 
            id: users[em].id,
            name, 
            phone: ph, 
            email: em 
        };
        
        return true;
    },
    
    login({email, password}) {
        const users = this.users;
        const em = email.toLowerCase().trim();
        const u = users[em];
        
        if (!u) {
            throw new Error('User not found');
        }
        
        if (u.password !== this.hash(password)) {
            throw new Error('Incorrect password');
        }
        
        this.current = { 
            id: u.id,
            name: u.name, 
            phone: u.phone, 
            email: u.email 
        };
        
        return true;
    },
    
    logout() { 
        this.current = null;
        return true; 
    },
    
    ensure() { 
        if(!this.current) {
            throw new Error('Please log in to your account'); 
        }
    }
};

const SoundManager = {
    sounds: {
        click: ['click1', 'click2', 'click3'],
        success: ['success1', 'success2'],
        error: ['error1'],
        hover: ['hover1', 'hover2'],
        toggle: ['toggle1'],
        navigation: ['nav1', 'nav2']
    },
    
    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    },
    
    play(type) {
        if (!this.audioContext) this.init();
        
        const sounds = this.sounds[type];
        if (!sounds) return;
        
        const soundName = sounds[Math.floor(Math.random() * sounds.length)];
        this.playSound(soundName, type);
    },
    
    playSound(name, type) {
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            let frequency, duration, volume;
            
            switch(type) {
                case 'click':
                    frequency = 800 + Math.random() * 200;
                    duration = 0.1;
                    volume = 0.1;
                    break;
                case 'success':
                    frequency = 1000;
                    duration = 0.3;
                    volume = 0.15;
                    break;
                case 'error':
                    frequency = 400;
                    duration = 0.5;
                    volume = 0.1;
                    break;
                case 'hover':
                    frequency = 600 + Math.random() * 100;
                    duration = 0.05;
                    volume = 0.05;
                    break;
                case 'toggle':
                    frequency = 700;
                    duration = 0.2;
                    volume = 0.1;
                    break;
                case 'navigation':
                    frequency = 500 + Math.random() * 300;
                    duration = 0.15;
                    volume = 0.08;
                    break;
                default:
                    frequency = 600;
                    duration = 0.1;
                    volume = 0.1;
            }
            
            oscillator.frequency.value = frequency;
            gainNode.gain.value = volume;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    }
};

PP.authSystem = {
    init() {
        this.setupAuthModal();
        this.bindAuthEvents();
        this.updateAuthUI();
        console.log('Auth system initialized');
    },

    setupAuthModal() {
        if (!document.getElementById('ppAuthModal')) {
            this.createAuthModal();
        }
    },

    createAuthModal() {
        const authModalHTML = `
        <div class="pp-auth-modal" id="ppAuthModal" aria-hidden="true">
            <div class="pp-auth-card">
                <div class="pp-auth-header">
                    <strong>Welcome to PowerPuff</strong>
                    <div class="pp-auth-tabs">
                        <button class="pp-auth-tab active" data-auth-tab data-tab="login">Login</button>
                        <button class="pp-auth-tab" data-auth-tab data-tab="register">Sign Up</button>
                    </div>
                    <button class="pp-close" data-close-auth>&times;</button>
                </div>
                
                <div class="pp-auth-body">
                    <!-- Login Pane -->
                    <div class="auth-pane active" id="loginPane">
                        <form id="loginForm">
                            <div class="pp-field">
                                <label for="loginEmail">Email Address *</label>
                                <input type="email" id="loginEmail" name="email" required placeholder="your.email@example.com">
                            </div>
                            
                            <div class="pp-field">
                                <label for="loginPassword">Password *</label>
                                <input type="password" id="loginPassword" name="password" required placeholder="Enter your password">
                            </div>
                            
                            <div class="pp-field-row">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="rememberMe" name="rememberMe">
                                    <label class="form-check-label" for="rememberMe">Remember me</label>
                                </div>
                                <a href="#" class="forgot-password" data-auth-tab data-tab="forgotPassword">Forgot password?</a>
                            </div>
                            
                            <div class="pp-auth-actions">
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-sign-in-alt me-2"></i>Login to Account
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Register Pane -->
                    <div class="auth-pane" id="registerPane">
                        <form id="registerForm">
                            <div class="pp-field">
                                <label for="registerName">Full Name *</label>
                                <input type="text" id="registerName" name="name" required placeholder="Enter your full name">
                            </div>
                            
                            <div class="pp-field">
                                <label for="registerEmail">Email Address *</label>
                                <input type="email" id="registerEmail" name="email" required placeholder="your.email@example.com">
                            </div>
                            
                            <div class="pp-field">
                                <label for="registerPhone">Phone Number</label>
                                <input type="tel" id="registerPhone" name="phone" placeholder="777 123 4567">
                                <small class="form-text">We'll use this to send appointment reminders</small>
                            </div>
                            
                            <div class="pp-field">
                                <label for="registerPassword">Password *</label>
                                <input type="password" id="registerPassword" name="password" required placeholder="At least 4 characters">
                            </div>
                            
                            <div class="pp-field">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                                    <label class="form-check-label" for="agreeTerms">
                                        I agree to the Terms of Service and Privacy Policy
                                    </label>
                                </div>
                            </div>
                            
                            <div class="pp-auth-actions">
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-user-plus me-2"></i>Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Forgot Password Pane -->
                    <div class="auth-pane" id="forgotPasswordPane">
                        <form id="forgotPasswordForm">
                            <div class="pp-field">
                                <label for="resetEmail">Email Address *</label>
                                <input type="email" id="resetEmail" name="resetEmail" required placeholder="your.email@example.com">
                                <small class="form-text">Enter your email address and we'll send you reset instructions</small>
                            </div>
                            
                            <div class="pp-auth-actions">
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-paper-plane me-2"></i>Send Reset Instructions
                                </button>
                            </div>
                            
                            <div class="text-center mt-3">
                                <a href="#" class="text-primary" data-auth-tab data-tab="login">
                                    <i class="fas fa-arrow-left me-1"></i>Back to Login
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', authModalHTML);
    },

    bindAuthEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="openAuthModal"]') || 
                e.target.closest('[onclick*="openAuthModal"]')) {
                e.preventDefault();
                const type = e.target.onclick?.includes('login') ? 'login' : 'register';
                this.openAuthModal(type);
            }
            
            if (e.target.matches('[data-close-auth]') || e.target.closest('[data-close-auth]')) {
                this.closeAuthModal();
            }
            
            if (e.target.matches('[data-auth-tab]') || e.target.closest('[data-auth-tab]')) {
                const tab = e.target.dataset.tab || e.target.closest('[data-auth-tab]').dataset.tab;
                this.switchAuthTab(tab);
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.matches('#registerForm')) {
                e.preventDefault();
                this.handleRegister(e.target);
            }
            
            if (e.target.matches('#loginForm')) {
                e.preventDefault();
                this.handleLogin(e.target);
            }
            
            if (e.target.matches('#forgotPasswordForm')) {
                e.preventDefault();
                this.handleForgotPassword(e.target);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="logout"]') || e.target.closest('[onclick*="logout"]')) {
                e.preventDefault();
                this.handleLogout();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('.pp-auth-modal')) {
                this.closeAuthModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isAuthModalOpen()) {
                this.closeAuthModal();
            }
        });
    },

    openAuthModal(type = 'login') {
        const modal = document.getElementById('ppAuthModal');
        if (!modal) return;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            modal.classList.add('show');
            this.switchAuthTab(type);
        }, 10);
        
        setTimeout(() => {
            const firstField = modal.querySelector('input:not([type="hidden"])');
            if (firstField) firstField.focus();
        }, 300);
    },

    closeAuthModal() {
        const modal = document.getElementById('ppAuthModal');
        if (!modal) return;

        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => {
                form.reset();
                form.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
                    field.classList.remove('is-valid', 'is-invalid');
                });
            });
        }, 300);
    },

    isAuthModalOpen() {
        const modal = document.getElementById('ppAuthModal');
        return modal && modal.classList.contains('show');
    },

    switchAuthTab(tabName) {
        document.querySelectorAll('[data-auth-tab]').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        document.querySelectorAll('.auth-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}Pane`);
        });
    },

    async handleRegister(form) {
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password')
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        this.setButtonLoading(submitBtn, true);

        try {
            const result = await PP.auth.register(userData);
            this.showNotification('🎉 Account created successfully! Welcome to PowerPuff!', 'success');
            this.closeAuthModal();
            this.updateAuthUI();
            form.reset();
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false, originalText);
        }
    },

    async handleLogin(form) {
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        this.setButtonLoading(submitBtn, true);

        try {
            const result = await PP.auth.login(credentials);
            this.showNotification(`Welcome back, ${result.user.name}! 👋`, 'success');
            this.closeAuthModal();
            this.updateAuthUI();
            form.reset();
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false, originalText);
        }
    },

    async handleForgotPassword(form) {
        const formData = new FormData(form);
        const email = formData.get('resetEmail');

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        this.setButtonLoading(submitBtn, true);

        try {
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showNotification('Password reset instructions have been sent to your email.', 'success');
            form.reset();
            this.switchAuthTab('login');
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false, originalText);
        }
    },

    handleLogout() {
        try {
            const currentUser = PP.auth.current;
            PP.auth.logout();
            this.showNotification('You have been logged out successfully', 'info');
            this.updateAuthUI();
            
            if (window.location.pathname.includes('profile.html')) {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    setButtonLoading(button, loading, originalText = '') {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
            button.classList.add('btn-loading');
        } else {
            button.disabled = false;
            button.innerHTML = originalText;
            button.classList.remove('btn-loading');
        }
    },

    updateAuthUI() {
        const currentUser = PP.auth.current;
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');

        if (authButtons && userInfo && userName) {
            if (currentUser) {
                authButtons.style.display = 'none';
                userInfo.style.display = 'flex';
                userName.textContent = currentUser.name || currentUser.email;
            } else {
                authButtons.style.display = 'flex';
                userInfo.style.display = 'none';
            }
        }

        if (window.location.pathname.includes('profile.html')) {
            setTimeout(() => {
                if (PP.loadProfilePage) {
                    PP.loadProfilePage();
                }
            }, 100);
        }
    },

    showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
            this.createSimpleNotification(message, type);
        }
    },

    createSimpleNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
};

if (typeof PP !== 'undefined') {
    PP.openAuthModal = function(type = 'login') {
        PP.authSystem.openAuthModal(type);
    };

    PP.closeAuthModal = function() {
        PP.authSystem.closeAuthModal();
    };

    PP.logout = function() {
        PP.authSystem.handleLogout();
    };
}

const AnimationManager = {
    init() {
        this.addButtonAnimations();
        this.addCardAnimations();
        this.addScrollAnimations();
    },
    
    addButtonAnimations() {
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.btn, .nav-link, .sidebar ul li, .card, .service-card')) {
                this.animateElement(e.target, 'hover');
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn, .nav-link, .sidebar ul li, .card, .service-card')) {
                this.animateElement(e.target, 'click');
            }
        });
    },
    
    addCardAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `cardSlideUp 0.6s ease-out ${entry.target.dataset.delay || '0s'} forwards`;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.card, .service-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.dataset.delay = `${index * 0.1}s`;
            observer.observe(card);
        });
    },
    
    addScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.section-spacing, .hero-section, .section-title').forEach(section => {
            observer.observe(section);
        });
    },
    
    animateElement(element, type) {
        switch(type) {
            case 'hover':
                element.style.transform = 'translateY(-2px) scale(1.02)';
                SoundManager.play('hover');
                break;
            case 'click':
                element.style.transform = 'translateY(0px) scale(0.98)';
                setTimeout(() => {
                    element.style.transform = 'translateY(-2px) scale(1.02)';
                }, 150);
                SoundManager.play('click');
                break;
        }
    }
};

function initDarkMode() {
    setTimeout(() => {
        document.documentElement.classList.remove('theme-loading');
    }, 100);

    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    updateDarkModeToggle(isDarkMode);
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            SoundManager.play('toggle');
            
            const shouldBeDark = !document.body.classList.contains('dark-mode');
            document.body.classList.toggle('dark-mode', shouldBeDark);
            localStorage.setItem('darkMode', shouldBeDark);
            
            updateDarkModeToggle(shouldBeDark);
            
            setTimeout(updateSearchHighlightColors, 50);
            
            const mode = shouldBeDark ? 'dark' : 'light';
            showNotification(`🌙 Switched to ${mode} mode`, 'success');
        });
    }
}

function updateDarkModeToggle(isDarkMode) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('.theme-icon');
        const text = darkModeToggle.querySelector('.theme-text');
        
        if (icon) {
            icon.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        if (text) {
            text.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
        }
    }
}

function initMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle d-lg-none';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.setAttribute('aria-label', 'Toggle menu');
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.appendChild(menuToggle);
    } else {
        document.body.appendChild(menuToggle);
    }
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    });
    
    sidebar.addEventListener('click', function(e) {
        if (e.target.tagName === 'LI' || e.target.closest('li')) {
            sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 991) {
            sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function initSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar ul li');
    
    sidebarLinks.forEach(link => {
        if (!link.onclick) {
            const text = link.textContent.toLowerCase();
            
            if (text.includes('story') || text.includes('about')) {
                link.onclick = () => scrollToSection('about-story');
            } else if (text.includes('team')) {
                link.onclick = () => scrollToSection('team');
            } else if (text.includes('mission') || text.includes('values')) {
                link.onclick = () => scrollToSection('mission');
            } else if (text.includes('gallery') || text.includes('design')) {
                link.onclick = () => scrollToSection('gallery');
            } else if (text.includes('faq')) {
                link.onclick = () => scrollToSection('faq');
            } else if (text.includes('manicure')) {
                link.onclick = () => scrollToSection('manicures');
            } else if (text.includes('pedicure')) {
                link.onclick = () => scrollToSection('pedicures');
            } else if (text.includes('nail art')) {
                link.onclick = () => scrollToSection('nail-art');
            } else if (text.includes('treatment')) {
                link.onclick = () => scrollToSection('treatments');
            } else if (text.includes('booking') || text.includes('appointment')) {
                link.onclick = () => scrollToSection('booking');
            } else if (text.includes('contact') || text.includes('info')) {
                link.onclick = () => scrollToSection('contact-info');
            } else if (text.includes('location')) {
                link.onclick = () => scrollToSection('location');
            } else if (text.includes('hour')) {
                link.onclick = () => scrollToSection('hours');
            } else if (text.includes('package') || text.includes('pricing')) {
                link.onclick = () => scrollToSection('main-packages');
            } else if (text.includes('special')) {
                link.onclick = () => scrollToSection('special-packages');
            }
        }
        
        link.addEventListener('click', function(e) {
            SoundManager.play('navigation');
            
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 107, 147, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        link.addEventListener('mouseenter', function() {
            SoundManager.play('hover');
        });
    });
}

function initImageOptimization() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                setTimeout(() => {
                    img.src = img.dataset.src;
                    img.onload = () => {
                        img.classList.remove('lazy-image');
                        img.classList.add('lazy-loaded');
                        img.style.animation = 'fadeInScale 1.2s ease-out forwards';
                    };
                    img.onerror = () => {
                        img.classList.add('lazy-error');
                    };
                }, 300);
                
                observer.unobserve(img);
            }
        });
    }, { threshold: 0.1 });
    
    images.forEach(img => {
        img.classList.add('lazy-image');
        img.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        imageObserver.observe(img);
    });
}

window.showNotification = function(message, type = 'info', duration = 4000) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type]} me-2"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        hideNotification(notification);
    });
    
    if (duration > 0) {
        setTimeout(() => {
            hideNotification(notification);
        }, duration);
    }
    
    return notification;
};

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded!");
    
    SoundManager.init();
    AnimationManager.init();
    
    const isHomepage = window.location.pathname.endsWith('index.html') || 
                      window.location.pathname === '/' ||
                      window.location.pathname.endsWith('/');
    
    if (isHomepage) {
        initGreetingScreen();
    } else {
        const mainWebsite = document.getElementById('mainWebsite');
        if (mainWebsite) {
            mainWebsite.classList.add('show');
        }
        setTimeout(initMainSiteFeatures, 100);
    }
    
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);
});

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        SoundManager.play('navigation');
        
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        element.style.animation = 'highlightFlash 2s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 2000);
    }
}

function initEnhancedValidation() {
    document.addEventListener('input', function(e) {
        if (e.target.type === 'email') {
            const email = e.target.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && !emailRegex.test(email)) {
                e.target.classList.add('is-invalid');
                e.target.classList.remove('is-valid');
            } else if (email) {
                e.target.classList.remove('is-invalid');
                e.target.classList.add('is-valid');
            }
        }
        
        if (e.target.type === 'tel') {
            const phone = e.target.value.replace(/\D/g, '');
            if (phone && phone.length !== 10) {
                e.target.classList.add('is-invalid');
                e.target.classList.remove('is-valid');
            } else if (phone) {
                e.target.classList.remove('is-invalid');
                e.target.classList.add('is-valid');
            }
        }
    });
}

function initAccessibility() {
    document.querySelectorAll('.btn, .nav-link, .card').forEach(element => {
        if (!element.getAttribute('aria-label')) {
            const text = element.textContent.trim() || element.title;
            if (text) {
                element.setAttribute('aria-label', text);
            }
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.popup-form.show');
            if (openModal) {
                closePopup();
            }
            
            const authModal = document.getElementById('ppAuthModal');
            if (authModal && authModal.classList.contains('show')) {
                PP.closeAuthModal();
            }
        }
    });
}

function initGreetingScreen() {
    const greetingScreen = document.getElementById('greetingScreen');
    const mainWebsite = document.getElementById('mainWebsite');
    const enterBtn = document.getElementById('enterSiteBtn');

    if (!greetingScreen || !mainWebsite || !enterBtn) {
        console.log('Greeting screen elements not found, showing main website');
        if (mainWebsite) {
            mainWebsite.style.display = 'block';
            mainWebsite.classList.add('show');
        }
        initMainSiteFeatures();
        return;
    }

    const greetingDismissed = localStorage.getItem('pp_greeting_dismissed');
    
    if (greetingDismissed === 'true') {
        greetingScreen.style.display = 'none';
        mainWebsite.style.display = 'block';
        setTimeout(() => {
            mainWebsite.classList.add('show');
            initMainSiteFeatures();
        }, 100);
    } else {
        greetingScreen.style.display = 'flex';
        mainWebsite.style.display = 'none';
        
        const greeting = getTimeBasedGreeting();
        const greetingText = document.getElementById('greetingText');
        const greetingQuote = document.getElementById('greetingQuote');

        if (greetingText) greetingText.textContent = greeting.timeOfDay;
        if (greetingQuote) greetingQuote.textContent = `"${greeting.quote}"`;

        enterBtn.addEventListener('click', function() {
            SoundManager.play('click');
            
            localStorage.setItem('pp_greeting_dismissed', 'true');
            
            greetingScreen.style.opacity = '0';
            greetingScreen.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                greetingScreen.style.display = 'none';
                mainWebsite.style.display = 'block';
                
                setTimeout(() => {
                    mainWebsite.classList.add('show');
                    initMainSiteFeatures();
                }, 50);
            }, 500);
        });
    }
}

function getTimeBasedGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay, quote;

    if (hour >= 5 && hour < 12) {
        timeOfDay = "Good Morning!";
        quote = "Mornings are when everything is possible. Start your day with beauty!";
    } else if (hour >= 12 && hour < 17) {
        timeOfDay = "Good Afternoon!";
        quote = "The day is in full swing - perfect time for a little break and self-care!";
    } else if (hour >= 17 && hour < 21) {
        timeOfDay = "Good Evening!";
        quote = "Evening is the perfect time for relaxation and beauty treatments.";
    } else {
        timeOfDay = "Welcome!";
        quote = "Even at night, you can be the brightest star!";
    }

    return { timeOfDay, quote };
}

function initServiceRatings() {
    console.log("Initializing service ratings...");
    
    const services = [
        { name: 'Creative Nail Art', rating: 0, id: 'nail-art' },
        { name: 'Luxury Manicure', rating: 0, id: 'manicure' },
        { name: 'Spa Pedicure', rating: 0, id: 'pedicure' },
        { name: 'Premium Treatments', rating: 0, id: 'treatments' }
    ];
    
    services.forEach(service => {
        const ratingContainer = document.querySelector(`.rating-stars[data-service="${service.id}"]`);
        if (ratingContainer) {
            const stars = ratingContainer.querySelectorAll('.star');
            const ratingText = ratingContainer.closest('.service-rating').querySelector('.rating-text');
            
            const savedRating = loadRating(service.id);
            if (savedRating > 0) {
                service.rating = savedRating;
                updateStarsDisplay(stars, savedRating);
                if (ratingText) {
                    ratingText.textContent = `You rated: ${savedRating}/5`;
                    ratingText.style.color = '#ffc107';
                }
            }
            
            stars.forEach((star, index) => {
                star.addEventListener('mouseenter', function() {
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', i <= index);
                    });
                });
                
                star.addEventListener('mouseleave', function() {
                    updateStarsDisplay(stars, service.rating);
                });
                
                star.addEventListener('click', function() {
                    const rating = index + 1;
                    service.rating = rating;
                    
                    updateStarsDisplay(stars, rating);
                    
                    if (ratingText) {
                        ratingText.textContent = `You rated: ${rating}/5`;
                        ratingText.style.color = '#ffc107';
                        ratingText.style.fontWeight = '600';
                    }
                    
                    SoundManager.play('click');
                    showNotification(`⭐ Rated "${service.name}" ${rating}/5 stars!`, 'success');
                    
                    saveRating(service.id, rating);
                });
            });
        }
    });
}

function updateStarsDisplay(stars, rating) {
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function saveRating(serviceId, rating) {
    const ratings = JSON.parse(localStorage.getItem('powerpuffRatings') || '{}');
    ratings[serviceId] = rating;
    localStorage.setItem('powerpuffRatings', JSON.stringify(ratings));
}

function loadRating(serviceId) {
    const ratings = JSON.parse(localStorage.getItem('powerpuffRatings') || '{}');
    return ratings[serviceId] || 0;
}

function initFormReset() {
    console.log("Initializing form reset...");
    
    document.querySelectorAll('.reset-form').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Reset button clicked!");
            
            const form = this.closest('form');
            if (form) {
                form.reset();
                
                form.querySelectorAll('.is-invalid, .is-valid').forEach(input => {
                    input.classList.remove('is-invalid', 'is-valid');
                });
                
                if (typeof currentFormStep !== 'undefined') {
                    currentFormStep = 1;
                    showFormStep(currentFormStep);
                    updateProgressBar();
                    updateStepIndicators();
                }
                
                SoundManager.play('click');
                showNotification('🔄 Form has been reset!', 'info');
            }
        });
    });
}

function initMultiStepForm() {
    console.log("Initializing multi-step form...");
    
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const bookingForm = document.getElementById('bookingForm');

    if (formSteps.length === 0) return;

    showFormStep(currentFormStep);
    updateStepIndicators();
    initMinDate();

    nextButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Next button clicked, current step:", currentFormStep);
            
            if (validateCurrentStep(currentFormStep)) {
                if (currentFormStep === 2) updateBookingSummary();
                currentFormStep++;
                showFormStep(currentFormStep);
                updateProgressBar();
                updateStepIndicators();
                SoundManager.play('click');
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            currentFormStep--;
            showFormStep(currentFormStep);
            updateProgressBar();
            updateStepIndicators();
            SoundManager.play('click');
        });
    });

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log("Form submitted!");
            
            if (validateCurrentStep(currentFormStep)) {
                SoundManager.play('success');
                showNotification('🎉 Booking submitted successfully! We will contact you soon.', 'success');
                bookingForm.reset();
                currentFormStep = 1;
                showFormStep(currentFormStep);
                updateProgressBar();
                updateStepIndicators();
            }
        });
    }
}

function showFormStep(stepNumber) {
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    const currentStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
}

function updateStepIndicators() {
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        const step = parseInt(indicator.dataset.step);
        indicator.classList.remove('active', 'completed');
        
        if (step < currentFormStep) {
            indicator.classList.add('completed');
        } else if (step === currentFormStep) {
            indicator.classList.add('active');
        }
    });
}

function validateCurrentStep(step) {
    const currentStep = document.querySelector(`.form-step[data-step="${step}"]`);
    const inputs = currentStep.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
        
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('is-invalid');
                isValid = false;
                return;
            }
        }
        
        if (input.type === 'tel' && input.value) {
            const phoneDigits = input.value.replace(/\D/g, '');
            if (phoneDigits.length !== 10) {
                input.classList.add('is-invalid');
                isValid = false;
                return;
            }
        }
        
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.add('is-valid');
        }
    });

    if (!isValid) {
        SoundManager.play('error');
        showNotification('❌ Please fill all required fields correctly', 'error');
        
        const firstError = currentStep.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }
    
    return isValid;
}

function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const totalSteps = document.querySelectorAll('.form-step').length;
        const progress = ((currentFormStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

function updateBookingSummary() {
    const summaryContent = document.getElementById('summaryContent');
    if (summaryContent) {
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : 'Not provided';
        };
        
        summaryContent.innerHTML = `
            <div class="row border-bottom pb-2 mb-2">
                <div class="col-6"><strong>Name:</strong></div>
                <div class="col-6">${getValue('bookingName')}</div>
            </div>
            <div class="row border-bottom pb-2 mb-2">
                <div class="col-6"><strong>Phone:</strong></div>
                <div class="col-6">${getValue('bookingPhone')}</div>
            </div>
            <div class="row border-bottom pb-2 mb-2">
                <div class="col-6"><strong>Service:</strong></div>
                <div class="col-6">${getValue('bookingService')}</div>
            </div>
            <div class="row">
                <div class="col-6"><strong>Date:</strong></div>
                <div class="col-6">${getValue('bookingDate')}</div>
            </div>
        `;
    }
}

function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon');
            
            document.querySelectorAll('.accordion-content').forEach(item => {
                if (item !== content) {
                    item.style.maxHeight = null;
                    item.classList.remove('show');
                }
            });
            
            document.querySelectorAll('.accordion-icon').forEach(item => {
                if (item !== icon) item.textContent = '+';
            });
            
            document.querySelectorAll('.accordion-header').forEach(item => {
                if (item !== this) item.classList.remove('active');
            });
            
            this.classList.toggle('active');
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                content.classList.remove('show');
                icon.textContent = '+';
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                content.classList.add('show');
                icon.textContent = '−';
            }
            
            SoundManager.play('click');
        });
    });
}

function initPopupForm() {
    const showPopupBtns = document.querySelectorAll('#subscribeBtn, .btn-outline-light');
    const popupForm = document.getElementById('popupForm');
    const closeBtn = document.getElementById('closePopup');
    const popupOverlay = document.getElementById('popupOverlay');

    function showPopup() {
        if (popupForm) {
            popupForm.style.display = 'block';
            setTimeout(() => {
                popupForm.classList.add('show');
            }, 10);
        }
        if (popupOverlay) {
            popupOverlay.style.display = 'block';
            setTimeout(() => {
                popupOverlay.classList.add('show');
            }, 10);
        }
        SoundManager.play('click');
        document.body.style.overflow = 'hidden';
    }

    function closePopup() {
        if (popupForm) {
            popupForm.classList.remove('show');
            setTimeout(() => {
                popupForm.style.display = 'none';
            }, 300);
        }
        if (popupOverlay) {
            popupOverlay.classList.remove('show');
            setTimeout(() => {
                popupOverlay.style.display = 'none';
            }, 300);
        }
        document.body.style.overflow = 'auto';
    }

    window.showPopupForm = showPopup;
    window.closePopup = closePopup;

    showPopupBtns.forEach(btn => {
        btn.addEventListener('click', showPopup);
    });

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (popupOverlay) popupOverlay.addEventListener('click', closePopup);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popupForm && popupForm.classList.contains('show')) {
            closePopup();
        }
    });
}

function initImageGallery() {
    document.querySelectorAll('.image-gallery').forEach(gallery => {
        const mainImage = gallery.querySelector('.main-image');
        const thumbnails = gallery.querySelectorAll('.thumbnail');
        
        if (mainImage && thumbnails.length > 0) {
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', function() {
                    mainImage.src = this.src;
                    mainImage.alt = this.alt;
                    mainImage.style.transform = 'scale(0.95)';
                    setTimeout(() => mainImage.style.transform = 'scale(1)', 150);
                    
                    thumbnails.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    SoundManager.play('click');
                });
            });
        }
    });
}

function initDesignShowcase() {
    document.querySelectorAll('.showcase-thumb').forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            document.querySelectorAll('.showcase-item').forEach(item => {
                item.style.opacity = '0';
            });
            const items = document.querySelectorAll('.showcase-item');
            if (items[index]) items[index].style.opacity = '1';
            SoundManager.play('click');
        });
    });
}

function addHoverAnimations() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initFAQ() {
    const faqContainer = document.getElementById('faqAccordion');
    if (!faqContainer) return;

    const faqItems = [
        { 
            question: "What are your working hours?", 
            answer: "We are open Monday-Friday: 9:00 AM - 8:00 PM, Saturday: 10:00 AM - 6:00 PM, and Sunday: 11:00 AM - 5:00 PM." 
        },
        { 
            question: "Do I need to make an appointment?", 
            answer: "While walk-ins are welcome, we highly recommend making an appointment to ensure availability and minimize waiting time." 
        },
        { 
            question: "What safety measures do you have?", 
            answer: "We follow strict hygiene protocols, including sterilizing all tools after each use and maintaining a clean environment." 
        },
        { 
            question: "How long does a manicure last?", 
            answer: "A regular manicure typically lasts 1-2 weeks, while gel manicures can last 2-3 weeks with proper care." 
        },
        { 
            question: "Do you use quality products?", 
            answer: "Yes! We use only premium, professional-grade products from trusted brands." 
        },
        { 
            question: "Can I bring my own design?", 
            answer: "Absolutely! We love when clients bring their own ideas and we can help create custom designs." 
        }
    ];

    faqContainer.innerHTML = faqItems.map((item, index) => `
        <div class="accordion-item">
            <div class="accordion-header" id="faqHeading${index}">
                <h5 class="mb-0">${item.question}<span class="accordion-icon">+</span></h5>
            </div>
            <div class="accordion-content" id="faqContent${index}">
                <p>${item.answer}</p>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon');
            
            document.querySelectorAll('.accordion-content').forEach(item => {
                if (item !== content) {
                    item.style.maxHeight = null;
                    item.classList.remove('show');
                }
            });
            
            document.querySelectorAll('.accordion-icon').forEach(item => {
                if (item !== icon) item.textContent = '+';
            });
            
            document.querySelectorAll('.accordion-header').forEach(item => {
                if (item !== this) item.classList.remove('active');
            });
            
            this.classList.toggle('active');
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                content.classList.remove('show');
                icon.textContent = '+';
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                content.classList.add('show');
                icon.textContent = '−';
            }
            
            SoundManager.play('click');
        });
    });
}

function initAboutPage() {
    initDesignShowcase();
    initFAQ();
    initMinDate();
}

function initMinDate() {
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    
    const datetimeElement = document.getElementById('currentDateTime');
    if (datetimeElement) datetimeElement.textContent = formattedDateTime;
}

function initScrollProgress() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress-container';
    progressContainer.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.prepend(progressContainer);
    
    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    });
}

function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.documentElement.classList.add('keyboard-navigation');
        }
        
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.popup-form.show');
            if (openModal) {
                closePopup();
            }
        }
        
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement.classList.contains('sidebar-link') || 
                activeElement.classList.contains('nav-link')) {
                activeElement.click();
            }
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.documentElement.classList.remove('keyboard-navigation');
    });
}

PP.mountAuthArea = function() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (!authButtons || !userInfo) {
        console.warn('Auth area elements not found');
        return;
    }
    
    const user = PP.auth.current;
    
    if (user && user.email) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        if (userName) {
            userName.textContent = user.name || user.email;
        }
    } else {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
    }
};

PP.openAuthModal = function(type = 'login') {
    const modal = document.getElementById('ppAuthModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            modal.classList.add('show');
            if (type === 'login') {
                document.getElementById('ppAuthTabLogin').click();
            } else {
                document.getElementById('ppAuthTabRegister').click();
            }
        }, 10);
    }
};

PP.closeAuthModal = function() {
    const modal = document.getElementById('ppAuthModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
};

PP.initAuthModal = function() {
    const modal = document.getElementById('ppAuthModal');
    if (!modal) {
        console.warn('Auth modal not found');
        return;
    }
    
    modal.querySelectorAll('[data-close-auth]').forEach(btn => {
        btn.addEventListener('click', () => PP.closeAuthModal());
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            PP.closeAuthModal();
        }
    });
    
    const tabLogin = document.getElementById('ppAuthTabLogin');
    const tabReg = document.getElementById('ppAuthTabRegister');
    const paneLogin = document.getElementById('ppLoginPane');
    const paneReg = document.getElementById('ppRegisterPane');
    
    function showTab(id) {
        [tabLogin, tabReg].forEach(n => n && n.classList.remove('active'));
        [paneLogin, paneReg].forEach(n => n && (n.style.display = 'none'));
        
        if (id === 'login') {
            tabLogin && tabLogin.classList.add('active');
            paneLogin && (paneLogin.style.display = 'block');
        } else {
            tabReg && tabReg.classList.add('active');
            paneReg && (paneReg.style.display = 'block');
        }
    }
    
    tabLogin && tabLogin.addEventListener('click', () => showTab('login'));
    tabReg && tabReg.addEventListener('click', () => showTab('register'));
    
    const loginForm = document.getElementById('ppLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('[name="email"]').value.trim();
            const password = loginForm.querySelector('[name="password"]').value;
            
            try {
                PP.auth.login({email, password});
                showNotification('Welcome back!', 'success');
                PP.closeAuthModal();
                PP.mountAuthArea();
                loginForm.reset();
                
                if (window.location.pathname.includes('profile.html')) {
                    setTimeout(() => PP.loadProfilePage(), 500);
                }
            } catch(err) {
                showNotification(err.message, 'error');
            }
        });
    }
    
    const regForm = document.getElementById('ppRegisterForm');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = regForm.querySelector('[name="name"]').value.trim();
            const phone = regForm.querySelector('[name="phone"]').value.trim();
            const email = regForm.querySelector('[name="email"]').value.trim();
            const password = regForm.querySelector('[name="password"]').value;
            
            if (!name || !email || !password) {
                showNotification('Please fill all required fields', 'error');
                return;
            }
            
            if (password.length < 4) {
                showNotification('Password must be at least 4 characters', 'error');
                return;
            }
            
            try {
                PP.auth.register({name, phone, email, password});
                showNotification('Account created successfully!', 'success');
                PP.closeAuthModal();
                PP.mountAuthArea();
                regForm.reset();
                
                if (window.location.pathname.includes('profile.html')) {
                    setTimeout(() => PP.loadProfilePage(), 500);
                }
            } catch(err) {
                showNotification(err.message, 'error');
            }
        });
    }
    
    showTab('login');
};

PP.logout = function() {
    PP.auth.logout();
    PP.mountAuthArea();
    showNotification('Logged out successfully', 'success');
    
    if (window.location.pathname.includes('profile.html')) {
        setTimeout(() => PP.loadProfilePage(), 500);
    }
};

PP.loadProfilePage = function() {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) {
        console.error('Profile content element not found');
        return;
    }
    
    try {
        if (!PP.auth || !PP.auth.current) {
            this.showLoginPrompt(profileContent);
            return;
        }
        
        const user = PP.auth.current;
        const users = PP.auth.users;
        const userData = users[user.email];
        
        if (!userData) {
            throw new Error('User data not found');
        }
        
        this.renderProfileContent(profileContent, user, userData);
        
    } catch (error) {
        console.error('Error in loadProfilePage:', error);
        this.showError(profileContent, error.message);
    }
};

PP.showLoginPrompt = function(profileContent) {
    profileContent.innerHTML = `
        <div class="alert alert-info text-center">
            <h4><i class="fas fa-user-lock me-2"></i>Login Required</h4>
            <p class="mb-3">Please log in to view your profile.</p>
            <div class="d-flex gap-2 justify-content-center flex-wrap">
                <button class="btn btn-primary" onclick="PP.openAuthModal('login')">
                    <i class="fas fa-sign-in-alt me-2"></i>Login
                </button>
                <button class="btn btn-outline-primary" onclick="PP.openAuthModal('register')">
                    <i class="fas fa-user-plus me-2"></i>Sign Up
                </button>
            </div>
        </div>
    `;
};

PP.showError = function(profileContent, message) {
    profileContent.innerHTML = `
        <div class="alert alert-danger text-center">
            <h4><i class="fas fa-exclamation-triangle me-2"></i>Error</h4>
            <p class="mb-3">${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">
                <i class="fas fa-redo me-2"></i>Reload Page
            </button>
        </div>
    `;
};

PP.renderProfileBookings = function(bookings) {
    if (!bookings || bookings.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No bookings yet</h5>
                <p class="text-muted">Book your first appointment to see it here!</p>
                <a href="contact.html" class="btn btn-primary mt-2">
                    <i class="fas fa-calendar-plus me-2"></i>Book Now
                </a>
            </div>
        `;
    }
    
    return `
        <div class="booking-list">
            ${bookings.map((booking, index) => `
                <div class="booking-item card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1 text-primary">${booking.service || 'Service'}</h6>
                                <p class="mb-1 text-muted">
                                    <i class="fas fa-calendar me-1"></i>${booking.date}
                                    <i class="fas fa-clock ms-2 me-1"></i>${booking.time}
                                </p>
                                ${booking.name ? `<small class="text-muted"><i class="fas fa-user me-1"></i>${booking.name}</small>` : ''}
                            </div>
                            <button class="btn btn-sm btn-outline-danger ms-2" onclick="PP.deleteBooking(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

PP.renderProfileContent = function(profileContent, user, userData) {
    profileContent.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-6" id="personal-info">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-header bg-gradient-primary text-white py-4">
                        <h4 class="h3 mb-0"><i class="fas fa-user-circle me-2"></i>Personal Information</h4>
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <strong>Name:</strong> ${this.escapeHtml(user.name || 'Not specified')}
                        </div>
                        <div class="mb-3">
                            <strong>Email:</strong> ${this.escapeHtml(user.email)}
                        </div>
                        <div class="mb-3">
                            <strong>Phone:</strong> ${this.escapeHtml(user.phone || 'Not specified')}
                        </div>
                        <div class="mb-3">
                            <strong>Member since:</strong> ${userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Recently'}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-6" id="bookings">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-header bg-gradient-success text-white py-4">
                        <h4 class="h3 mb-0"><i class="fas fa-calendar-check me-2"></i>My Bookings</h4>
                    </div>
                    <div class="card-body p-4">
                        ${this.renderProfileBookings(userData.bookings)}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-4">
                <div class="card text-center border-0 bg-light">
                    <div class="card-body">
                        <i class="fas fa-calendar-alt fa-2x text-primary mb-3"></i>
                        <h3 class="text-primary">${userData.bookings ? userData.bookings.length : 0}</h3>
                        <p class="text-muted mb-0">Total Bookings</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-center border-0 bg-light">
                    <div class="card-body">
                        <i class="fas fa-star fa-2x text-warning mb-3"></i>
                        <h3 class="text-warning">${userData.bookings ? userData.bookings.length * 5 : 0}</h3>
                        <p class="text-muted mb-0">Loyalty Points</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-center border-0 bg-light">
                    <div class="card-body">
                        <i class="fas fa-gem fa-2x text-info mb-3"></i>
                        <h3 class="text-info">${userData.bookings && userData.bookings.length >= 5 ? 'VIP' : 'Regular'}</h3>
                        <p class="text-muted mb-0">Member Status</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

PP.deleteBooking = function(index) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
        const user = PP.auth.current;
        if (!user) throw new Error('Not logged in');
        
        const users = PP.auth.users;
        const userData = users[user.email];
        
        if (userData && userData.bookings) {
            userData.bookings.splice(index, 1);
            users[user.email] = userData;
            PP.auth.users = users;
            
            PP.loadProfilePage();
            showNotification('Booking deleted successfully', 'success');
        }
    } catch (error) {
        showNotification('Error deleting booking: ' + error.message, 'error');
    }
};

PP.escapeHtml = function(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

function initMainSiteFeatures() {
    console.log("Initializing ALL features...");
    
    initDarkMode();
    initSidebar();
    initSearchFeatures();
    initMobileMenu();
    initEnhancedValidation();
    initImageOptimization();
    initAccessibility();
    initKeyboardNavigation();
    
    initServiceRatings();
    initFormReset();
    initMultiStepForm();
    initAccordion();
    initPopupForm();
    initImageGallery();
    initDesignShowcase();
    addHoverAnimations();
    
    setTimeout(() => {
        try {
            if (typeof PP === 'undefined') {
                window.PP = {};
            }
            if (!PP.auth) {
                PP.auth = {
                    usersKey: 'pp_users_v4',
                    currentKey: 'pp_current_user_v2',
                    get users() { 
                        try {
                            return JSON.parse(localStorage.getItem(this.usersKey)) || {}; 
                        } catch(e) {
                            return {};
                        }
                    },
                    set users(data) {
                        try {
                            localStorage.setItem(this.usersKey, JSON.stringify(data));
                        } catch(e) {
                            console.error('Error saving users:', e);
                        }
                    },
                    get current() {
                        try {
                            return JSON.parse(localStorage.getItem(this.currentKey)) || null;
                        } catch(e) {
                            return null;
                        }
                    },
                    set current(user) {
                        try {
                            if (user) {
                                localStorage.setItem(this.currentKey, JSON.stringify(user));
                            } else {
                                localStorage.removeItem(this.currentKey);
                            }
                        } catch(e) {
                            console.error('Error setting current user:', e);
                        }
                    }
                };
            }
            
            PP.mountAuthArea();
            if (PP.initAuthModal) PP.initAuthModal();
            if (PP.authSystem && PP.authSystem.init) PP.authSystem.init();
            
            console.log('Auth system initialized');
            
        } catch (e) {
            console.error('Auth system init error:', e);
        }
    }, 100);
    
    if (window.location.pathname.includes('pricing.html')) {
        setTimeout(() => {
            fixPricingCards();
            enhancePricingCards();
        }, 100);
    }
    
    if (document.getElementById('faqAccordion')) {
        initFAQ();
    }
    
    initMinDate();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    initScrollProgress();
    
    console.log("All features initialized successfully!");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
    });
} else {
}

class PowerPuffAuth {
    constructor() {
        this.usersKey = 'pp_users_v5';
        this.currentUserKey = 'pp_current_user_v3';
        this.sessionsKey = 'pp_sessions_v2';
        this.init();
    }

    init() {
        if (!this.getUsers()) {
            this.setUsers({});
        }
        
        if (!this.getSessions()) {
            this.setSessions({});
        }
        
        this.autoLogin();
    }

    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.usersKey)) || {};
        } catch (e) {
            console.error('Error reading users:', e);
            return {};
        }
    }

    setUsers(users) {
        try {
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            return true;
        } catch (e) {
            console.error('Error saving users:', e);
            return false;
        }
    }

    getSessions() {
        try {
            return JSON.parse(localStorage.getItem(this.sessionsKey)) || {};
        } catch (e) {
            console.error('Error reading sessions:', e);
            return {};
        }
    }

    setSessions(sessions) {
        try {
            localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
            return true;
        } catch (e) {
            console.error('Error saving sessions:', e);
            return false;
        }
    }

    getCurrentUser() {
        try {
            const sessionId = localStorage.getItem(this.currentUserKey);
            if (!sessionId) return null;

            const sessions = this.getSessions();
            const session = sessions[sessionId];
            
            if (!session || this.isSessionExpired(session)) {
                this.logout();
                return null;
            }

            return session.user;
        } catch (e) {
            console.error('Error reading current user:', e);
            return null;
        }
    }

    setCurrentUser(sessionId) {
        try {
            if (sessionId) {
                localStorage.setItem(this.currentUserKey, sessionId);
            } else {
                localStorage.removeItem(this.currentUserKey);
            }
            return true;
        } catch (e) {
            console.error('Error setting current user:', e);
            return false;
        }
    }

    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
    }

    hashPassword(password) {
        return btoa(unescape(encodeURIComponent(password + '_powerpuff_salt_2025')));
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    validatePassword(password) {
        return password && password.length >= 4;
    }

    validateName(name) {
        return name && name.trim().length >= 2;
    }

    isSessionExpired(session) {
        return Date.now() > session.expiresAt;
    }

    async register(userData) {
        try {
            const { name, email, phone, password } = userData;
            
            if (!this.validateName(name)) {
                throw new Error('Please enter a valid name (at least 2 characters)');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            if (phone && !this.validatePhone(phone)) {
                throw new Error('Please enter a valid 10-digit phone number');
            }

            if (!this.validatePassword(password)) {
                throw new Error('Password must be at least 4 characters long');
            }

            const users = this.getUsers();
            const normalizedEmail = email.toLowerCase().trim();
            const normalizedPhone = phone ? phone.replace(/\D/g, '') : '';

            if (users[normalizedEmail]) {
                throw new Error('An account with this email already exists');
            }

            if (normalizedPhone) {
                for (const existingEmail in users) {
                    if (users[existingEmail].phone === normalizedPhone) {
                        throw new Error('An account with this phone number already exists');
                    }
                }
            }

            const userId = this.generateId();
            const newUser = {
                id: userId,
                name: name.trim(),
                email: normalizedEmail,
                phone: normalizedPhone,
                password: this.hashPassword(password),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLogin: null,
                bookings: [],
                preferences: {
                    newsletter: true,
                    notifications: true
                }
            };

            users[normalizedEmail] = newUser;
            
            if (!this.setUsers(users)) {
                throw new Error('Failed to save user data');
            }

            return await this.login({ email, password });
            
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            const { email, password, rememberMe = false } = credentials;
            
            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            if (!this.validatePassword(password)) {
                throw new Error('Please enter your password');
            }

            const users = this.getUsers();
            const normalizedEmail = email.toLowerCase().trim();
            const user = users[normalizedEmail];

            if (!user) {
                throw new Error('No account found with this email address');
            }

            if (user.password !== this.hashPassword(password)) {
                throw new Error('Incorrect password. Please try again.');
            }

            user.lastLogin = new Date().toISOString();
            user.updatedAt = new Date().toISOString();
            users[normalizedEmail] = user;
            this.setUsers(users);

            const sessionId = this.generateSessionId();
            const session = {
                id: sessionId,
                userId: user.id,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                createdAt: Date.now(),
                expiresAt: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
            };

            const sessions = this.getSessions();
            sessions[sessionId] = session;
            
            if (!this.setSessions(sessions)) {
                throw new Error('Failed to create session');
            }

            if (!this.setCurrentUser(sessionId)) {
                throw new Error('Failed to set current user');
            }

            return {
                user: session.user,
                session: session
            };

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        try {
            const sessionId = localStorage.getItem(this.currentUserKey);
            if (sessionId) {
                const sessions = this.getSessions();
                delete sessions[sessionId];
                this.setSessions(sessions);
            }
            
            this.setCurrentUser(null);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    }

    autoLogin() {
        try {
            const currentUser = this.getCurrentUser();
            if (currentUser) {
                console.log('Auto-login successful for:', currentUser.email);
                return currentUser;
            }
            return null;
        } catch (error) {
            console.error('Auto-login error:', error);
            return null;
        }
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    updateProfile(userId, updates) {
        try {
            const users = this.getUsers();
            let userFound = false;

            for (const email in users) {
                if (users[email].id === userId) {
                    users[email] = { ...users[email], ...updates, updatedAt: new Date().toISOString() };
                    userFound = true;
                    break;
                }
            }

            if (!userFound) {
                throw new Error('User not found');
            }

            if (!this.setUsers(users)) {
                throw new Error('Failed to update profile');
            }

            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                const sessionId = localStorage.getItem(this.currentUserKey);
                const sessions = this.getSessions();
                if (sessions[sessionId]) {
                    sessions[sessionId].user = { ...sessions[sessionId].user, ...updates };
                    this.setSessions(sessions);
                }
            }

            return true;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }

    addBooking(userId, bookingData) {
        try {
            const users = this.getUsers();
            let userFound = false;

            for (const email in users) {
                if (users[email].id === userId) {
                    const booking = {
                        id: 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        ...bookingData,
                        createdAt: new Date().toISOString(),
                        status: 'confirmed'
                    };
                    
                    users[email].bookings.push(booking);
                    users[email].updatedAt = new Date().toISOString();
                    userFound = true;
                    break;
                }
            }

            if (!userFound) {
                throw new Error('User not found');
            }

            if (!this.setUsers(users)) {
                throw new Error('Failed to save booking');
            }

            return true;
        } catch (error) {
            console.error('Add booking error:', error);
            throw error;
        }
    }

    getBookings(userId) {
        try {
            const users = this.getUsers();
            
            for (const email in users) {
                if (users[email].id === userId) {
                    return users[email].bookings || [];
                }
            }
            
            return [];
        } catch (error) {
            console.error('Get bookings error:', error);
            return [];
        }
    }

    deleteBooking(userId, bookingId) {
        try {
            const users = this.getUsers();
            let userFound = false;

            for (const email in users) {
                if (users[email].id === userId) {
                    users[email].bookings = users[email].bookings.filter(booking => booking.id !== bookingId);
                    users[email].updatedAt = new Date().toISOString();
                    userFound = true;
                    break;
                }
            }

            if (!userFound) {
                throw new Error('User not found');
            }

            if (!this.setUsers(users)) {
                throw new Error('Failed to delete booking');
            }

            return true;
        } catch (error) {
            console.error('Delete booking error:', error);
            throw error;
        }
    }

    async requestPasswordReset(email) {
        try {
            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            const users = this.getUsers();
            const normalizedEmail = email.toLowerCase().trim();
            
            if (!users[normalizedEmail]) {
                return { success: true, message: 'If an account exists with this email, you will receive reset instructions.' };
            }

            console.log('Password reset requested for:', normalizedEmail);
            
            return { 
                success: true, 
                message: 'Password reset instructions have been sent to your email.' 
            };
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }
}

window.PowerPuffAuth = new PowerPuffAuth();

class AuthUI {
    constructor() {
        this.auth = window.PowerPuffAuth;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateAuthUI();
        this.setupFormValidation();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-auth-toggle]')) {
                this.toggleAuthModal();
            }
            
            if (e.target.matches('[data-close-auth]')) {
                this.closeAuthModal();
            }
            
            if (e.target.matches('[data-auth-tab]')) {
                this.switchAuthTab(e.target.dataset.tab);
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.matches('#registerForm')) {
                e.preventDefault();
                this.handleRegister(e.target);
            }
            
            if (e.target.matches('#loginForm')) {
                e.preventDefault();
                this.handleLogin(e.target);
            }
            
            if (e.target.matches('#forgotPasswordForm')) {
                e.preventDefault();
                this.handleForgotPassword(e.target);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-logout]')) {
                this.handleLogout();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('#authModal')) {
                this.closeAuthModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isAuthModalOpen()) {
                this.closeAuthModal();
            }
        });
    }

    setupFormValidation() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('[data-validate]')) {
                this.validateField(e.target);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.matches('#registerPassword')) {
                this.updatePasswordStrength(e.target.value);
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        
        field.classList.remove('is-valid', 'is-invalid');
        
        let isValid = true;
        let message = '';

        switch (fieldName) {
            case 'registerName':
                isValid = this.auth.validateName(value);
                message = isValid ? '' : 'Name must be at least 2 characters';
                break;
                
            case 'registerEmail':
            case 'loginEmail':
                isValid = this.auth.validateEmail(value);
                message = isValid ? '' : 'Please enter a valid email address';
                break;
                
            case 'registerPhone':
                isValid = !value || this.auth.validatePhone(value);
                message = isValid ? '' : 'Please enter a valid 10-digit phone number';
                break;
                
            case 'registerPassword':
                isValid = this.auth.validatePassword(value);
                message = isValid ? '' : 'Password must be at least 4 characters';
                break;
                
            case 'loginPassword':
                isValid = value.length > 0;
                message = isValid ? '' : 'Please enter your password';
                break;
        }

        if (value && !isValid) {
            field.classList.add('is-invalid');
            this.showFieldError(field, message);
        } else if (value && isValid) {
            field.classList.add('is-valid');
            this.clearFieldError(field);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = message;
        errorDiv.id = `${field.id}Error`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        const existingError = document.getElementById(`${field.id}Error`);
        if (existingError) {
            existingError.remove();
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrength');
        const strengthText = document.getElementById('passwordStrengthText');
        
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let text = 'Very Weak';
        let color = '#dc3545';

        if (password.length >= 4) strength = 25;
        if (password.length >= 6) strength = 50;
        if (password.length >= 8 && /[A-Z]/.test(password)) strength = 75;
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) strength = 100;

        switch (strength) {
            case 25: text = 'Weak'; color = '#fd7e14'; break;
            case 50: text = 'Fair'; color = '#ffc107'; break;
            case 75: text = 'Good'; color = '#20c997'; break;
            case 100: text = 'Strong'; color = '#198754'; break;
        }

        strengthBar.style.width = strength + '%';
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    async handleRegister(form) {
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password')
        };

        let allValid = true;
        ['registerName', 'registerEmail', 'registerPassword'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !this.validateField(field)) {
                allValid = false;
            }
        });

        if (!allValid) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        this.setButtonLoading(submitBtn, true);

        try {
            const result = await this.auth.register(userData);
            this.showNotification('🎉 Account created successfully! Welcome to PowerPuff!', 'success');
            this.closeAuthModal();
            this.updateAuthUI();
            form.reset();
            
            setTimeout(() => {
                this.showNotification(`Welcome back, ${result.user.name}!`, 'success');
            }, 1000);
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false, originalText);
        }
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        let allValid = true;
        ['loginEmail', 'loginPassword'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !this.validateField(field)) {
                allValid = false;
            }
        });

        if (!allValid) {
            this.showNotification('Please check your email and password', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        this.setButtonLoading(submitBtn, true);

        try {
            const result = await this.auth.login(credentials);
            this.showNotification(`Welcome back, ${result.user.name}! 👋`, 'success');
            this.closeAuthModal();
            this.updateAuthUI();
            form.reset();
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false, originalText);
        }
    }

    async handleForgotPassword(form) {
        const formData = new FormData(form);
        const email = formData.get('resetEmail');

        if (!this.auth.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        this.setButtonLoading(submitBtn, true);

        try {
            const result = await this.auth.requestPasswordReset(email);
            this.showNotification(result.message, 'success');
            form.reset();
            this.switchAuthTab('login');
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false, originalText);
        }
    }

    async handleLogout() {
        try {
            const currentUser = this.auth.getCurrentUser();
            this.auth.logout();
            this.showNotification('You have been logged out successfully', 'info');
            this.updateAuthUI();
            
            if (window.location.pathname.includes('profile.html')) {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    setButtonLoading(button, loading, originalText = '') {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
            button.classList.add('btn-loading');
        } else {
            button.disabled = false;
            button.innerHTML = originalText;
            button.classList.remove('btn-loading');
        }
    }

    toggleAuthModal() {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        if (modal.classList.contains('show')) {
            this.closeAuthModal();
        } else {
            this.openAuthModal();
        }
    }

    openAuthModal(tab = 'login') {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.switchAuthTab(tab);
        
        setTimeout(() => {
            const firstField = modal.querySelector('input:not([type="hidden"])');
            if (firstField) firstField.focus();
        }, 300);
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();
            form.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
                field.classList.remove('is-valid', 'is-invalid');
            });
        });
        
        modal.querySelectorAll('.invalid-feedback').forEach(error => error.remove());
    }

    isAuthModalOpen() {
        const modal = document.getElementById('authModal');
        return modal && modal.classList.contains('show');
    }

    switchAuthTab(tabName) {
        document.querySelectorAll('[data-auth-tab]').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        document.querySelectorAll('.auth-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}Pane`);
        });

        document.querySelectorAll('.auth-pane form').forEach(form => {
            if (form.parentElement.id !== `${tabName}Pane`) {
                form.reset();
                form.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
                    field.classList.remove('is-valid', 'is-invalid');
                });
            }
        });

        document.querySelectorAll('.invalid-feedback').forEach(error => error.remove());
    }

    updateAuthUI() {
        const currentUser = this.auth.getCurrentUser();
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');

        if (authButtons && userInfo && userName) {
            if (currentUser) {
                authButtons.style.display = 'none';
                userInfo.style.display = 'flex';
                userName.textContent = currentUser.name;
            } else {
                authButtons.style.display = 'flex';
                userInfo.style.display = 'none';
            }
        }
        if (window.location.pathname.includes('profile.html') && typeof PP !== 'undefined') {
            setTimeout(() => {
                if (PP.loadProfilePage) {
                    PP.loadProfilePage();
                }
            }, 100);
        }
    }

    showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.AuthUI = new AuthUI();
});

class ProfileManager {
    constructor() {
        this.auth = window.PowerPuffAuth;
        this.init();
    }

    init() {
        this.loadProfileData();
        this.bindProfileEvents();
    }

    async loadProfileData() {
        const currentUser = this.auth.getCurrentUser();
        const profileContent = document.getElementById('profile-content');

        if (!profileContent) return;

        if (!currentUser) {
            this.showLoginPrompt(profileContent);
            return;
        }

        try {
            const userData = this.getUserData(currentUser.id);
            const bookings = this.auth.getBookings(currentUser.id);
            
            this.renderProfile(profileContent, currentUser, userData, bookings);
        } catch (error) {
            console.error('Profile load error:', error);
            this.showError(profileContent, 'Failed to load profile data');
        }
    }

    getUserData(userId) {
        const users = this.auth.getUsers();
        for (const email in users) {
            if (users[email].id === userId) {
                return users[email];
            }
        }
        return null;
    }

    showLoginPrompt(container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="auth-prompt">
                    <i class="fas fa-user-lock fa-4x text-primary mb-4"></i>
                    <h3 class="mb-3">Welcome to Your Profile</h3>
                    <p class="text-muted mb-4">Please log in to view and manage your personal information and appointments.</p>
                    <div class="d-flex gap-3 justify-content-center flex-wrap">
                        <button class="btn btn-primary btn-lg" onclick="AuthUI.openAuthModal('login')">
                            <i class="fas fa-sign-in-alt me-2"></i>Login to Your Account
                        </button>
                        <button class="btn btn-outline-primary btn-lg" onclick="AuthUI.openAuthModal('register')">
                            <i class="fas fa-user-plus me-2"></i>Create New Account
                        </button>
                    </div>
                    <div class="mt-4">
                        <small class="text-muted">New to PowerPuff? Create an account to book appointments and save your preferences.</small>
                    </div>
                </div>
            </div>
        `;
    }

    showError(container, message) {
        container.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
                <div class="mt-2">
                    <button class="btn btn-primary btn-sm" onclick="location.reload()">
                        <i class="fas fa-redo me-1"></i>Try Again
                    </button>
                </div>
            </div>
        `;
    }

    renderProfile(container, user, userData, bookings) {
        const memberSince = userData ? new Date(userData.createdAt).toLocaleDateString() : 'Recently';
        const lastLogin = userData && userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'Never';
        const bookingCount = bookings ? bookings.length : 0;
        const loyaltyPoints = bookingCount * 50; 
        const memberStatus = bookingCount >= 5 ? 'VIP Member' : bookingCount >= 2 ? 'Regular Member' : 'New Member';

        container.innerHTML = `
            <div class="profile-content-loaded">
                <!-- Profile Header -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card border-0 bg-gradient-primary text-white">
                            <div class="card-body p-4">
                                <div class="row align-items-center">
                                    <div class="col-md-8">
                                        <h2 class="h3 mb-2">Welcome back, ${user.name}! 👋</h2>
                                        <p class="mb-0 opacity-75">Here's your personalized dashboard and appointment history.</p>
                                    </div>
                                    <div class="col-md-4 text-md-end">
                                        <div class="member-badge">
                                            <i class="fas fa-crown me-2"></i>${memberStatus}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="row mb-4">
                    <div class="col-md-3 col-6">
                        <div class="card text-center border-0 bg-light h-100">
                            <div class="card-body">
                                <i class="fas fa-calendar-check fa-2x text-primary mb-3"></i>
                                <h3 class="text-primary">${bookingCount}</h3>
                                <p class="text-muted mb-0">Total Bookings</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="card text-center border-0 bg-light h-100">
                            <div class="card-body">
                                <i class="fas fa-star fa-2x text-warning mb-3"></i>
                                <h3 class="text-warning">${loyaltyPoints}</h3>
                                <p class="text-muted mb-0">Loyalty Points</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="card text-center border-0 bg-light h-100">
                            <div class="card-body">
                                <i class="fas fa-gem fa-2x text-info mb-3"></i>
                                <h3 class="text-info">${memberStatus.split(' ')[0]}</h3>
                                <p class="text-muted mb-0">Member Status</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="card text-center border-0 bg-light h-100">
                            <div class="card-body">
                                <i class="fas fa-clock fa-2x text-success mb-3"></i>
                                <h3 class="text-success">${lastLogin}</h3>
                                <p class="text-muted mb-0">Last Visit</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-4">
                    <!-- Personal Information -->
                    <div class="col-lg-6" id="personal-info">
                        <div class="card shadow-sm border-0 h-100">
                            <div class="card-header bg-gradient-primary text-white py-3">
                                <h4 class="h5 mb-0"><i class="fas fa-user-circle me-2"></i>Personal Information</h4>
                            </div>
                            <div class="card-body p-4">
                                <div class="info-item mb-3">
                                    <label class="form-label text-muted mb-1">Full Name</label>
                                    <p class="mb-0 fw-semibold">${user.name}</p>
                                </div>
                                <div class="info-item mb-3">
                                    <label class="form-label text-muted mb-1">Email Address</label>
                                    <p class="mb-0 fw-semibold">${user.email}</p>
                                </div>
                                <div class="info-item mb-3">
                                    <label class="form-label text-muted mb-1">Phone Number</label>
                                    <p class="mb-0 fw-semibold">${user.phone || 'Not provided'}</p>
                                </div>
                                <div class="info-item mb-3">
                                    <label class="form-label text-muted mb-1">Member Since</label>
                                    <p class="mb-0 fw-semibold">${memberSince}</p>
                                </div>
                                <div class="mt-4">
                                    <button class="btn btn-outline-primary w-100" onclick="ProfileManager.editProfile()">
                                        <i class="fas fa-edit me-2"></i>Edit Profile Information
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- My Bookings -->
                    <div class="col-lg-6" id="bookings">
                        <div class="card shadow-sm border-0 h-100">
                            <div class="card-header bg-gradient-success text-white py-3">
                                <h4 class="h5 mb-0"><i class="fas fa-calendar-check me-2"></i>My Bookings</h4>
                            </div>
                            <div class="card-body p-4">
                                ${this.renderBookings(bookings)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Preferences Section -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card shadow-sm border-0">
                            <div class="card-header bg-gradient-warning text-white py-3">
                                <h4 class="h5 mb-0"><i class="fas fa-cog me-2"></i>Preferences & Settings</h4>
                            </div>
                            <div class="card-body p-4">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="newsletterPref" checked>
                                            <label class="form-check-label" for="newsletterPref">
                                                Receive newsletter and promotions
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="notificationsPref" checked>
                                            <label class="form-check-label" for="notificationsPref">
                                                Appointment reminders
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <button class="btn btn-primary" onclick="ProfileManager.savePreferences()">
                                        <i class="fas fa-save me-2"></i>Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderBookings(bookings) {
        if (!bookings || bookings.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No bookings yet</h5>
                    <p class="text-muted mb-3">You haven't made any appointments yet.</p>
                    <a href="contact.html" class="btn btn-primary">
                        <i class="fas fa-calendar-plus me-2"></i>Book Your First Appointment
                    </a>
                </div>
            `;
        }

        return `
            <div class="booking-list">
                ${bookings.map((booking, index) => `
                    <div class="booking-item card mb-3 border-start-4 border-start-success">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <h6 class="mb-1 text-primary">${booking.service || 'Nail Service'}</h6>
                                    <p class="mb-1 text-muted small">
                                        <i class="fas fa-calendar me-1"></i>${booking.date || 'Not specified'}
                                        <i class="fas fa-clock ms-2 me-1"></i>${booking.time || 'Not specified'}
                                    </p>
                                    ${booking.name ? `<p class="mb-1 small"><i class="fas fa-user me-1"></i>${booking.name}</p>` : ''}
                                    ${booking.requests ? `<p class="mb-0 small text-muted"><i class="fas fa-sticky-note me-1"></i>${booking.requests}</p>` : ''}
                                </div>
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#"><i class="fas fa-edit me-2"></i>Reschedule</a></li>
                                        <li><a class="dropdown-item text-danger" href="#" onclick="ProfileManager.cancelBooking('${booking.id}')">
                                            <i class="fas fa-times me-2"></i>Cancel
                                        </a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="mt-2">
                                <span class="badge bg-success">${booking.status || 'Confirmed'}</span>
                                <small class="text-muted ms-2">Booked on ${new Date(booking.createdAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    bindProfileEvents() {
    }

    static editProfile() {
        AuthUI.showNotification('Profile editing feature coming soon!', 'info');
    }

    static savePreferences() {
        AuthUI.showNotification('Preferences saved successfully!', 'success');
    }

    static cancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            const auth = window.PowerPuffAuth;
            const currentUser = auth.getCurrentUser();
            
            if (currentUser) {
                try {
                    auth.deleteBooking(currentUser.id, bookingId);
                    AuthUI.showNotification('Booking cancelled successfully', 'success');
                    
                    setTimeout(() => {
                        window.ProfileManager.loadProfileData();
                    }, 1000);
                } catch (error) {
                    AuthUI.showNotification('Failed to cancel booking', 'error');
                }
            }
        }
    }
}

if (window.location.pathname.includes('profile.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.ProfileManager = new ProfileManager();
    });
}

class BookingManager {
    constructor() {
        this.auth = window.PowerPuffAuth;
    }

    async submitBooking(bookingData) {
        const currentUser = this.auth.getCurrentUser();
        
        if (!currentUser) {
            this.pendingBooking = bookingData;
            AuthUI.openAuthModal('login');
            AuthUI.showNotification('Please log in to complete your booking', 'info');
            return false;
        }

        try {
            this.auth.addBooking(currentUser.id, bookingData);
            
            await this.sendConfirmation(currentUser, bookingData);
            
            AuthUI.showNotification('🎉 Booking confirmed! Check your email for details.', 'success');
            
            this.pendingBooking = null;
            
            return true;
        } catch (error) {
            console.error('Booking error:', error);
            AuthUI.showNotification('Failed to save booking. Please try again.', 'error');
            return false;
        }
    }

    async sendConfirmation(user, booking) {
        console.log('Sending confirmation to:', user.email);
        console.log('Booking details:', booking);
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    handlePostLogin() {
        if (this.pendingBooking) {
            setTimeout(() => {
                this.submitBooking(this.pendingBooking);
            }, 1000);
        }
    }
}

window.BookingManager = new BookingManager();

window.showNotification = function(message, type = 'info', duration = 5000) {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    const notification = document.createElement('div');
    notification.className = `custom-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type]} me-2"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .custom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 0;
                border-radius: 12px;
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                max-width: 400px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .custom-notification.show {
                transform: translateX(0);
            }
            .notification-success {
                background: linear-gradient(135deg, #4facfe, #00f2fe);
            }
            .notification-error {
                background: linear-gradient(135deg, #f093fb, #f5576c);
            }
            .notification-info {
                background: linear-gradient(135deg, #667eea, #764ba2);
            }
            .notification-warning {
                background: linear-gradient(135deg, #f6d365, #fda085);
            }
            .notification-content {
                padding: 15px 20px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 5px;
                margin-left: 10px;
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(styles);
    }

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });

    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    return notification;
};

function updateAuthUI() {
    try {
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        
        if (!authButtons || !userInfo) return;
        
        let currentUser = null;
        if (typeof PP !== 'undefined' && PP.auth) {
            currentUser = PP.auth.current;
        } else {
            const userStr = localStorage.getItem('pp_current_user_v2');
            currentUser = userStr ? JSON.parse(userStr) : null;
        }
        
        if (currentUser && currentUser.email) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            if (userName) {
                userName.textContent = currentUser.name || currentUser.email;
            }
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    } catch (error) {
        console.error('Error updating auth UI:', error);
    }
}

PP.mountAuthArea = updateAuthUI;

class WeatherService {
    constructor() {
        this.apiKey = 'your_api_key_here'; 
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    }

    async getWeather(city = 'Astana') {
        try {
            const mockWeather = {
                temp: 22,
                description: 'sunny',
                icon: '☀️'
            };
            
            this.displayWeather(mockWeather);
            return mockWeather;
            
            const response = await fetch(`${this.baseUrl}?q=${city}&appid=${this.apiKey}&units=metric`);
            const data = await response.json();
            
            const weather = {
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: this.getWeatherIcon(data.weather[0].main)
            };
            
            this.displayWeather(weather);
            return weather;

        } catch (error) {
            console.error('Weather API error:', error);
            this.displayWeather({ temp: 'N/A', description: 'Unable to load', icon: '❓' });
        }
    }

    getWeatherIcon(condition) {
        const icons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Snow': '❄️',
            'Thunderstorm': '⛈️',
            'Drizzle': '🌦️',
            'Mist': '🌫️'
        };
        return icons[condition] || '🌈';
    }

    displayWeather(weather) {
        const weatherElement = document.getElementById('weather-display');
        if (weatherElement) {
            weatherElement.innerHTML = `
                <div class="weather-widget">
                    <div class="weather-icon">${weather.icon}</div>
                    <div class="weather-info">
                        <div class="weather-temp">${weather.temp}°C</div>
                        <div class="weather-desc">${weather.description}</div>
                    </div>
                </div>
            `;
        }
    }

    init() {
        this.getWeather('Astana');
        
        setInterval(() => {
            this.getWeather('Astana');
        }, 30 * 60 * 1000);
    }
}

const weatherService = new WeatherService();

class EnhancedSearchSystem {
    constructor() {
        this.searchHistoryKey = 'powerpuff_search_history';
        this.init();
    }

    init() {
        this.bindSearchEvents();
        this.loadSearchHistory();
    }

    bindSearchEvents() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('#serviceSearch') || e.target.matches('#highlightSearch')) {
                this.handleSearchInput(e.target);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('#serviceSearch')) {
                this.saveToSearchHistory(e.target.value);
            }
        });
    }

    handleSearchInput(input) {
        const searchTerm = input.value.toLowerCase().trim();
        
        if (searchTerm.length > 2) {
            this.filterServices(searchTerm);
            this.saveToSearchHistory(searchTerm);
        } else if (searchTerm.length === 0) {
            this.showAllServices();
        }
    }

    filterServices(searchTerm) {
        let visibleCount = 0;
        
        document.querySelectorAll('.service-card').forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            
            if (cardText.includes(searchTerm) || cardTitle.includes(searchTerm)) {
                card.closest('.col-md-6, .col-lg-4').style.display = 'block';
                this.highlightMatches(card, searchTerm);
                visibleCount++;
            } else {
                card.closest('.col-md-6, .col-lg-4').style.display = 'none';
            }
        });

        this.showSearchResults(visibleCount, searchTerm);
    }

    highlightMatches(element, searchTerm) {
        const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        const nodes = [];
        while (node = walker.nextNode()) {
            if (node.textContent.match(regex)) {
                nodes.push(node);
            }
        }

        nodes.forEach(node => {
            const span = document.createElement('span');
            span.className = 'search-highlight';
            span.innerHTML = node.textContent.replace(regex, '<mark>$1</mark>');
            node.parentNode.replaceChild(span, node);
        });
    }

    showSearchResults(visibleCount, searchTerm) {
        document.querySelectorAll('.search-results-message').forEach(msg => msg.remove());

        if (visibleCount === 0 && searchTerm) {
            const message = document.createElement('div');
            message.className = 'search-results-message alert alert-info mt-3';
            message.innerHTML = `
                <i class="fas fa-info-circle me-2"></i>
                No services found matching "<strong>${searchTerm}</strong>".
                Try different keywords or <a href="#" class="alert-link" onclick="enhancedSearch.showSimilarServices('${searchTerm}')">view similar services</a>.
            `;
            document.querySelector('#manicures').after(message);
        }
    }

    saveToSearchHistory(searchTerm) {
        if (!searchTerm.trim()) return;

        const history = this.getSearchHistory();
        
        const filteredHistory = history.filter(item => item !== searchTerm);
        
        filteredHistory.unshift(searchTerm);
        
        const limitedHistory = filteredHistory.slice(0, 10);
        
        localStorage.setItem(this.searchHistoryKey, JSON.stringify(limitedHistory));
        this.updateSearchHistoryUI();
    }

    getSearchHistory() {
        return JSON.parse(localStorage.getItem(this.searchHistoryKey)) || [];
    }

    updateSearchHistoryUI() {
        const history = this.getSearchHistory();
        const historyContainer = document.querySelector('.search-history');
        
        if (!historyContainer) return;

        if (history.length > 0) {
            historyContainer.innerHTML = `
                <div class="search-history-content">
                    <h6>Recent Searches</h6>
                    ${history.map(term => `
                        <div class="search-history-item" onclick="enhancedSearch.useHistoryTerm('${term}')">
                            <span>${term}</span>
                            <small class="text-muted">${new Date().toLocaleDateString()}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    loadSearchHistory() {
        this.updateSearchHistoryUI();
    }

    useHistoryTerm(term) {
        const searchInput = document.querySelector('#serviceSearch');
        if (searchInput) {
            searchInput.value = term;
            this.handleSearchInput(searchInput);
        }
    }

    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    showAllServices() {
        document.querySelectorAll('.service-card').forEach(card => {
            card.closest('.col-md-6, .col-lg-4').style.display = 'block';
            this.removeHighlights(card);
        });
        document.querySelectorAll('.search-results-message').forEach(msg => msg.remove());
    }

    removeHighlights(element) {
        element.querySelectorAll('.search-highlight').forEach(highlight => {
            highlight.replaceWith(highlight.textContent);
        });
    }
}

const enhancedSearch = new EnhancedSearchSystem();

function initSearchFeatures() {
    console.log("Initializing search features...");
    
    const manicuresSection = document.getElementById('manicures');
    const searchContainer = document.querySelector('.search-container');
    
    if (manicuresSection && !searchContainer) {
        console.log("Adding search container to services page");
        addSearchContainer();
    }
    
    initSearchFunctionality();
}

function addSearchContainer() {
    const searchHTML = `
        <div class="search-container mb-5">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="input-group input-group-lg">
                        <span class="input-group-text bg-gradient-primary text-white">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" class="form-control" 
                               id="serviceSearch" 
                               placeholder="Search for services... (e.g., manicure, pedicure, nail art)"
                               aria-label="Search services">
                        <button class="btn btn-outline-secondary" type="button" id="clearSearch">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="form-text text-center mt-2">
                        <i class="fas fa-info-circle me-1"></i>
                        Type to filter services in real-time. Results are saved for your convenience.
                    </div>
                    
                    <!-- История поиска -->
                    <div class="search-history mt-3" style="display: none;">
                        <div class="search-history-content card">
                            <div class="card-body">
                                <h6 class="card-title">
                                    <i class="fas fa-history me-2"></i>Recent Searches
                                </h6>
                                <div class="search-history-list"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const manicuresSection = document.getElementById('manicures');
    if (manicuresSection) {
        manicuresSection.insertAdjacentHTML('beforebegin', searchHTML);
        console.log("Search container added successfully");
    }
}

function initSearchFunctionality() {
    const searchInput = document.getElementById('serviceSearch');
    const clearButton = document.getElementById('clearSearch');
    
    if (!searchInput) {
        console.log("Search input not found on this page");
        return;
    }
    
    console.log("Initializing mobile-responsive search functionality...");
    
    function enhanceForMobile() {
        if (window.innerWidth < 768) {
            searchInput.setAttribute('autocapitalize', 'none');
            searchInput.setAttribute('autocorrect', 'off');
            searchInput.style.fontSize = '16px';
            
            searchInput.style.minHeight = '44px';
            
            searchInput.placeholder = "Search services...";
        }
    }
    
    function addMobileQuickSearch() {
        if (window.innerWidth >= 768) return;
        
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer || document.querySelector('.mobile-quick-search')) return;
        
        const quickSearchHTML = `
            <div class="mobile-quick-search mt-3">
                <div class="quick-search-tags">
                    <span class="quick-tag" data-search="manicure">Manicure</span>
                    <span class="quick-tag" data-search="pedicure">Pedicure</span>
                    <span class="quick-tag" data-search="design">Design</span>
                    <span class="quick-tag" data-search="gel">Gel</span>
                </div>
            </div>
        `;
        
        searchContainer.insertAdjacentHTML('beforeend', quickSearchHTML);
        
        document.querySelectorAll('.quick-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const searchTerm = this.getAttribute('data-search');
                searchInput.value = searchTerm;
                performSearch(searchTerm);
                
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            });
        });
    }
    
    function performSearch(searchTerm) {
        let visibleCount = 0;
        
        document.querySelectorAll('.service-card').forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            
            if (searchTerm === '' || cardText.includes(searchTerm.toLowerCase()) || cardTitle.includes(searchTerm.toLowerCase())) {
                card.closest('.col-md-6, .col-lg-4').style.display = 'block';
                highlightMatches(card, searchTerm);
                visibleCount++;
            } else {
                card.closest('.col-md-6, .col-lg-4').style.display = 'none';
                removeHighlights(card);
            }
        });

        showSearchResults(visibleCount, searchTerm);
        
        if (window.innerWidth < 768 && searchTerm) {
            setTimeout(() => {
                const firstVisible = document.querySelector('.service-card:not([style*="display: none"])');
                if (firstVisible) {
                    firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }
    
    function highlightMatches(element, searchTerm) {
        removeHighlights(element);
        
        if (!searchTerm) return;
        
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const nodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                nodes.push(node);
            }
        }
        
        nodes.forEach(node => {
            const span = document.createElement('span');
            span.className = 'search-highlight';
            span.innerHTML = node.textContent.replace(
                new RegExp(`(${escapeRegex(searchTerm)})`, 'gi'),
                '<mark class="search-match">$1</mark>'
            );
            node.parentNode.replaceChild(span, node);
        });
    }
    
    function removeHighlights(element) {
        element.querySelectorAll('.search-highlight').forEach(highlight => {
            highlight.replaceWith(highlight.textContent);
        });
    }
    
    function showSearchResults(visibleCount, searchTerm) {
        document.querySelectorAll('.search-results-message').forEach(msg => msg.remove());
        
        if (visibleCount === 0 && searchTerm) {
            const message = document.createElement('div');
            message.className = 'search-results-message alert alert-info mt-4';
            message.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-search me-3 fa-lg"></i>
                    <div>
                        <h6 class="alert-heading mb-1">No services found</h6>
                        <p class="mb-0">No services match "<strong>${searchTerm}</strong>". Try different keywords.</p>
                    </div>
                </div>
            `;
            
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer) {
                searchContainer.after(message);
            }
        }
    }
    
    function escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        performSearch(searchTerm);
        
        if (clearButton) {
            clearButton.style.display = searchTerm.length > 0 ? 'block' : 'none';
        }
        
        if (window.innerWidth < 768 && searchTerm === '' && document.activeElement === searchInput) {
            searchInput.blur();
        }
    });
    
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            performSearch('');
            searchInput.focus();
            
            if (window.innerWidth < 768 && navigator.vibrate) {
                navigator.vibrate(30);
            }
        });
        
        if (window.innerWidth < 768) {
            clearButton.style.display = 'none';
        }
    }
    
    searchInput.addEventListener('focus', function() {
        if (window.innerWidth < 768) {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    });
    
    enhanceForMobile();
    addMobileQuickSearch();
    
    window.addEventListener('resize', function() {
        enhanceForMobile();
        addMobileQuickSearch();
    });
    
    console.log("Mobile-responsive search functionality initialized");
}

function showAutocompleteSuggestions(searchTerm) {
    const autocompleteContainer = document.querySelector('.autocomplete-suggestions');
    if (!autocompleteContainer) return;
    
    autocompleteContainer.innerHTML = '';
    
    if (searchTerm.length < 2) {
        autocompleteContainer.style.display = 'none';
        return;
    }
    
    const suggestions = serviceSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (suggestions.length === 0) {
        autocompleteContainer.style.display = 'none';
        return;
    }
    
    const limitedSuggestions = suggestions.slice(0, 5);
    
    autocompleteContainer.innerHTML = limitedSuggestions.map(suggestion => `
        <div class="autocomplete-suggestion" data-suggestion="${suggestion}">
            <i class="fas fa-search me-2 text-muted"></i>
            ${highlightSuggestion(suggestion, searchTerm)}
        </div>
    `).join('');
    
    autocompleteContainer.style.display = 'block';
    
    autocompleteContainer.querySelectorAll('.autocomplete-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            const selectedSuggestion = this.dataset.suggestion;
            document.getElementById('serviceSearch').value = selectedSuggestion;
            performSearch(selectedSuggestion);
            saveToSearchHistory(selectedSuggestion);
            autocompleteContainer.style.display = 'none';
        });
    });
}

function highlightSuggestion(suggestion, searchTerm) {
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return suggestion.replace(regex, '<mark class="suggestion-highlight">$1</mark>');
}

function navigateAutocomplete(direction) {
    const suggestions = document.querySelectorAll('.autocomplete-suggestion');
    if (suggestions.length === 0) return;
    
    const currentActive = document.querySelector('.autocomplete-suggestion.active');
    let nextIndex = 0;
    
    if (currentActive) {
        const currentIndex = Array.from(suggestions).indexOf(currentActive);
        if (direction === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % suggestions.length;
        } else {
            nextIndex = (currentIndex - 1 + suggestions.length) % suggestions.length;
        }
        currentActive.classList.remove('active');
    }
    
    suggestions[nextIndex].classList.add('active');
    
    const selectedSuggestion = suggestions[nextIndex].dataset.suggestion;
    document.getElementById('serviceSearch').value = selectedSuggestion;
}

function saveToSearchHistory(searchTerm) {
    if (!searchTerm.trim()) return;
    
    const history = getSearchHistory();
    
    const existingItem = history.find(item => item.term.toLowerCase() === searchTerm.toLowerCase());
    if (existingItem) {
        existingItem.count++;
        existingItem.timestamp = new Date().toISOString();
        history.splice(history.indexOf(existingItem), 1);
        history.unshift(existingItem);
    } else {
        history.unshift({
            term: searchTerm,
            timestamp: new Date().toISOString(),
            count: 1
        });
    }
    
    const limitedHistory = history.slice(0, 10);
    localStorage.setItem('powerpuff_search_history', JSON.stringify(limitedHistory));
    
    updateSearchHistoryDisplay();
}

function updateSearchHistoryDisplay() {
    const history = getSearchHistory();
    const historyList = document.querySelector('.search-history-list');
    const historyContainer = document.querySelector('.search-history');
    
    if (!historyList || !historyContainer) return;
    
    if (history.length > 0) {
        historyList.innerHTML = history.map(item => `
            <div class="search-history-item d-flex justify-content-between align-items-center p-2 border-bottom">
                <div class="d-flex align-items-center">
                    <i class="fas fa-clock me-2 text-muted"></i>
                    <span class="search-term" onclick="useSearchTerm('${item.term.replace(/'/g, "\\'")}')">
                        ${item.term}
                    </span>
                    <span class="badge bg-primary ms-2">${item.count}</span>
                </div>
                <small class="text-muted">${formatHistoryDate(item.timestamp)}</small>
            </div>
        `).join('');
        
        if (!document.querySelector('.clear-history-btn')) {
            const clearButton = document.createElement('button');
            clearButton.className = 'clear-history-btn btn btn-sm btn-outline-danger w-100 mt-2';
            clearButton.innerHTML = '<i class="fas fa-trash me-1"></i>Clear Search History';
            clearButton.onclick = clearSearchHistory;
            historyList.parentNode.appendChild(clearButton);
        }
        
        historyContainer.style.display = 'block';
    } else {
        historyContainer.style.display = 'none';
    }
}

function formatHistoryDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
}

function clearSearchHistory() {
    if (confirm('Are you sure you want to clear your search history?')) {
        localStorage.removeItem('powerpuff_search_history');
        updateSearchHistoryDisplay();
        
        const searchInput = document.getElementById('serviceSearch');
        if (searchInput) {
            searchInput.placeholder = 'Search history cleared';
            setTimeout(() => {
                searchInput.placeholder = 'Search for services... (e.g., manicure, pedicure, nail art)';
            }, 2000);
        }
    }
}

function useSearchTerm(term) {
    const searchInput = document.getElementById('serviceSearch');
    if (searchInput) {
        searchInput.value = term;
        performSearch(term);
        saveToSearchHistory(term);
        
        const historyContainer = document.querySelector('.search-history');
        if (historyContainer) {
            historyContainer.style.display = 'none';
        }
        
        const clearButton = document.getElementById('clearSearch');
        if (clearButton) {
            clearButton.style.display = 'block';
        }
    }
}

function addSearchContainer() {
    const searchHTML = `
        <div class="search-container mb-5">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="search-header mb-3">
                        <h3 class="text-center">
                            <i class="fas fa-search me-2 text-gradient"></i>
                            Find Your Perfect Service
                        </h3>
                        <p class="text-center text-muted">
                            Discover our wide range of nail services and treatments
                        </p>
                    </div>
                    
                    <div class="input-group input-group-lg search-input-group">
                        <span class="input-group-text bg-gradient-primary text-white">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" class="form-control" 
                               id="serviceSearch" 
                               placeholder="Search for services... (e.g., manicure, pedicure, nail art)"
                               aria-label="Search services"
                               autocomplete="off">
                        <button class="btn btn-outline-secondary" type="button" id="clearSearch" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="search-meta mt-2">
                        <div class="form-text text-center">
                            <i class="fas fa-lightbulb me-1"></i>
                            Start typing to see suggestions and filter services in real-time
                        </div>
                        <div class="search-counter text-center mt-1" id="searchCounter"></div>
                    </div>
                    
                    <div class="search-history mt-3" style="display: none;">
                        <div class="search-history-content card">
                            <div class="card-body">
                                <h6 class="card-title d-flex align-items-center">
                                    <i class="fas fa-history me-2 text-primary"></i>
                                    Recent Searches
                                    <span class="badge bg-primary ms-2" id="historyCount">0</span>
                                </h6>
                                <div class="search-history-list"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const manicuresSection = document.getElementById('manicures');
    if (manicuresSection) {
        manicuresSection.insertAdjacentHTML('beforebegin', searchHTML);
        console.log("Enhanced search container added successfully");
    }
}

function highlightMatches(element, searchTerm) {
    removeHighlights(element);
    
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const nodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
            nodes.push(node);
        }
    }
    
    nodes.forEach(node => {
        const span = document.createElement('span');
        span.className = 'search-highlight';
        span.innerHTML = node.textContent.replace(
            new RegExp(`(${escapeRegex(searchTerm)})`, 'gi'),
            '<mark class="search-match">$1</mark>'
        );
        node.parentNode.replaceChild(span, node);
    });
}

function removeHighlights(element) {
    element.querySelectorAll('.search-highlight').forEach(highlight => {
        highlight.replaceWith(highlight.textContent);
    });
}

function showSearchResults(visibleCount, searchTerm) {
    document.querySelectorAll('.search-results-message').forEach(msg => msg.remove());
    
    if (visibleCount === 0 && searchTerm) {
        const message = document.createElement('div');
        message.className = 'search-results-message alert alert-info mt-4';
        message.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-search me-3 fa-lg"></i>
                <div>
                    <h6 class="alert-heading mb-1">No services found</h6>
                    <p class="mb-0">No services match "<strong>${searchTerm}</strong>". Try different keywords or <a href="#" class="alert-link" onclick="showAllServices()">view all services</a>.</p>
                </div>
            </div>
        `;
        
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.after(message);
        }
    }
}

function updateSearchCounter(visible, total) {
    let counter = document.getElementById('searchCounter');
    
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'searchCounter';
        counter.className = 'search-counter text-center mt-2';
        
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            const formText = searchContainer.querySelector('.form-text');
            if (formText) {
                formText.after(counter);
            }
        }
    }
    
    if (visible === total) {
        counter.innerHTML = `<small class="text-muted"><i class="fas fa-list me-1"></i>Showing all ${total} services</small>`;
    } else {
        counter.innerHTML = `<small class="text-success"><i class="fas fa-filter me-1"></i>Showing ${visible} of ${total} services</small>`;
    }
}

function showAllServices() {
    const searchInput = document.getElementById('serviceSearch');
    if (searchInput) {
        searchInput.value = '';
        performSearch('');
    }
}

function saveToSearchHistory(searchTerm) {
    if (!searchTerm.trim()) return;
    
    const history = getSearchHistory();
    const filteredHistory = history.filter(item => item.term !== searchTerm);
    
    filteredHistory.unshift({
        term: searchTerm,
        timestamp: new Date().toISOString(),
        count: (history.find(item => item.term === searchTerm)?.count || 0) + 1
    });
    
    const limitedHistory = filteredHistory.slice(0, 8);
    localStorage.setItem('powerpuff_search_history', JSON.stringify(limitedHistory));
    
    updateSearchHistoryDisplay();
}

function getSearchHistory() {
    return JSON.parse(localStorage.getItem('powerpuff_search_history')) || [];
}

function updateSearchHistoryDisplay() {
    const history = getSearchHistory();
    const historyList = document.querySelector('.search-history-list');
    const historyContainer = document.querySelector('.search-history');
    
    if (!historyList || !historyContainer) return;
    
    if (history.length > 0) {
        historyList.innerHTML = history.map(item => `
            <div class="search-history-item d-flex justify-content-between align-items-center p-2 border-bottom">
                <div>
                    <span class="search-term" onclick="useSearchTerm('${item.term}')">
                        <i class="fas fa-search me-2 text-muted"></i>${item.term}
                    </span>
                    <small class="text-muted ms-2">(${item.count}x)</small>
                </div>
                <small class="text-muted">${new Date(item.timestamp).toLocaleDateString()}</small>
            </div>
        `).join('');
        
        historyContainer.style.display = 'block';
    } else {
        historyContainer.style.display = 'none';
    }
}

function useSearchTerm(term) {
    const searchInput = document.getElementById('serviceSearch');
    if (searchInput) {
        searchInput.value = term;
        performSearch(term);
        saveToSearchHistory(term);
    }
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - initializing search...");
    
    setTimeout(() => {
        initSearchFeatures();
    }, 100);
});

window.addEventListener('load', function() {
    console.log("Page fully loaded - finalizing search initialization...");
    initSearchFeatures();
});
