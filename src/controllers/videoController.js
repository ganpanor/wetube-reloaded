import Video from "../models/Video";

export const home = async(req, res) => {
    const videos = await Video.find({}).sort({createdAt:"desc"});
    console.log(videos);
    return res.render("home", {pageTitle:"Home" , videos});
};
export const watch = async (req, res) => {
    const { id } = req.params; // <- ES6 //const id = req.params.id;
    const video = await Video.findById(id);
    if(!video){
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("watch", { pageTitle: video.title, video });
};
export const getEdit = async (req, res) => {
    const { id } = req.params; // <- ES6 //const id = req.params.id;
    const video = await Video.findById(id); //edit 템플릿에 video object를 보내야 하기 때문에 video를 찾아야 함
    if(!video){
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.exists({ _id:id }); // Video 모델을 이용하기 때문에 true or false만 구하면 됨
    if(!video){
        return res.render("404", { pageTitle: "Video not found." });
    }
    await Video.findByIdAndUpdate(id, { //mongoose의 model 활용
        title, 
        description, 
        hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect(`/videos/${id}`);    
};

export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle:"Upload Video"});
};

export const postUpload = async (req, res) => {
    //here we will add a video to the videos array.
    const { title, description, hashtags } = req.body;
    try {
        await Video.create({
            title,
            description,
            hashtags: Video.formatHashtags(hashtags),
        });
        return res.redirect("/"); //back home
    } catch (error) {
        // console.log(error);
        return res.render("upload", {
            pageTitle: "Upload Video", 
            errorMessage: error._message,
        });
    };
};

export const deleteVideo = async(req, res) => {
    const { id } = req.params;
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async(req, res) => {
    console.log(req.query);
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, 'i')
            },
        });
    };
    return res.render("search", {pageTitle: "Search", videos });
};

