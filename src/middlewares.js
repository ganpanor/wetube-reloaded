import { request } from "express";
import { redirect } from "express/lib/response";

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Wetube";
  res.locals.loggedIn = Boolean(req.session.loggedIn); //boolean 하는 이유: 값이 false나 undefined일 수도 있기 때문
  res.locals.loggedInUser = req.session.user || {};
  next(); //next 없으면 사이트 작동 안함
};

// 사용자가 로그인 돼 있지 않은 것을 확인하면 로그인 페이지로 redirect
export const protectorMiddleWare = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

const multer = require("multer");
// export const uploadFiles = multer({ dest: "uploads/" });

export const avatarUpload = multer({
  dest: "uploads/avstars",
  limits: {
    fileSize: 3000000,
  },
});
export const videoUpload = multer({
  dest: "uploads/videos",
  limits: {
    fileSize: 10000000,
  },
});
