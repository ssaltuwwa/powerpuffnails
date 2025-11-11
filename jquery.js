$(document).ready(function(){
    console.log("jQuery is ready!");
    
    try {
        if ($('#manicures').length && !$('.search-container').length) {
            initSearchFilter();
        }
        
        if ($('#serviceSearch').length) {
            initAutocomplete();
        }
        
        if ($('.main-content').length) {
            initSearchHighlighting();
        }
        
        initScrollProgressBar();
        initAnimatedCounters();
        initLoadingSpinners();
        
        initNotificationSystem();
        initCopyToClipboard();
        initLazyLoading();
        
        console.log("All jQuery features initialized!");
    } catch (error) {
        console.error("Error initializing jQuery features:", error);
    }
});


function initSearchFilter() {
    console.log("Initializing search filter...");
    
    if ($('#manicures').length && !$('.search-container').length) {
        const searchHTML = `
            <div class="search-container mb-5">
                <div class="row justify-content-center">
                    <div class="col-lg-6">
                        <div class="input-group">
                            <span class="input-group-text bg-gradient-primary text-white">
                                <i class="fas fa-search"></i>
                            </span>
                            <input type="text" class="form-control form-control-lg" 
                                   id="serviceSearch" placeholder="Search services... (e.g., manicure, gel, spa)">
                        </div>
                        <div class="form-text text-center">Type to filter services in real-time</div>
                    </div>
                </div>
            </div>
        `;
        
        $('#manicures').before(searchHTML);
        
        $('#serviceSearch').on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase().trim();
            let visibleCount = 0;
            
            $('.service-card').each(function() {
                const $card = $(this);
                const cardText = $card.text().toLowerCase();
                const cardTitle = $card.find('.card-title').text().toLowerCase();
                
                if (searchTerm === '' || cardText.includes(searchTerm) || cardTitle.includes(searchTerm)) {
                    $card.parent().show();
                    visibleCount++;
                } else {
                    $card.parent().hide();
                }
            });
            
            $('.alert-info').remove();
            
            if (visibleCount === 0 && searchTerm !== '') {
                $('#manicures').after(`
                    <div class="alert alert-info text-center mt-3">
                        <i class="fas fa-info-circle me-2"></i>
                        No services found matching "<strong>${searchTerm}</strong>"
                    </div>
                `);
            }
        });
    }
}

function initAutocomplete() {
    console.log("Initializing autocomplete...");
    
    const services = [
        "Basic Manicure - 8,000₸", 
        "Luxury Manicure - 12,000₸", 
        "Gel Manicure - 15,000₸",
        "Classic Pedicure - 10,000₸", 
        "Spa Pedicure - 18,000₸", 
        "Gel Pedicure - 20,000₸",
        "Basic Design - +3,000₸", 
        "Premium Art - +7,000₸", 
        "3D Art - +12,000₸"
    ];
    
    if ($('#serviceSearch').length) {
        let $suggestions = $('<div class="autocomplete-suggestions"></div>');
        $('#serviceSearch').after($suggestions);
        
        $('#serviceSearch').on('input', function() {
            const value = $(this).val().toLowerCase().trim();
            $suggestions.empty().hide();
            
            if (value.length > 0) {
                const filtered = services.filter(service => 
                    service.toLowerCase().includes(value)
                );
                
                if (filtered.length > 0) {
                    filtered.forEach(service => {
                        const $suggestion = $('<div class="autocomplete-suggestion"></div>')
                            .html(`<i class="fas fa-spa me-2"></i>${service}`)
                            .on('click', function() {
                                $('#serviceSearch').val(service.split(' - ')[0]);
                                $suggestions.hide();
                                filterServices(service.split(' - ')[0]);
                                if (typeof playSound === 'function') {
                                    playSound('click');
                                }
                            });
                        $suggestions.append($suggestion);
                    });
                    $suggestions.show();
                }
            }
        });
        
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.autocomplete-suggestions, #serviceSearch').length) {
                $suggestions.hide();
            }
        });
        
        $('#serviceSearch').on('keydown', function(e) {
            if (e.key === 'Escape') {
                $suggestions.hide();
            }
        });
    }
}

function filterServices(searchTerm) {
    const term = searchTerm.toLowerCase();
    let visibleCount = 0;
    
    $('.service-card').each(function() {
        const $card = $(this);
        const cardText = $card.text().toLowerCase();
        const cardTitle = $card.find('.card-title').text().toLowerCase();
        
        if (term === '' || cardText.includes(term) || cardTitle.includes(term)) {
            $card.closest('.col-md-6, .col-lg-4').show();
            visibleCount++;
        } else {
            $card.closest('.col-md-6, .col-lg-4').hide();
        }
    });
    
    $('.no-results-message').remove();
    if (visibleCount === 0 && term !== '') {
        $('#serviceSearch').after(`
            <div class="no-results-message alert alert-info text-center mt-3">
                <i class="fas fa-info-circle me-2"></i>
                No services found matching "<strong>${searchTerm}</strong>"
            </div>
        `);
    }
}

function initSearchHighlighting() {
    console.log("Initializing search highlighting...");
    
    if ($('.search-highlight-container').length) return;
    
    const searchHTML = `
        <div class="search-highlight-container bg-light p-3 rounded mb-4">
            <div class="row">
                <div class="col-md-6 mx-auto text-center">
                    <h5><i class="fas fa-highlighter me-2"></i>Text Highlighter</h5>
                    <div class="input-group mb-2">
                        <input type="text" class="form-control" 
                               id="highlightSearch" 
                               placeholder="Enter keyword to highlight...">
                        <button class="btn btn-warning" id="highlightBtn">
                            <i class="fas fa-highlighter"></i> Highlight
                        </button>
                    </div>
                    <small class="text-muted">All matching words will be highlighted in yellow</small>
                </div>
            </div>
        </div>
    `;
    
    $('.main-content').prepend(searchHTML);
    
    $('#highlightBtn').click(function() {
        const searchText = $('#highlightSearch').val().trim();
        
        if (searchText === '') {
            if (typeof showNotification === 'function') {
                showNotification('Please enter a keyword to highlight', 'error');
            }
            return;
        }
        
        removeHighlights();
        
        highlightMatches(searchText);
        
        if (typeof playSound === 'function') {
            playSound('click');
        }
        if (typeof showNotification === 'function') {
            showNotification(`Highlighted all "${searchText}" words on page`, 'success');
        }
    });
}

function removeHighlights() {
    $('.search-highlight').each(function() {
        const $this = $(this);
        $this.replaceWith($this.text());
    });
}

function highlightMatches(searchText) {
    const regex = new RegExp(`(${escapeRegex(searchText)})`, 'gi');
    
    $('p, h1, h2, h3, h4, h5, h6, li, td, span:not(.search-highlight)').each(function() {
        const $element = $(this);
        const html = $element.html();
        
        const newHtml = html.replace(regex, '<span class="search-highlight">$1</span>');
        
        if (newHtml !== html) {
            $element.html(newHtml);
        }
    });
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function initScrollProgressBar() {
    console.log("Initializing scroll progress bar...");
    
    if ($('.scroll-progress-container').length) return;
    
    const progressHTML = `
        <div class="scroll-progress-container">
            <div class="scroll-progress-bar"></div>
        </div>
    `;
    
    $('body').prepend(progressHTML);
    
    $(window).on('scroll', function() {
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();
        const scrollTop = $(window).scrollTop();
        
        const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
        $('.scroll-progress-bar').css('width', progress + '%');
        
        if (progress < 25) {
            $('.scroll-progress-bar').css('background', 'linear-gradient(90deg, #ff6b93, #ff8eb4)');
        } else if (progress < 50) {
            $('.scroll-progress-bar').css('background', 'linear-gradient(90deg, #667eea, #8e9ff7)');
        } else if (progress < 75) {
            $('.scroll-progress-bar').css('background', 'linear-gradient(90deg, #4facfe, #7bc6ff)');
        } else {
            $('.scroll-progress-bar').css('background', 'linear-gradient(90deg, #f093fb, #f5b0ff)');
        }
    });
}

function initAnimatedCounters() {
    console.log("Initializing animated counters...");
    
    if ($('.stat-number').length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    $(entry.target).each(function() {
                        const $this = $(this);
                        const targetText = $this.text();
                        const target = parseInt(targetText.replace('+', ''));
                        const duration = 2000;
                        
                        $({ count: 0 }).animate({ count: target }, {
                            duration: duration,
                            easing: 'swing',
                            step: function() {
                                $this.text(Math.floor(this.count) + '+');
                            },
                            complete: function() {
                                $this.text(target + '+');
                            }
                        });
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        $('.stat-number').each(function() {
            observer.observe(this);
        });
    }
}

function initLoadingSpinners() {
    console.log("Initializing loading spinners...");
    
    $('#bookingForm').on('submit', function(e) {
        e.preventDefault();
        
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalText = $submitBtn.html();
        
        console.log("Booking form submit clicked");
        
        $submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>Please wait...');
        $submitBtn.addClass('btn-loading');
        $submitBtn.prop('disabled', true);
        
        setTimeout(() => {
            $submitBtn.html(originalText);
            $submitBtn.removeClass('btn-loading');
            $submitBtn.prop('disabled', false);
            
            if (typeof showNotification === 'function') {
                showNotification('🎉 Booking submitted successfully! We will contact you soon.', 'success', 5000);
            }
            
            $(this)[0].reset();
            
            if (typeof currentFormStep !== 'undefined') {
                currentFormStep = 1;
                if (typeof showFormStep === 'function') showFormStep(currentFormStep);
                if (typeof updateProgressBar === 'function') updateProgressBar();
                if (typeof updateStepIndicators === 'function') updateStepIndicators();
            }
            
        }, 2000);
    });
    
    $('#subscribeForm').on('submit', function(e) {
        e.preventDefault();
        
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalText = $submitBtn.html();
        const email = $('#subscriberEmail').val();
        
        if (!validateEmail(email)) {
            if (typeof showNotification === 'function') {
                showNotification('❌ Please enter a valid email address', 'error', 3000);
            }
            return;
        }
        
        console.log("Subscribe form submit clicked");
        
        $submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>Please wait...');
        $submitBtn.addClass('btn-loading');
        $submitBtn.prop('disabled', true);
        
        setTimeout(() => {
            $submitBtn.html(originalText);
            $submitBtn.removeClass('btn-loading');
            $submitBtn.prop('disabled', false);
            
            if (typeof showNotification === 'function') {
                showNotification('📧 Thank you for subscribing! You will receive our updates.', 'success', 4000);
            }
            
            if (typeof closePopup === 'function') {
                closePopup();
            }
            
            $(this)[0].reset();
            
        }, 1500);
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

const spinnerStyles = `
    .btn-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.8;
    }
    
    .fa-spinner {
        animation: fa-spin 1s linear infinite;
    }
    
    @keyframes fa-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

if (!$('#spinner-styles').length) {
    $('head').append(`<style id="spinner-styles">${spinnerStyles}</style>`);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function initNotificationSystem() {
    console.log("Initializing notification system...");
    
    if (typeof window.showNotification !== 'undefined') return;
    
    window.showNotification = function(message, type = 'info', duration = 5000) {
        $('.notification').remove();
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        const $notification = $(`
            <div class="notification ${type}">
                <div class="notification-content">
                    <i class="fas ${icon} me-2"></i>
                    <span>${message}</span>
                    <button class="notification-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `);
        
        $('body').append($notification);
        
        setTimeout(() => {
            $notification.addClass('show');
        }, 100);
        
        $notification.find('.notification-close').on('click', function() {
            hideNotification($notification);
        });
        
        if (duration > 0) {
            setTimeout(() => {
                hideNotification($notification);
            }, duration);
        }
        
        return $notification;
    };
    
    function hideNotification($notification) {
        $notification.removeClass('show');
        setTimeout(() => {
            $notification.remove();
        }, 300);
    }
    
    setTimeout(() => {
        const isHomepage = window.location.pathname.endsWith('index.html') || 
                          window.location.pathname === '/' ||
                          window.location.pathname.endsWith('/');
        
        if (isHomepage && typeof showNotification === 'function') {
            showNotification('✨ Welcome to PowerPuff Nail Salon! Discover our premium nail services.', 'info', 6000);
        }
    }, 2000);
}

function initCopyToClipboard() {
    console.log("Initializing copy to clipboard...");
    
    $('.contact-item').each(function() {
        const $item = $(this);
        const textToCopy = $item.find('p').text().replace(/\s+/g, ' ').trim();
        
        if (textToCopy) {
            $item.find('.btn-copy').remove();
            
            const $copyBtn = $(`
                <button class="btn-copy" title="Copy to clipboard" style="
                    position: absolute !important;
                    right: 0 !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    background: var(--gradient-primary) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 8px 12px !important;
                    cursor: pointer !important;
                    font-size: 0.8rem !important;
                    min-width: 40px !important;
                    height: 32px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;">
                    <i class="fas fa-copy"></i>
                </button>
            `);
            
            $item.css('position', 'relative').css('padding-right', '50px').append($copyBtn);
            
            $copyBtn.on('click', async function() {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    
                    $copyBtn.html('<i class="fas fa-check"></i>');
                    $copyBtn.addClass('copied');
                    
                    if (typeof showNotification === 'function') {
                        showNotification('✓ Copied to clipboard!', 'success', 2000);
                    }
                    
                    setTimeout(() => {
                        $copyBtn.html('<i class="fas fa-copy"></i>');
                        $copyBtn.removeClass('copied');
                    }, 2000);
                    
                } catch (err) {
                    if (typeof showNotification === 'function') {
                        showNotification('❌ Failed to copy text', 'error', 3000);
                    }
                }
            });
        }
    });
}

function initLazyLoading() {
    console.log("Initializing lazy loading...");
    
    $('img').not('.navbar img, .hero-section img, .carousel img').each(function() {
        const $img = $(this);
        const src = $img.attr('src');
        
        if (src && !$img.hasClass('critical-image')) {
            $img.attr('data-src', src);
            $img.removeAttr('src');
            $img.addClass('lazy-image');
            $img.css({
                'background': '#f8f9fa',
                'min-height': '50px',
                'opacity': '0.6'
            });
        }
    });
    
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) * 1.2 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    function loadVisibleImages() {
        $('.lazy-image').each(function() {
            const $img = $(this);
            if (isInViewport(this)) {
                loadImage($img);
            }
        });
    }
    
    function loadImage($img) {
        const src = $img.attr('data-src');
        if (!src) return;
        
        const img = new Image();
        img.onload = function() {
            $img.attr('src', src);
            $img.removeClass('lazy-image');
            $img.addClass('lazy-loaded');
            $img.css({
                'background': 'none',
                'opacity': '1',
                'transition': 'opacity 0.5s ease-in-out'
            });
        };
        img.onerror = function() {
            console.warn('Failed to load image:', src);
            $img.addClass('lazy-error');
            $img.css('background', '#ffe6e6');
        };
        img.src = src;
    }
    
    setTimeout(loadVisibleImages, 100);
    
    $(window).on('scroll', function() {
        loadVisibleImages();
    });
    
    $(window).on('resize', function() {
        loadVisibleImages();
    });
}

const _ = {
    throttle: function(func, wait) {
        let timeout = null;
        let previous = 0;
        
        return function() {
            const now = Date.now();
            const remaining = wait - (now - previous);
            const context = this;
            const args = arguments;
            
            if (remaining <= 0) {
                previous = now;
                func.apply(context, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    previous = Date.now();
                    timeout = null;
                    func.apply(context, args);
                }, remaining);
            }
        };
    }
};

function fixMultiStepForm() {
    $('.prev-step, .reset-form').on('click', function() {
        $(this).closest('form').find('.is-invalid').removeClass('is-invalid');
    });
}

function updateSearchHighlightColors() {
    const searchContainer = document.querySelector('.search-highlight-container');
    if (!searchContainer) return;
    
    if (document.body.classList.contains('dark-mode')) {
        searchContainer.style.background = 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)';
        searchContainer.style.color = '#ffffff';
        searchContainer.style.borderColor = '#495057';
        
        const textElements = searchContainer.querySelectorAll('h5, .form-text, .text-muted, small');
        textElements.forEach(el => {
            el.style.color = '#ffffff';
        });
        
        const input = searchContainer.querySelector('.form-control');
        if (input) {
            input.style.background = '#2d2d2d';
            input.style.color = '#ffffff';
            input.style.borderColor = '#495057';
        }
        
        const inputGroup = searchContainer.querySelector('.input-group-text');
        if (inputGroup) {
            inputGroup.style.background = 'var(--gradient-primary)';
            inputGroup.style.color = 'white';
            inputGroup.style.borderColor = 'var(--primary-color)';
        }
    } else {
        searchContainer.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
        searchContainer.style.color = '#2c3e50';
        searchContainer.style.borderColor = '#dee2e6';
        
        const textElements = searchContainer.querySelectorAll('h5, .form-text, .text-muted, small');
        textElements.forEach(el => {
            el.style.color = '#2c3e50';
        });
        
        const input = searchContainer.querySelector('.form-control');
        if (input) {
            input.style.background = '';
            input.style.color = '';
            input.style.borderColor = '';
        }
        
        const inputGroup = searchContainer.querySelector('.input-group-text');
        if (inputGroup) {
            inputGroup.style.background = '';
            inputGroup.style.color = '';
            inputGroup.style.borderColor = '';
        }
    }
}


function playSound(type) {
    if (typeof SoundManager !== 'undefined' && SoundManager.play) {
        SoundManager.play(type);
    }
}