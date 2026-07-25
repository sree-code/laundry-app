import { createApp } from './app.js';

const app = createApp({ serveStatic: true });
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Weekend Cricket server running on http://0.0.0.0:${PORT}`);
});
