const { RpcClient, RpcServer } = require('rabbitmq');


const routers = {
    getBank: ({params, data}) => ({
        bankId: params.bankId,
        accountId: params.accountId,
        bankName: `Hello ${params.bankId}`,
        bankAddress: `Hello ${params.bankId} address`,
        bankCountry: `Hello ${params.bankId} country`,
        accountName:   `Hello Account ${params.accountId}`,
        requestData: data,
    })
}

async function responseGenerator (input) {
    const request = JSON.parse(input);
    const {method, params, data} = request;
    console.log("params:", params);
    console.log("data:", data);
    const response = await routers[method]({params, data});
    return JSON.stringify(response);
}

// Example usage
const rpcServer = new RpcServer('rpc_queue', responseGenerator);
rpcServer.start();