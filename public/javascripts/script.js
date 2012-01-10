var options = {
    ns: { namespaces: ['translation'], defaultNs: 'translation'},
    useLocalStorage: false,
    resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__',
    dynamicLoad: true,
    sendMissing: true
};
$.i18n.init(options, function() { 
    //TODO: add more text
});