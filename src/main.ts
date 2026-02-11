import { WolfApp } from './app/gameApp';

const app = document.getElementById('app');
if (!app) {
  throw new Error('Missing #app container');
}

new WolfApp(app);
