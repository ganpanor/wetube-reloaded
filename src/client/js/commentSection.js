const videoContainer = document.querySelector("#videoContainer");
const form = document.querySelector("#commentForm");
let videoComments = document.querySelector(".video__comments ul");
let targetComments = videoComments.querySelectorAll("li");
let newComment;
const addComment = (text, id) => {
  newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  const span2 = document.createElement("span");
  span2.classList.add("delete__comment");
  span2.innerText = "x";
  span.innerText = ` ${text}`;
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
  //   newComment.addEventListener("click", console.log("alal"));
};

const handleSubmit = async (event) => {
  event.preventDefault(); // 브라우저의 기본 기능을 정지함 (새로고침 방지)
  const textArea = form.querySelector("textarea");
  const text = textArea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "" || text.trim() === "") {
    return;
  }
  // fetch는 backend로 가야 하고 backend는 DB랑 뭔가를 하고 나서, status code를 리턴하고
  // 그리고 backend가 우리에게 돌아옴 => 시간이 걸림 => await 사용
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      // header는 기본적으로 request에 대한 정보를 담고 있음
      "Content-Type": "application/json", // 내가 보내는 정보는 json string 이라는 것을 알려줌
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    textArea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};
if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleDelete = async (target) => {
  console.log("hi");
  const commentId = target.path[1].dataset.id;
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "post",
  });
  if (response.status === 200) {
    target.path[2].removeChild(target.path[1]);
  }

  console.log(response.status);
};

if (targetComments) {
  targetComments.forEach((targetComment) => {
    const deleteComment = targetComment.querySelector(".delete__comment");
    deleteComment.addEventListener("click", handleDelete);
  });
}

let observer = new MutationObserver((mutations) => {
  // 노드가 변경 됐을 때의 작업
  const deleteComment2 = newComment.querySelector(".delete__comment");
  console.log(newComment);
  deleteComment2.addEventListener("click", handleDelete);
});
let option = {
  attributes: true,
  childList: true,
  characterData: true,
};
observer.observe(videoComments, option);
