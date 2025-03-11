$(document).ready(function() {
  function getResponsiveValues() {
    const width = $(window).width();
    const baseWidth = 1920; // reference width
    const scale = Math.min(width / baseWidth, 1);

    return {
      videoWidth: Math.round(1680 * scale),
      videoHeight: Math.round(1120 * scale),
      zDistance: Math.round(2200 * scale),
      perspective: Math.round(1500 * scale)
    };
  }

  function updateSliderParameters() {
    const values = getResponsiveValues();
    
    gsap.set('.panorama-slider__container', {
      perspective: values.perspective
    });

    gsap.set('.ring__video', {
      width: values.videoWidth,
      height: values.videoHeight,
      rotateY: (i) => i * -45,
      transformOrigin: `50% 50% ${values.zDistance}px`,
      z: -values.zDistance,
      backfaceVisibility: 'hidden'
    });
  }

  // Inicjalizacja wideo
  function initializeVideos() {
    $('.ring__video').each(function(index) {
      const video = $(this);
      const source = video.find('source');
      
      // Ustawiamy właściwe źródło dla każdego wideo
      source.attr('src', source.data('src'));
      video.attr('poster', video.data('poster'));
      
      // Ładujemy wideo
      video[0].load();
      
      // Obsługa błędów
      video.on('error', function() {
        console.error('Error loading video:', index);
      });
    });
  }

  let xPos = 0;
  let isAnimating = false;
  let isDragging = false;

  function rotateSlider(direction) {
    if (isAnimating || isDragging) return;
    
    isAnimating = true;
    const angle = direction === 'next' ? 45 : -45;
    
    gsap.to('#ring', {
      rotationY: `+=${angle}`,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        isAnimating = false;
      }
    });
  }

  // Inicjalizacja slidera
  const tl = gsap.timeline();
  tl.set('#dragger', { opacity: 0 })
    .set('#ring', { rotationY: 180 })
    .add(() => {
      updateSliderParameters();
      initializeVideos();
    })
    .from('.ring__video', {
      duration: 1.5,
      y: 200,
      opacity: 0,
      stagger: 0.1,
      ease: 'expo'
    });

  // Event listeners
  $('.panorama-slider__arrow--prev').on('click', () => rotateSlider('prev'));
  $('.panorama-slider__arrow--next').on('click', () => rotateSlider('next'));

  $(document).on('keydown', (e) => {
    if (e.key === 'ArrowLeft') rotateSlider('prev');
    if (e.key === 'ArrowRight') rotateSlider('next');
  });

  $('.ring__video').on({
    mouseenter: function() {
      if (!isDragging) {
        $('#dragger').addClass('active');
      }
    },
    mouseleave: function() {
      if (!isDragging) {
        $('#dragger').removeClass('active');
      }
    }
  });

  Draggable.create('#dragger', {
    type: 'x',
    inertia: true,
    dragResistance: 0.2,  // Reduced resistance for smoother dragging
    cursor: 'grab',
    allowContextMenu: true,
    minimumMovement: 2,  // Reduced threshold for drag initiation
    edgeResistance: 0.65,
    inertiaMultiplier: 0.8,  // Added momentum for natural feel
    
    onDragStart: function() {
      isDragging = true;
      this.startRotation = gsap.getProperty('#ring', 'rotationY');
      this.startX = this.x;
      this.velocity = 0;
      $('.ring__video').addClass('draggable');
      gsap.set(this.target, { cursor: 'grabbing' });
      $(this.target).addClass('active');
    },
    
    onDrag: function() {
      const dx = this.startX - this.x;
      const sensitivity = 0.8; // Increased rotation sensitivity
      const rotation = this.startRotation + (dx * sensitivity);
      this.velocity = this.getVelocity();
      gsap.set('#ring', { rotationY: rotation });
    },
    
    onDragEnd: function() {
      isDragging = false;
      this.startX = 0;
      
      // Add momentum-based animation
      const momentum = Math.abs(this.velocity) > 50;
      const currentRotation = gsap.getProperty('#ring', 'rotationY');
      const snapAngle = 45;
      let targetRotation = Math.round(currentRotation / snapAngle) * snapAngle;
      
      if (momentum) {
        targetRotation += (this.velocity > 0 ? snapAngle : -snapAngle);
      }
      
      gsap.to('#ring', {
        rotationY: targetRotation,
        duration: momentum ? 0.8 : 0.4,
        ease: 'power2.out'
      });
      
      gsap.set(this.target, {
        x: 0,
        y: 0,
        cursor: 'grab'
      });
      $(this.target).removeClass('active');
      $('.ring__video').removeClass('draggable');
    }
  });

  let resizeTimeout;
  $(window).on('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSliderParameters, 100);
  });
});