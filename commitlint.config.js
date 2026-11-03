export default {
  extends: ['@commitlint/cli', '@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'wip',
      ],
    ],

    'type-case': [2, 'always', 'lower-case'],

    'subject-empty': [2, 'never'],

    'subject-full-stop': [2, 'never', '.'],

    'header-max-length': [2, 'always', 100],
  },
};
