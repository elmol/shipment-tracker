const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const hre = require("hardhat");

const ethers = hre.ethers;
const expect = chai.expect;
chai.use(chaiAsPromised);

const ValidationError = require('../app/error/validation.error.js');
const ContractError = require('../app/error/contract.error.js');

var Delivery = require('../app/order.service');

const order = { code: "First Order", distributorId: "distributor 1", receptorId: "receptor 1"};

describe('Delivery', async () => {

    beforeEach(async () => {
        //deploy the contract
        const ShipmentTracker = await ethers.getContractFactory("ShipmentTracker");
        shipmentTracker = await ShipmentTracker.deploy();
        shipmentTracker = await shipmentTracker.deployed();
        address = shipmentTracker.address;
        delivery = await Delivery.create(address);
    });

    it('can be created',  async () => {
        expect((await Delivery.create(shipmentTracker.address)).contract.address).to.equal(shipmentTracker.address);
    });

    it('can not be created with a non existent contract address',  async () => {
        const nonexistentAddr = "0xa54d3c09E34aC96807c1CC397404bF2B98DC4eFb";
        await expect(Delivery.create(nonexistentAddr)).to.be.rejectedWith("contract not found");
    });

    //should return a order details including tx hash and created timestamp (datetime)
    it('can create a shipping order with default account',  async () => {
        const res = await delivery.create(order);

        expect(res.transactionHash,"tx hash").to.not.be.undefined;
        expect(res.createdAt).to.not.be.undefined;
        expect(ethers.utils.parseBytes32String(await shipmentTracker.orderCodes(0))).to.equal(res.order.code);
    });

    it('should throw an error if shipping order creation failed',  async () => {
        await delivery.create(order);

        //trying to create the same order      
        await expect(delivery.create(order)).to.be.rejectedWith(ContractError,"Shipping order already exists");
    });

    it('can deliver a shipping order with default account',  async () => {
        await delivery.create(order);

        const res = await delivery.deliver(order.code);
        expect(res.transactionHash,"tx hash").to.not.be.undefined;
        expect(res.createdAt).to.not.be.undefined;
        const deliveredOrder = await shipmentTracker.orders(ethers.utils.formatBytes32String(order.code));
        expect(deliveredOrder.status).to.equal(Delivery.STATUS.Delivered);        
    });

    it('should throw an error if shipping order deliver failed',  async () => {
        await delivery.create(order);
        await delivery.deliver(order.code);

        await expect(delivery.deliver(order.code)).to.be.rejectedWith(ContractError,"Shipping order in not in pending status");
    });

    it('can cancel a shipping order with default account ',  async () => {
        await delivery.create(order);

        const res = await delivery.cancel(order.code);
        expect(res.transactionHash,"tx hash").to.not.be.undefined;
        expect(res.createdAt).to.not.be.undefined;

        const canceledOrder = await shipmentTracker.orders(ethers.utils.formatBytes32String(order.code));
        expect(canceledOrder.status).to.equal(Delivery.STATUS.Cancelled);        
    });

    it('should thrown an error on creation if order is undefined',  async () => {
        await expect(delivery.create({})).to.be.rejectedWith(ValidationError,"Shipping order is empty");
    });

    
    it('should not has public access to contract',  async () => {
        delivery.contract = undefined;
    });
    
});