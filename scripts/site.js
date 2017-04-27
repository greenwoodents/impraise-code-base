/*
  Event function

  For FB pixel are arguments concat.
  Usage. sendEvent('Open','Demo request modal');
*/
function sendEvent(eventCategory, eventAction) {
  var evt = eventCategory + ' ' + eventAction;
  fbq('track', evt);

  ga('send', {
    hitType: 'event',
    eventCategory: eventCategory,
    eventAction: eventAction,
  });
};

var web = (function () {
  'use strict';
  /**
   * When set to true, you get helpful console logs.
   * @const DEBUG
   */
  var scrollMe = {};
  var resizeMe = {};
  var pressMe = {};
  var parts = {};
  var mq = window.matchMedia('(max-width: 720px)');

  function runMethods (obj, e) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key].call(e);
      }
    }
  }

  function httpGetAsync (theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
    }

    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
  }

  /**
   * Initializing some scripts after page load
   */
  function afterLoad() {
    resizeMe.checkMobileImages();
    parts.readerLine();
    parts.slideshow();
    parts.socialCounting();
    parts.ebookCapitalize();
  };





  /**
   * Adding listeners form scroll and resize
   */
  window.addEventListener('scroll', function(e){ runMethods(scrollMe);});
  window.addEventListener('touchmove', function(e){ runMethods(scrollMe);});
  window.addEventListener('resize', function(e){ runMethods(resizeMe,e);});
  window.addEventListener("keyup", function(e){ if(e.keyCode == 27) { runMethods(pressMe,e) }}, false);
  window.addEventListener('load', afterLoad);

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

  var refreshImages = function() {
     var images = document.querySelectorAll('img[data-src]' );
      for (var i = 0; i < images.length; i++) {
        ImageLoader.load(images[i], {load: true});
      }
  };
  resizeMe.refreshImages = refreshImages;
  parts.refreshimages = refreshImages;

  /*
    Share buttons affix
  */
  var affix = function(el, offset) {
    if (!(document.querySelector(el))){
      return;
    }

    var jsAboutUsNav = document.querySelector('.js-affix');
    var page = document.querySelector('.page');

    if(mq.matches){
      jsAboutUsNav.style.cssText = null;
    }

    if(jsAboutUsNav == undefined || page == true || mq.matches){
      return false
    }

    var elStyle = jsAboutUsNav.style,
        scrollTop = window.pageYOffset,
        a = scrollTop - document.querySelector('.js-affix-header').offsetHeight,
        b = scrollTop - document.querySelector('.js-affix-body').offsetHeight + (offset);

    if(a > 0 && b < 0){
      elStyle.cssText = null;
      elStyle.position = 'fixed';
      elStyle.top = '0';
    } else {
      if(a < 0){
        elStyle.cssText = null;
        elStyle.position = 'absolute';
        elStyle.top = '0';
      }
      if(b > 0){
        elStyle.cssText = null;
        elStyle.position = 'absolute';
        elStyle.bottom = '0';
      }
    };
  };

  scrollMe.affixes = function() {
    affix('.social_block',-380);
    affix('.resource-affix', 0);
    affix('.press-affix', 200);
  }


  /**
  * scroll and resize events
  */
  var infiniteScroll = function(parent, post) {
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

  // Infinite scroll call function on domready.
  parts.infiniteScrollInit = function() {
    Y.use('node', function() {
      Y.on('domready', function() {
        infiniteScroll('.homepage','.article-list_item');
      });
    });
  };

  /*
    reader line
  */
  parts.readerLine = function() {
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
    Modal verification
   */
  parts.verification = function() {
    [].forEach.call(document.querySelectorAll('.modal_schedule_demo_main_form .form-button-wrapper .button'), function(el,i,a) {

      el.addEventListener('click', function(){
        var form = el.parentNode.parentNode;

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
          var invalid = 0;

          [].forEach.call(form.querySelectorAll('.form-item'), function(el,i,a) {
            var parent = el;
            var input = el.querySelector('.field-element');

            if (input) {
              input.addEventListener('focus', function(event) {
                parent.classList.remove('is-invalid');
              });
            }

            parent.classList.remove('is-ok');
            parent.classList.remove('is-invalid');

            if(parent.querySelector('.field-error')){
              parent.classList.add('is-invalid');
              invalid++;
            } else {
              parent.classList.add('is-ok');
            }
          });

          if(invalid === 0){
            if (document.querySelector('.js-resource-list')) {

            setTimeout(function(){
              window.location.href = window.location.href;
             }, 1000);
            }
            sendEvent('Submited','Demo request modal');
            return true;
          }
        }


      })
    });
  };

//modification of ebook form
parts.ebookCapitalize = function() {
  [].forEach.call(document.querySelectorAll('#ebook_modal .field-element'), function(el,i,a) {
    el.addEventListener('keyup', function(e){

      var val = e.target.value;
      var head = val.substring(0,1);
      var tail = val.substring(1,val.length);

      if (head == head.toLowerCase()) {
        e.target.value = head.toUpperCase()  + tail;
      }
    });
  });
};

  /*
    Share buttons counter display.
   */
  parts.socialCounting = function() {
    [].forEach.call(document.querySelectorAll('.social_block'), function(el,i,a) {
      if (typeof Socialcount !== 'undefined') {
        Socialcount.all(function (counts) {
          if(counts.facebook > 0){
            el.querySelector('.facebook .count').innerHTML = counts.facebook;
          }
          if(counts.google > 0){
            el.querySelector('.google .count').innerHTML = counts.google;
          }
          if(counts.linkedin > 0){
            el.querySelector('.linkedin .count').innerHTML = counts.linkedin;
          }
        });
      }

    });
  };

  /*
    Slideshow
    Run On Load
  */
  parts.slideshow = function() {
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

  parts.Pricing = function() {
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

  parts.personalisedAdress = function() {
    var state,
    states = ['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FO','FI','FR','DE','GI','GR','HU','IS','IE','IT','LV',
    'LI','LT','LU','MK','MT','MD','MC','NL','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','UA','GB','VA',
    'RS','IM','RS','ME'],

    getState = function(){
      httpGetAsync('https://freegeoip.net/json/',function(response) {
        proceed(JSON.parse(response));
      });
    },

    proceed = function(resp) {
      [].forEach.call(states, function(s,i,a) {
        if(s.trim() == resp['country_code'].trim()){
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
  };

  /*
    masonry listeners and filter handler.
  */
  parts.masonry = function() {
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

  /*
    Menu open listener
  */
  parts.menuopen = function() {
    var site = document.querySelector('.site');
    site.addEventListener('click', function(e){
      var body = document.body;
      if( body.classList.contains('side_menu_open') && e.target.nodeName === 'DIV'){
        document.body.classList.toggle('side_menu_open');
      }

      if(document.querySelector('.masonry_selector')){
        var selector = document.querySelector('.masonry_selector');
        if( selector.classList.contains('active') && e.target.classList != 'masonry_selector_title'){
          selector.classList.remove('active')
        }
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
  };

  /*
    Modal open listeners
  */
  var modalOpen = function(id) {

    if(document.querySelector(id) === null){
      return;
    }

    var modal = document.querySelector(id),
        close = document.querySelector(id + ' ' +'.modal_schedule_demo_close'),
        bcg = document.querySelector(id + ' ' +'.modal_schedule_demo_bcg'),
        body = document.body;


    var closeModal = function(e){
      body.classList.remove('modal-active');
      modal.classList.remove('visible');
      modal.classList.add('hidden');

    };

    pressMe.closeForm = function(e){
      try { event.stopImmediatePropagation(); } catch (err) { console.log(err); }
      closeModal();
    };

    if (close) {
      close.addEventListener('click', function(e){closeModal(e)});
    }

    if (bcg) {
      bcg.addEventListener('click', closeModal);
    }

  };

  parts.modalOpeners = function(){
    modalOpen('#demo_modal');
    modalOpen('#ebook_modal');
    modalOpen('#white-papers_modal');

    //Buttons listeners
    [].forEach.call(document.querySelectorAll('.js-modal-open-schedule'), function(el,i,a) {
      var id;

      if(el.getAttribute('modal')) {
        id = el.getAttribute('modal');
      } else {
        id = '#demo_modal';
      }

      var modal = document.querySelector(id),
          close = document.querySelector( id + ' ' +'.modal_schedule_demo_close'),
          bcg = document.querySelector( id + ' ' +'.modal_schedule_demo_bcg'),
          firstInput = document.querySelector( id + ' ' +'input'),
          body = document.body;

      el.addEventListener('click', function(){

        if(this.getAttribute('modal') === "#ebook_modal" || this.getAttribute('modal') === "#white-papers_modal"){
          var title = el.parentNode.querySelector('.js-ebook-title');
          if (title === null) {
            title = document.title.split('—')[0];
          } else {
            title = title.innerText;
          }

          [].forEach.call(document.querySelectorAll('input[name="SQF_BOOK"]'), function(el,i,a) {
            el.value = title;
          })
        }

        body.classList.add('modal-active');
        modal.classList.remove('hidden');
        modal.classList.add('visible');

        if (body.classList.contains('side_menu_open')) {
          body.classList.remove('side_menu_open');
        };

        if(mq.matches){
          window.scrollTo(0,0);
        }

        setTimeout(function(){
          firstInput.focus();

          if (modal.querySelector('[placeholder="+1 (111) 123-4567"]')) {
            modal.querySelector('[placeholder="+1 (111) 123-4567"]').addEventListener('keyup',function(e){
              var val = e.target.value;
              if (val.indexOf('+') === 0) {
                e.target.value = "'" + val ;
              }

              console.log(e.target.value);

            });
          }

        }, 1000)

      });

    });

    if (document.querySelector('.modal_schedule_landingPage')) {
      [].forEach.call(document.querySelectorAll('input[name="SQF_BOOK"]'), function(el,i,a) {
        el.value = document.title.split('—')[0];
      })
    }


  };

  /*
    Video opener

    Making video overlay from data-video atribute on js-video class.

    Curently supporting players:
    Youtube.com
  */
  parts.videoopen = function() {
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
                                  '<div class="overlay_container">'+
                                    '<div class="overlay_close"><svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M14 1.41L12.59 0 7 5.59 1.41 0 0 1.41 5.59 7 0 12.59 1.41 14 7 8.41 12.59 14 14 12.59 8.41 7 14 1.41z" fill="#FFF" fill-rule="evenodd"/></svg></div>'+
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
  };

  /* Instagram post opening in new tab */
  parts.instagram = function() {
    [].forEach.call(document.querySelectorAll('.instagram_box .image-slide-anchor'), function(el,i,a) {
      el.setAttribute('target', '_blank');
    });
  };

  /* Function for checking if is displayed same post in "post in" area */
  parts.samepost = function() {
    [].forEach.call(document.querySelectorAll('.js-check-articles'), function(el,i,a) {
      var id = document.querySelector('.js-check-articles-main').getAttribute('data-item-id');

      if(id){
        var item = document.getElementById(id);

        if(item){
          item.remove();
        }
      }
    });
  };

  /* This function opening description on team member after clicking their name */
  parts.memberopener = function() {

   [].forEach.call(document.querySelectorAll('.team_person_description_name'), function(el,i,a) {
      var par = el.parentNode.parentNode;
      el.addEventListener('click', function(e){
        par.classList.toggle('show');
      });
    });
  };

  //Procedure for changing year to actual in footer
  parts.footerYear = function() {
    document.querySelector('.js-year').innerHTML = new Date().getFullYear();
  };

  //function for adding click event listener to element to togling a class.
  var opener = function(button, element, classname) {
    var buttonEl = document.querySelector(button);
    var el = document.querySelector(element);

    if(buttonEl == undefined || el == undefined ){
      return;
    }


    buttonEl.addEventListener('click', function(){
      el.classList.toggle(classname);
    });
  };

  parts.openers = function() {
    opener('.js-press-menu-button','.js-press-menu','menu-close');
  };


  //Filtering on resource page
  var FilterMe = (function(){
    var exports = {};
    var items;
    var tag = '';
    var listContainer;
    var _itemsClass;

    var allItems = function(action, itemclass) {
      [].forEach.call(items, function(el,i,a) {
        if(action === "add"){
          el.classList.add(itemclass);
        } else if(action === "remove") {
          el.classList.remove(itemclass);
        }
      });
    };

    // Filter
    // get all items compere the to active tag.
    var filter = function(tag) {
      if (window.pageYOffset > 700) {
        window.scrollTo(0,400);
      }
      //hide all
      allItems('add', 'tag-hidden');

      //show
      [].forEach.call(items, function(el,i,a) {
        var att = el.getAttribute('data-tags') || "";

        if (att.indexOf(',') > 0) {
          att = att.split(',');
          att.forEach(function (item) {
            if(item === tag){
              el.classList.remove('tag-hidden');
            }
          })
        } else if(att === tag){
          el.classList.remove('tag-hidden');
        }
      });
    };


    //construcor
    //display all tags into DIV.
    //Delegeta listener to parent of this DIV.

    var init = function(listClass , itemsClass) {
      _itemsClass = itemsClass;
      listContainer = document.querySelector(listClass);
      items = document.querySelectorAll(itemsClass);
      var tags = [];

      if (items.length === 0 || listContainer === null) {
        return  false;
      }

      //Gather all tags
      [].forEach.call(items, function(el,i,a) {
        var att = el.getAttribute('data-tags') || "";
        if(att.length > 1){

          if (att.indexOf(',') > 0) {
            att = att.split(',');
            att.forEach(function (item) {
              if(tags.indexOf(item,0) === -1){
                tags.push(item);
              }
            })
          } else if(tags.indexOf(att,0) === -1){
            tags.push(att);
          }

        }
      });

      //Create fragment ad append tags to listContainer class
      var fragment = document.createDocumentFragment();
      tags.forEach(function(el){
        var a = document.createElement('a');
        a.setAttribute('data-tag', el)
        a.innerText = el.replace('-', ' ');
        fragment.appendChild(a);
      });
      listContainer.appendChild(fragment);


      listContainer.addEventListener('click', function(e){
        var el = e.target;

        if(el.classList.contains('active')){
          el.classList.remove('active');
          allItems('remove', 'tag-hidden');
          checkEmpty('.resource_items','tag-hidden');
          return;
        }

        [].forEach.call(listContainer.querySelectorAll('a'), function(el,i,a) {
          el.classList.remove('active');
        });

        if(el.classList.contains('active')){
          el.classList.remove('active');
          allItems('remove', 'tag-hidden');
        } else {
          el.classList.add('active');
          filter(el.getAttribute('data-tag'));
        }


        checkEmpty('.js-filter-wrap','tag-hidden');
      })
    };

    //Hide empty
    //check for empty sections and hide them.
    var checkEmpty = function(selectorParent, classOnChildren) {
      var hidden = 0;

      [].forEach.call(document.querySelectorAll(selectorParent), function(el,i,a) {

        el.classList.remove('hidden');

        [].forEach.call(el.querySelectorAll(_itemsClass),function(element,i,a) {
          if(element.classList.contains(classOnChildren)){
            hidden++;
          }
          if (hidden === a.length) {
            el.classList.add('hidden');
          }

        });

        hidden = 0;
      });
    };

    //export functions
    exports.init = init;
    exports.filter = init;

    return exports;
  })();

  parts.resourcepage = function() {
    FilterMe.init('.display-tags', '.js-filter-item');
  }




  runMethods(parts);
  return parts;
}());




function liAuth (){
   IN.User.authorize(function (){
       onLinkedInLoad();
   });
}

// Setup an event listener to make an API call once auth is complete
function onLinkedInLoad() {
  getProfileData();

}

// Handle the successful return from the API call
function onSuccess(data) {
  populateForm("#modal_ebook form",data);
  populateForm("#white-papers_modal form",data);
  populateForm("#modal_schedule_demo_main_form form",data);

}

function populateForm(formSelector, data) {
  var data = data['values'][0];

  var positions = data.positions;
  var positionCount = positions._total;
  var allPositions = "";
  for(var i = 0; i < positionCount; i++) {
    var company = positions.values[i].company.name || "";
    var title = positions.values[i].title || "";
    allPositions += title + " at " + company + ", ";
  }


  [].forEach.call(document.querySelectorAll(formSelector + " label"), function(el) {

    var label = el.innerText.trim().toLowerCase().replace(' ', '-');
    var parent = el.parentNode;
    var input = parent.querySelector('input');

    switch(label){
      case "name":
        input.value = data['firstName'] + " " + data['lastName'];
        break;
      case "email-address":
        input.value = data['emailAddress'];
        break;
      case "position":
        input.value = allPositions;
        break;
      case "role":
        input.value = positions.values[0].title;
        break;
      case "organization":
        input.value = positions.values[0].company.name;
        break;
      default:
        break;
    }
  });

  [].forEach.call(document.querySelectorAll('input[name="SQF_POSITIONS"]'), function(el) {
    el.value = allPositions;
  });

  [].forEach.call(document.querySelectorAll('input[name="SQF_HEADLINE"]'), function(el) {
    el.value = data['headline'];
  });


};

// Handle an error response from the API call
function onError(error) {
  console.log(error);
}

// Use the API call wrapper to request the member's basic profile data
function getProfileData() {
  IN.API.Profile("me").fields("first-name", "last-name", "email-address", "headline", "id", "positions").result(onSuccess).error(onError);
}
