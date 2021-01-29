export default {
    "appTitle": "Viewer",
    "clients": {},
    "connection": {
        "endpoint": {
            "default": "ws://{host}/api/v2",
            "ssl": "wss://{host}/api/v2",
        },
        "protocol": "dec112",
        "attachments": {
            "endpoint": "https://{host}/attachment/{call_id}/{attachment_id}",
        },
        "pingPong": 60000,
    },
    "debug": false,
    "language": null,
    "triggers": null,
    "processTestCalls": false,
    "alternativeTargets": [],
    "translation": {
        "maxCacheCount": 1000,
        "translationEndpoint": 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0',
        "languagesEndpoint": "https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation",
        "apiKey": null,
        "region": 'westeurope',
    },
    "ui": {
        "notification": {
            "playAudio": false,
        },
        "snackbar": {
            "timeout": 5000,
        },
        "copyToClipboard": {
            "preview": {
                "maxLength": 70,
            },
        },
        "dataView": {
            "enabled": true,
        },
        "mapView": {
            "enabled": true,
            "clipboardLocationTemplate": "{{latitude}},{{longitude}}",
            "polyline": {
                "color": "#00f",
            },
        },
        "messageView": {
            "enabled": true,
            "attachments": {
                "types": {
                    "image": [
                        "image/.+"
                    ],
                    "video": [
                        "video/.+",
                    ],
                },
            },
            "snippets": [
                {
                    "title": {
                        "de": "Video-Anruf",
                        "en": "Video-Call"
                    },
                    "shortcut": "F10",
                    "uri": "https://meet.jit.si/{{random(24)}}#config.prejoinPageEnabled=false",
                    "text": {
                        "de": "Treten Sie dem Video-Anruf bei.",
                        "en": "Join the video call."
                    }
                },
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
