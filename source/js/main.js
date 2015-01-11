/*jslint browser: true*/
/*global $, console, MBP*/

(function ($) {
    
    //Avoid accidental global variable declarations
    "use strict";

    var var = '';
        
    var AC = {
        
        onReady : function () {
            
            //Turn off console.log in production
            if (!debug) {
                console = console || {};
                console.log = function(){};
            }
            
            //Check if JQuery is loaded
            if (jQuery) {
                console.log('Jquery loaded');
            }
            
            //Go on and set up website
            AC.setUpSite();
        },
        
        setUpSite : function () {
            console.log('AC.setUpSite');

        },

        initializeContactForm : function () {

            /*Messages set*/
            var msg = {
                sending: 'Sending...',
                thanks: 'Thank you',
                retry: 'Ups. Try again, please.',
                please_retry: 'Please, try again.',
                server_problems: 'The server us taking too Long to Respond.'
            }
                $cForm = $('#contact-form'),
                $formName = $('#name'),
                mail = document.getElementById('mail'),
                $email = $('#email'),
                $message = $('#message'),
                lang = document.getElementById('lang'),
                $submitButton = $('#submit');
                
            /* on focus: Delete prefilled content */
            $formName.on('focus', function() {
                 if (this.value == 'Name') {this.value = ''}
            });
            $email.on('focus', function() {
                 if (this.value == 'Email') {this.value = ''}
            });
            $message.on('focus', function() {
                 if (this.value == 'Your message') {this.value =  ''}
            });
            
            /* on Blur: Restore prefilled content in same cases, Validate and return true/false */
            $formName.on('blur', function() {
                 if (/^(|\s*|Name)$/.test(this.value)) {
                    $(this).val('Name').siblings('span').fadeIn(500);
                    return false;
                 } else {
                    $(this).siblings('span').fadeOut(500);
                    return true;
                 }
            });
            $email.on('blur', function() {
                 if (/^(|\s*|Email)$/.test(this.value)) {
                    $(this).val('Email').siblings('span').fadeIn(500);
                    return false;
                 } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i.test(this.value) ) {
                    $(this).siblings('span').fadeIn(500);
                    return false;
                 } else {
                    $(this).siblings('span').fadeOut(500);
                    return true;
                 }
            });
            $message.on('blur', function() {
                 if (/^(|\s*|Your message)$/.test(this.value)) {
                    $(this).val('Your message').siblings('span').fadeIn(500);
                    return false;
                 } else {
                    $(this).siblings('span').fadeOut(500);
                    return true;
                 }
            });
            
            /* On form submit... */
            $submitButton.on('click', function(e) {
            
                //stop the form from being submitted
                e.preventDefault();
            
                var validation = true;

                //Trigger blur event for every input (Blur event makes validation and returns true/false)
                validation =    validation *
                                $formName.triggerHandler('blur') *
                                $email.triggerHandler('blur') *
                                $message.triggerHandler('blur');
                        
                if (validation) { 
                    //organize the data properly
                    var data = {name: $formName.val(), mail: mail.value, email: $email.val(), message: encodeURIComponent($message.val()), lang: lang.value}
                    
                    //disabled all the text fields
                    $cForm.find('.text').attr('disabled','true');
                    //cancel the submit button default behaviours
                    $submitButton.attr({'disabled' : 'true', 'value' : msg['sending']});
                    //show the loading sign
                    $cForm.find('form-loading').show();
                    
                    //start the ajax
                    $.ajax({
                        //url: $('#contact-form').attr('action'),
                        url: "scripts/contactmail.php",
                        
                        //Pass data
                        data: data,
                        dataType: 'json',
                        timeout: 10000,
                        
                        success: function (data) {
                            //if sent
                            if (data.sent == 1) { $submitButton.attr({'value' : msg['thanks']}) }
                            
                            //if sending problems
                            else {  $cForm.find('p.form-message').html(data.msg).slideDown(500);
                                    $submitButton.attr({'value' : msg['retry']})
                            }
                            $cForm.find('div.loading').fadeOut(500);
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            if (errorThrown == 'timeout') {errorThrown = msg['server_problem']}
                            $cForm.find('p.form-message').html(errorThrown +'. '+msg['please_retry']).slideDown(500);
                            $submitButton.attr({'value' : msg['retry'] });
                            $cForm.find('div.loading').fadeOut(500);
                        }

                    });
                } // end if Validation
                
            }); 
        }
        
    }; //End AC
    
    //Ready event
    $(document).ready(AC.onReady());
                
})( jQuery );