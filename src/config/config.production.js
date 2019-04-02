module.exports = {
    "appTitle": "DEC112 Webview",
    "apiKey": "",
    "debug": false,
    "language": "de-DE",
    "ui": {
        "snackbar": {
            "timeout": 5000
        },
        "dataView": {
            "enabled": true
        },
        "mapView": {
            "enabled": true,
            "polyline": {
                "color": "#00f",
            },
        },
        "messageView": {
            "enabled": true
        }
    },
    "connection": {
        "endpoint": "wss://example.com",
        "protocol": "dec112"
    }
};
