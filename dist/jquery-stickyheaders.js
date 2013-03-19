/*! jQuery stickyHeaders - v0.1.0 - 2013-03-15
* https://github.com/TheWebShop/jquery-stickyheaders
* Copyright (c) 2013 Kevin Attfield; Licensed MIT */
(function($) {

  // Collection method.
  $.fn.stickyHeaders = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.stickyHeaders = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.stickyHeaders.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.stickyHeaders.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].stickyHeaders = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
