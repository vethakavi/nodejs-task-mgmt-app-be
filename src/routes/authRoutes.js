const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  register,
  login,
  logout,
  getUser,
  updateUser,
  checkUserExists,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user/exists", checkUserExists);
router.post("/reset-password", resetPassword);
router.get("/user", auth, getUser);
router.put("/user/:id", auth, updateUser);

module.exports = router;
