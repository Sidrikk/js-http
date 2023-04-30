import fs from 'fs';
import url from 'url';
import httpHeaders from 'http-headers';
import build from '../server/server.js';

test('should work', async () => {
  const app = build();

  const data = fs.readFileSync('solutions/1-http_1_0', 'utf-8');
  const requestObj = httpHeaders(data);

  const parts = {
    port: 8080,
    protocol: 'http',
    hostname: 'localhost',
    pathname: requestObj.url,
  };
  const requestUrl = url.format(parts);

  const options = {
    headers: requestObj.headers,
    method: requestObj.method,
    url: requestUrl,
  };

  const {
    raw: { req },
    statusCode: status,
  } = await app.inject(options);

  const { method } = req;
  const result = { method, status };
  expect(result).toMatchObject({ status: 200, method: 'GET' });
});
