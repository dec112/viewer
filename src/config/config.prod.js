export default {
    "appTitle": "DEC112 Viewer",
    "clients": {},
    "connection": {
        "endpoint": {
            "default": "ws://{host}/api/v2",
            "ssl": "wss://{host}/api/v2",
        },
        "protocol": "dec112",
    },
    "debug": false,
    "language": null,
    "triggers": null,
    "ui": {
        "snackbar": {
            "timeout": 5000,
        },
        "dataView": {
            "enabled": true,
        },
        "mapView": {
            "enabled": true,
            "polyline": {
                "color": "#00f",
            },
        },
        "messageView": {
            "enabled": true,
            "snippets": [
                {
                    "title": {
                        "de": "Was?",
                        "en": "What?",
                    },
                    "shortcut": "F1",
                    "text": {
                        "de": "Was ist passiert?",
                        "en": "What has happened?",
                    },
                },
                {
                    "title": {
                        "de": "Wie viele?",
                        "en": "How many?",
                    },
                    "shortcut": "F2",
                    "text": {
                        "de": "Wie viele Verletzte Personen gibt es?",
                        "en": "How many injured people are there?",
                    },
                },
                {
                    "title": {
                        "de": "Wo?",
                        "en": "Where?",
                    },
                    "shortcut": "F3",
                    "text": {
                        "de": "Wo befinden Sie sich?",
                        "en": "What is your location?",
                    },
                },
            ],
        },
        "replayControlPanel": {
            "updateInterval": 1000,
            "playSpeeds": [
                0.5,
                0.75,
                1,
                1.25,
                1.5,
                2,
                5,
                10,
            ],
        },
    },
    "pi2": {
        "enabled": false,
        "connection": {
            "default": "http://{hostname}:3000",
            "ssl": "https://{hostname}:3001",
        },
        "credentials": {
            "clientId": "",
            "clientSecret": ""
        },
    },
};
