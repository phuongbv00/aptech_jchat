export const environment = {
  production: true,
  wsEndpoint: window['env']['wsEndpoint'] || 'ws://localhost:8000/ws',
  apiEndpoint: window['env']['apiEndpoint'] || 'http://localhost:8000/api',
};
