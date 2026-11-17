const task = /\(S[1-3]-T\d{3}\):/;
const header =
  /^(feat|fix|test|refactor|docs|chore|ci)\((S[1-3]-T\d{3}|S[1-3]-(spec|plan|tasks)|constitution|agents|briefing|specs|setup)\): \S.*$/;

export default {
  defaultIgnores: false,
  ignores: [(message) => /^Merge\b/.test(message)],
  plugins: [
    {
      rules: {
        'sheepbotz-header': (parsed) => [
          header.test(parsed.header ?? ''),
          'Use tipo(escopo): descrição com o escopo de uma tarefa ou artefato SDD.',
        ],
        'sheepbotz-requirements': (parsed) => [
          !task.test(parsed.header ?? '') || /^Requisitos: \S.+$/m.test(parsed.raw),
          'Commits de tarefa devem incluir a linha Requisitos: .',
        ],
      },
    },
  ],
  rules: {
    'sheepbotz-header': [2, 'always'],
    'sheepbotz-requirements': [2, 'always'],
  },
};
