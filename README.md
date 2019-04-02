# DEC112 viewer

A lightweight viewer for DEC112 PSAP integration powered by **React**. It should simplify PSAP integration by providing a web frontend for sending and receiving text messages coming from the caller, as well as displaying the caller's location and additional personal data.

## First run

### Prerequisites

*  [Node.js](https://nodejs.org/en/) installed
*  [yarn](https://yarnpkg.com/en/) package manager installed

### Installation

```sh
yarn install
yarn start
```

Development server will be started on port 3000 and your default browser will be opened.

## Configuration

In order run this application, a complete setup of all DEC112 components is necessary. You can find an overview of all components [here](https://github.com/dec112).

### Config Files

There are two locations where the viewer can be configured.

1. `./src/config/config.js`: This configuration is bundled when you build the project
2. `./public/dec112.config.json`: This configuration can always be changed and is loaded asynchronously by the application and overwrites any config parameters previously defined in `config.js`

### Sample Configuration

```javascript
{
  "appTitle": "DEC112", // used as <title /> in index.html
  "apiKey": "", // predefined api key (skips login page)
  "debug": true, // toggles debug messages in console
  "language": "de-DE", // predefined ui language, otherwise, browser locale is used (currently only used to determine date-time locale)
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
      "endpoint": "wss://service.dec112.at:8080/api/v1", // endpoint which the viewer tries to connect to
      "protocol": "dec112" // protocol that's used for data exchange
  },
  "clients": {
    "testApiKey": {
      "appTitle": "DEC112 for testApiKey",
      "ui": {
        "dataView": {
          "enabled": false
        },
        "mapView": {
          "enabled": false
        }
      }
    }
  }
}
```

### Clients

Different clients can be configured with different configurations. If a user logs in with his/her api key, the respective configuration for this user is applied on top of the existing configuration.

In the example above, all users would share the same configuration, except user with api key "testApiKey". This user would not be able to view "dataView" and "mapView" within the viewer. Only "messageView" would be visible. Furthermore, a different appTitle would be used for this user.

## Usage

### Login

The login consists of a username/api key (which has to be configured in the backend) and a password (which, for simplicity, is always: `Pxx.` [replace "xx" with current hour+minutes])

For example: At 14:25, the password is `P39.`, because 14+25=39.

### Overview

This view lists all active emergency calls. Clicking on it navigates to to the specific emergency call.

Furthermore, a spefific call can be opened by typing its id into the text field.

### Main view (emergency chat)

This view allows to communicate with the caller via a chat function. Furthermore the current location, as well as the caller's location history can be seen on the map.

If location data is available for text messages, it is indicated by a pin symbol next to the message. Clicking it shows this specific location on the map.


## Build

```sh
# production
yarn build # or
yarn build --profile production

# development
yarn build --profile dev
```

Each time the application is compiled, corresponding template config is copied to both `config.js` and `dec112.config.json`

### Config template locations

1. `./src/config/config.[dev|production].js`
2. `./config/dec112.config.[dev|production].json`

## Authors

*  Mario Murrent ([mariomurrent-softwaresolutions](https://github.com/mariomurrent-softwaresolutions))
*  Gabriel Unterholzer ([gebsl](https://github.com/gebsl))

## License

This project is licensed under the GNU GPLv3 License - see the LICENSE file for details