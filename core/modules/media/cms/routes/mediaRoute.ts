import { upload } from "upload";
import router from "../../../../router.ts";
import mediaController from "../controllers/mediaController.ts";

router
  .get("/demo-upload", mediaController.demoUpload)
  .post(
    "/upload",
    upload("uploads", ["jpg", "png"], 20000000, 10000000, true, false, true),
    mediaController.posUpload,
  );

export default router;
