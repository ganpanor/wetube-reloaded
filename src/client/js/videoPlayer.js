const video = document.querySelector("video");
const playBtn = document.querySelector("#play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.querySelector("#mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.querySelector("#volume");
const currenTime = document.querySelector("#currenTime");
const totalTime = document.querySelector("#totalTime");
const timeline = document.querySelector("#timeline");
const fullscreenBtn = document.querySelector("#fullScreen");
const videoContainer = document.querySelector("#videoContainer");
const videoControls = document.querySelector("#videoControls");

let controlsTimeout = null;
let controlMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (event) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleSpaceBar = (event) => {
  if (event.keyCode === 32) {
    handlePlayClick();
  }
};

const handleMute = (event) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(14, 5);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = video.currentTime;
};

const handleTimelineChange = (event) => {
  // console.log(event.target.value);
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    // 풀스크린 종료는 document에서 실행해야 됨
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  //마우스가 나갔다가 다시 들어오면 timeout을 없애줌
  if (controlsTimeout) {
    clearTimeout(controlsTimeout); // timeout을 없애고
    controlsTimeout = null; // 변수 초기화
  }
  if (controlMovementTimeout) {
    clearTimeout(controlMovementTimeout);
    controlMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  //setTimeout을 생성하면 브라우저에서 고유한 아이디를 지정해줌
  controlsTimeout = setTimeout(hideControls, 3000);
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, { method: "post" });
};

video.addEventListener("click", handlePlayClick);
playBtn.addEventListener("click", handlePlayClick);
document.addEventListener("keydown", handleSpaceBar);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadeddata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
fullscreenBtn.addEventListener("click", handleFullscreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
