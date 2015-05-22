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
            AC.initializeContactForm();
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
                    'name=' + formName.value +
                    '&mail=' + formMail.value +
                    '&email=' + formEmail.value +
                    '&message=' + encodeURIComponent( formMessage.value );
                    
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
                    request.open( 'GET', 'scripts/contactmail.php', true );

                    request.onload = function() {
                        if ( request.status >= 200 && request.status < 400 ) {
                            // Success!
                            formSubmit.setAttribute( 'value', msg['thanks'] );
                            var resp = request.responseText;
                            console.log(resp);
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
                    request.send( data );
                    
                } // end if Validation
                
            }); 
        },

        validateField : function( field ){
if
             ( field.id == 'email' ) {
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