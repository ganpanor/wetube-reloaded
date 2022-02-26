import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcryptjs";
import { path } from "express/lib/application";

export const getJoin = (req, res) =>
  res.render("users/join", { pageTitle: "Create Account" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const exists = await User.exists({ $or: [{ username }, { email }] });
  const pageTitle = "Join";
  if (exists) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "This username is already taken",
    });
  }

  if (password !== password2) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("../login", {
      pageTitle,
      errorMessage: "no account",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("/login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GIT_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GIT_CLIENT,
    client_secret: process.env.GIT_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  // access_token: Github API URL을 fetch하는데 사용됨
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.login,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

// const client_id= process.env.KKO_CLIENT;
// const redirect_uri= "http://localhost:4000/users/kakao/finish";
// const response_type= "code";
// const client_secret= process.env.KKO_SECRET;

export const startKakaoLogin = (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.KKO_CLIENT,
    redirect_uri: "http://localhost:4000/users/kakao/finish",
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  // console.log(params);
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  // return res.end();
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    client_id: process.env.KKO_CLIENT,
    redirect_uri: "http://localhost:4000/users/kakao/finish",
    response_type: "code",
    client_secret: process.env.KKO_SECRET,
    code: req.query.code,
    grant_type: "authorization_code",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://kapi.kakao.com";
    const userData = await (
      await fetch(`${apiUrl}/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          property_keys: "kakao_account.email",
        },
      })
    ).json();
    // console.log(userData);
    const hasEmail = userData.kakao_account.has_email;
    const emailObj = userData.kakao_account.email;
    if (hasEmail == false) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj });
    console.log(user);
    if (!user) {
      console.log("user");
      user = await User.create({
        avatarUrl: userData.properties.profile_image,
        name: userData.properties.nickname,
        username: userData.kakao_account.email,
        email: userData.kakao_account.email,
        password: "",
        socialOnly: true,
        location: "",
      });
    }
    console.log("hi");
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("../login");
  }
};

export const logout = (req, res) => {
  // req.session.destroy();
  req.session.user = null;
  res.locals.loggedInUser = req.session.user;
  req.session.loggedIn = false;
  req.flash("info", "Bye Bye");
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    }, // req 안에 있는  session에서 user의 id를 얻음
    body: { name, email, username, location },
    file,
    // req 안의 body에 있는 name, email, username, paaword
  } = req;
  console.log(path);
  // 같은 의미
  // const id  = req.session.user.id
  // const { name, email, username, location } = req.body;

  // session update
  /*1. 직접 하는 방법
    await User.findByIdAndUpdate(_id, {
        name, email, username, location 
    });
    req.session.user = {
        ...req.session.user, // 기존 session
        //새로운 정보로 덮어씀
        name, email, username, location,
    };*/

  // if (exists) {
  //   console.log("alalal");
  // }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      // 업데이트 하려는 user의 id
      _id,
      {
        // 업데이트 하려는 정보
        avatarUrl: file ? file.path : avatarUrl, // if file exists -> file.path
        name,
        email,
        username,
        location,
        updated: true,
      },
      { new: true } // option
    );
    req.session.user = updatedUser;
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }

  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  // const { oldPW, newPW, newPWConfirm } = req.body;
  const {
    session: {
      user: { _id },
    },
    body: { oldPW, newPW, newPWConfirm },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPW, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPW !== newPWConfirm) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "password does not match",
    });
  }
  user.password = newPW;
  await user.save();
  req.flash("info", "Password updated");
  return res.redirect("users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  // console.log(user);
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};
