//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract ShipmentTracker {
  enum DeliveryStatus {
    Pending,
    Delivered,
    Cancelled
  }

  event StatusChanged(bytes32 shippingCode, bytes32 distributorId, bytes32 receptorId, DeliveryStatus oldStatus, DeliveryStatus newStatus);
  event OrderCreated(bytes32 shippingCode, bytes32 distributorId, bytes32 receptorId, address owner);

  struct Shipping {
    bytes32 code;
    bytes32 distributorId;
    bytes32 receptorId;
    DeliveryStatus status;
    address owner;
  }

  bytes32[] public orderCodes;
  mapping(bytes32 => Shipping) public orders;

  modifier atPending(bytes32 _code) {
    require(exists(_code), "Non existent shipping order");
    require(orders[_code].status == DeliveryStatus.Pending, "Shipping order in not in pending status");
    require(orders[_code].owner == msg.sender, "Non the order owner. Only the owner can change the status");
    _;
    emit StatusChanged(_code, orders[_code].distributorId, orders[_code].receptorId, DeliveryStatus.Pending, orders[_code].status);
  }

  function getOrderCodes() public view returns (bytes32[] memory) {
    return orderCodes;
  }

  function getAllOrders() public view returns (Shipping[] memory) {
    Shipping[] memory _orders = new Shipping[](orderCodes.length);
    for (uint256 index = 0; index < orderCodes.length; index++) {
      _orders[index] = orders[orderCodes[index]];
    }
    return _orders;
  }

  function create(bytes32 _code, bytes32 _distributorId, bytes32 _receptorId) public {
    require(_code[0] != 0, "Shipping order code is empty");
    require(_distributorId[0] != 0, "Shipping order distributorId is empty");
    require(_receptorId[0] != 0, "Shipping order receptorId is empty");
    require(!exists(_code), "Shipping order already exists");

    Shipping memory _order = Shipping({ code: _code, distributorId: _distributorId, receptorId: _receptorId, status: DeliveryStatus.Pending, owner: msg.sender });
    orders[_order.code] = _order;
    orderCodes.push(_order.code);

    emit OrderCreated(_order.code, _order.distributorId, _order.receptorId, _order.owner);
  }

  function cancel(bytes32 _code) public atPending(_code) {
    orders[_code].status = DeliveryStatus.Cancelled;
  }

  function deliver(bytes32 _code) public atPending(_code) {
    orders[_code].status = DeliveryStatus.Delivered;
  }

  function exists(bytes32 _code) private view returns (bool) {
    return orders[_code].code != 0;
  }

}
