const express = require("express");
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const {
  addUser,
  generateSubscriptionKey,
  revokeSubscriptionKey,
  listUsers,
  listSubscriptionKeys,
} = require("../controllers/adminController");

router.use(authenticate, authorizeAdmin);

router.post("/users", addUser);
router.get("/users", listUsers);
router.post("/subscriptions/generate", generateSubscriptionKey);
router.get("/subscriptions", listSubscriptionKeys);
router.patch("/subscriptions/:keyId/revoke", revokeSubscriptionKey);

module.exports = router;
