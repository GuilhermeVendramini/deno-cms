import router from "../../../../../router.ts";
import recoveryPasswordController from "../controllers/recoveryPasswordController.ts";

router
  .get("/recovery-password", recoveryPasswordController.recoveryPassword);

export default router;
