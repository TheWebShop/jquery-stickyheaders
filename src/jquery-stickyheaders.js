/*
 * jquery-stickyheaders
 * https://github.com/TheWebShop/jquery-stickyheaders
 *
 * Copyright (c) 2013 Kevin Attfield
 * Licensed under the MIT license.
 */

 // element.scrollIntoView(alignWithTop);

(function($) {
  var $window = $(window);


  $.stickyHeaders = function() {
    $(function() {
      $('ol, ul').first().stickyHeaders();
    });
  }

  var currentMousePos = { x: -1, y: -1 };
  $(document).mousemove(function(event) {
      currentMousePos.x = event.pageX;
      currentMousePos.y = event.pageY;
  });

  $.stickyHeaders.options = {
    bumpHeight: 100,
    width: 30,
    shouldAddId: true,
    idSeed: 'sticky-header',
    idBase: 1,
    shouldUseLable: true
  };

  $.fn.stickyHeaders = function(options) {
    var options = $.extend({}, $.stickyHeaders.options, options);

    options.marginLeft = -options.width;

    return this.each(function(i, list) {
      var list = new StickyGroup(list, options)
        .style(options);
      // since scrollTop is not ready on document ready, we'll chill out for a second
      setTimeout(function(){
        list.start();
      }, 1000);   
    });
  };

  function StickyGroup(list, options, parent){
    var self = this;
    this.isActive = false;
    this.parent = parent;
    this.options = options;
    this.$list = $(list);
    this.$headers = this.$list.children().children('.sticky-header');
    this.$containers = this.$headers.parent();
    this.$children = this.$containers.children('ol, ul');
    this.$list.data('stickyData', this);

    if(options.shouldAddId) {
      this.id = parent? parent.id + '-' + this.$list.siblings('.sticky-header').text(): options.idSeed;
      this.$headers.each(function(i, header) {
        var $header = $(header);
        var identifier = options.shouldUseLable? $(header).text(): options.idBase + i;
        
        $(header).prop('id', self.id + '-' + identifier);
      });
    }

    this.$children.each(function(i, list) {
      new StickyGroup(list, options, self)
        .style(options);
    });

  }
  StickyGroup.prototype.style = function(options) {
    this.$list
      .addClass('sticky-headers')
      .css({
        listStyle: 'none'
      });

    this.$containers.css({
        position: 'relative',
        marginLeft: options.width
      });

    this.$headers.css({
      position: 'absolute',
      top: 0,
      marginLeft: -options.width
    });
    return this;
  }
  StickyGroup.prototype.unstyle = function() {
    this.$list
      .removeClass('sticky-headers')
      .css({
        listStyle: ''
      });

    this.$containers.css({
        position: '',
        marginLeft: ''
      });

    this.$headers.css({
      position: '',
      top: ''
    });
    return this;
  }
  StickyGroup.prototype.measure = function() {
    this.top = this.$list.offset().top;
    this.bottom = this.top + this.$list.outerHeight();
    return this;
  }
  StickyGroup.prototype.start = function() {
    if (this.isActive) { return this; }
    if (typeof this.top === "undefined") this.measure();
    var self = this;
    var options = this.options;
    var scrollTop = $window.scrollTop() + options.bumpHeight;

    this.isActive = true;
    this.checkChildren(scrollTop);
    //console.log("ON------------->" + this.id)

    self.$containers.each(function(i, li) {
      $container = $(li);
      var top = $container.offset().top;
      var height = $container.outerHeight();
      var bottom = top + height;
      var $header = $container.children('.sticky-header');
      var headerHeight = $header.outerHeight();

      $container.data({
        top: top,
        height: height,
        bottom: bottom,
        '$header': $header,
        headerHeight: headerHeight
      });
    });

    this.repositioner = $.throttle( 100, function reposition(e) {
      var options = self.options;
      var scrollTop = $window.scrollTop() + options.bumpHeight;

      self.$containers.each(function(i, li) {
        $container = $(li);
        var top = $container.data('top');
        var height = $container.data('height');
        var bottom = $container.data('bottom');
        var $header = $container.data('$header');
        var headerHeight = $container.data('headerHeight');
        
        self.checkChildren();

        if (scrollTop <  top) {
          // The container is further down the page
          // Resetting multiple headers in case scrolling as jumped a long way
          self.$headers.slice(i, self.$headers.length + 1).css({
            //border: '1px solid blue',
            position: 'absolute',
            top: 0
          });
          return false;
        }
        else {
          if (scrollTop > top + height - headerHeight) {
            // We've scrolled past the container, header should appear at the bottom
            $header.css({
              //border: '1px solid red',
              position: 'absolute',
              top: height - headerHeight
            });
          }
          else {
            // Scrolled half-way though the container
            self.$fixedheader = $header;
            $header.width( $header.width() );
            $header.css({
              //border: '1px solid yellow',
              position: 'fixed',
              top: options.bumpHeight
            });
          }
        }
      });
    });
    $window.on({
      scroll: this.repositioner,
      resize: this.repositioner
    });
    this.repositioner();
    return this;
  }
  StickyGroup.prototype.stop = function() {
    if (!this.isActive) { return this; }
    if (typeof this.top === "undefined") this.measure();
    var options = this.options;
    var scrollTop = $window.scrollTop() + options.bumpHeight;
    //console.log("OFF============>" + this.id)
    var self = this;
    this.isActive = false;
    this.checkChildren();

    if (scrollTop < this.top) {
      // The container is further down the page
      this.$headers.css({
        //border: '1px solid purple',
        position: 'absolute',
        top: 0
      });
    }else {
      this.$headers.css({
        //border: '1px solid orange',
        position: 'absolute',
        top: 0
      });
    }

    $window.off({
      scroll: this.repositioner,
      resize: this.repositioner
    });
    return this;
  }
  StickyGroup.prototype.checkChildren = function() {
    var options = this.options;
    var scrollTop = $window.scrollTop() + options.bumpHeight;

    this.$children.each(function(i, list) {
      var stickyData = $(list).data('stickyData');
      if (typeof stickyData.top === "undefined") stickyData.measure();
      var isInActiveRegion = scrollTop < stickyData.bottom && scrollTop  > stickyData.top;

      if(isInActiveRegion){
        stickyData.start();
      } else {
        stickyData.stop();
      }
    });
    return this;
  }
  function StickyHeader(header) {
    this.$header = $(header);
    this.$container = this.$header.parent();
  }
})(jQuery);