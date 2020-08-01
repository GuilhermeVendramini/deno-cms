import router from "../../../../../router.ts";
import recoveryPasswordController from "../controllers/recoveryPasswordController.ts";

router
  .get("/recovery-password", recoveryPasswordController.recoveryPassword)
  .post("/recovery-password", recoveryPasswordController.recoveryPasswordPost)
  .get("/recovery-password/login/:hash", recoveryPasswordController.recoveryPasswordLogin);

export default router;
