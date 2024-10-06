This project supply OpenBankProject connector adapter

## connect to RabbitMQ with RPC
### steps
- `npm install`
- `npm run start:docker`
- `npm run start`

after start api, you can request api with:

```bash
curl -X POST http://localhost:3000/api/getBank/bankId_123,accountId_abc \
     -H "Content-Type: application/json" \
     -d '{"key1": "value1", "key2": "value2"}' -v
```

## You can stop docker container with `npm run stop:docker`

## Add new demo connector
Add new function just like `packages/core/src/demoServer.js` routers object did, you can add new method name as key, response generator function as value.