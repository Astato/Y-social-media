import { useEffect, useState } from "react";
import axios from "axios";
import defaultProfileImage from "../icons/profile-default.jpg";
import { ReactComponent as LoadingAnimation } from "../icons/tube-spinner.svg";
import { useNavigate } from "react-router-dom";
import { BASEURL } from "../App";
const Followers = ({
  user,
  setUser,
  isThirdParty,
  show,
  thirdPartyUser,
  setThirdPartyUser,
}) => {
  const [followers, setFollowers] = useState(false);
  const [following, setFollowing] = useState(false);
  const [tabSelected, setTabSelected] = useState(show);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleFollowUser = async (action, interactedUserID) => {
    try {
      const response = await axios.get(
        `${BASEURL}/social/follow?followAction=${action}&interactedUserID=${interactedUserID}`
      );
      if (response.status === 200) {
        setUser(response.data);
        return;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const getFollowersData = async (query, thirdPartyUserId) => {
    try {
      const response = await axios.get(
        `${BASEURL}/social/following-followers?get=${query}&thirdPartyUserId=${thirdPartyUserId}`
      );
      if (response.data && response.status === 200) {
        query === "following"
          ? setFollowing(response.data)
          : setFollowers(response.data);
        return setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const handleOpenProfile = async (clickedUser_id) => {
    try {
      const getUser = await axios.get(
        `${BASEURL}/social/getProfile?userID=${clickedUser_id}`
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

  useEffect(() => {
    if (
      !isThirdParty &&
      user.followers.length > 0 &&
      tabSelected === "Followers" &&
      !followers
    ) {
      getFollowersData("followers", false);
    }
    if (
      !isThirdParty &&
      user.following.length > 0 &&
      tabSelected === "Following" &&
      !following
    ) {
      getFollowersData("following", false);
    }

    if (
      isThirdParty &&
      thirdPartyUser.followers.length > 0 &&
      tabSelected === "Followers" &&
      !followers
    ) {
      getFollowersData("followers", thirdPartyUser._id);
    }
    if (
      isThirdParty &&
      thirdPartyUser.following.length > 0 &&
      tabSelected === "Following" &&
      !following
    ) {
      getFollowersData("following", thirdPartyUser._id);
    } else {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  });

  const Users = ({ data }) => {
    if (!data && !isLoading) {
      return (
        <div style={{ textAlign: "center" }}>
          {show === "Followers" && !isThirdParty ? (
            <h2>You are not following anyone yet</h2>
          ) : show === "Following" && !isThirdParty ? (
            <h2>Seems that you don't have any followers yet</h2>
          ) : show === "Followers" && isThirdParty ? (
            <h2>{thirdPartyUser.name} is not following anyone yet</h2>
          ) : (
            <h2>
              Seems like {thirdPartyUser.name} doesn't have have any followers
              yet
            </h2>
          )}
        </div>
      );
    }

    const users = data.map((element) => {
      return (
        <div
          key={element._id}
          className="followers-following-userlist"
          onClick={() => handleOpenProfile(element._id)}
        >
          <img src={defaultProfileImage} alt="profile" />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p>
              {element.name} <span>{element.username}</span>
            </p>
            {show === "Following" ? (
              <button
                className="white-button"
                onClick={() => handleFollowUser("unfollow", element._id)}
              >
                Unfollow
              </button>
            ) : show === "Followers" &&
              user.following.indexOf(element._id) === -1 ? (
              <button
                className="white-button"
                onClick={() => handleFollowUser("follow", element._id)}
              >
                Follow
              </button>
            ) : (
              <button
                className="white-button"
                onClick={() => handleFollowUser("unfollow", element._id)}
              >
                Unfollow
              </button>
            )}
          </div>
          <p className="user-bio">{element.bio || ""}</p>
        </div>
      );
    });
    return <div>{users}</div>;
  };
  return (
    <div id="followers-container">
      <div className="main topbar" style={{ borderBottom: "none" }}>
        <h3>{show}</h3>
      </div>
      <div className="tabs-container">
        <div className="tab" onClick={() => setTabSelected("Followers")}>
          <div>
            Followers
            <div
              className="border"
              hidden={tabSelected === "Followers" ? false : true}
            />
          </div>
        </div>
        <div className="tab" onClick={() => setTabSelected("Following")}>
          <div>
            Following
            <div
              className="border"
              hidden={tabSelected === "Following" ? false : true}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          className="loading-screen"
          style={{ width: "550px", height: "30rem" }}
        >
          <div style={{ width: "5rem" }}>
            <LoadingAnimation></LoadingAnimation>
          </div>
        </div>
      ) : tabSelected === "Followers" ? (
        <div>
          <Users data={followers} />
        </div>
      ) : (
        <div>
          <Users data={following} />
        </div>
      )}
    </div>
  );
};

export default Followers;
