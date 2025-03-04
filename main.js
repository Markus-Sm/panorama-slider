let xPos = 0;

gsap.timeline()
    .set(dragger, { opacity: 0 })
    .set(ring, { rotationY: 180 })
    .set('.img', {
      rotateY: (i) => i * -45,
      transformOrigin: '50% 50% 2200px',
      z: -2200,
      backgroundImage: (i) => 'url(https://picsum.photos/id/' + (i + 32) + '/1680/1120/)',
      backgroundPosition: (i) => getBgPos(i),
      backfaceVisibility: 'hidden'
    })
    .from('.img', {
      duration: 1.5,
      y: 200,
      opacity: 0,
      stagger: 0.1,
      ease: 'expo'
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
      onUpdate: () => { gsap.set('.img', { backgroundPosition: (i) => getBgPos(i) }) }
    });
    
    xPos = Math.round(e.clientX);
  },
  
  onDragEnd: () => {
    gsap.set(dragger, { x: 0, y: 0 });
  }
});

function getBgPos(i) {
  return (-gsap.utils.wrap(0, 360, gsap.getProperty(ring, 'rotationY') - 180 - i * 45) / 360 * 1680) + 'px 0px';
}