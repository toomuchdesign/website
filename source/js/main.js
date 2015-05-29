/*jslint browser: true*/
/*global $, console, MBP*/

(function () {
    
    //Avoid accidental global variable declarations
    "use strict";
        
    var AC = {
        
        onReady : function () {
            
            //Go on and set up website
            AC.setUpSite();
        },
        
        setUpSite : function () {
            console.log('AC.setUpSite');

            AC.initializeSmoothScroll();
            AC.initializeLazyLoadingImages();
            AC.initializeContactForm();
        },

        initializeSmoothScroll : function () {

            //https://github.com/cferdinandi/smooth-scroll
            smoothScroll.init();
        },

        initializeLazyLoadingImages : function () {

            //https://github.com/toddmotto/echo
            echo.init({
                offset: 0,
                unload: false,
                callback: function( element, op ) {

                    if( op === 'load' ) {

                        //Detect truly image loaded event
                        //https://github.com/desandro/imagesloaded
                        imagesLoaded( element, function( imagesLoadedObj ) {
                            imagesLoadedObj.elements[0].parentNode.classList.add( 'loaded' );
                        });
                    } else {
                        element.parentNode.classList.remove( 'loaded' );
                    }
                }
            });
        },

        initializeContactForm : function () {

            /*Messages set*/
            var msg = {
                sending: 'Sending...',
                thanks: 'Thank you',
                retry: 'Ups. Try again, please.',
                please_retry: 'Please, try again.',
                server_problems: 'The server us taking too Long to Respond.'
            },
                cForm = document.getElementById( 'contact-form' ),
                formName = document.getElementById( 'name' ),
                formEmail = document.getElementById( 'email' ),
                formMessage = document.getElementById( 'message' ),
                formSubmit = document.getElementById( 'submit' ),
                formMail = document.getElementById( 'mail' ),           //formMail is just a honeypot
                formAlert = document.getElementById( 'form-alert' ),
                formSpinner = document.getElementById( 'form-spinner' );


            /* on Blur: Validate and return true/false */
            formName.addEventListener( 'blur', function() {
                AC.validateField( this );
            });

            formEmail.addEventListener( 'blur', function() {
                AC.validateField( this );
            });

            formMessage.addEventListener( 'blur', function() {
                AC.validateField( this );
            });
            
            /* On form submit... */
            formSubmit.addEventListener( 'click', function(e) {
            
                //stop the form from being submitted
                e.preventDefault();
            
                var validation = true;

                //Trigger complete form validation
                validation =    validation *
                                AC.validateField( formName ) *
                                AC.validateField( formEmail ) *
                                AC.validateField( formMessage );
                        
                if ( validation && !formMail.value ) {

                    //Organize the data properly
                    var data =
                    'name=' + encodeURIComponent( formName.value ) +
                    '&mail=' + encodeURIComponent( formMail.value ) +
                    '&email=' + encodeURIComponent( formEmail.value ) +
                    '&message=' + encodeURIComponent( formMessage.value ) +
                    '&ajx=1' //Ajax flag for server processing
                    
                    //Disabled all text fields
                    formName.setAttribute( 'disabled', true );
                    formMail.setAttribute( 'disabled', true );
                    formMessage.setAttribute( 'disabled', true );

                    //Cancel the submit button default behaviours
                    formSubmit.setAttribute( 'disabled', true );
                    formSubmit.setAttribute( 'value', msg['sending'] );

                    //Show the loading spinner
                    formSpinner.style.opacity = 1;

                    //Start the ajax request
                    var request = new XMLHttpRequest();
                    request.open( 'GET', 'scripts/contactmail.php?' + data, true );

                    request.onload = function() {
                        if ( request.status >= 200 && request.status < 400 ) {
                            // Ajax Success!

                            //Check server response status
                            console.log(request.responseText);
                            var resp = JSON.parse( request.responseText );
                            console.log(resp);

                            if( resp.sent == 1 ){
                                formSubmit.setAttribute( 'value', msg['thanks'] );
                            } else {
                                formAlert.innerHTML = resp.msg;
                                formSubmit.setAttribute( 'value', msg['retry'] );
                            }
                        } else {
                            // We reached our target server, but it returned an error
                            formAlert.innerHTML = msg['please_retry'];
                            formSubmit.setAttribute( 'value', msg['retry'] );
                        }
                        formSpinner.style.opacity = 0;
                    };

                    request.onerror = function() {
                        //There was a connection error of some sort
                        formAlert.innerHTML = msg['please_retry'];
                        formSubmit.setAttribute( 'value', msg['retry'] );
                        formSpinner.style.opacity = 0;
                    };

                    console.log( 'Sending' );
                    console.log( data );
                    request.send();
                    
                } // end if Validation
                
            }); 
        },

        validateField : function( field ){
            if ( field.id == 'email' ) {
                //Regex again email format
                if ( /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i.test( field.value )) {
                   field.previousElementSibling.style.opacity = 0;
                   return true;
                }
            }

            if ( field.id == 'name' || field.id == 'message' ) {
                //Regex again empty spaces
                if ( field.value && !/^\s*$/.test( field.value )) {
                   field.previousElementSibling.style.opacity = 0;
                   return true;
                }
            }

            //Make validation fail by default
            field.previousElementSibling.style.opacity = 1;
            return false;
        }
        
    }; //End AC
    
    //Ready event
    domready(function() {
        AC.onReady();
    })
})();