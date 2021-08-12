module.exports = async (app) => {
  const Controller = require("./order.controller");
  const delivery =  await Controller.createController(app.address);
    
  // Create a new  Delivery
  app.post("/delivery", async (req,res,next) =>  delivery.create(req,res,next));

  // Deliver a shipping order
  app.put("/delivery/:id/deliver", async (req,res,next) =>  delivery.deliver(req,res,next));

  // Cancel a shipping order
  app.put("/delivery/:id/cancel", async (req,res,next) =>  delivery.cancel(req,res,next));
}