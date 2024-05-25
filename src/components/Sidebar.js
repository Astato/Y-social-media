import React, { useEffect, useState } from "react";
import { ReactComponent as HomeIcon } from "../icons/home_icon.svg";
import { ReactComponent as NotificationsIcon } from "../icons/notifications_icon.svg";
import { ReactComponent as MessagesIcon } from "../icons/messages_icon.svg";
import { ReactComponent as BookmarksIcon } from "../icons/bookmark_icon.svg";
import { ReactComponent as ProfileIcon } from "../icons/profile_icon.svg";
import { ReactComponent as SettingsIcon } from "../icons/settings_icon.svg";
import axios from "axios";
import { ReactComponent as Logo } from "../icons/logo.svg";
import { socket } from "../socket";

import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({
  unreadNotification,
  user,
  setThirdPartyUser,
  setHashtagFilter,
  setSettingsPage,
  setShowNewPostsNotification,
}) => {
  const [showNotificationIcon, setShowNotificationIcon] =
    useState(unreadNotification);
  const [newPostCount, setNewPostCount] = useState(
    Number(sessionStorage.getItem("newPostsCount")) || 0
  );

  const handleLogout = async () => {
    try {
      const logout = await axios.get("http://localhost:5000/social/logout");
      if (logout.status === 200) {
        console.log(logout);
        return (window.location.href = "/");
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const newPostUnread = Number(sessionStorage.getItem("newPostsCount"));
    if (newPostUnread > 0 && newPostCount === 0) {
      setNewPostCount(newPostUnread);
    }
    function onNewPost() {
      setNewPostCount((prev) => prev + 1);
      setShowNewPostsNotification(true);
      sessionStorage.setItem("newPostsCount", newPostCount + 1);
    }

    socket.on("New Post Notification", onNewPost);
    return () => {
      socket.off("New Post Notification", onNewPost);
    };
  }, []);

  useEffect(() => {
    if (
      location.pathname !== "/Profile/newGoogleLogin" &&
      user.googleID &&
      !user.username
    ) {
      navigate("/Profile/newGoogleLogin");
    }
    if (location.pathname === "/Settings") {
      setSettingsPage(true);
    } else {
      setSettingsPage(false);
    }
  }, [location]);

  if (location.pathname === "/Profile/newGoogleLogin") {
    return;
  }

  return (
    <nav id="sidebar">
      <div id="sidebar-items">
        <Link id="home" to="/" style={{ padding: ".8rem" }}>
          <Logo />
        </Link>
        <Link
          to="/"
          onClick={() => {
            setHashtagFilter("");
          }}
        >
          <HomeIcon className="sidebar-icon" />
          <p>Home</p>
        </Link>
        {/* <Link to="/explore">
          <SearchIcon className="sidebar-icon" />
          <p>Explore</p>
        </Link> */}
        <Link
          to="/notifications"
          onClick={() => setShowNotificationIcon(!showNotificationIcon)}
        >
          <NotificationsIcon className="sidebar-icon" />
          <p>Notifications</p>
          <div
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: "rgb(29, 155, 240)",
              borderRadius: "100%",
              display: unreadNotification ? "flex" : "none",
            }}
          ></div>
        </Link>
        <Link to="messages">
          <MessagesIcon className="sidebar-icon" />
          <p>Messages</p>
          <div
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: "rgb(29, 155, 240)",
              borderRadius: "100%",
              display: user.messages ? "flex" : "none",
            }}
          ></div>
        </Link>
        <Link to="/Bookmarks">
          <BookmarksIcon id="bookmarks" className="sidebar-icon" />
          <p>Bookmarks</p>
        </Link>
        {/* <Link>
          <p>Communities</p>
        </Link> */}
        <Link to="/Profile" onClick={() => setThirdPartyUser(false)}>
          <ProfileIcon
            className="sidebar-icon"
            onClick={() => setThirdPartyUser(false)}
          />
          <p>Profile</p>
        </Link>
        <Link to="/Settings">
          <SettingsIcon className="sidebar-icon" />
          <p>Settings</p>
        </Link>
        <button
          onClick={handleLogout}
          className="white-button"
          style={{ margin: "1rem" }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
export default Sidebar;
