/* Server stub commented out to avoid parse errors in Next.js build.
   Original content contained CommonJS example. Kept as a commented reference.

const express = require('express');
const app = express();
const port = 4001;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
*/

export const noop = () => undefined;
