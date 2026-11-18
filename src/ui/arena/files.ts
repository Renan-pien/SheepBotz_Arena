import type { ChangeEvent } from 'react';

export class LocalFiles {
  #request = 0;

  async read(
    file: File,
    revision: () => number,
    accept: (text: string) => void,
    reject: (fileName: string) => void,
  ) {
    const request = ++this.#request;
    const origin = revision();
    const current = () => this.#request === request && revision() === origin;
    let text: string;
    try {
      text = await file.text();
    } catch {
      if (current()) reject(file.name);
      return;
    }
    if (current()) accept(text);
  }
}

export function chosenFile(
  event: ChangeEvent<HTMLInputElement>,
): File | undefined {
  const file = event.currentTarget.files?.[0];
  event.currentTarget.value = '';
  return file;
}

export function downloadText(
  text: string,
  name: string,
  mediaType: string,
): void {
  const url = URL.createObjectURL(new Blob([text], { type: mediaType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
