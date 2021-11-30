# Changelog

## [Unreleased]

## 3.6.1

* Center navbar text

## 3.6.0

* Better handling of test calls. It can be specified in config whether test calls should be processed or not. \
By default, test calls are not processed for production builds, however they are for development builds. \
Additionally, test calls are highlighted in a different color when they are shown in the overview list.

## 3.5.0

* Fixed audio notification. Defaults to disabled. \
Due to considerable interference in classic environments audio notifications are now disabled by default.

## 3.4.0

* Added better visibility for display name and call id within a call
* Fixed uncaught promise on connection errors

## 3.3.0

* Added support for attachments (images, videos and other attachments)
* Added support device types and device names, shown as a map marker
* Added support for `client_id` URL parameter for specifying a specific client config
* Fixed bug when DEC112 Viewer stopped working if no external config was present

## 3.2.0

* Added support for test calls. They won't be shown in the call overview. \
Furthermore, no notifications about an incoming call will be shown for them.
* Updated React to version 16.14.0
* More stable handling for new calls

## 3.1.7

* Fixed missing german language keys

## 3.1.6

* Added language keys for additional information

## 3.1.5

* Less restrictive call id validation on search

## 3.1.4

* Added copy to clipboard button for latest location on map

## 3.1.3

* Fixed ping pong for multiple logoffs/logins

## 3.1.2

* Changed design of messages

## 3.1.1

* Fixed bug where additional data is not updated during a call

## 3.1.0

* Added Notification service

## 3.0.5

* Fixed bug when logging out on Border v2 environments

## 3.0.4

* Fixed bug when opening call in a new tab

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