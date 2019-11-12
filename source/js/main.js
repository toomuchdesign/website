(function() {
  'use strict';

  //Store reference to HTML
  var html = document.documentElement;
  var AC = {
    start: function() {
      //Go on and set up website
      AC.setUpSite();
    },

    setUpSite: function() {
      //Set html replace html no-js with js class
      html.className = document.documentElement.className.replace(
        'no-js',
        'js'
      );

      AC.initializePlaceholdersFallback();
      AC.initializeSmoothScroll();
      AC.initializeContactForm();
    },

    initializeSmoothScroll: function() {
      //https://github.com/cferdinandi/smooth-scroll
      new SmoothScroll('a[data-scroll]', {
        updateURL: false,
        emitEvents: true,
        speed: 150,
        easing: 'easeInOutCubic',
      });

      document.addEventListener('scrollStart', AC.closeOffCanvasMenu, false);
    },

    closeOffCanvasMenu: function(event) {
      location.hash = event.detail.toggle.hash;
    },

    initializePlaceholdersFallback: function() {
      if (!AC.supportsPlaceholders()) {
        html.className += ' no-placeholder';
      }
    },

    supportsPlaceholders: function() {
      //see: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/forms/placeholder.js
      return (
        'placeholder' in document.createElement('input') &&
        'placeholder' in document.createElement('textarea')
      );
    },

    initializeContactForm: function() {
      /*Messages set*/
      var msg = {
          sending: 'Sending...',
          thanks: 'Thank you',
          retry: 'Ups. Try again, please.',
          please_retry: 'Please, try again.',
          server_problems: 'The server us taking too Long to Respond.',
        },
        formName = document.getElementById('name'),
        formEmail = document.getElementById('email'),
        formMessage = document.getElementById('message'),
        formSubmit = document.getElementById('submit'),
        formMail = document.getElementById('mail'), //formMail is just a honeypot
        formAlert = document.getElementById('form-alert'),
        formSpinner = document.getElementById('form-spinner');

      /* on Blur: Validate and return true/false */
      formName.addEventListener('blur', function() {
        AC.validateField(this);
      });

      formEmail.addEventListener('blur', function() {
        AC.validateField(this);
      });

      formMessage.addEventListener('blur', function() {
        AC.validateField(this);
      });

      /* On form submit... */
      formSubmit.addEventListener('click', function(e) {
        //stop the form from being submitted
        e.preventDefault();

        var validation = true;

        //Trigger complete form validation
        validation =
          validation *
          AC.validateField(formName) *
          AC.validateField(formEmail) *
          AC.validateField(formMessage);

        if (validation && !formMail.value) {
          //Organize the data properly
          var data =
            'name=' +
            encodeURIComponent(formName.value) +
            '&mail=' +
            encodeURIComponent(formMail.value) +
            '&email=' +
            encodeURIComponent(formEmail.value) +
            '&message=' +
            encodeURIComponent(formMessage.value) +
            '&ajx=1'; //Ajax flag for server processing

          //Disabled all text fields
          formName.setAttribute('disabled', true);
          formMail.setAttribute('disabled', true);
          formMessage.setAttribute('disabled', true);

          //Cancel the submit button default behaviours
          formSubmit.setAttribute('disabled', true);
          formSubmit.setAttribute('value', msg.sending);

          //Show the loading spinner
          formSpinner.style.opacity = 1;

          //Start the ajax request
          var request = new XMLHttpRequest();
          request.open('GET', 'scripts/contactmail.php?' + data, true);

          request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
              // Ajax Success!

              //Check server response status
              //console.log(request.responseText);
              var resp = JSON.parse(request.responseText);
              //console.log(resp);

              if (resp.sent === 1) {
                formSubmit.setAttribute('value', msg.thanks);
              } else {
                formAlert.innerHTML = resp.msg;
                formSubmit.setAttribute('value', msg.retry);
              }
            } else {
              // We reached our target server, but it returned an error
              formAlert.innerHTML = msg.please_retry;
              formSubmit.setAttribute('value', msg.retry);
            }
            formSpinner.style.opacity = 0;
          };

          request.onerror = function() {
            //There was a connection error of some sort
            formAlert.innerHTML = msg.please_retry;
            formSubmit.setAttribute('value', msg.retry);
            formSpinner.style.opacity = 0;
          };

          //console.log( 'Sending' );
          //console.log( data );
          request.send();
        } // end if Validation
      });
    },

    validateField: function(field) {
      if (field.id === 'email') {
        //Regex again email format
        if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i.test(field.value)) {
          field.previousElementSibling.style.opacity = 0;
          return true;
        }
      }

      if (field.id === 'name' || field.id === 'message') {
        //Regex again empty spaces
        if (field.value && !/^\s*$/.test(field.value)) {
          field.previousElementSibling.style.opacity = 0;
          return true;
        }
      }

      //Make validation fail by default
      field.previousElementSibling.style.opacity = 1;
      return false;
    },
  }; //End AC

  AC.start();
})();
