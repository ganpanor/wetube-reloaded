import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  fileUrl: { type: String, required: true },
  thumbUrl: { type: String, required: true },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 140,
    minLength: 2,
  },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`)); // ?if :else
});

//middleware는 무조건 model이 생성되기 전에 만들어야 함
// videoSchema.pre('save', async function(){
//     this.hashtags = this.hashtags[0].split(",").map(word => word.startsWith("#") ? word : `#${word}`);
// });

const Video = mongoose.model("Video", videoSchema);
export default Video;
