// Panorama Slider Plugin
(function($) {
  'use strict';

  class PanoramaSliderGsap {
    constructor(element, options) {
      this.$slider = $(element);
      this.$ring = this.$slider.find('.ring');
      this.$slides = this.$slider.find('.video-cover-panorama');
      
      this.options = $.extend({
        baseWidth: 1920,
        videoWidth: 1680,
        videoHeight: 1120,
        zDistance: 2200,
        perspective: 1500,
        rotationSpeed: 0.5,
        animationDuration: 0.8
      }, options);

      this.state = {
        isAnimating: false,
        isDragging: false,
        rotationY: 180,
        lastMouseX: 0
      };

      this.init();
    }

    getResponsiveValues() {
      const width = $(window).width();
      const scale = Math.min(width / this.options.baseWidth, 1);

      return {
        videoWidth: Math.round(this.options.videoWidth * scale),
        videoHeight: Math.round(this.options.videoHeight * scale),
        zDistance: Math.round(this.options.zDistance * scale),
        perspective: Math.round(this.options.perspective * scale)
      };
    }

    updateSliderParameters() {
      const values = this.getResponsiveValues();
      
      gsap.set(this.$slider.find('.panorama-slider-gsap__container'), {
        perspective: values.perspective
      });

      gsap.set(this.$slides, {
        width: values.videoWidth,
        height: values.videoHeight,
        rotateY: (i) => i * -45,
        transformOrigin: `50% 50% ${values.zDistance}px`,
        z: -values.zDistance,
        backfaceVisibility: 'hidden'
      });
    }

    initializeVideos() {
      this.$slides.each((index, slide) => {
        const $slide = $(slide);
        const video = $slide.find('video')[0];
        
        if (video) {
          video.load();
          $(video).on('error', () => {
            console.error('Error loading video:', index);
          });
        }
      });
    }

    rotateSlider(direction) {
      if (this.state.isAnimating || this.state.isDragging) return;
      
      this.state.isAnimating = true;
      const angle = direction === 'next' ? 45 : -45;
      
      gsap.to(this.$ring, {
        rotationY: `+=${angle}`,
        duration: this.options.animationDuration,
        ease: 'power2.out',
        onComplete: () => {
          this.state.isAnimating = false;
        }
      });
    }

    initDragging() {
      const startDrag = (e) => {
        e.preventDefault();
        this.state.isDragging = true;
        this.state.lastMouseX = e.clientX || e.originalEvent.touches[0].clientX;
        
        const transform = this.$ring[0].style.transform;
        const match = transform.match(/rotateY\(([-\d.]+)deg\)/i);
        this.state.rotationY = match ? parseFloat(match[1]) : this.state.rotationY;
        
        this.$ring.css('cursor', 'grabbing');
        this.$slides.css('cursor', 'grabbing');
      };

      const onDrag = (e) => {
        if (!this.state.isDragging) return;
        const clientX = e.clientX || e.originalEvent.touches[0].clientX;
        const dx = this.state.lastMouseX - clientX;
        this.state.lastMouseX = clientX;
        
        this.state.rotationY += dx * this.options.rotationSpeed;
        this.$ring.css('transform', `rotateY(${this.state.rotationY}deg)`);
      };

      const endDrag = () => {
        if (!this.state.isDragging) return;
        this.state.isDragging = false;
        this.$ring.css('cursor', 'grab');
        this.$slides.css('cursor', 'grab');
      };

      // Obsługa myszy i dotyku dla ringa
      this.$ring
        .css('cursor', 'grab')
        .on('mousedown touchstart', startDrag);

      // Obsługa myszy i dotyku dla slajdów
      this.$slides
        .css('cursor', 'grab')
        .on('mousedown touchstart', startDrag);

      // Globalne handlery dla przeciągania
      $(document)
        .on('mousemove touchmove', onDrag)
        .on('mouseup touchend mouseleave', endDrag);
    }

    init() {
      const tl = gsap.timeline();
      tl.set(this.$slider.find('.dragger'), { opacity: 0 })
        .set(this.$ring, { rotationY: this.state.rotationY })
        .add(() => {
          this.updateSliderParameters();
          this.initializeVideos();
        })
        .from(this.$slides, {
          duration: 1.5,
          y: 200,
          opacity: 0,
          stagger: 0.1,
          ease: 'expo'
        });

      this.initDragging();

      // Event listeners
      this.$slider.find('.panorama-slider-gsap__arrow--prev').on('click', () => this.rotateSlider('prev'));
      this.$slider.find('.panorama-slider-gsap__arrow--next').on('click', () => this.rotateSlider('next'));

      // Keyboard navigation
      $(document).on('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.rotateSlider('prev');
        if (e.key === 'ArrowRight') this.rotateSlider('next');
      });

      // Responsive handling
      let resizeTimeout;
      $(window).on('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.updateSliderParameters(), 100);
      });
    }
  }

  // jQuery plugin definition
  $.fn.panoramaSliderGsap = function(options) {
    return this.each(function() {
      if (!$.data(this, 'panoramaSliderGsap')) {
        $.data(this, 'panoramaSliderGsap', new PanoramaSliderGsap(this, options));
      }
    });
  };
})(jQuery);

// Inicjalizacja
$(document).ready(function() {
  $('.panorama-slider-gsap').panoramaSliderGsap();
});