import router from "../../../router.ts";
import homeController from "../controllers/homeController.ts";

router
  .get("/", homeController.home);

export default router;
