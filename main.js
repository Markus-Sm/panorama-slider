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
  let currentRotation = 180; // Początkowa rotacja

  function rotateSlider(direction) {
    if (isAnimating || isDragging) return;
    
    isAnimating = true;
    const angle = direction === 'next' ? 45 : -45;
    currentRotation += angle;
    
    gsap.to('#ring', {
      rotationY: currentRotation,
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
    .set('#ring', { rotationY: currentRotation })
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
        gsap.set('#dragger', {
          pointerEvents: 'auto',
          opacity: 1
        });
      }
    },
    mouseleave: function() {
      if (!isDragging) {
        gsap.set('#dragger', {
          pointerEvents: 'none',
          opacity: 0
        });
      }
    }
  });

  Draggable.create('#dragger', {
    type: 'x',
    inertia: true,
    dragResistance: 0.4,
    cursor: 'grab',
    
    onDragStart: function() {
      isDragging = true;
      this.startRotation = currentRotation;
      this.startX = this.x;
      $('.ring__video').addClass('draggable');
      gsap.set(this.target, { cursor: 'grabbing' });
    },
    
    onDrag: function() {
      const dx = this.startX - this.x;
      currentRotation = this.startRotation + (dx * 0.5);
      gsap.set('#ring', { rotationY: currentRotation });
    },
    
    onDragEnd: function() {
      isDragging = false;
      this.startX = 0;
      gsap.set(this.target, {
        x: 0,
        y: 0,
        cursor: 'grab',
        pointerEvents: 'auto',
        opacity: 1
      });
      $('.ring__video').removeClass('draggable');
    }
  });

  // Aktualizacja obsługi hover dla #dragger
  $('#dragger').on({
    mouseenter: function() {
      if (!isDragging) {
        gsap.set(this, {
          pointerEvents: 'auto',
          opacity: 1,
          cursor: 'grab'
        });
      }
    },
    mouseleave: function() {
      if (!isDragging) {
        gsap.set(this, {
          pointerEvents: 'none',
          opacity: 0
        });
      }
    }
  });

  let resizeTimeout;
  $(window).on('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSliderParameters, 100);
  });
});