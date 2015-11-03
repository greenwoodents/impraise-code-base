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
   * Alowing download images on desktop.
   */
  resizeMe.checkMobileImages = function() {
    if (!(mq.matches)) {
      [].forEach.call(document.querySelectorAll('.checkImages'), function(el,i,a) {
        var img = el.getAttribute('data-image-url');
        if( img !== null){
          el.setAttribute('style', 'background-image: url('+ img +');');
          el.removeAttribute('data-image-url');
        }
      });
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

   /**
   * Initializing some scripts after page load
   */
   function afterLoad() {
     readerLine();
     slideshow();
   };

  window.addEventListener('load', afterLoad);


 /**
  * scroll and resize events
  */





  function infiniteScroll(parent, post) {
    // Set some variables. We'll use all these later.
    var postIndex = 1,
        execute = true,
        stuffBottom = Y.one(parent).get('clientHeight') + Y.one(parent).getY(),
        urlQuery = window.location.pathname,
        postNumber = Static.SQUARESPACE_CONTEXT.collection.itemCount,
        presentNumber = Y.all(post).size();

    scrollMe.infinite = function() {
      if(document.querySelector('.js-blog')){
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
    if(document.querySelector('.footer') === null) {
      return false;
    }
    var winHeight = window.innerHeight,
        docHeight = document.body.clientHeight,
        footer = document.querySelector('.footer').offsetHeight,
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



  [].forEach.call(document.querySelectorAll('.js-video'), function(el,i,a) {
    var inject = document.querySelector('.overlays');
    el.addEventListener('click', function(){
      inject.innerHTML  =     '<div class="overlay">'+
                                '<div class="overlay_close"><svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M14 1.41L12.59 0 7 5.59 1.41 0 0 1.41 5.59 7 0 12.59 1.41 14 7 8.41 12.59 14 14 12.59 8.41 7 14 1.41z" fill="#FFF" fill-rule="evenodd"/></svg></div>'+
                                '<div class="overlay_container">'+
                                  '<iframe id="s9zzxkFbr8A-placeholder" frameborder="0" allowfullscreen="1" title="YouTube video player" width="1000" height="562" src="https://www.youtube.com/embed/s9zzxkFbr8A?autoplay=1&amp;rel=0&amp;showinfo=0&amp;theme=light&amp;color=white&amp;enablejsapi=1&amp;origin=https%3A%2F%2Fwww.impraise.com"></iframe>'+
                                '</div>'+
                              '</div>'

      var close = document.querySelector('.overlay_close');

     close.addEventListener('click', function(){
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
    Email Sender for modal
  */
  // (function() {
  //   var form, inputs , sendButton, web;

  //   var init = function() {
  //     form = document.querySelector('.modal_schedule_demo_main_form'),
  //     inputs = form.querySelectorAll('input'),
  //     sendButton = form.querySelector('.action-button'),
  //     web = document.location.origin;

  //     if (sendButton) {
  //       //Send listener
  //       sendButton.addEventListener('click', function(e) {
  //         e.preventDefault();
  //         sendEmail();
  //       }, false);
  //     };
  //   };

  //   var isValidEmail = function(email) {
  //     var expr = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  //     return expr.test(email);
  //   };

  //   var escapeHtml = function(str) {
  //     var div = document.createElement('div');
  //     div.appendChild(document.createTextNode(str));
  //     return div.innerHTML;
  //   };


  //   var constructEmail = function(data) {
  //     var html = "<h2>"+ escapeHtml(data.name) +
  //                " Want to scheadule a demo.</h2>" +
  //                "<p>Information:</p>" +
  //                "<ul>"+
  //                "<li>Name: "+ escapeHtml(data.name) +"</li>" +
  //                "<li>Email: "+ escapeHtml(data.contact) +"</li>" +
  //                "<li>Phone: "+ escapeHtml(data.phone) +"</li>" +
  //                "<li>Organization: "+ escapeHtml(data.organization) +"</li>" +
  //                "</ul>"+
  //                "<p>Message:<br>"+ escapeHtml(data.message) +
  //                "</p><p style='font-size: 10px;color: grey;margin-top: 30px;display: block;'>Sended from "+
  //                escapeHtml(web) +"</p>";
  //                console.log(html);
  //     var text =
  //     {
  //       "key": "XTxJRVNYRCrJMh-n_8Ga2g",
  //       "message": {
  //         "html": html,
  //         "text": "Schedule a demo request",
  //         "subject": "Schedule a demo request",
  //         "from_email": data.contact,
  //         "from_name": data.name,
  //         "to": [
  //             {
  //                 "email": "support@impraise.com",
  //                 "name": "Support at Impraise",
  //                 "type": "to"
  //             }
  //         ],
  //         "headers": {
  //             "Reply-To": data.contact
  //         },
  //         "important": false,
  //         "track_opens": null,
  //         "track_clicks": null,
  //         "auto_text": null,
  //         "auto_html": null,
  //         "inline_css": null,
  //         "url_strip_qs": null,
  //         "preserve_recipients": null,
  //         "view_content_link": null,
  //         "tracking_domain": null,
  //         "signing_domain": null,
  //         "return_path_domain": null,
  //         "merge": true,
  //         "merge_language": "mailchimp"
  //       },
  //       "async": false,
  //       "ip_pool": "Main Pool"
  //     };

  //     return text;
  //   }

  //   var sendEmail = function() {
  //     var stop = false;
  //     var data = {};
  //     var sended = false;

  //     if(sended === true){
  //       return false;
  //     }

  //     [].forEach.call(inputs, function(input, i, array) {
  //       input.addEventListener('focus', function(event) {
  //        event.target.parentNode.classList.remove('is-invalid');
  //       });
  //     });

  //     [].forEach.call(inputs, function(input, i, array) {
  //       parent = input.parentNode;
  //       parent.classList.remove('is-ok');
  //       parent.classList.remove('is-invalid');

  //       if(input.value == '') {
  //         parent.classList.add('is-invalid');
  //         stop = true;

  //       } else {
  //         if (input.name === "contact") {
  //           if (isValidEmail(input.value) === false ) {
  //             parent.classList.add('is-invalid');
  //             stop = true;
  //           } else {
  //             parent.classList.add('is-ok');
  //             data[input.name] = input.value;
  //           }
  //         } else if (input.name) {
  //           parent.classList.add('is-ok');
  //           data[input.name] = input.value;
  //         }
  //       }
  //     });

  //     var text = constructEmail(data);
  //     var btn = document.querySelector('.js-form-button');
  //     // construct an HTTP request
  //     var xhr = new XMLHttpRequest();
  //     xhr.open('POST', 'https://mandrillapp.com/api/1.0/messages/send.json', true);
  //     xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

  //     xhr.onreadystatechange = function() {
  //       console.log(xhr);
  //       if (xhr.readyState==4 && xhr.status==200) {
  //         btn.classList.remove('loading');
  //         btn.classList.add('done');
  //         sended = true;
  //       }
  //     }
  //     // send the collected data as JSON
  //     if (!(stop)) {
  //       console.log('sending');
  //       console.log(text);
  //       xhr.send(JSON.stringify(text));
  //       btn.classList.add('loading');
  //     }
  //   }
  //   init();
  // })();
  //
  //

  /*
    Share buttons affix
  */
  scrollMe.affix = function() {
    var jsAboutUsNav = document.querySelector('.social_block');
    var hp = document.querySelector('.homepage');

    if(mq.matches){
      jsAboutUsNav.style.cssText = null;
    }

    if(jsAboutUsNav == undefined || hp == true || mq.matches){
      return false
    }

    var footer = document.querySelector('.email_signup'),
        elStyle = jsAboutUsNav.style,
        scrollTop = window.pageYOffset,
        a = scrollTop - document.querySelector('.article_header').offsetHeight,
        b = scrollTop - document.querySelector('.post_body_content').offsetHeight - 375;


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
      var position = positioned;

      if(slide > 0){
        position = (widthOfScreen * slide) * -1;
      } else {
        position = 0;
      }

      wrap.style.transform = 'translateX('+ position +'px)';
      wrap.style.webkitTransform  = 'translateX('+ position +'px)';
      displayed = slide;

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
      el.querySelector('.total_save .price').innerHTML = ( (((price * 12) * numUsers) - totalYearly) * ratio[activeRatio] ).toFixed(0);

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
          document.querySelector('.us-adress').classList.add('hide');
          document.querySelector('.eu-adress').classList.remove('hide');
        }
      });
    };

    getState();
  }
  personalisedAdress()


  console.log(pressMe);

}());
