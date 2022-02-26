import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectorMiddleWare, videoUpload } from "../middlewares";

const videoRouter = express.Router();

const idd = "/:id([0-9a-f]{24})";

//videoRouter.get(idd, watch);
// videoRouter.get(`${idd}/edit`, getEdit);
// videoRouter.post(`${idd}/edit`, postEdit);
videoRouter.route(idd).get(watch);
videoRouter
  .route(`${idd}/edit`)
  .all(protectorMiddleWare)
  .get(getEdit)
  .post(postEdit);
videoRouter.route(`${idd}/delete`).all(protectorMiddleWare).get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleWare)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );

export default videoRouter;
