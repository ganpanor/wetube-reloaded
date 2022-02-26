import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

console.log(process.cwd()); //check current working directory

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//브라우저가 백엔드와 상호작용 할 때마다 브라우저에 쿠키를 전송하는 역할을 하는 미들웨어
app.use(
  session({
    secret: process.env.COOKIE_SECRET, // 쿠키에 sign 할 때 사용하는 string (backend가 쿠키를 줬다는 것을 보여주기 위함)
    resave: false, //
    saveUninitialized: false, // 수정되지 않은 새 세션에게 쿠키를 줄지 여부
    // cookie: {
    //     maxAge: 20000 // 쿠키 만료시점 (1000ms)
    // },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

// 이 세션 미들웨어가 있으면 웹사이트를 방문할 때마다 express가 알아서 그 브라우저를 위한 세션 id를 만들고, 브라우저에게 보내준다
// 그러면 브라우저가 쿠키에 그 세션 id를 저장하고 express에서도 그 세션을 세션 DB에 저장한다
// app.use((req, res, next) => {
//     req.sessionStore.all((error, sessions) => {
//         console.log(sessions);
//         next();
//     });
// });

app.use(flash());
// 세션 미들웨어 다음에 로컬 미들웨어가 위치함으로써 로컬 미들웨어에서 세션 미들웨어에 접근이 가능해짐
app.use(localsMiddleware);
// static: Express에게 사람들이 이 폴더 안에 있는 파일들을 볼 수 있게 해달라고 요청하는 역할
app.use("/uploads", express.static("uploads"));
app.use("/rumble", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
