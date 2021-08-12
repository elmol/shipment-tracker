let chai = require("chai");
let chaiHttp = require("chai-http");
const expect = require("chai").expect;
chai.use(chaiHttp);
const App = require("../app/app");
const hre = require("hardhat");
const ethers = hre.ethers;

const url = "http://localhost:3000";
const req = chai.request(url);
var cambio = false;
const order = { code: "First Order", distributorId: "distributor 1", receptorId: "receptor 1"};
const order2 = { code: "Second Order", distributorId: "distributor 2", receptorId: "receptor 1"};

const StatusCodes = require('http-status-codes').StatusCodes

describe("Deliver Rest App", () => {
  
  before(async () => {
    var server = await createApp();
  });

  after((done) => {
    server.close();
    done();
  });

  it("should have a root message", (done) => {
    req.get("/").end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.message).to.be.not.undefined;
      done();
    });
  });

  it("can create a shipping order", (done) => {
    req.post("/delivery").send(order).end((err, res) => {
      expect(res).to.have.status(StatusCodes.OK);
      expect(res.body).to.have.property("transactionHash").not.be.undefined;
      expect(res.body).to.have.property("createdAt").not.be.undefined;
      expect(res.body).to.have.property("order").not.be.undefined.and.equal(order);
      done();
    });
  });

  it("should not allow to create orders with empty order", (done) => {
    req.post("/delivery").end((err, res) => {
      expect(res).to.have.status(StatusCodes.BAD_REQUEST);
      done();
    });
  });

  it("should not create shipping orders with same shipping code", (done) => {
    req.post("/delivery").send(order).end((err, res) => {
      expect(res).to.have.status(StatusCodes.CONFLICT);
      expect(res.body).to.have.property("message").not.be.undefined
      done();
    });
  });

  it("can deliver an order which is in pending status", (done) => {
    req.put("/delivery/" + order.code + "/deliver").end((err, res) => {
      expect(res).to.have.status(StatusCodes.OK);
      expect(res.body).to.have.property("transactionHash").not.be.undefined;
      expect(res.body).to.have.property("createdAt").not.be.undefined;
      done();
    });
  });

  it("can not deliver an order which is not pending status", (done) => {
    req.put("/delivery/" + order.code + "/deliver").end((err, res) => {
      expect(res).to.have.status(StatusCodes.CONFLICT);
      expect(res.body).to.have.property("message").not.be.undefined
      done();
    });
  });

  it("can cancel an order which is in pending status", (done) => {
    req.post("/delivery/").send(order2).end((err, res) => {
      expect(res).to.have.status(StatusCodes.OK);
    });
    req.put("/delivery/" + order2.code + "/cancel").end((err, res) => {
      expect(res).to.have.status(StatusCodes.OK);
      expect(res.body).to.have.property("transactionHash").not.be.undefined;
      expect(res.body).to.have.property("createdAt").not.be.undefined;
      done();
    });
  });

  it("can not cancel an order which is not pending status", (done) => {
    req.put("/delivery/" + order2.code + "/cancel").end((err, res) => {
      expect(res).to.have.status(StatusCodes.CONFLICT);
      expect(res.body).to.have.property("message").not.be.undefined
      done();
    });
  });

  //helpers
  async function deployContract() {
    //deploy the contract
    const ShipmentTracker = await ethers.getContractFactory("ShipmentTracker");
    shipmentTracker = await ShipmentTracker.deploy();
    shipmentTracker = await shipmentTracker.deployed();
    return shipmentTracker.address;
  }

  async function createApp() {
    address = await deployContract();
    var app = await App.create(address);
    server = app.listen(3000, () => {
      console.log("Server is listening on port 3000");
      console.log("Access to http://localhost:3000");
    });
    return server;
  }
});
