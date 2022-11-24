import { defineMessages } from 'react-intl';
import defaultMessages from './DefaultMessages';

export default defineMessages(defaultMessages);

// TODO: cleanup translation keys that are used for translating data
// that comes from the server
// e.g. `first_name` or `last_name` is never used directly by DEC112 Viewer
// but is a translation for content that comes from the server
// it would be nice to have a separate namespace for all these keys
// so they are collected in a single object and not mixing with other keys.