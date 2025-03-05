// Funkcja do obliczania wymiarów na podstawie szerokości ekranu
function getResponsiveValues() {
  const width = window.innerWidth;
  const baseWidth = 1920; // szerokość referencyjna
  const scale = Math.min(width / baseWidth, 1);

  return {
    imageWidth: Math.round(1680 * scale),
    imageHeight: Math.round(1120 * scale),
    zDistance: Math.round(2200 * scale),
    perspective: Math.round(1500 * scale)
  };
}

// Aktualizacja parametrów slidera
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

// Funkcja do animacji obrotu
function rotateSlider(direction) {
  if (isAnimating) return;
  
  isAnimating = true;
  const angle = direction === 'next' ? -45 : 45;
  
  gsap.to(ring, {
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

// Inicjalizacja slidera
gsap.timeline()
    .set(dragger, { opacity: 0 })
    .set(ring, { rotationY: 180 })
    .add(() => updateSliderParameters())
    .from('.ring__video', {
      duration: 1.5,
      y: 200,
      opacity: 0,
      stagger: 0.1,
      ease: 'expo'
    });

// Obsługa strzałek
const prevButton = document.querySelector('.panorama-slider__arrow--prev');
const nextButton = document.querySelector('.panorama-slider__arrow--next');

prevButton.addEventListener('click', () => rotateSlider('prev'));
nextButton.addEventListener('click', () => rotateSlider('next'));

// Obsługa klawiszy strzałek
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') rotateSlider('prev');
  if (e.key === 'ArrowRight') rotateSlider('next');
});

// Włączanie/wyłączanie draggable podczas interakcji ze strzałkami
function toggleDraggable(enable) {
  gsap.set('#dragger', {
    pointerEvents: enable ? 'auto' : 'none'
  });
}

// Nasłuchiwanie na hover na strzałkach
[prevButton, nextButton].forEach(button => {
  button.addEventListener('mouseenter', () => toggleDraggable(false));
  button.addEventListener('mouseleave', () => toggleDraggable(true));
});

Draggable.create(dragger, {
  type: 'x',
  inertia: true,
  
  onDragStart: (e) => {
    if (e.touches) e.clientX = e.touches[0].clientX;
    xPos = Math.round(e.clientX);
  },
  
  onDrag: (e) => {
    if (e.touches) e.clientX = e.touches[0].clientX;
    
    gsap.to(ring, {
      rotationY: '-=' + ((Math.round(e.clientX) - xPos) % 360),
      onUpdate: () => { gsap.set('.ring__video', { backgroundPosition: (i) => getBgPos(i) }) }
    });
    
    xPos = Math.round(e.clientX);
  },
  
  onDragEnd: () => {
    gsap.set(dragger, { x: 0, y: 0 });
  }
});

function getBgPos(i) {
  const values = getResponsiveValues();
  return (-gsap.utils.wrap(0, 360, gsap.getProperty(ring, 'rotationY') - 180 - i * 45) / 360 * values.imageWidth) + 'px 0px';
}

// Nasłuchiwanie na zmiany rozmiaru okna
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateSliderParameters, 100);
});