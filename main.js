// Panorama Slider Plugin
(function($) {
  'use strict';

  class PanoramaSlider {
    constructor(element, options) {
      this.$slider = $(element);
      this.$ring = this.$slider.find('.ring');
      this.$videos = this.$slider.find('.ring__video');
      
      this.options = $.extend({
        baseWidth: 1930,
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
      
      gsap.set(this.$slider.find('.panorama-slider__container'), {
        perspective: values.perspective
      });

      gsap.set(this.$videos, {
        width: values.videoWidth,
        height: values.videoHeight,
        rotateY: (i) => i * -45,
        transformOrigin: `50% 50% ${values.zDistance}px`,
        z: -values.zDistance,
        backfaceVisibility: 'hidden'
      });
    }

    initializeVideos() {
      this.$videos.each((index, video) => {
        const $video = $(video);
        const $source = $video.find('source');
        
        $source.attr('src', $source.data('src'));
        $video.attr('poster', $video.data('poster'));
        video.load();
        
        $video.on('error', () => {
          console.error('Error loading video:', index);
        });
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
      this.$ring
        .css('cursor', 'grab')
        .on('mousedown touchstart', (e) => {
          e.preventDefault();
          this.state.isDragging = true;
          this.state.lastMouseX = e.clientX || e.originalEvent.touches[0].clientX;
          this.state.rotationY = parseFloat(this.$ring.css('transform').split(',')[0].slice(7)) || this.state.rotationY;
          this.$ring.css('cursor', 'grabbing');
        });

      $(document)
        .on('mousemove touchmove', (e) => {
          if (!this.state.isDragging) return;
          const clientX = e.clientX || e.originalEvent.touches[0].clientX;
          const dx = this.state.lastMouseX - clientX;
          this.state.lastMouseX = clientX;
          
          this.state.rotationY += dx * this.options.rotationSpeed;
          this.$ring.css('transform', `rotateY(${this.state.rotationY}deg)`);
        })
        .on('mouseup touchend mouseleave', () => {
          if (!this.state.isDragging) return;
          this.state.isDragging = false;
          this.$ring.css('cursor', 'grab');
        });
    }

    init() {
      const tl = gsap.timeline();
      tl.set(this.$slider.find('.dragger'), { opacity: 0 })
        .set(this.$ring, { rotationY: this.state.rotationY })
        .add(() => {
          this.updateSliderParameters();
          this.initializeVideos();
        })
        .from(this.$videos, {
          duration: 1.5,
          y: 200,
          opacity: 0,
          stagger: 0.1,
          ease: 'expo'
        });

      this.initDragging();

      // Event listeners
      this.$slider.find('.panorama-slider__arrow--prev').on('click', () => this.rotateSlider('prev'));
      this.$slider.find('.panorama-slider__arrow--next').on('click', () => this.rotateSlider('next'));

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
  $.fn.panoramaSlider = function(options) {
    return this.each(function() {
      if (!$.data(this, 'panoramaSlider')) {
        $.data(this, 'panoramaSlider', new PanoramaSlider(this, options));
      }
    });
  };
})(jQuery);

// Inicjalizacja
$(document).ready(function() {
  $('.panorama-slider').panoramaSlider();
});