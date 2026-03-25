document.addEventListener('DOMContentLoaded', () => {
    // 1. Loader & Entry Animation Logic
    const loader = document.getElementById('loader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loader) {
                loader.classList.add('hidden');
                document.body.style.overflow = 'auto'; // Re-enable scrolling
            }
            
            // Trigger hero fade-ins immediately after loader hides
            setTimeout(() => {
                const heroStaggers = document.querySelectorAll('.hero .fade-in-up, .hero .fade-in, .hero .fade-in-left');
                heroStaggers.forEach(el => el.classList.add('visible'));
                
                // Add class to trigger CSS line animations if they exist in hero
                const lines = document.querySelectorAll('.hero .draw-line-anim');
                lines.forEach(line => line.classList.add('animated'));
            }, 100);
        }, 1200); // Gives time to see the cool logo pulse
    });
    
    // Safety fallback
    setTimeout(() => {
        if (loader && !loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }, 5000);

    // 2. Mobile Menu Setup
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Prevent body scroll when menu is open on mobile
            if (mobileToggle.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Close menu when clicking a link
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileToggle) {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });

    // 3. Advanced Navbar Scroll Effects
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    
    const handleScroll = () => {
        const scrollY = window.scrollY;
        
        // Navbar Styling
        if (scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link switching based on deepest visible section
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
        
        // Parallax effects for elements with parallax-bg class
        const parallaxBgs = document.querySelectorAll('.parallax-bg');
        parallaxBgs.forEach(bg => {
            const speed = 0.4;
            bg.style.transform = `translateY(${scrollY * speed}px)`;
        });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init on load

    // 4. Enhanced Scroll Animations (Intersection Observer)
    const animateElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .slide-in-right, .reveal-scale');
    
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class
                entry.target.classList.add('visible');
                
                // Trigger any child line-drawing animations
                const lines = entry.target.querySelectorAll('.draw-line-anim');
                lines.forEach(line => line.classList.add('animated'));
                
                // If the element itself is a line
                if (entry.target.classList.contains('draw-line-anim')) {
                    entry.target.classList.add('animated');
                }
                
                // Stop observing once animated to keep it visible
                observer.unobserve(entry.target); 
            }
        });
    }, {
        root: null,
        threshold: 0.1,    // Trigger slightly earlier for smoother experience
        rootMargin: '0px 0px -80px 0px'
    });

    animateElements.forEach(element => {
        // Exclude hero elements as they are managed by the loader logic
        if (!element.closest('.hero')) {
            animationObserver.observe(element);
        }
    });

    // 5. Lookbook Gallery Setup (Drag & Centering)
    const galleryScroll = document.querySelector('.gallery-scroll');
    const prevBtn = document.querySelector('.prev-ctrl');
    const nextBtn = document.querySelector('.next-ctrl');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (galleryScroll) {
        // Desktop Dragging Logic
        let isDown = false;
        let startX;
        let scrollLeft;
        let dragDistance = 0;

        galleryScroll.addEventListener('mousedown', (e) => {
            isDown = true;
            dragDistance = 0;
            galleryScroll.style.cursor = 'grabbing';
            galleryScroll.style.scrollBehavior = 'auto'; // Disable smooth scroll while dragging
            galleryScroll.style.scrollSnapType = 'none'; // Disable snap
            
            // Remove pointer events on images and links to prevent accidental clicks while dragging
            galleryScroll.querySelectorAll('img, a').forEach(el => el.style.pointerEvents = 'none');
            
            startX = e.pageX - galleryScroll.offsetLeft;
            scrollLeft = galleryScroll.scrollLeft;
        });

        galleryScroll.addEventListener('mouseleave', () => {
            if(!isDown) return;
            resetDragState();
        });

        galleryScroll.addEventListener('mouseup', (e) => {
            if(!isDown) return;
            resetDragState();
            
            // If it was a click (not a drag), allow events to fire
            if (Math.abs(dragDistance) < 5) {
                galleryScroll.querySelectorAll('img, a').forEach(el => el.style.pointerEvents = '');
            }
        });

        galleryScroll.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - galleryScroll.offsetLeft;
            const walk = (x - startX) * 2; // Scroll multiplier
            dragDistance = walk;
            galleryScroll.scrollLeft = scrollLeft - walk;
        });
        
        function resetDragState() {
            isDown = false;
            galleryScroll.style.cursor = 'auto';
            galleryScroll.style.scrollBehavior = 'smooth';
            galleryScroll.style.scrollSnapType = 'x mandatory';
            
            // Restore pointer events after a slight delay to prevent the click
            setTimeout(() => {
                galleryScroll.querySelectorAll('img, a').forEach(el => el.style.pointerEvents = '');
            }, 50);
        }

        // Button Controls
        const itemWidth = galleryItems.length > 0 ? galleryItems[0].offsetWidth + 35 : 400; // width + gap
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                galleryScroll.scrollBy({ left: -itemWidth, behavior: 'smooth' });
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                galleryScroll.scrollBy({ left: itemWidth, behavior: 'smooth' });
            });
        }

        // Add visual focus to center item
        galleryScroll.addEventListener('scroll', () => {
            const scrollCenter = galleryScroll.scrollLeft + (galleryScroll.clientWidth / 2);
            galleryItems.forEach(item => {
                const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
                 // Check if item is roughly in the center
                if (Math.abs(scrollCenter - itemCenter) < (item.offsetWidth / 1.5)) {
                    item.classList.add('in-view');
                } else {
                    item.classList.remove('in-view');
                }
            });
        }, { passive: true });
        
        // Initial check for center item
        setTimeout(() => {
            const scrollEvent = new Event('scroll');
            galleryScroll.dispatchEvent(scrollEvent);
        }, 500);
    }
    
    // 6. Floating WhatsApp Pop-up animation triggers late to catch user eye
    setTimeout(() => {
        const waFloat = document.querySelector('.whatsapp-float');
        if (waFloat) waFloat.classList.add('visible');
    }, 4000);
});
