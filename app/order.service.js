const ethers = require("hardhat").ethers;
const ContractError = require("./error/contract.error");
const ValidationError = require("./error/validation.error");

const STATUS = Object.freeze({ Pending: 0, Delivered: 1, Cancelled: 2 });

class OrderService {

  constructor(contract) {
    this.contract = contract;
    this._confirms = 0; //waits for #confirms confirmations after tx 
  }

  static async create(address) {
    const ShipmentTrackerFactory = await ethers.getContractFactory("ShipmentTracker");
    const contract = await ShipmentTrackerFactory.attach(address);
    //check if contract is deployed
    if ((await contract.provider.getCode(address)) === "0x") {
      throw new Error("contract not found");
    }
    return new OrderService(contract);
  }

  //errors are not controlled, they're thrown directly from ethers.js
  async create(order) {
    if (this._isEmpty(order)) throw new ValidationError("Shipping order is empty");
    const transactionReceipt = await this._contractCall(() => this.contract.create(this._convertToBytes32(order.code), this._convertToBytes32(order.distributorId),  this._convertToBytes32(order.receptorId)));
    transactionReceipt.order = order;
    return transactionReceipt;
  }

  async deliver(orderCode) {
    return this._contractCall(() => this.contract.deliver(this._convertToBytes32(orderCode)));
  }

  async cancel(orderCode) {
    return this._contractCall(() => this.contract.cancel(this._convertToBytes32(orderCode)));
  }

  set confirmations(confirms) {
    this._confirms = confirms;
  }

  async _contractCall(call) {
    try {
      const tx = await call();
      await tx.wait(this._confirms);
      return {
        transactionHash: tx.hash,
        createdAt: Date.now(),
      };
    } catch (error) {
      throw new ContractError(error.message);
    }
  }

  _convertToBytes32(string) {
    return ethers.utils.formatBytes32String(string);
  }

  _isEmpty(obj) {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}

OrderService.STATUS = STATUS;

module.exports = OrderService;
