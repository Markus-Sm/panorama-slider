let xPos = 0;

gsap.timeline()
    .set('.ring', { rotationY: 180, cursor: 'grab' }) // set initial rotationY so the parallax jump happens off-screen
    .set('.img', { // apply transform rotations to each image
        rotateY: (i) => i * -60,
        transformOrigin: '50% 50% 800px',
        z: -800,
        backgroundImage: (i) => 'url(https://picsum.photos/id/' + (i + 32) + '/800/600/)',
        backgroundPosition: (i) => getBgPos(i),
        backfaceVisibility: 'hidden'
    })
    .from('.img', {
        duration: 1.5,
        y: 200,
        opacity: 0,
        stagger: 0.1,
        ease: 'expo'
    })
    .add(() => {
        document.querySelectorAll('.img').forEach(img => {
            img.addEventListener('mouseenter', (e) => {
                let current = e.currentTarget;
                gsap.to('.img', { opacity: (i, t) => (t == current) ? 1 : 0.5, ease: 'power3' })
            });

            img.addEventListener('mouseleave', (e) => {
                gsap.to('.img', { opacity: 1, ease: 'power2.inOut' })
            });
        });
    }, '-=0.5');

document.addEventListener('mousedown', dragStart);
document.addEventListener('touchstart', dragStart);

function dragStart(e) {
    if (e.touches) e.clientX = e.touches[0].clientX;
    xPos = Math.round(e.clientX);
    gsap.set('.ring', { cursor: 'grabbing' });
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
}

function drag(e) {
    if (e.touches) e.clientX = e.touches[0].clientX;
    gsap.to('.ring', {
        rotationY: '-=' + ((Math.round(e.clientX) - xPos) % 360),
        onUpdate: () => { gsap.set('.img', { backgroundPosition: (i) => getBgPos(i) }) }
    });

    xPos = Math.round(e.clientX);
}

document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchend', dragEnd);

function dragEnd(e) {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    gsap.set('.ring', { cursor: 'grab' });
}

function getBgPos(i) { //returns the background-position string to create parallax movement in each image
    return (100 - gsap.utils.wrap(0, 360, gsap.getProperty('.ring', 'rotationY') - 180 - i * 60) / 360 * 500) + 'px 0px';
}