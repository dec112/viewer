import React, { useEffect, useCallback } from 'react';
// @ts-ignore
import classNames from 'classnames';
import { LocalizationService } from '../../service';
import { getRandomString } from '../../utilities';

export class Snippet {
  constructor(
    public title: string,
    public shortcut?: string,
    public text?: string,
    public uri?: string,
  ) { }
}

const getRandomRegex = () => new RegExp('{{random\\((\\d+)\\)}}');

export const mapSnippetsFromConfig = (config: any) => {
  const intl = LocalizationService.getInstance();

  return config ? config.map((x: any) => {
    let uri: string = x.uri;

    const match = getRandomRegex().exec(uri);
    if (match && match[1]) {
      const randomSize = parseInt(match[1]);
      const randomString = getRandomString(randomSize);

      uri = uri.replace(getRandomRegex(), randomString);
    }

    return new Snippet(
      intl.getTextFromLanguageObject(x.title) || 'Unknown Title',
      x.shortcut,
      intl.getTextFromLanguageObject(x.text),
      uri,
    );
  }) : [];
}

export const SnippetPanel = (props: {
  snippets: Array<Snippet>,
  callback: (snippet: Snippet) => void,
  hidden: boolean,
  disabled: boolean,
}) => {
  const triggerSnippet = useCallback((snippet: Snippet) => props.disabled ? null : props.callback(snippet), [props]);
  const onKeyDown = useCallback((evt: KeyboardEvent) => {
    const snipp = props.snippets.find(x => x.shortcut === evt.key);

    if (!snipp)
      return;

    evt.preventDefault();
    triggerSnippet(snipp);
  }, [props.snippets, triggerSnippet]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    }
  }, [props.snippets, props.disabled, onKeyDown]);

  const getSnippetTitle = (snippet: Snippet) => {
    const { title, shortcut } = snippet;
    let res = title;

    if (shortcut)
      res = `${res} [${shortcut}]`;

    return res;
  }

  return (
    <section hidden={props.hidden}>
      {props.snippets.map((x, index) => <button
        key={index}
        className={classNames('btn', 'btn-default')}
        onClick={() => triggerSnippet(x)}
      >
        {getSnippetTitle(x)}
      </button>
      )}
    </section>
  );
}