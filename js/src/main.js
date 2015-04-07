'use strict';

// Loading dependencies, caching selectors and defining other variables.
var Ajax = require('simple-ajax'),
    apiPrefix = 'http://localhost:4000/api/',
    i18nHelper = require('./utils/i18n-helper'),
    greetingElement = document.querySelector('.js-greeting'),
    languageElement = document.querySelector('.js-select-language'),
    messageCountElement = document.querySelector('.js-message-count'),
    messageElement = document.querySelector('.js-messages');

/**
 *  Retrieves the language files that match the language code.
 *  Performs an API request for data if necessary.
 *
 *  @param {string} langCode - Two-letter language code.
 *  @return {object} - Promise.
 */
function getTranslations(langCode) {
    return new Promise(function(resolve, reject) {
        if (i18nHelper.store.hasOwnProperty(langCode)) {
            resolve(i18nHelper.store[langCode]);
        } else {
            var ajax = new Ajax({
                method: 'GET',
                url: apiPrefix + 'translations/' + langCode
            });

            ajax.on('success', function(event, data) {
                i18nHelper.store[langCode] = JSON.parse(data);
                resolve(i18nHelper.store[langCode]);
            });

            ajax.on('error', function(event, data) {
                reject(JSON.parse(data));
            });

            ajax.send();
        }
    });
}

/**
 *  Applies the translation data to the i18n instance and
 *  then triggers an update of the greetings.
 *
 *  @param {string} langCode - Two-letter language code.
 */
function setLanguage(langCode) {
    var translationsRequest = getTranslations(langCode);

    translationsRequest.then(
        function(data) {
            i18nHelper.i18n = new i18nHelper.Jed(data);
            setGreeting();
            setMessage();
        },
        function(rawData) {
            i18nHelper.i18n = new i18nHelper.Jed({});
            setGreeting();
            setMessage();
        }
    );
}

/**
 *  Updates the DOM with the appropriate greeting.
 *  This demonstrates a standard translation via `gettext`.
 */
function setGreeting() {
    var greetingTranslation = i18nHelper.i18n.gettext('Hello world.');
    greetingElement.innerHTML = greetingTranslation;
}

/**
 *  Takes the message count and ensures its a numeric value. Uses
 *  `ngettext` to determine which message (singular or plural)
 *  should be used then uses `sprintf` to update the dynamic
 *  values within the statement. After this is all done, the
 *  DOM is updated.
 */
function setMessage() {
    var inputValue = messageCountElement.value
    inputValue = parseInt(inputValue.trim(), 10) || 0;

    var correctPluralTranslation = i18nHelper.i18n.ngettext(
        'You have %1$d new message.',
        'You have %1$d new messages.',
        inputValue
    );

    var variableReplacedTranslation = i18nHelper.Jed.sprintf(
        correctPluralTranslation,
        inputValue
    );

    messageElement.innerHTML = variableReplacedTranslation;
}

/**
 *  Whenever the language selection changes, trigger update
 *  logic to change accordingly.
 *
 *  @param {object} event - DOM Event.
 */
languageElement.addEventListener('change', function(event) {
    var chosenValue = event.target.value;
    setLanguage(chosenValue);
});

/**
 *  Whenever the message count field is updated we trigger
 *  the logic to update the DOM.
 *
 *  @param {object} event - DOM Event.
 */
messageCountElement.addEventListener('keyup', function(event) {
    event.preventDefault();
    setMessage();
});

setGreeting();
setMessage();