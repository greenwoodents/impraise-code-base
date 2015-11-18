(function () {
  /**
   * When set to true, you get helpful console logs.
   * @const DEBUG
   */
  var DEBUG = false;

  var scrollMe = {};
  var resizeMe = {};
  var pressMe = {};
  var mq = window.matchMedia( "(max-width: 720px)" );


  function runMethods(obj,e) {
    for (var key in obj) {
     if (obj.hasOwnProperty(key)) {
        obj[key].call();
      }
    }
  };

  function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
  }


  /**
   * Adding listeners form scroll and resize
   */
  window.addEventListener('scroll', function(e){ runMethods(scrollMe);});
  window.addEventListener('touchmove', function(e){ runMethods(scrollMe);});
  window.addEventListener('resize', function(e){ runMethods(resizeMe,e);});
  window.addEventListener("keyup", function(e){ if(e.keyCode == 27) { runMethods(pressMe,e) }}, false);

  /**
   * removing fouc hide class from body to prevent flash of unstyled content.
   */
  //document.querySelector('body').classList.remove('fouc');


  /**
   * Alowing download images on desktop and mobile depending on chosen class chekImages for mobile and lazyImage for everything.
   */
  resizeMe.checkMobileImages = function() {
    if (!(mq.matches)) {
      [].forEach.call(document.querySelectorAll('.checkImages'), function(el,i,a) {
        loadImage(el);
      });
    }

    [].forEach.call(document.querySelectorAll('.lazyImage'), function(el,i,a) {
      loadImage(el);
    });

    function loadImage(el) {
      var img = el.getAttribute('data-image-url');
      if( img !== null){
        el.setAttribute('style', 'background-image: url('+ img +');');
        el.removeAttribute('data-image-url');
      }
    }
  };
  resizeMe.checkMobileImages();


  /**
   * Run ImageLoader on resize so images on the page get refreshed.
   * @method refreshImages of resizeMe delegator
   * @private
   */

  resizeMe.refreshImages = function() {
    var images = document.querySelectorAll('img[data-src]');

    for (var i = 0; i < images.length; i++) {
      ImageLoader.load(images[i]);
    }
  };
  resizeMe.refreshImages();

   /**
   * Initializing some scripts after page load
   */
   function afterLoad() {
     readerLine();
     slideshow();
     socialCounting();
   };

  window.addEventListener('load', afterLoad);


 /**
  * scroll and resize events
  */
  function infiniteScroll(parent, post) {
    if(!(document.querySelector('.js-blog'))){
      return;
    }
    // Set some variables. We'll use all these later.
    var postIndex = 1,
        execute = true,
        stuffBottom = Y.one(parent).get('clientHeight') + Y.one(parent).getY(),
        urlQuery = window.location.pathname,
        postNumber = Static.SQUARESPACE_CONTEXT.collection.itemCount,
        presentNumber = Y.all(post).size();

    scrollMe.infinite = function() {
      if(!(document.querySelector('.js-blog'))){
        return;
      }

      if (presentNumber >= postNumber && execute === true) {
        Y.one(parent).append('<h1>There are no more posts.</h1>')
        execute = false;
      } else {
        // A few more variables.
        var spaceHeight = document.documentElement.clientHeight + window.scrollY,
        next = false;
        /*
            This if statement measures if the distance from
            the top of the page to the bottom of the content
            is less than the scrollY position. If it is,
            it's sets next to true.
        */
        if (stuffBottom - 1600 <= spaceHeight && execute === true) {
          next = true;
        }
        if (next === true) {
          /*
              Immediately set execute back to false.
              This prevents the scroll listener from
              firing too often.
          */
          execute = false;
          // Increment the post index.
          postIndex++;
          // Make the Ajax request.
          Y.io(urlQuery + '?page=' + postIndex, {
            on: {
                success: function (x, o) {
                    try {
                      var d = Y.DOM.create(o.responseText);
                    } catch (e) {
                      console.log("JSON Parse failed!");
                      return;
                    }

                    // Append the contents of the next page to this page.
                    Y.one(parent).append(Y.Selector.query(parent, d, true).innerHTML);

                    // Reset some variables.
                    stuffBottom = Y.one(parent).get('clientHeight') + Y.one(parent).getY();
                    presentNumber = Y.all(post).size();
                    execute = true;
                    resizeMe.checkMobileImages();
                }
            }
          });
        }
      }
    };
  };
  // Call the function on domready.
  Y.use('node', function() {
    Y.on('domready', function() {
      infiniteScroll('.homepage','.article-list_item');
    });
  });



  /*
    reader line
  */
  function readerLine() {
    if(!(document.querySelector('.js-footer') && document.querySelector('PROGRESS'))) {
      return false;
    }
    var winHeight = window.innerHeight,
        docHeight = document.body.clientHeight,
        footer = document.querySelector('.js-footer').offsetHeight,
        progressBar = document.querySelector('PROGRESS'),
        max, value;
    /* Set the max scrollable area */
    max = docHeight - winHeight - footer;
    progressBar.setAttribute('max', max);

    scrollMe.readerLine = function() {
      value = window.pageYOffset;
      progressBar.setAttribute('value', value);
    };
  };

  /*
    Menu open listener
  */
  var site = document.querySelector('.site');
  site.addEventListener('click', function(e){
    var body = document.body;
    if( body.classList.contains('side_menu_open') && e.target.nodeName === 'DIV'){
      document.body.classList.toggle('side_menu_open');
    }
  });

  [].forEach.call(document.querySelectorAll('.header_navigation_more > p'), function(el,i,a) {
    var header = document.querySelector('.header');
    el.addEventListener('click', function(){
      header.classList.toggle('active-navigation');
    });
  });

  [].forEach.call(document.querySelectorAll('.js-more-open'), function(el,i,a) {
    var body = document.body;
    el.addEventListener('click', function(){
      body.classList.toggle('side_menu_open');
    });

    var closeSideMenu = document.querySelector('.side_menu .overlay_close ');
    closeSideMenu.addEventListener('click', function() {
      body.classList.toggle('side_menu_open');
    });
  });



  /*
    Modal open listeners
  */
  [].forEach.call(document.querySelectorAll('.js-modal-open-schedule'), function(el,i,a) {
    var modal = document.querySelector('.modal_schedule_demo'),
        close = document.querySelector('.modal_schedule_demo_close'),
        bcg = document.querySelector('.modal_schedule_demo_bcg'),
        body = document.body,

    closeModal = function(){
      body.classList.remove('modal-active');
      modal.classList.remove('visible');
      modal.classList.add('hidden');
    };

    pressMe.closeForm = function(){
      closeModal();
    };

    el.addEventListener('click', function(){
      body.classList.add('modal-active');
      modal.classList.remove('hidden');
      modal.classList.add('visible');

      if (body.classList.contains('side_menu_open')) {
        body.classList.remove('side_menu_open');
      };

      if(mq.matches){
        window.scrollTo(0,0);
      }
    });

    close.addEventListener('click', closeModal);
    bcg.addEventListener('click', closeModal);
  });


  /* Video opener

      Making video overlay from data-video atribute on js-video class.

      Curently supporting players:
      Youtube.com

  */
  [].forEach.call(document.querySelectorAll('.js-video'), function(el,i,a) {
    var inject = document.querySelector('.overlays');
    var url = el.getAttribute('data-video');
    var rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

    var r = url.match(rx);

    if(r === null){
      r = url;
    } else {
      r = r[1];
    }



    el.addEventListener('click', function(){
      inject.innerHTML  =     '<div class="overlay">'+
                                '<div class="overlay_close"><svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M14 1.41L12.59 0 7 5.59 1.41 0 0 1.41 5.59 7 0 12.59 1.41 14 7 8.41 12.59 14 14 12.59 8.41 7 14 1.41z" fill="#FFF" fill-rule="evenodd"/></svg></div>'+
                                '<div class="overlay_container">'+
                                  '<iframe id="s9zzxkFbr8A-placeholder" frameborder="0" allowfullscreen="1" title="YouTube video player" width="1000" height="562" src="https://www.youtube.com/embed/'+r+'?autoplay=1&amp;rel=0&amp;showinfo=0&amp;theme=light&amp;color=white&amp;enablejsapi=1&amp;origin=https%3A%2F%2Fwww.impraise.com"></iframe>'+
                                '</div>'+
                              '</div>'

    var close = document.querySelector('.overlay_close');
    var overlay = document.querySelector('.overlay');

     close.addEventListener('click', function(){
        inject.innerHTML = "";
     });

    overlay.addEventListener('click', function(){
        inject.innerHTML = "";
     });


     pressMe.closeModal = function(e){
       inject.innerHTML = "";
     };
    })
  });


  /*
    Modal verification
   */
  function verification() {
    [].forEach.call(document.querySelectorAll('.modal_schedule_demo_main_form .form-button-wrapper .button'), function(el,i,a) {



      el.addEventListener('click', function(){
        var form = document.querySelector('.form-inner-wrapper form');


        var submiter = function() {
          if(form.classList.contains('submitting')){
            return;
          } else {
            clearInterval(interval);
            checker();
          }
        };

        var interval = setInterval(function(){ submiter(); }, 200);


        function checker() {
          [].forEach.call(document.querySelectorAll('.form-item'), function(el,i,a) {
            var parent = el;
            var input = el.querySelector('.field-element');

            input.addEventListener('focus', function(event) {
              parent.classList.remove('is-invalid');
            });

            parent.classList.remove('is-ok');
            parent.classList.remove('is-invalid');

            if(parent.querySelector('.field-error')){
              parent.classList.add('is-invalid');
            } else {
              parent.classList.add('is-ok');
            }
          });
        }


      })
    });
  };
  verification();


  /*
    Share buttons affix
  */
  scrollMe.affix = function() {
    if (!(document.querySelector('.social_block'))){
      return;
    }
    var jsAboutUsNav = document.querySelector('.social_block');
    var page = document.querySelector('.page');

    if(mq.matches){
      jsAboutUsNav.style.cssText = null;
    }

    if(jsAboutUsNav == undefined || page == true || mq.matches){
      return false
    }

    var footer = document.querySelector('.email_signup'),
        elStyle = jsAboutUsNav.style,
        scrollTop = window.pageYOffset,
        a = scrollTop - document.querySelector('.js-affix-header').offsetHeight,
        b = scrollTop - document.querySelector('.js-affix-body').offsetHeight - 375;

    if(a > 0 && b < 0){
      elStyle.cssText = null;
      elStyle.position = 'fixed';
      elStyle.top = '10%';
    } else {
      if(a < 0){
        elStyle.cssText = null;
        elStyle.position = 'absolute';
        elStyle.top = '0px';
      }
      if(b > 0){
        elStyle.cssText = null;
        elStyle.position = 'absolute';
        elStyle.bottom = '0px';
      }
    };
  };

  /*
    Share buttons counter display.

   */
   function socialCounting() {
    [].forEach.call(document.querySelectorAll('.social_block'), function(el,i,a) {
      Socialcount.all(function (counts) {
        if(counts.twitter > 0){
          el.querySelector('.twitter .count') = counts.twitter;
        }
        if(counts.facebook > 0){
          el.querySelector('.facebook .count') = counts.facebook;
        }
        if(counts.google > 0){
          el.querySelector('.google .count') = counts.google;
        }
        if(counts.linkedin > 0){
          el.querySelector('.linkedin .count') = counts.linkedin;
        }
      });
    });
   };




  /*
    Slideshow
    Run On Load
    object of parameters.


  */
  function slideshow() {
    if(!(document.querySelector('.slideshow_companies'))){
      return;
    }

    var
    buttons = document.querySelectorAll('.slideshow_companies_logo'),
    wrap = document.querySelector('.slideshow_companies_slides_wrap'),
    item = document.querySelectorAll('.slideshow_companies_slide'),
    displayed = 0,
    positioned = 0,
    widthOfScreen = 0,
    widthOfWrap = 0;

    function init() {
      resize();
      /*
        Add Event listeners
      */
      [].forEach.call(buttons, function(el,i,a) {
        el.addEventListener('click', function(){
          if(mq.matches){return};
          display(i);
        })
      });
    }

    /*
      Function for displaying slide number wich is put as first and only argument.
    */
    function display(slide) {
      // var position = positioned;

      // if(slide > 0){
      //   position = (widthOfScreen * slide) * -1;
      // } else {
      //   position = 0;
      // }

      // wrap.style.transform = 'translateX('+ position +'px)';
      // wrap.style.webkitTransform  = 'translateX('+ position +'px)';
      // displayed = slide;
      //
      [].forEach.call(item, function(el,i,a) {
        if(slide === i){
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });

      [].forEach.call(buttons, function(el,i,a) {
        if(i === slide){
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    }

    function resize() {
      widthOfScreen = window.innerWidth;
      widthOfWrap = widthOfScreen * buttons.length;

      if(mq.matches){
        widthOfWrap = widthOfScreen;
        wrap.style.width =  "100%";
        [].forEach.call(item, function(el,i,a) {
          el.style.width = "94%";
        });
      } else {
        wrap.style.width = widthOfWrap + "px";
        [].forEach.call(item, function(el,i,a) {
          el.style.width = widthOfScreen + "px";
        });
      }

      wrap.style.transition = "0ms";
      display(displayed);

      setTimeout(timeout, 200);
      function timeout() {
        wrap.style.transition = "500ms";
      }
    }

    resizeMe.slideshowResize = resize;


    init();
  };

  var Pricing = function() {
    if(!(document.querySelector('.pricing_input'))){
      return;
    }
    var self = this,
    numUsersEl = document.querySelector('.pricing_input'),
    numUsers = 0,
    yearlyDiscount = 10,
    activeRatio = 'usd',
    ratio = {},

    init = function() {
      numUsersEl.addEventListener('keyup', function(argument){
        numUsers = numUsersEl.value;
        reCalculate();
      });

      numUsersEl.focus();

      [].forEach.call(document.querySelectorAll('.pricing_currency_item'), function(el,i,a) {

        var currency = el.getAttribute('data-currency').toString();
        var ration = el.getAttribute('data-ratio');

        ratio[currency] = ration;



        el.addEventListener('click', function(e){
          activeRatio = e.target.getAttribute('data-currency');

          [].forEach.call(document.querySelectorAll('.pricing_currency_item'), function(el,i,a) {
            el.classList.remove('active');
          });
          e.target.classList.add('active');

          [].forEach.call(document.querySelectorAll('.js-currency'), function(el,i,a) {

            var glyph = '';

            switch(activeRatio){
              case 'usd':
                glyph = '$';
                break;
              case 'eur':
                glyph = '€';
                break;
              case 'gbp':
                glyph = '£';
                break;
              default:
                glyph = '$';
                break;
            }

            el.innerHTML = glyph;
          });

          reCalculate();
        });
      });
    },

    reCalculate = function() {
      [].forEach.call(document.querySelectorAll('.pricing_box'), function(el,i,a) {
        if(el.hasAttribute('data-price')){
          calculate(el, el.getAttribute('data-price'));
        }
      });
    },

    calculate = function(el, price) {

      if(numUsers === ''){
        el.classList.add('total-hidden');
      } else {
        el.classList.remove('total-hidden');
      }

      var YearlyUserPaidYearly = 0;
      var monthlyUserPaidYearly = 0;
      var content = el.querySelector('.pricing_box_content');

      switch(price){
        case "4":
          if(numUsers < 161){
            YearlyUserPaidYearly = (price * 12) - ((price * 12) * 0.10);
          } else if(numUsers > 5000) {
            YearlyUserPaidYearly = 14.79;
          } else {
            YearlyUserPaidYearly = 0.0125 * Math.pow(numUsers/100-1,2) - 1.217 * (numUsers/100-1) + 43.9;
          }
        break;
        default:
          if(numUsers < 161){
            YearlyUserPaidYearly = (price * 12) - ((price * 12) * 0.10);
          } else if(numUsers > 5000) {
            YearlyUserPaidYearly = 22.2;
          } else {
            YearlyUserPaidYearly = 0.0188 * Math.pow(numUsers/100-1,2) - 1.8108 * (numUsers/100-1) + 65.889;

          }
        break;
      }

      if(numUsers > 2000){
        enterprise();
      } else {
        clearEnterprise();
      }

      monthlyUserPaidYearly = YearlyUserPaidYearly / 12;
      monthlyUserPaidMonthly = (YearlyUserPaidYearly / 12) * 1.111111;
      totalYearly = YearlyUserPaidYearly * numUsers ;
      totalMonthly = totalYearly * 1.1;

      el.querySelector('.new-price .price').innerHTML = (monthlyUserPaidYearly * ratio[activeRatio]).toFixed(2);
      el.querySelector('.total_price .price').innerHTML = (totalYearly * ratio[activeRatio]).toFixed(0);
      el.querySelector('.total_save .price').innerHTML = '-' + ( (((price * 12) * numUsers) - totalYearly) * ratio[activeRatio] ).toFixed(0);

      content.classList.add('calculated');
      content.classList.add('discount');
    },

    enterprise = function() {
      [].forEach.call(document.querySelectorAll('.pricing_box'), function(el,i,a) {
        if(el.hasAttribute('data-price')){
         el.classList.add('disabled');
        } else if(el.classList.contains('individual_pricing')){
          el.classList.add('active');
        }
      });
    },

    clearEnterprise = function() {
      [].forEach.call(document.querySelectorAll('.pricing_box'), function(el,i,a) {
        if(el.hasAttribute('data-price')){
         el.classList.remove('disabled');
        } else if(el.classList.contains('individual_pricing')){
          el.classList.remove('active');
        }
      });
    };
    init();
  };
  Pricing();

  function personalisedAdress() {
    var state,
    states = ['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FO','FI','FR','DE','GI','GR','HU','IS','IE','IT','LV',
    'LI','LT','LU','MK','MT','MD','MC','NL','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','UA','GB','VA',
    'RS','IM','RS','ME'],

    getState = function(){
      httpGetAsync('http://ipinfo.io/country',function(response) {
        proceed(response);
      });
    },

    proceed = function(resp) {
      [].forEach.call(states, function(s,i,a) {
        if(s.trim() == resp.trim()){
          [].forEach.call(document.querySelectorAll('.us-adress'), function(el,i,a) {
            el.classList.add('hide');
          });

          [].forEach.call(document.querySelectorAll('.eu-adress'), function(el,i,a) {
            el.classList.remove('hide');
          });
        }
      });
    };

    getState();
  }
  personalisedAdress();


  /* Instagram post opening in new tab */
  [].forEach.call(document.querySelectorAll('.instagram_box .image-slide-anchor'), function(el,i,a) {
    el.setAttribute('target', '_blank');
  });

  /* masonry listeners and filter handler. */
  function masonry() {
    if(!(document.querySelector('.masonry'))) {
      return;
    }

    [].forEach.call(document.querySelectorAll('.masonry_selector_item'), function(el,i,a) {
      el.addEventListener('click', function(e){
        var filter = e.target.getAttribute('data-filter');
        document.querySelector('.masonry_selector_title').textContent = e.target.textContent;
        document.querySelector('.masonry_selector').classList.remove('active');

        iso.arrange({ filter: filter });
      })
    });

    document.querySelector('.masonry_selector_title').addEventListener('click', function(e){
      document.querySelector('.masonry_selector').classList.add('active');
    })
  };
  masonry();


  /* Function for checking if is displayed same post in "post in" area */
  [].forEach.call(document.querySelectorAll('.js-check-articles'), function(el,i,a) {
    var id = document.querySelector('.js-check-articles-main').getAttribute('data-item-id');

    if(id){
      var item = document.getElementById(id);

      if(item){
        item.remove();
      }
    }
  });


  /* This function opening description on team member after clicking their name */
  [].forEach.call(document.querySelectorAll('.team_person_description_name'), function(el,i,a) {
    var par = el.parentNode.parentNode;
    el.addEventListener('click', function(e){
      par.classList.toggle('show');
    });
  });
}());
