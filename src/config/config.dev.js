export default {
    // The viewer's document.title
    // Currently not working for clients
    //// string
    "appTitle": "Viewer",
    // Section for client specific configuration
    // Whenever a client is used (usually determined by logged in user), 
    // configuration within "clients" is applied on top of the initial configuration
    //// Object
    "clients": {
        // Example: 
        // One client, namely "DEC#test" is configured
        // This client specific configuration changes the viewer's language to "en"
        // and disables the data view
        /*
        "DEC#test": {
            "language": "en",
            "ui": {
                "dataView": {
                    "enabled": false,
                },
            },
        },
        */
    },
    //// Object
    "connection": {
        // "endpoint" specifies the url the viewer connects to by default
        // If "endpoint" is an object, it must contain properties "default" and "ssl"
        // If viewer is running in a secure context (SSL), property "ssl" is used, "default" otherwise
        // The placeholder {host} will be replaced with the viewer's current hostname and port (e.g. localhost:3000)
        // If "endpoint" is a string, the viewer will always use this endpoint, no matter wheter it's running under a secure context or not
        // Be careful with mixed content!
        //// string | Object
        "endpoint": {
            "default": "ws://{host}/api/v2",
            "ssl": "wss://{host}/api/v2",
        },
        // Example:
        /*
        "endpoint": "ws://server:port/api/v[1-2]"
        "endpoint": {
            "default": "ws://server:port/api/v[1-2]",
            "ssl": "wss://server:port/api/v[1-2]",
        }
        */
        // Protocol, used to communicate via websocket
        //// string
        "protocol": "dec112",
        //// Object
        "attachments": {
            // URL where to fetch attachments from
            // {host} will be replaced by the host used for the websocket connection
            // {hostname} will be replaced by the hostname used for the websocket connection
            // {call_id} will be replaced by the respective call id the attachment was sent along
            // {attachment_id} will be replaced by the attachment that should be fetched
            //// string
            "endpoint": "https://{host}/attachment/{call_id}/{attachment_id}",
        },
        // "pingPong" speficies the duration between two ping pong calls that are fired to the endpoint
        // this is important to keep websockets open and to possibly renew session tokens (v2)
        // If set to null, ping pong is inactive
        //// number | null
        "pingPong": 60000,
    },
    // If true, logs debug messages into the browser's console
    //// true | false
    "debug": true,
    // Used to overwrite the viewer's default language
    // Use two character ISO language identifiers, like "en", "de"...
    //// string
    "language": null,
    // Manual triggers can be specified here
    // "triggers" should either be "null" or an array of objects
    //// null | Array<Object>
    "triggers": null,
    // Example: 
    /*
    "triggers": [
        {
            // The id of the trigger
            // MUST be the same as configured at border
            //// string
            "id": "trigger_id",
            // The title of this trigger
            // Used for display on UI
            //// string | LanguageObject
            "title": {
                "en": "trigger-en",
                "de": "trigger-de",
            }
        }
    ],
    */
    // Defines whether test calls should be visualized or not
    //// Boolean
    "processTestCalls": true,
    // Specifies targets the call taker can choose from
    // These are alternative ways to reach the caller
    //// Array<Object>
    "alternativeTargets": [
        // {
        //     // Used to uniquely identify the target
        //     //// string
        //     "id": "sms-gateway",
        //     // The title of this target
        //     // Used for display on UI
        //     //// string | LanguageObject
        //     "title": {
        //         "en": "SMS",
        //         "de": "SMS",
        //     },
        //     // type of this target
        //     // different implementations can exist for targets
        //     //// string
        //     "type": "phone",
        //     // A target URI
        //     // placeholder {value} can be used for specifying where to put the new target
        //     //// string
        //     "targetUri": "sip:{value}@sms.test.dec112.eu",
        // }
    ],
    // Translation specifies resources necessary to enable translation service
    //// Object
    "translation": {
        // Maximum number of translation items cached to browser storage
        // This functionality should minimize the amount of requests needed
        //// number
        "maxCacheCount": 1000,
        // Endpoint for translations
        //// string
        "translationEndpoint": 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0',
        // Endpoint for fetching all available langugages
        //// string
        "languagesEndpoint": "https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation",
        // API-Key for retreiving data
        // If no API-Key is present, translation will be disabled
        //// string | null
        "apiKey": null,
        // Azure region
        //// string
        "region": 'westeurope',
    },
    //// Object
    "ui": {
        // Configuration concerning notifications about new calls
        //// Object
        "notification": {
            // Play audio when a new call comes in?
            //// Boolean
            "playAudio": false,
        },
        // Configuration concerning snackbars
        //// Object
        "snackbar": {
            // Timeout (in milliseconds), after which snackbars disappear automatically
            // This does not apply to errors shown in snackbars, they do not disappear automatically
            //// number
            "timeout": 5000,
        },
        // Configuration concerning snackbars that occur, when data is copied to clipboard
        //// Object
        "copyToClipboard": {
            "preview": {
                // Max length of preview text
                // If text is longer an ellipsis "..." is appended after the maximum characters
                //// number
                "maxLength": 70,
            },
        },
        // Configuration concerning the data view
        //// Object
        "dataView": {
            // Enables or disables data view on UI
            //// true | false
            "enabled": true,
        },
        // Configuration concerning the map view
        //// Object
        "mapView": {
            // Enbles or disables map view on UI
            //// true | false
            "enabled": true,
            // Template that specifies which text should be copied to clipboard
            // {{latitude}} {{longitude}} and {{radius}} can be used as placeholders
            //// string
            "clipboardLocationTemplate": "{{latitude}},{{longitude}}",
            // Polyline specific configuration
            //// Object
            "polyline": {
                // Polyline color
                // Specify valid CSS color string (hex, rgba, hsla...)
                //// string
                "color": "#00f",
            },
        },
        // Configuration concerning the message view
        //// Object
        "messageView": {
            // Enables or disables map view on UI
            //// true | false
            "enabled": true,
            // Defines MIME types that can be natively shown within the viewer
            // Regular expressions can be used to describe the MIME type
            //// Object
            "attachments": {
                //// Object
                "types": {
                    // Specify image MIME types that should be natively shown within DEC112 Viewer
                    //// Array<string>
                    "image": [
                        "image/.+",
                    ],
                    // Specify video MIME types that should be natively shown within DEC112 Viewer
                    //// Array<string>
                    "video": [
                        "video/.+",
                    ],
                },
            },
            // Configuration concerning the snippet panel
            //// Array<Object>
            "snippets": [
                {
                    // The title of this snippet
                    // Used for display on UI
                    //// string | LanguageObject
                    "title": {
                        "de": "Video-Anruf",
                        "en": "Video-Call"
                    },
                    // Shortcut key to trigger the snippet
                    // Currently, only F-Keys are supported [F1-F12]
                    //// string
                    "shortcut": "F10",
                    // URI that will be sent to the client
                    // Template {{random(n)}} will be replace with a random, alphanumeric string of length `n`
                    //// string
                    "uri": "https://meet.jit.si/{{random(24)}}#config.prejoinPageEnabled=false",
                    // Text, that is appended to message, when snippet is triggered
                    // If also property `uri` is available, URI and text will be directly sent to the client
                    //// string | LanguageObject
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
        // Configuration concerning the replay control panel
        //// Object
        "replayControlPanel": {
            // How often the ui should be refreshed, when in play mode (in milliseconds)
            //// number
            "updateInterval": 1000,
            // Presets for play speeds
            //// Array<number>
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
        // defines, if pi2 service is enabled or not
        /// true | false
        "enabled": false,
        // "connection" specifies the url the viewer connects to for resolving DIDs
        // If "connection" is an object, it must contain properties "default" and "ssl"
        // If viewer is running in a secure context (SSL), property "ssl" is used, "default" otherwise
        // The placeholder {hostname} will be replaced with the viewer's current hostname (e.g. localhost)
        // If "connection" is a string, the viewer will always use this endpoint, no matter wheter it's running under a secure context or not
        // Be careful with mixed content!
        //// string | Object
        "connection": {
            "default": "http://{hostname}:3000",
            "ssl": "https://{hostname}:3001",
        },
        // Credentials used to connect to the PI2 service (OAuth)
        //// Object
        "credentials": {
            //// string
            "clientId": "",
            //// string
            "clientSecret": ""
        },
    },
};
