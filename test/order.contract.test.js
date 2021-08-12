const { expect } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;

//uses cases.
//1. able to create a new shipping order
//2. able to list orders
//3. possible to cancel an order
//4. possible to deliver an order (change state)

const DeliveryStatus = Object.freeze({ Pending: 0, Delivered: 1, Cancelled: 2 });
const order = { code: convertToBytes32("First Order"), distributorId: convertToBytes32("distributor 1"), receptorId: convertToBytes32("receptor 1")};
const EMPTY_BYTES32 = ethers.constants.HashZero;

describe("ShipmentTracker Contract", () => {
  
  beforeEach(async () => {
    const ShipmentTracker = await ethers.getContractFactory("ShipmentTracker");
    shipmentTracker = await ShipmentTracker.deploy();
    shipmentTracker = await shipmentTracker.deployed();
  });

  it("can be created", async () => {});
  
  it("should does not have shipping order after creation", async () => {
    expect(await shipmentTracker.getOrderCodes()).to.be.empty;
    expect(await shipmentTracker.orderCodes.length).equal(0);
  });
  
  it("can create the first shipping order", async () => {
    create(order);
    expect(await shipmentTracker.orderCodes(0)).to.equal(order.code);
  });
  
  it("can create the second shipping order", async () => {
    create(order);
    expect(await shipmentTracker.orderCodes(0)).to.equal(order.code);
    
    const order2 = { code: convertToBytes32("Second Order"), distributorId: convertToBytes32("distributor 2"), receptorId: convertToBytes32("receptor 1")};
    create(order2);
    expect(await shipmentTracker.orderCodes(1)).to.equal(order2.code);
  });

  it("should not create shipping orders with same shipping code", async () => {
    create(order);
    expect(await shipmentTracker.orderCodes(0)).to.equal(order.code);

    await expect(shipmentTracker.create(order.code, order.distributorId, order.receptorId)).to.be.revertedWith("Shipping order already exists");
  });

  it("should return all shipping orders", async () => {
    create(order);
    expect(await shipmentTracker.orderCodes(0)).to.equal(order.code);

    const orders = await shipmentTracker.getAllOrders();
    expect(orders.length).to.equal(1);
    expect(orders[0][0]).to.equal(order.code);
  });

  it("should not allow to create orders with empty code", async () => {
    await expect(shipmentTracker.create(EMPTY_BYTES32, order.distributorId, order.receptorId)).to.be.revertedWith("Shipping order code is empty");
  });

  it("should not allow to create orders with empty distributor id", async () => {
    await expect(shipmentTracker.create(order.code, EMPTY_BYTES32, order.receptorId)).to.be.revertedWith("Shipping order distributorId is empty");
  });

  it("should not allow to create orders with empty receptor id", async () => {
    await expect(shipmentTracker.create(order.code, order.distributorId, EMPTY_BYTES32)).to.be.revertedWith("Shipping order receptorId is empty");
  });

  it("should create new shipping orders with pending delivery status", async () => {
    create(order);

    const shipping = await shipmentTracker.orders(order.code);
    expect(shipping.status).to.equal(DeliveryStatus.Pending);
  });

  it("can cancel an order which is in pending status", async () => {
    create(order);

    const shipping = await shipmentTracker.orders(order.code);
    expect(shipping.status).to.equal(DeliveryStatus.Pending);

    const txCancel = await shipmentTracker.cancel(order.code);
    await txCancel.wait();

    const canceledOrder = await shipmentTracker.orders(order.code);
    expect(canceledOrder.status).to.equal(DeliveryStatus.Cancelled);
  });

  it("can not cancel an order which is not pending status", async () => {
    create(order);

    const shipping = await shipmentTracker.orders(order.code);
    expect(shipping.status).to.equal(DeliveryStatus.Pending);

    const txCancel = await shipmentTracker.cancel(order.code);
    await txCancel.wait();

    const canceledOrder = await shipmentTracker.orders(order.code);
    expect(canceledOrder.status).to.equal(DeliveryStatus.Cancelled);

    await expect(shipmentTracker.cancel(order.code)).to.be.revertedWith("Shipping order in not in pending status");
  });

  it("can not cancel an order which does not exist", async () => {
    await expect(shipmentTracker.cancel(convertToBytes32("inexistent"))).to.be.revertedWith("Non existent shipping order");
  });

  it("can deliver an order which is in pending status", async () => {
    create(order);

    const shipping = await shipmentTracker.orders(order.code);
    expect(shipping.status).to.equal(DeliveryStatus.Pending);

    const txDeliver = await shipmentTracker.deliver(order.code);
    await txDeliver.wait();

    const deliveredOrder = await shipmentTracker.orders(order.code);
    expect(deliveredOrder.status).to.equal(DeliveryStatus.Delivered);
  });

  it("can not deliver an order which is not pending status", async () => {
    create(order);

    const shipping = await shipmentTracker.orders(order.code);
    expect(shipping.status).to.equal(DeliveryStatus.Pending);

    const txCancel = await shipmentTracker.cancel(order.code);
    await txCancel.wait();

    const canceledOrder = await shipmentTracker.orders(order.code);
    expect(canceledOrder.status).to.equal(DeliveryStatus.Cancelled);

    await expect(shipmentTracker.deliver(order.code)).to.be.revertedWith("Shipping order in not in pending status");
  });

  it("can not deliver an order which does not exist", async () => {
    await expect(shipmentTracker.deliver(convertToBytes32("inexistent"))).to.be.revertedWith("Non existent shipping order");
  });

  it("should emit a StatusChange event when an order is delivered", async () => {
    create(order);

    const shipping = await shipmentTracker.orders(order.code);
    expect(shipping.status).to.equal(DeliveryStatus.Pending);

    await expect(shipmentTracker.deliver(order.code)).to.emit(shipmentTracker, "StatusChanged").withArgs(order.code, order.distributorId, order.receptorId, DeliveryStatus.Pending, DeliveryStatus.Delivered);

    const delivered = await shipmentTracker.orders(order.code);
    expect(delivered.status).to.equal(DeliveryStatus.Delivered);
  });

  it("should emit a StatusChange event when an order is canceled", async () => {
    create(order);

    const shipping = await shipmentTracker.orders(order.code);
    expect(shipping.status).to.equal(DeliveryStatus.Pending);

    await expect(shipmentTracker.cancel(order.code)).to.emit(shipmentTracker, "StatusChanged").withArgs(order.code, order.distributorId, order.receptorId, DeliveryStatus.Pending, DeliveryStatus.Cancelled);

    const cancelled = await shipmentTracker.orders(order.code);
    expect(cancelled.status).to.equal(DeliveryStatus.Cancelled);
  });

  it("should not allow an order to be canceled by another than the creator", async () => {
    create(order);

    const shipping = await shipmentTracker.orders(order.code);
    expect(shipping.status).to.equal(DeliveryStatus.Pending);

    const [owner, addr1] = await ethers.getSigners();

    await expect(shipmentTracker.connect(addr1).deliver(order.code)).to.be.revertedWith("Non the order owner. Only the owner can change the status");
  });

  it("should emit a OrderCreated event when a new order is created", async () => {
    const [owner] = await ethers.getSigners();
    await expect(await shipmentTracker.create(order.code, order.distributorId, order.receptorId))
      .to.emit(shipmentTracker, "OrderCreated")
      .withArgs(order.code, order.distributorId, order.receptorId, owner.address);
  });

});

//create an order and wait to be minned
async function create(order) {
  const tx = await shipmentTracker.create(order.code, order.distributorId, order.receptorId);
  await tx.wait();
}

function convertToBytes32(string) {
     return ethers.utils.formatBytes32String(string);
}
