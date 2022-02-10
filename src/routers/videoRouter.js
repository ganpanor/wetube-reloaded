import express from "express";
import { watch, getEdit, postEdit, getUpload, postUpload, deleteVideo } from "../controllers/videoController";

const videoRouter = express.Router();

const idd = "/:id([0-9a-f]{24})"


//videoRouter.get(idd, watch);
// videoRouter.get(`${idd}/edit`, getEdit);
// videoRouter.post(`${idd}/edit`, postEdit);
videoRouter.route(idd).get(watch);
videoRouter.route(`${idd}/edit`).get(getEdit).post(postEdit);
videoRouter.route(`${idd}/delete`).get(deleteVideo);
videoRouter.route("/upload").get(getUpload).post(postUpload);

export default videoRouter;