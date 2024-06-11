import { useEffect, useRef, useState } from "react";
import { ReactComponent as OpenIcon } from "../icons/open_icon.svg";
import { ReactComponent as CloseIcon } from "../icons/close_icon.svg";
import { ReactComponent as BackIcon } from "../icons/back_icon.svg";
import Compressor from "compressorjs";
import "@pqina/pintura/pintura.css";
import { ReactComponent as LoadingAnimation } from "../icons/tube-spinner.svg";

import { getEditorDefaults } from "@pqina/pintura";
import { PinturaEditor } from "@pqina/react-pintura";
import defaultProfileImage from "../icons/profile-default.jpg";
import { Link } from "react-router-dom";
import Posts from "./Posts";
import axios from "axios";

const editorConfig = getEditorDefaults();

const ProfileSetUpDiaalog = ({ openDialog, setOpenDialog, setUser }) => {
  const dialogRef = useRef();
  const mediaInputRef = useRef();
  const textareaRef = useRef();
  const [profileImageData, setprofileImageData] = useState(false);
  const [headerImageData, setHeaderImageData] = useState(false);
  const [userBio, setUserBio] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [profileSetupŚtage, setProfileSetupState] = useState(0);
  const [editedProfileImage, setEditedProfileImage] = useState("");
  const [editedHeaderImage, setEditedHeaderImage] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);
  const editorRef = useRef(null);

  delete editorConfig.utils[10];
  delete editorConfig.utils[9];
  delete editorConfig.utils[5];
  delete editorConfig.utils[6];
  delete editorConfig.utils[7];
  delete editorConfig.utils[11];

  const ImageEditor = ({ image, scale, w, h }) => {
    return (
      <PinturaEditor
        ref={editorRef}
        {...editorConfig}
        src={image}
        imageTargetSize={{ width: w, height: h }}
        // layoutHorizontalUtilsPreference="top"
        previewUpscale={true}
        imageCropAspectRatio={scale}
      ></PinturaEditor>
    );
  };

  const handleEditImageClick = (type) => {
    editorRef.current.editor.processImage().then((imageResult) => {
      const file = imageResult.dest;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const result = reader.result;
        if (type === "profile") {
          return setEditedProfileImage(result);
        } else {
          return setEditedHeaderImage(result);
        }
      };
    });
  };

  const saveButtonStyle = {
    width: "10rem",
    fontSize: "21px",
    margin: "-7rem auto auto auto",
  };

  const handleProfileImagePicker = () => {
    const clickEvent = new MouseEvent("click");
    mediaInputRef.current.dispatchEvent(clickEvent);
  };

  const handleSaveProfile = async () => {
    if (!userBio && !userLocation && !profileImageData && !headerImageData) {
      return setOpenDialog(false);
    }
    const obj = {
      bio: userBio,
      location: userLocation,
      profile_img: editedProfileImage,
      header_img: editedHeaderImage,
    };
    const options = {
      method: "POST",
      url: "http://localhost:5000/social/update-profile",
      data: obj,
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const updateProfile = await axios(options);
      if (updateProfile.status === 200) {
        setUser(updateProfile.data);
        window.location.reload();
        return;
      }
      if (updateProfile.status === 413) {
        return setErrorMessage(
          "Images sizes are too large.Maximum allowed is 10mb "
        );
      } else {
        return setErrorMessage("An error has ocurred, please try again later.");
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const mediaHandler = async (e, type) => {
    if (!e.target.files[0]) {
      return;
    }
    const file = e.target.files[0];
    const filesize = e.target.files[0].size;
    if (filesize > 26214400) {
      e.target = "";
      return null;
    }

    if (type === "profile") {
      setEditedProfileImage("");
      setprofileImageData(file);
    } else {
      setEditedHeaderImage("");
      setHeaderImageData(file);
    }
  };

  return (
    <dialog ref={dialogRef} open={openDialog} id="profile-setup-dialog">
      <div
        id="dialog-wrapper"
        style={{
          marginLeft: "-1rem",
        }}
      >
        {profileSetupŚtage > 0 ? (
          <BackIcon
            onClick={() => setProfileSetupState((prev) => prev - 1)}
            id="back-button"
            style={{
              fill: "white",
              position: "absolute",
              width: "25px",
              marginLeft: "1rem",
              top: 0,
            }}
          />
        ) : null}
        <CloseIcon
          className="close-button"
          style={{
            zIndex: "99",
            position: "absolute",
            top: ".8rem",
            marginLeft: "90%",
          }}
          onClick={() => {
            dialogRef.current.close();
            setProfileSetupState(0);
            setOpenDialog(false);
          }}
        />

        {profileSetupŚtage === 0 ? (
          <>
            {profileImageData && !editedProfileImage ? (
              <dialog
                open={true}
                style={{
                  height: "500px",
                  width: "500px",
                  margin: "auto 0%",
                  zIndex: 9999,
                }}
              >
                <ImageEditor
                  image={profileImageData}
                  scale={1}
                  w={300}
                  h={300}
                />
                <button
                  className="white-button"
                  onClick={() => handleEditImageClick("profile")}
                  style={{ position: "absolute", bottom: "-1.5rem" }}
                >
                  Accept
                </button>
              </dialog>
            ) : null}
            <div className="dialog-stage-content-wrapper">
              <h1>Pick a profile picture</h1>
              <input
                type="file"
                accept="image/png, image/jpeg"
                hidden={true}
                ref={mediaInputRef}
                onChange={(e) => mediaHandler(e, "profile")}
              />
              <div
                style={{
                  marginTop: "-5rem",
                }}
              >
                <button id="image-picker" onClick={handleProfileImagePicker}>
                  <OpenIcon
                    id="open-icon"
                    style={{
                      position: "absolute",
                      top: "45%",
                      left: "44%",
                      fill: "black",
                    }}
                  />
                  <img src={editedProfileImage || defaultProfileImage}></img>
                </button>
              </div>
            </div>
          </>
        ) : profileSetupŚtage === 1 ? (
          <>
            {headerImageData && !editedHeaderImage ? (
              <dialog
                open={true}
                style={{
                  height: "500px",
                  width: "500px",
                  margin: "auto 0%",
                  zIndex: 9999,
                }}
              >
                <ImageEditor
                  image={headerImageData}
                  scale={2}
                  w={850}
                  h={300}
                />
                <button
                  className="white-button"
                  onClick={() => handleEditImageClick("header")}
                  style={{ position: "absolute", bottom: "-1.5rem" }}
                >
                  Accept
                </button>
              </dialog>
            ) : null}
            <div className="dialog-stage-content-wrapper">
              <h1>Pick a header</h1>
              <input
                type="file"
                accept="image/png, image/jpeg"
                hidden={true}
                ref={mediaInputRef}
                onChange={(e) => {
                  mediaHandler(e, "header");
                }}
              />
              <div>
                <button
                  id="image-picker"
                  style={{
                    width: "100%",
                    borderRadius: 0,
                    backgroundColor: "gray",
                    border: "none",
                    marginBottom: "3rem",

                    backgroundImage: editedHeaderImage
                      ? `url(${editedHeaderImage})`
                      : "none",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                  onClick={handleProfileImagePicker}
                >
                  <OpenIcon
                    id="open-icon"
                    style={{ fill: "white", position: "absolute" }}
                  />
                </button>
              </div>
              <img
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10px",
                  width: "150px",
                  height: "150px",
                }}
                id="image-picker"
                src={editedProfileImage || defaultProfileImage}
              ></img>
            </div>
          </>
        ) : profileSetupŚtage === 2 ? (
          <div div className="dialog-stage-content-wrapper">
            <h1>Describe yourself</h1>
            <textarea
              ref={textareaRef}
              id="bio-textarea"
              maxLength={150}
              cols={1}
              rows={5}
              autoFocus={true}
              value={userBio}
              placeholder="Your bio..."
              onChange={(e) => setUserBio(e.target.value)}
            />
          </div>
        ) : profileSetupŚtage === 3 ? (
          <div div className="dialog-stage-content-wrapper">
            <h1>Where do you live?</h1>
            <input
              className="input-style"
              type="text"
              autoFocus={true}
              placeholder="Location"
              style={{ width: "400px", margin: "auto" }}
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
            ></input>
          </div>
        ) : (
          <div>
            <h1
              style={{
                margin: "auto",
                marginTop: "11rem",
              }}
            >
              Save the updates
            </h1>
            <p
              style={{
                fontWeight: "bolder",
                fontSize: "20px",
                color: "orangered",
                margin: "2rem auto 1rem auto",
                textAlign: "center",
              }}
            >
              {errorMessage}
            </p>
          </div>
        )}
      </div>
      <button
        className="white-button"
        style={profileSetupŚtage === 4 ? saveButtonStyle : {}}
        onClick={() => {
          if (profileSetupŚtage === 4) {
            return handleSaveProfile();
          } else {
            return setProfileSetupState((prev) => prev + 1);
          }
        }}
      >
        {profileSetupŚtage !== 4 ? "Continue" : "Save"}
      </button>
    </dialog>
  );
};

const Profile = ({
  user,
  setUser,
  isThirdParty,
  setThirdPartyUser,
  setOpenPost,
}) => {
  const [userPosts, setUserPosts] = useState(false);
  const [userPostsCount, setUserPostsCount] = useState(0);
  const [userLikedPosts, setUserLikedPosts] = useState(false);
  const [likedPostsCount, setLikedPostsCount] = useState(0);
  const [userRepliedPosts, setUserRepliedPosts] = useState(false);
  const [repliedPostsCount, setRepliedPostsCount] = useState(0);
  const [thirdPartyProfile, setThirdPartyProfile] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [postsTab, setPostsTab] = useState(1);
  const [repliesTab, setRepliesTab] = useState(0);
  const [likesTab, setLikesTab] = useState(0);

  const handleSetUpProfile = () => {
    return setOpenDialog(true);
  };

  const handleGetPosts = async (query, thirdPartyID, skipValue) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/social?${query}=true&&isThirdParty=${thirdPartyID}&&skipCount=${skipValue}`
      );
      if (
        response.status === 200 &&
        response.data.length > 0 &&
        skipValue === 0
      ) {
        query === "likes"
          ? setUserLikedPosts(response.data)
          : query === "replies"
          ? setUserRepliedPosts(response.data)
          : setUserPosts(response.data);
        return;
      } else if (
        response.status === 200 &&
        response.data.length > 0 &&
        skipValue >= 10
      ) {
        query === "likes"
          ? setUserLikedPosts((prev) => [...prev, ...response.data])
          : query === "replies"
          ? setUserRepliedPosts((prev) => [...prev, ...response.data])
          : setUserPosts((prev) => [...prev, ...response.data]);
        return;
      } else {
        query === "likes"
          ? setUserLikedPosts(false)
          : query === "replies"
          ? setUserRepliedPosts(false)
          : setUserPosts(false);
        return;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const getLikedPosts = async () => {
    setPostsTab(0);
    setRepliesTab(0);
    setLikesTab(1);
    if (
      (user.likes && user.likes.length === 0 && !isThirdParty) ||
      (isThirdParty && thirdPartyProfile.likes.length === 0)
    ) {
      return;
    } else if (userLikedPosts) {
      return;
    } else if (isThirdParty && thirdPartyProfile) {
      setLikedPostsCount(thirdPartyProfile.likes.length);
      return await handleGetPosts("likes", thirdPartyProfile._id, 0);
    } else {
      setLikedPostsCount(user.likes.length);
      return await handleGetPosts("likes", false, 0);
    }
  };
  const getRepliedPosts = async () => {
    setPostsTab(0);
    setRepliesTab(1);
    setLikesTab(0);
    if (
      (user.replies && user.replies.length === 0 && !isThirdParty) ||
      (isThirdParty && thirdPartyProfile.replies.length === 0)
    ) {
      return;
    } else if (userRepliedPosts) {
      return;
    } else if (isThirdParty && thirdPartyProfile) {
      setRepliedPostsCount(thirdPartyProfile.likes.length);
      return await handleGetPosts("replies", thirdPartyProfile._id, 0);
    } else {
      setRepliedPostsCount(user.replies.length);
      return await handleGetPosts("replies", false, 0);
    }
  };

  const getUserPosts = async () => {
    setPostsTab(1);
    setRepliesTab(0);
    setLikesTab(0);
    if (
      (user.posts && user.posts.length === 0 && !isThirdParty) ||
      (isThirdParty && thirdPartyProfile.posts.length === 0)
    ) {
      return;
    } else if (userPosts) {
      return;
    } else if (isThirdParty && thirdPartyProfile) {
      setUserPostsCount(thirdPartyProfile.posts.length);
      return await handleGetPosts("userPosts", thirdPartyProfile._id, 0);
    } else {
      setUserPostsCount(user.posts.length);
      return await handleGetPosts("userPosts", false, 0);
    }
  };

  //get thirdParty user profile
  async function getProfile() {
    try {
      const response = await axios.get(
        /// the data "user" is being replaced by an id when a third party user name
        // is clicked on a post, I.E client's want to see user profile of the post creator
        // so there's no data besides an id. This is being done in Posts.js on
        /// handleViewUserProfile at line 296
        "http://localhost:5000/social/getProfile?userID=" + user._id
      );
      if (response.data && response.status === 200) {
        const clientID = user.clientID;
        user = response.data;
        user.clientID = clientID;
        setThirdPartyUser(user);
        return setThirdPartyProfile(user);
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  const handleFollowUser = async (action) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/social/follow?followAction=${action}&&interactedUserID=${user._id}`
      );
      if (response.status === 200 && action === "follow") {
        ///adds the client id to the third party user followers profile, so the
        /// followers count change without the need od a re-render
        const updateFollowers = { ...thirdPartyProfile };
        updateFollowers.followers.push(thirdPartyProfile.clientID);
        setThirdPartyProfile(updateFollowers);
        setUser(response.data);
        return;
      }
      if (response.status === 200 && action === "unfollow") {
        ///samme as follows, but removes it. so the followers counts decrreses
        const index = thirdPartyProfile.followers.indexOf(
          thirdPartyProfile.clientID
        );
        const updateFollowers = { ...thirdPartyProfile };
        updateFollowers.followers.splice(index, 1);
        setThirdPartyProfile(updateFollowers);
        setUser(response.data);

        return;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const loadMore = async () => {
    if (postsTab && userPosts.length < userPostsCount) {
      isThirdParty
        ? await handleGetPosts(
            "userPosts",
            thirdPartyProfile._id,
            userPosts.length
          )
        : await handleGetPosts("userPosts", false, userPosts.length)
            .then(() => console.log("Success"))
            .catch((error) => console.log(error));
    } else if (likesTab && userLikedPosts.length < likedPostsCount) {
      isThirdParty
        ? await handleGetPosts(
            "likes",
            thirdPartyProfile._id,
            userLikedPosts.length
          )
        : await handleGetPosts("likes", false, userLikedPosts.length);
    } else if (repliesTab && userRepliedPosts.length < repliedPostsCount) {
      isThirdParty
        ? await handleGetPosts(
            "replies",
            thirdPartyProfile._id,
            userRepliedPosts.length
          )
        : await handleGetPosts("replies", false, userRepliedPosts.length);
    } else {
      return;
    }
  };

  useEffect(() => {
    if (isThirdParty && !thirdPartyProfile) {
      getProfile();
    }
    if (isThirdParty && thirdPartyProfile && !userPosts && postsTab) {
      handleGetPosts("userPosts", thirdPartyProfile._id, 0);
    }
    if (
      !userPosts &&
      postsTab &&
      user.posts &&
      user.posts.length > 0 &&
      !isThirdParty
    ) {
      setUserPostsCount(user.posts.length);
      handleGetPosts("userPosts", false, 0);
    }
  });

  return (
    <div id="profile-container">
      <div className="main topbar">
        <BackIcon
          className="close-button"
          style={{ marginRight: "1rem" }}
          aria-label="back"
          onClick={() => window.history.back()}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            margin: "0 1rem",
          }}
        >
          <h3 style={{ margin: "0" }}>{user.name}</h3>
          <p style={{ margin: "0", fontSize: "12px", color: "gray" }}>
            Posts {user.posts?.length || 0}
          </p>
        </div>
      </div>
      <div id="profile-page">
        <div
          id="header-image"
          style={{
            width: "100%",
            backgroundImage: user.header_img ? `url(${user.header_img})` : null,
          }}
        ></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <img
            id="profile-image"
            src={user.profile_img || defaultProfileImage}
          />
          {isThirdParty ? (
            thirdPartyProfile.followers?.length === 0 ||
            thirdPartyProfile.followers?.indexOf(thirdPartyProfile.clientID) ===
              -1 ? (
              <button
                className="white-button"
                style={{ height: "fit-content", margin: "1rem" }}
                onClick={() => handleFollowUser("follow")}
              >
                Follow
              </button>
            ) : (
              <button
                className="white-button"
                style={{ height: "fit-content", margin: "1rem" }}
                onMouseOver={(e) => (
                  (e.target.style.backgroundColor = "red"),
                  (e.target.style.color = "white")
                )}
                onMouseLeave={(e) => (
                  (e.target.style.backgroundColor = "white"),
                  (e.target.style.color = "black")
                )}
                onClick={() => handleFollowUser("unfollow")}
              >
                Unfollow
              </button>
            )
          ) : (
            <button
              className="black-button"
              style={{ height: "fit-content", margin: "1rem" }}
              onClick={() => setOpenDialog(!openDialog)}
            >
              Set up Profile
            </button>
          )}
          <ProfileSetUpDiaalog
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            setUser={setUser}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>{user.name}</h2>
          <p style={{ marginTop: "1px", color: "gray", fontSize: "16px" }}>
            {user.username}
          </p>
          <p style={{ margin: "0", color: "gray", fontSize: "14px" }}>
            Joined on{" "}
            {thirdPartyProfile
              ? new Date(thirdPartyProfile.joined_date).toLocaleDateString()
              : new Date(user.joined_date).toLocaleDateString()}
          </p>
          <p style={{ lineBreak: "anywhere" }}> Bio: {user.bio}</p>
          <div style={{ display: "flex", gap: "1rem", color: "gray" }}>
            <Link
              to={
                isThirdParty
                  ? `/${thirdPartyProfile.username}/following`
                  : `/${user.username}/following`
              }
            >
              <span style={{ color: "white" }}>
                {thirdPartyProfile.following?.length ||
                  user.following?.length ||
                  0}
              </span>{" "}
              Following
            </Link>
            <Link
              to={
                isThirdParty
                  ? `/${thirdPartyProfile.username}/followers`
                  : `/${user.username}/followers`
              }
            >
              <span style={{ color: "white" }}>
                {thirdPartyProfile.followers?.length ||
                  user.followers?.length ||
                  0}
              </span>{" "}
              Followers
            </Link>
          </div>
        </div>
        <div className="profile-tabs">
          <div className="tab" onClick={getUserPosts}>
            <div>
              Posts
              <hr className="border" style={{ opacity: postsTab }} />
            </div>
          </div>
          <div className="tab" onClick={getRepliedPosts}>
            <div>
              Replies
              <hr className="border" style={{ opacity: repliesTab }} />
            </div>
          </div>
          <div className="tab" onClick={getLikedPosts}>
            <div>
              Likes
              <hr className="border" style={{ opacity: likesTab }} />
            </div>
          </div>
        </div>
        <div id="profile-tabs-content">
          {postsTab ? (
            <div className="posts-container">
              {(!userPosts && user.posts?.length > 0) ||
              (thirdPartyProfile.posts?.length > 0 && !userPosts) ? (
                <div className="loading-screen">
                  <div style={{ width: "5rem" }}>
                    <LoadingAnimation></LoadingAnimation>
                  </div>
                </div>
              ) : null}
              {userPosts ? (
                <Posts
                  userInteractedPosts={userPosts}
                  setUserInteractedPosts={setUserPosts}
                  loadMore={loadMore}
                  userInteractedPostsCount={userPostsCount}
                  user={user}
                  setUser={setUser}
                  setOpenPost={setOpenPost}
                ></Posts>
              ) : (!isThirdParty && user.posts?.length === 0) ||
                (isThirdParty && thirdPartyProfile.posts?.length === 0) ? (
                <h2>No post made yet...</h2>
              ) : null}
            </div>
          ) : likesTab ? (
            <div className="posts-container">
              {userLikedPosts ? (
                <Posts
                  userInteractedPosts={userLikedPosts}
                  setUserInteractedPosts={setUserLikedPosts}
                  loadMore={loadMore}
                  userInteractedPostsCount={likedPostsCount}
                  user={user}
                  setUser={setUser}
                  setOpenPost={setOpenPost}
                ></Posts>
              ) : (!isThirdParty && user.likes.length === 0) ||
                (isThirdParty && thirdPartyProfile.posts.length === 0) ? (
                <h2>No post liked yet...</h2>
              ) : null}
            </div>
          ) : (
            <div className="posts-container" style={{ width: "100%" }}>
              {userRepliedPosts ? (
                <Posts
                  style={{ height: "20rem" }}
                  userInteractedPosts={userRepliedPosts}
                  setUserInteractedPosts={setUserRepliedPosts}
                  loadMore={loadMore}
                  userInteractedPostsCount={repliedPostsCount}
                  user={user}
                  setUser={setUser}
                  setOpenPost={setOpenPost}
                ></Posts>
              ) : (!isThirdParty && user.replies.length === 0) ||
                (isThirdParty && thirdPartyProfile.posts.length === 0) ? (
                <h2>No post replied yet...</h2>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
