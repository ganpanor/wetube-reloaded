import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  // console.log(videos);
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params; // <- ES6 //const id = req.params.id;
  const video = await Video.findById(id).populate("owner").populate("comments"); //owner 부분을 User의 reference로 채워줌
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params; // <- ES6 //const id = req.params.id;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id); //edit 템플릿에 video object를 보내야 하기 때문에 video를 찾아야 함
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;

  const video = await Video.exists({ _id: id }); // Video 모델을 이용하기 때문에 true or false만 구하면 됨
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    //mongoose의 model 활용
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes saved");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    //Session의 user에서 id를 가지고 옴
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  //here we will add a video to the videos array.
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/"); //back home
  } catch (error) {
    // console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  // console.log(req.query);
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  // const { id } = req.params;
  // const { text } = req.body;
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req; //fetch를 하면 쿠키(세션)이 같이 옴

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404); //sendStatus는 status code를 보내고 request를 끝내버림
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id }); //201: 생성됨을 의미
};

export const deleteComment = async (req, res) => {
  // const video = await Video.findById(id);

  const { id } = req.params;
  console.log(req.params);
  const {
    user: { _id },
  } = req.session;
  console.log(_id);
  const comment = await Comment.findById(id);
  console.log(comment);
  const video = await Video.findById(comment.video);
  console.log(video);

  if (!Comment) {
    return res.status(404).render("404", { pageTitle: "Comment not found." });
  }
  if (String(comment.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of this comment");
    return res.status(403).redirect("/");
  }
  await Comment.findByIdAndDelete(id);
  video.comments.pop(comment._id);
  video.save();
  console.log(video);
  return res.redirect("/");
};
