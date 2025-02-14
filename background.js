// NOTES:
// Icons taken from: https://www.iconarchive.com/show/fluentui-emoji-flat-icons-by-microsoft/World-Map-Flat-icon.html

// chrome.runtime.onInstalled.addListener(function () {
//})

chrome.contextMenus.create({
	id: "aboutMaptSwitch",
	title: "About MapSwitch",
	contexts: ["browser_action", "page_action"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "aboutMaptSwitch") {
		chrome.tabs.create({ url: getMapSwitchUrl() });
	}
});

function getMapSwitchUrl() {
	return "https://github.com/pgazdik/map-switch";
}

const data = [
	{
		title: "Google Maps",
		urlPattern: "https://*.google.com/maps/*",
		parsing: {
			type: "href",
			//regex: "@(-?[0-9.]+),(-?[0-9.]+),([0-9]+)z",
			regex: "@(-?[0-9.]+),(-?[0-9.]+),([0-9]+)m",
			x: 2,
			y: 1,
			z: 3,
			zType: "m",
		},
		urlTemplate: "https://www.google.com/maps/@${y},${x},${z}z"
	},
	{
		title: "Mapy.cz",
		urlPattern: "https://*.mapy.cz/*",
		parsing: {
			type: "search",
			x: "x",
			y: "y",
			z: "z"
		},
		urlTemplate: "https://mapy.cz/turisticka?x=${x}&y=${y}&z=${z}"
	},
	{
		title: "Geocaching",
		urlPattern: "https://*.geocaching.com/map/*",
		parsing: {
			type: "href",
			regex: "ll=(-?[0-9.]+),(-?[0-9.]+)&z=([0-9]+)",
			x: 2,
			y: 1,
			z: 3
		},
		urlTemplate: "https://www.geocaching.com/map/#?ll=${y},${x}&z=${z}"
	},
	{
		title: "Cyclo BA",
		urlPattern: "https://mapa.cyklokoalicia.sk/bratislava/public/*",
		parsing: {
			type: "href",
			regex: "\\|z([0-9]+)\\|c(-?[0-9.]+),(-?[0-9.]+)",
			x: 3,
			y: 2,
			z: 1
		},
		urlTemplate: "https://mapa.cyklokoalicia.sk/bratislava/public/#l5,6,99/3|z${z}|c${y},${x}"
	},
	{
		title: "Hrady.sk",
		urlPattern: "https://hrady.sk/mapa/*",
		parsing: {
			type: "href",
			regex: "mapa/([0-9]+)/([0-9.]+)/([0-9.]+)",
			x: 3,
			y: 2,
			z: 1
		},
		urlTemplate: "https://hrady.sk/mapa/${z}/${y}/${x}/X"
	},
	{
		title: "OpenStreetMap",
		urlPattern: "https://www.openstreetmap.org/*",
		parsing: {
			type: "href",
			regex: "map=([0-9]+)/(-?[0-9.]+)/(-?[0-9.]+)",
			x: 3,
			y: 2,
			z: 1
		},
		urlTemplate: "https://www.openstreetmap.org/#map=${z}/${y}/${x}"
	},
	{
		title: "Bing",
		urlPattern: "https://www.bing.com/maps?*",
		parsing: {
			type: "href",
			regex: "cp=(-?[0-9.]+)%7E(-?[0-9.]+)&lvl=([0-9.]+)", // Browser shows ~, but url is shown with %7E instead
			x: 2,
			y: 1,
			z: 3
		},
		urlTemplate: null // Don't offer it as target
	}
]

class TheBrain {

	setMapMenuItems(data) {
		// Apparently 
		chrome.contextMenus.removeAll();

		for (const onEntry of data)
			for (const toEntry of data)
				if (onEntry.parsing && toEntry.urlTemplate)
					if (onEntry != toEntry)
						this.addNewMenuItem(onEntry, toEntry);
	}

	addNewMenuItem(onEntry, toEntry) {
		const uuid = crypto.randomUUID();
		chrome.contextMenus.create({
			id: uuid,
			title: "Show on " + toEntry.title,
			contexts: ["page", "editable"],
			documentUrlPatterns: [onEntry.urlPattern]
		})
		chrome.contextMenus.onClicked.addListener((info, tab) => {
			if (info.menuItemId === uuid)
				chrome.tabs.sendMessage(tab.id, { on: onEntry, to: toEntry })
		})

		// chrome.contextMenus.update("disabledMenuItem", { enabled: true });
	}

}

const brain = new TheBrain();
brain.setMapMenuItems(data);