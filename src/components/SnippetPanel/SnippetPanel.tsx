import React, { useEffect, useCallback } from 'react';
// @ts-ignore
import classNames from 'classnames';

export class Snippet {
  constructor(
    public text: string,
    public title?: string,
    public shortcut?: string
  ) { }
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
    const { title, text, shortcut } = snippet;
    let res = title || text;

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