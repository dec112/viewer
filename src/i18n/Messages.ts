import { defineMessages, MessageDescriptor } from 'react-intl';

// German is our global language default
import defaultMessages from './de.json';

// create the data model that's used to tell the lib
// about our translations
const messages = Object.entries(defaultMessages).reduce<{
  [key: string]: MessageDescriptor,
}>((prev, [key, value]) => {
  prev[key] = {
    id: key,
    defaultMessage: value,
  };

  return prev;
}, {});

// this additional type hint is to overcome a type incompatibility
// this is not nice, but is due to the existence of legacy code
// (and potentially incompatible types from the lib)
export default defineMessages(messages) as { [key: string]: string };