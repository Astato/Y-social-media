import React, { useEffect, useRef, useState } from "react";
import { ReactComponent as SearchLogo } from "../icons/search_icon.svg";
import defaultProfileImage from "../icons/profile-default.jpg";
import axios from "axios";
import DOMPurify from "dompurify";

const Rightsidebar = () => {
  const [showSearchBox, setShowSearchBox] = useState("none");
  const [fillColor, setFillColor] = useState("white");
  const [searchResults, setSearchResults] = useState("");
  const [resultsContainerHeight, setResultsContainerHeight] = useState(0);
  const [trending, setTrending] = useState("");
  const [shouldBlur, setShouldBlur] = useState(true);
  const inputRef = useRef(null);
  const userFoundContainerRef = useRef(null);

  const handleUserSearch = async (e) => {
    const input = DOMPurify.sanitize(e.target.value);
    if (input.length >= 3) {
      try {
        const search = await axios.get(
          "http://localhost:5000/social/search?type=all&&searchValue=" + input
        );
        if (search.status === 200) {
          if (search.data && search.data.length > 0) {
            setResultsContainerHeight(4.5 * search.data.length);
            return setSearchResults(search.data);
          }
          return;
        }
        return;
      } catch (error) {
        console.log(error);
        return;
      }
    }
  };

  const handleOpenProfile = async (clickedUser_id) => {
    try {
      const getUser = await axios.get(
        `http://localhost:5000/social/getProfile?userID=${clickedUser_id}`
      );
      if (getUser) {
        // setThirdPartyUser(getUser.data);
        window.location.href = `/profile/${getUser.data.username}`;
        // return navigate(`/profile/${getUser.data.username}`);
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const getTrending = async () => {
    try {
      const response = await axios.get("http://localhost:5000/social/trending");
      if (response.status === 200) {
        return setTrending(response.data);
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const handleClick = () => {
    inputRef.current.focus();
    const accentColor = "rgb(29, 155, 240)";
    if (showSearchBox === "none") setShowSearchBox("flex");
    setFillColor(accentColor);
  };
  const handleBlur = () => {
    if (shouldBlur) {
      setShowSearchBox("none");
      setFillColor("white");
      setResultsContainerHeight(0);
    } else {
      return;
    }
  };

  const handleGoToHashtag = async (hashtag) => {
    hashtag = hashtag.replace("#", "");
    // setHashTagFilter(hashtag);
    // navigate("/hashtags/" + hashtag);
    window.location.href = "/hashtags/" + hashtag;
  };

  useEffect(() => {
    if (!trending) {
      getTrending()
        .then(() => console.log("sucess"))
        .catch((error) => console.log(error));
    }
  }, []);

  return (
    <div id="rightsidebar">
      <div className="topbar">
        <div
          id="searchbar"
          onClick={handleClick}
          style={{
            boxShadow: ` inset 0 0 0 1px ${
              fillColor === "white" ? "transparent" : fillColor
            }`,
            backgroundColor:
              fillColor === "white" ? "rgb(48, 48, 48)" : "black",
          }}
        >
          <SearchLogo
            id="search-icon"
            style={{ width: "20px", fill: fillColor }}
          ></SearchLogo>
          <input
            type="text"
            placeholder="Search"
            ref={inputRef}
            onBlur={handleBlur}
            onChange={(e) => {
              handleUserSearch(e);
            }}
            style={{
              backgroundColor:
                fillColor === "white" ? "rgb(48, 48, 48)" : "black",
            }}
          ></input>
        </div>
        <div
          id="search-results"
          onMouseOver={() => setShouldBlur(false)}
          onMouseLeave={() => setShouldBlur(true)}
          style={{ display: showSearchBox, height: "auto" }}
        >
          {searchResults ? (
            searchResults.map((element, index) => {
              return (
                <div
                  key={element._id || index}
                  ref={userFoundContainerRef}
                  className="searchbar-results"
                  onClick={() => {
                    element.username
                      ? handleOpenProfile(element._id)
                      : handleGoToHashtag(element.hashtag);
                  }}
                >
                  {element.username && (
                    <img src={element.profile_img || defaultProfileImage} />
                  )}
                  <p style={{ fontWeight: 900, fontSize: "18px" }}>
                    {element.hashtag || element.name}
                  </p>
                  {element.username && (
                    <p style={{ color: "gray", gridColumn: 2 }}>
                      {element.username}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p> Search for people or tags</p>
          )}
        </div>
      </div>
      <div id="trending-container">
        <p style={{ fontSize: "18px", fontWeight: "900", margin: "15px" }}>
          What's happening
        </p>
        <div>
          {trending &&
            trending.map((hashtag, index) => {
              return (
                <div
                  className="trending-item"
                  key={hashtag._id}
                  onClick={() => handleGoToHashtag(hashtag.hashtag)}
                >
                  <p style={{ fontWeight: "900" }}>{hashtag.hashtag}</p>
                  <p style={{ color: "gray", fontSize: "12px" }}>
                    {hashtag.postCount} posts
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
export default Rightsidebar;
