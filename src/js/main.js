(function () {
  'use strict';

  //Store reference to HTML
  var html = document.documentElement;
  var AC = {
    start: function () {
      //Go on and set up website
      AC.setUpSite();
    },

    setUpSite: function () {
      //Set html replace html no-js with js class
      html.className = document.documentElement.className.replace(
        'no-js',
        'js'
      );

      AC.initializeCloseOffCanvasMenu();
      AC.initializePlaceholdersFallback();
      AC.initializeSmoothScroll();
      AC.initializeContactForm();
    },

    initializeCloseOffCanvasMenu: function () {
      var button = document.getElementById('offcanvas-close');
      button.onclick = function (e) {
        e.preventDefault();
        AC.closeOffCanvasMenu();
      };
    },

    initializeSmoothScroll: function () {
      //https://github.com/cferdinandi/smooth-scroll
      new SmoothScroll('a[data-scroll]', {
        updateURL: false,
        emitEvents: true,
        speed: 150,
        easing: 'easeInOutCubic',
      });

      document.addEventListener('scrollStart', AC.closeOffCanvasMenu, false);
    },

    closeOffCanvasMenu: function (event) {
      location.hash = '';
      history.replaceState('', document.title, window.location.pathname);
    },

    initializePlaceholdersFallback: function () {
      if (!AC.supportsPlaceholders()) {
        html.className += ' no-placeholder';
      }
    },

    supportsPlaceholders: function () {
      //see: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/forms/placeholder.js
      return (
        'placeholder' in document.createElement('input') &&
        'placeholder' in document.createElement('textarea')
      );
    },

    initializeContactForm: function () {
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
      formName.addEventListener('blur', function () {
        AC.validateField(this);
      });

      formEmail.addEventListener('blur', function () {
        AC.validateField(this);
      });

      formMessage.addEventListener('blur', function () {
        AC.validateField(this);
      });

      /* On form submit... */
      formSubmit.addEventListener('click', function (e) {
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
          //Disabled all text fields
          formName.setAttribute('disabled', true);
          formMail.setAttribute('disabled', true);
          formMessage.setAttribute('disabled', true);

          //Cancel the submit button default behaviours
          formSubmit.setAttribute('disabled', true);
          formSubmit.setAttribute('value', msg.sending);

          //Show the loading spinner
          formSpinner.style.opacity = 1;

          var data = {
            name: formName.value,
            mail: formMail.value,
            email: formEmail.value,
            message: formMessage.value,
          };

          fetch('/.netlify/functions/send-message', {
            body: JSON.stringify(data),
            method: 'POST',
          })
            .then(function (response) {
              if (!response.ok) {
                throw response;
              }
            })
            .then(function () {
              formSubmit.setAttribute('value', msg.thanks);
            })
            .catch(function (err) {
              formAlert.innerHTML = msg.please_retry;
              formSubmit.setAttribute('value', msg.retry);
            })
            .finally(function () {
              formSpinner.style.opacity = 0;
            });
        } // end if Validation
      });
    },

    validateField: function (field) {
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
