chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.on && request.to)
            handleShowOnMapClick(request.on, request.to);
    }
);

function handleShowOnMapClick(onEntry, toEntry) {
    const xyz = parseXyz(onEntry.parsing);
    if (!xyz) {
        console.log("Error when parsing url params, cannot redirect to: " + toEntry.title +
            ". Window location is: " + window.location.href + ", current site entry: ");
        console.log({ onEntry });
        return;
    }

    const toUrl = resolveTargetUrl(toEntry.urlTemplate, xyz);
    window.open(toUrl);
}

function resolveTargetUrl(template, xyz) {
    return template
        .replace("${x}", xyz.x)
        .replace("${y}", xyz.y)
        .replace("${z}", xyz.z)
}

function parseXyz(parsing) {
    if (parsing.type === "href")
        return parseXyzFromHref(parsing);

    if (parsing.type === "search")
        return parseXyzFromSearch(parsing);
}

function parseXyzFromHref(parsing) {
    console.log("Href:" + window.location.href)
    console.log("Regex:" + parsing.regex)

    const regex = new RegExp(parsing.regex)
    console.log("RegExp:" + regex)
    const matches = window.location.href.match(regex);
    console.log("matches: " + matches);

    if (!matches) {
        console.log("Error, regex does not match!");
        return;
    }

    const maxMatchingPos = Math.max(parsing.x, parsing.y, parsing.z)
    if (matches.length <= maxMatchingPos) {
        console.log("Error, regex does not have enough matching parts. Matched: " + matches.length +
            ", but a match on index " + maxMatchingPos + " is requried. Mathces: " + matches);
        return null;
    }

    const xyz = {
        x: matches[parsing.x],
        y: matches[parsing.y],
        z: matches[parsing.z],
    }

    // Conversion from meters (which Google uses instead of zoom) - https://www.google.com/maps/@45.1404987,10.0038878,6254m
    // Conversion: Math.log2(CIRCUMFERENCE_OF_EARTH / meters)
    if (typeof(parsing.zType) !== "undefined")
        if (parsing.zType === "m")
            xyz.z = Math.round(Math.log2(40075016 / xyz.z));

    return xyz;
}

function parseXyzFromSearch(parsing) {
    const { search } = window.location;
    if (!search)
        return null;

    const urlParams = new URLSearchParams(search);

    const x = urlParams.get(parsing.x);
    const y = urlParams.get(parsing.y);
    const z = urlParams.get(parsing.z);

    if (!x || !y || !z)
        return null;

    return {
        x: x,
        y: y,
        z: z,
    }
}
