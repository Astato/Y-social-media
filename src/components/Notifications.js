import { ReactComponent as FilledLikeIcon } from "../icons/filled_like_icon.svg";
import { ReactComponent as CloseIcon } from "../icons/close_icon.svg";
import { ReactComponent as LoadingAnimation } from "../icons/tube-spinner.svg";
import profileDefaultImage from "../icons/profile-default.jpg";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import searchPost from "../utils/searchPost";

const Notifications = ({ setUser, setOpenPost, user, setThirdPartyUser }) => {
  const [notifications, setNotifications] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // const userPopupRef = useRef(null);
  const navigate = useNavigate();

  const getNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/social/update-notifications",
        { withCredentials: true }
      );
      if (response.status === 200 && response.data) {
        setUser(response.data);
        if (
          response.data.notifications &&
          response.data.notifications.length > 0
        ) {
          ///show last notifications first
          return setNotifications(response.data.notifications.reverse());
        }
        return;
      } else {
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      return error;
    }
  };

  const getPosts = async () => {
    const postsID = [];
    const usersID = [];
    let postsToGet = notifications;
    if (notifications.length > 15) {
      postsToGet = notifications.slice(0, 15);
    }
    for (const post of Object.values(postsToGet)) {
      postsID.push(post.post);
      usersID.push(post.issuer);
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/social?notificationPosts=${postsID}&&notificationUsers=${usersID}`
      );

      if (response.data) {
        //// replaces the post id with all the neccessary data username, post_content, etc.
        await replaceProperties(postsToGet, response.data.posts);
        await replaceProperties(postsToGet, response.data.users);
        setPosts(postsToGet);
        return setIsLoading(false);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  useEffect(() => {
    if (!notifications) {
      getNotifications();
    }
    if (notifications && !posts) {
      getPosts();
    }
  });

  function replaceProperties(originalObj, fetchedProperties) {
    for (const obj of originalObj) {
      for (const fetched of Object.values(fetchedProperties)) {
        if (obj.post === fetched._id) {
          obj.post = fetched;
        }
        if (obj.issuer === fetched._id) {
          obj.issuer = fetched;
        }
      }
    }
    return originalObj;
  }

  const handleOpenPost = async (e, post_id) => {
    if (!post_id) {
      setErrorMessage("It seems that the post has been deleted by the author");
    } else if (e.target.tagName !== "A") {
      const getPost = await searchPost(post_id);
      if (getPost) {
        if (getPost[0].creatorID === user._id) {
          setOpenPost(...getPost);
          return navigate(`/${user.name}/post/${post_id}`);
        } else {
          try {
            const getUser = await axios.get(
              `http://localhost:5000/social/getProfile?userID=${getPost[0].creatorID}`
            );
            if (getUser) {
              getPost.creator = getUser.data;
              setOpenPost(...getPost);
              return navigate(`/${getUser.data.name}/post/${post_id}`);
            }
          } catch (error) {
            console.log(error);
            return error;
          }
        }
      }
    }
  };

  const handleOpenProfile = async (clickedUser_id) => {
    console.log(clickedUser_id);
    try {
      const getUser = await axios.get(
        `http://localhost:5000/social/getProfile?userID=${clickedUser_id}`
      );
      if (getUser) {
        setThirdPartyUser(getUser.data);
        return navigate(`/${getUser.data.name}`);
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  return (
    <div id="notifications-container">
      <div
        id="errormessage-container"
        style={{
          display: errorMessage ? "flex" : "none",
          position: "fixed",
          zIndex: 99,
        }}
      >
        <p>{errorMessage}</p>
        <CloseIcon
          id="close-btn"
          onClick={() => setErrorMessage("")}
          style={{
            width: "20px",
            fill: "white",
            marginLeft: "2rem",
            stroke: "white",
            strokeWidth: "100",
          }}
        />
      </div>
      <div className="main topbar">
        <h3>Notifications</h3>
      </div>
      <main>
        {isLoading ? (
          <div className="loading-screen" style={{ width: "500px" }}>
            <div style={{ width: "5rem" }}>
              <LoadingAnimation></LoadingAnimation>
            </div>
          </div>
        ) : posts ? (
          posts.map((element) => {
            return (
              <div
                className="notification-item"
                onClick={(e) => {
                  handleOpenPost(e, element.post._id);
                }}
                key={element.issuer._id + element.post._id}
              >
                {element.notification_type === "likes" ? (
                  <div
                    style={{
                      display: "flex",
                      marginLeft: "20px",
                    }}
                  >
                    <FilledLikeIcon
                      id="filled-heart"
                      style={{
                        width: "30px",
                        height: "30px",
                        animation: "none",
                      }}
                    />{" "}
                  </div>
                ) : null}
                <div style={{ gridColumn: 2, marginTop: "1rem" }}>
                  <img
                    src={element.issuer.profile_img || profileDefaultImage}
                    style={{ width: "30px", borderRadius: "100%" }}
                  />
                  <p style={{ fontWeight: "bolder", color: "white" }}>
                    <a
                      onClick={() => {
                        handleOpenProfile(element.issuer._id);
                      }}
                    >
                      {element.issuer.username}
                    </a>
                    {element.notification_type === "likes" ? (
                      <span> liked your post</span>
                    ) : element.notification_type === "mention" ? (
                      <span> mentioned on a post</span>
                    ) : (
                      <span> replied your post</span>
                    )}
                    <p style={{ color: "gray" }}>{element.post.post_content}</p>
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <h1 style={{ textAlign: "center" }}>Nothing to see here... </h1>
        )}
      </main>
    </div>
  );
};

export default Notifications;
