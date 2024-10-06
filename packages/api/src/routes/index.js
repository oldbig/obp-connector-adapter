const express = require('express');
const router = express.Router();
const {RpcClient} = require('rabbitmq');

// Example usage
// const rpcServer = new RpcServer('rpc_queue');
// rpcServer.start();

const rpcClient = new RpcClient('rpc_queue');
rpcClient.connect();

/**
 * the full path is: http://localhost:3000/api/getBank/bankId_123,accountId_abc
 */
router.post(['/:method/:bankId,:accountId', '/:method'], async (req, res) => {
  const {method, bankId, accountId } =  req.params;
  const input = JSON.stringify({
    method,
    params: {bankId, accountId},
    data: req.body,
  });
  const response = await rpcClient.call(input);
  res.json(JSON.parse(response));
});



module.exports = {router, closeRpcClient: ()=> rpcClient.close()};
