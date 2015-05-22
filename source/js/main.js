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
                formSubmit = document.getElementById( 'submit' );

            /* on Blur: Validate and return true/false */
            formName.addEventListener( 'blur', function() {
                 if ( /^(|\s*)$/.test( this.value )) {
                    this.previousElementSibling.css( 'opacity', 1 );
                    return false;
                 } else {
                    this.previousElementSibling.css( 'opacity', 0 );
                    return true;
                 }
            });

            formEmail.addEventListener( 'blur', function() {
                 if ( /^(|\s*)$/.test( this.value )) {
                    this.previousElementSibling.css( 'opacity', 1 );
                    return false;
                 } else if ( !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i.test( this.value )) {
                    this.previousElementSibling.css( 'opacity', 1 );
                    return false;
                 } else {
                    this.previousElementSibling.css( 'opacity', 0 );
                    return true;
                 }
            });

            formMessage.addEventListener( 'blur', function() {
                 if ( /^(|\s*)$/.test( this.value )) {
                    this.previousElementSibling.css( 'opacity', 1 );;
                    return false;
                 } else {
                    this.previousElementSibling.css( 'opacity', 0 );
                    return true;
                 }
            });
            
            /* On form submit... */
            formSubmit.addEventListener( 'click', function(e) {
            
                //stop the form from being submitted
                e.preventDefault();
            
                var validation = true;

                //Trigger blur event for every input (Blur event makes validation and returns true/false)
                validation =    validation *
                                formName.triggerHandler( 'blur' ) *
                                formEmail.triggerHandler( 'blur' ) *
                                formMessage.triggerHandler( 'blur' ) *
                                mail.value;
                        
                if ( validation ) {

                    //Organize the data properly
                    var data = {
                        name: formName.value,
                        mail: mail.value,
                        email: email.value,
                        message: encodeURIComponent( message.value )
                    }
                    
                    //disabled all the text fields
                    $cForm.find('.text').attr('disabled','true');

                    el.setAttribute('tabindex', 3);

                    //cancel the submit button default behaviours
                    $formSubmit.attr({'disabled' : 'true', 'value' : msg['sending']});
                    //show the loading sign
                    $cForm.find('form-loading').show();

                    //Start the ajax request
                    var request = new XMLHttpRequest();
                    request.open( 'GET', 'scripts/contactmail.php', true );

                    request.onload = function() {
                      if (request.status >= 200 && request.status < 400) {
                        // Success!
                        var resp = request.responseText;
                      } else {
                        // We reached our target server, but it returned an error

                      }
                    };

                    request.onerror = function() {
                      // There was a connection error of some sort
                    };

                    request.send( data );
                    
                    $.ajax({
                        //url: $('#contact-form').attr('action'),
                        url: "scripts/contactmail.php",
                        
                        //Pass data
                        data: data,
                        dataType: 'json',
                        timeout: 10000,
                        
                        success: function (data) {
                            //if sent
                            if (data.sent == 1) { $formSubmit.attr({'value' : msg['thanks']}) }
                            
                            //if sending problems
                            else {  $cForm.find('p.form-message').html(data.msg).slideDown(500);
                                    $formSubmit.attr({'value' : msg['retry']})
                            }
                            $cForm.find('div.loading').fadeOut(500);
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            if (errorThrown == 'timeout') {errorThrown = msg['server_problem']}
                            $cForm.find('p.form-message').html(errorThrown +'. '+msg['please_retry']).slideDown(500);
                            $formSubmit.attr({'value' : msg['retry'] });
                            $cForm.find('div.loading').fadeOut(500);
                        }

                    });
                } // end if Validation
                
            }); 
        }
        
    }; //End AC
    
    //Ready event
    domready(function() {
        AC.onReady();
    })
                
})();