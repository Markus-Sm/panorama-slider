$(document).ready(function() {
  function getResponsiveValues() {
    const width = $(window).width();
    const baseWidth = 1920; // reference width
    const scale = Math.min(width / baseWidth, 1);

    return {
      imageWidth: Math.round(1680 * scale),
      imageHeight: Math.round(1120 * scale),
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
      width: values.imageWidth,
      height: values.imageHeight,
      rotateY: (i) => i * -45,
      transformOrigin: `50% 50% ${values.zDistance}px`,
      z: -values.zDistance,
      backgroundImage: (i) => `url(https://picsum.photos/id/${(i + 32)}/${values.imageWidth}/${values.imageHeight}/)`,
      backgroundPosition: (i) => getBgPos(i),
      backfaceVisibility: 'hidden'
    });
  }

  let xPos = 0;
  let isAnimating = false;
  let isDragging = false;

  // Rotation animation function
  function rotateSlider(direction) {
    if (isAnimating || isDragging) return;
    
    isAnimating = true;
    const angle = direction === 'next' ? 45 : -45;
    
    gsap.to('#ring', {
      rotationY: `+=${angle}`,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        gsap.set('.ring__video', { 
          backgroundPosition: (i) => getBgPos(i) 
        });
      },
      onComplete: () => {
        isAnimating = false;
      }
    });
  }

  // Slider initialization

  const tl = gsap.timeline();
  tl.set('#dragger', { opacity: 0 })
    .set('#ring', { rotationY: 180 })
    .add(() => updateSliderParameters())
    .from('.ring__video', {
      duration: 1.5,
      y: 200,
      opacity: 0,
      stagger: 0.1,
      ease: 'expo'
    });

  // Arrow event listeners
  $('.panorama-slider__arrow--prev').on('click', () => rotateSlider('prev'));
  $('.panorama-slider__arrow--next').on('click', () => rotateSlider('next'));

  // Keyboard event listener
  $(document).on('keydown', (e) => {
    if (e.key === 'ArrowLeft') rotateSlider('prev');
    if (e.key === 'ArrowRight') rotateSlider('next');
  });

  // Obsługa hover na video elementach
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

  // Inicjalizacja Draggable
  Draggable.create('#dragger', {
    type: 'x',
    inertia: true,
    
    onDragStart: function(e) {
      isDragging = true;
      if (e.touches) e.clientX = e.touches[0].clientX;
      xPos = Math.round(e.clientX);
      $('.ring__video').addClass('draggable');
    },
    
    onDrag: function(e) {
      if (e.touches) e.clientX = e.touches[0].clientX;
      
      gsap.to('#ring', {
        rotationY: '-=' + ((Math.round(e.clientX) - xPos) % 360),
        onUpdate: () => { 
          gsap.set('.ring__video', { 
            backgroundPosition: (i) => getBgPos(i) 
          });
        }
      });
      
      xPos = Math.round(e.clientX);
    },
    
    onDragEnd: function() {
      isDragging = false;
      gsap.set('#dragger', { 
        x: 0, 
        y: 0,
        pointerEvents: 'none',
        opacity: 0
      });
      $('.ring__video').removeClass('draggable');
    }
  });

  function getBgPos(i) {
    const values = getResponsiveValues();
    return (-gsap.utils.wrap(0, 360, gsap.getProperty('#ring', 'rotationY') - 180 - i * 45) / 360 * values.imageWidth) + 'px 0px';
  }

  // Nasłuchiwanie na zmiany rozmiaru okna
  let resizeTimeout;
  $(window).on('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSliderParameters, 100);
  });
});