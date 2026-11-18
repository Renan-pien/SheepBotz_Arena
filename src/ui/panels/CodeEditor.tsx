import { Annotation, Compartment, EditorState } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { useEffect, useRef, useState } from 'react';

const fromSession = Annotation.define<boolean>();

interface CodeEditorProps {
  readonly label: string;
  readonly value: string;
  readonly readOnly: boolean;
  readonly onChange: (value: string) => void;
}

export function CodeEditor({
  label,
  value,
  onChange,
  readOnly,
}: CodeEditorProps) {
  const [access] = useState(() => new Compartment());
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView | null>(null);
  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        extensions: [
          lineNumbers(),
          access.of([]),
          EditorView.contentAttributes.of({
            'aria-label': label,
            spellcheck: 'false',
          }),
          EditorState.phrases.of({ Editor: 'Editor', Line: 'Linha' }),
          EditorView.updateListener.of((update) => {
            if (
              update.docChanged &&
              !update.transactions.some((transaction) =>
                transaction.annotation(fromSession),
              )
            ) {
              onChange(update.state.doc.toString());
            }
          }),
        ],
      }),
    });
    editor.current = view;
    return () => {
      view.destroy();
      editor.current = null;
    };
  }, [access, label, onChange]);

  useEffect(() => {
    editor.current?.dispatch({
      effects: access.reconfigure([
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
      ]),
    });
  }, [access, readOnly]);

  useEffect(() => {
    const view = editor.current;
    if (!view || view.state.doc.toString() === value) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
      annotations: fromSession.of(true),
    });
  }, [value]);

  return <div className="code-editor" ref={host} />;
}
