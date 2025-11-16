import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: ['teklab-ui/**'],
  },
  ...nextCoreWebVitals,
];

export default config;
