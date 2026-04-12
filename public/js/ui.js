export function initUI() {
    // Counters
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const runCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                if (entry.target.querySelector('.counter')) {
                    runCounters();
                }
            }
        });
    }, observerOptions);

    // Apply reveal to sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('reveal');
        observer.observe(section);
    });

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('open');
        });
    }

    // Header scroll background
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(5, 5, 5, 0.95)';
            header.style.padding = '10px 0';
        } else {
            header.style.background = 'rgba(5, 5, 5, 0.7)';
            header.style.padding = '0';
        }
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            faqItem.classList.toggle('active');
            
            // Close other items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
        });
    });
}
