# Changelog

## 3.0.3

* Improved cache management through deregistration of existing service workers

## 3.0.2

* Better error handling for unexpected server errors
* Better error handling for message send errors

## 3.0.1

* Better error handling for parsing the server response

## 3.0.0

* Breaking change: External config file was moved from build root into folder "config". This had to be changed to enable external config being in a docker volume, so config can be changed without restarting the docker container.
* Updated: Spanish translations

## 2.0.3

* Added: Docker support
* Added: caching for PI2 service calls
* Enhancement: Better release script
* Enhancement: More efficient did resolving
* Enhancement: Better duration component, is now easier to read
* Enhancement: Easier to understand call state information
* Enhancement: Server config and client config are now in one place
* Fixed: Correct call erasing
* Fixed: Call replay progress indication
* Fixed: get_config call for semantic containers

## 2.0.0

* Added support for version 2 of server API (login, remote config, sessions)
* Added support for manual triggers
* Added support for hidden fields in data view
* Added support for multiline messages
* Added support for DIDs (decentralized identities, pi2 service)
* Added support for configuration via server
* Added ability to show called service as text
* Introduced typescript
* Introduced client-side routing
* Introduced snippets in message view
* Introduced call replays
* Introduced access to debug information
* Enhanced and cleaner map behaviour
* Enhanced data input validation
* Enhanced UI (texts & translations, colors, snackbars, debug data, error handling)
* Enhanced persistent logins
* Enhanced and unified localization handling
* Full rework of internal state management
* Updated dependencies
* Rework of server communication
  * Added support for semantic containers
  * Introduced interfaces for abstract server communication (mappers and connectors)
  * Introduced zero configuration endpoints
  * Enhanced server error handling (500 and 404)