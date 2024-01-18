// NOTES:
// Icons taken from: https://www.iconarchive.com/show/fluentui-emoji-flat-icons-by-microsoft/World-Map-Flat-icon.html

chrome.contextMenus.create({
	title: "About MapSwitch",
	contexts: ["browser_action", "page_action"],
	onclick: (info, tab) => chrome.tabs.create({ windowId: window.id, url: getMapSwitchUrl() })
});

function getMapSwitchUrl() {
	return "https://github.com/pgazdik/map-switch";
}

/*
chrome.commands.onCommand.addListener(function (command) {
	notifyActiveTab(command)
});
*/

function notifyActiveTab(message) {
	// Send a message to the active tab
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var activeTab = tabs[0];
		notifyTab(activeTab.id, message);
	});
}

function notifyTab(tabId, message) {
	chrome.tabs.sendMessage(tabId, { "message": message });
}

const data = [
	{
		title: "Google Maps",
		urlPattern: "https://*.google.com/maps/*",
		parsing: {
			type: "href",
			regex: "@(-?[0-9.]+),(-?[0-9.]+),([0-9.]+)z",
			x: 2,
			y: 1,
			z: 3
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
	}
]

class TheBrain {

	menuItems = [];

	setMapMenuItems(data) {
		this.clearOldMenuItems();

		for (const onEntry of data)
			for (const toEntry of data)
				if (onEntry != toEntry)
					this.addNewMenuItem(onEntry, toEntry);
	}

	clearOldMenuItems() {
		while (this.menuItems.length > 0) {
			const item = this.menuItems.pop();
			chrome.contextMenus.remove(item);
		}
	}

	addNewMenuItem(onEntry, toEntry) {
		this.menuItems.push(this.createNewMenuItem(onEntry, toEntry));
	}

	createNewMenuItem(onEntry, toEntry) {
		chrome.contextMenus.create({
			title: "Show on " + toEntry.title,
			contexts: ["page"],
			documentUrlPatterns: [onEntry.urlPattern],
			onclick: (info, tab) => {
				chrome.tabs.sendMessage(tab.id, { on: onEntry, to: toEntry })
			}
		});
	}

}

const brain = new TheBrain();
brain.setMapMenuItems(data);
