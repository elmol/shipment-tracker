# Shipment Tracking Application

Shipment Tracking Application is a REST APIs based application that lets you track shipping orders in a transparent and public way. It relais on EVM comptabile blockchain to leave traceability of the actions carried out on the order.

> **disclaimer:** This code does merely have a _teaching purpose_.

 ## Requirements

- [NPM](https://www.npmjs.com/)

## Installation
You can add different networks by configuring [hardhat.config](https://hardhat.org/config). By default [RSK](https://www.rsk.co/) testnet network is configured.
You can to create an `.env` file or export the following enviarment variables:

`.env` example:
```
#RSK TESTNET
CONTRACT_ADDRESS=0x0123456ABC
RSKTESTNET_RPC_URL='https://public-node.testnet.rsk.co'
PRIVATE_KEY='abcdef' 
```
`bash` example
```
export CONTRACT_ADDRESS=0x0123456ABC
export RSKTESTNET_RPC_URL='https://public-node.testnet.rsk.co'
export PRIVATE_KEY='abcdef' 
```
You will get the contract address after the contract deployment.

## Deploy
To deploy to testnet:
```bash
npx hardhat run scripts/contract-deploy.js --network rsktestnet
```
You have to update the contract address environment variable with the address gotten.

## Run
```bash
npx hardhat run app/server.js --network rsktestnet
```

## Test
To run all (integration, unit and contract) the tests 

```bash
npx hardhat test
```

## REST APIs 

### Shipping order creation
```bash
curl --location --request POST 'http://localhost:3000/delivery' \
--header 'Content-Type: application/json' \
--data-raw ' { "code": "code1", "distributorId": "distributor 1", "receptorId": "receptor 1"}'
```

### Shipping order deliver
```bash
curl --location --request PUT 'http://localhost:3000/delivery/code1/deliver' \
--data-raw ''
```

### Shipping order cancel
```bash
curl --location --request PUT 'http://localhost:3000/delivery/code1/cancel' \
--data-raw ''
```

### Notes

* REST APIs could be set to wait until n configurable confirmations. Default confirmation is 0.


