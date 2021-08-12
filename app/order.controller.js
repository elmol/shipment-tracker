const Delivery = require("./order.service");
const StatusCodes = require("http-status-codes").StatusCodes;

class OrderController {
  constructor(delivery) {
    this.delivery = delivery;
  }

  static async createController(address) {
    const delivery = await Delivery.create(address);
    return new OrderController(delivery);
  }

  async create(req, res, next) {
    return this._handleResponse(res, next, () => this.delivery.create(req.body));
  }

  async deliver(req, res, next) {
    return this._handleResponse(res, next, () => this.delivery.deliver(req.params.id));
  }

  async cancel(req, res, next) {
    return this._handleResponse(res, next, () => this.delivery.cancel(req.params.id));
  }

  async _handleResponse(res, next, callback) {
    try {
      let response = await callback();
      return res.status(StatusCodes.OK).send(response);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
