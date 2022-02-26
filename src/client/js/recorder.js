import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.querySelector("#actionBtn");
const video = document.querySelector("#preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
    log: true,
  });

  await ffmpeg.load();

  // 메모리에 파일을 저장하고 / 파일명은 files.input이라 하고 / videoFile로부터 파일 정보를 가져온다
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile)); // ffmpeg의 가상 세계에 파일을 생성함

  await ffmpeg.run("-i", files.input, "-r", "60", files.output); // 생성한 파일을 60프레임의 output.mp4로 변환

  await ffmpeg.run(
    "-i", //-i : input
    files.input, // files.input을 인풋으로 받고
    "-ss", //
    "00:00:01", // 시간대를 찾고
    "-frames:v",
    "1", // 1장의 스크린샷을 찍어서
    files.thumb // thumbnail.jpg로 저장함
  );

  // 만들어진 파일들을 읽음
  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  // buffer를 통해 만들어진 binary data로 mp4/jpg 파일을 만듬
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  // blob(파일)을 가지고 objectURL을 만듬 ,
  // 이 url은 서버에 있는 것이 아니고, 브라우저를 받기 전까지만 브라우저에 있음
  const mp4Url = URL.createObjectURL(mp4Blob); //- URL을 통해 파일에 접근
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  // 서버를 가볍게 유지하기 위해 이미 사용해서 불필요해진 정보들을 제거함
  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);
  URL.revokeObjectURL(videoFile);
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

const handleStop = () => {
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  //   stop() 이벤트 발생시 dataavailable 이벤트도 함께 실행됨
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data); // createObjectURL: 브라우저 메모리에서만 사용 가능한 URL을 생성
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 1024, height: 576 },
    // video: { width: 500 },
  });
  video.srcObject = stream;
  video.play();
};

init();

actionBtn.addEventListener("click", handleStart);
