function getACADeepLinkParam4Notification(params, acaUrl, pAppType, pAppTypeAlias, module) {
    // pass in a hashtable and it will add the additional parameters to the table

    addParameter(params, "$$acaDeepLinkUrl$$", getDeepLinkUrl(acaUrl, pAppType, module));
    addParameter(params, "$$acaDeepLinkAppTypeAlias$$", pAppTypeAlias);

    return params;
}
