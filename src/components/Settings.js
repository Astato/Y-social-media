import { useState, useRef, useEffect } from "react";
import { ReactComponent as ChevronIcon } from "../icons/chevron_icon.svg";
import { formatDistanceToNow } from "date-fns";
import { ReactComponent as CloseIcon } from "../icons/close_icon.svg";

import axios from "axios";
import DOMPurify from "dompurify";

const Settings = ({ user }) => {
  const [selected, setSelected] = useState("Account");
  const [expandTab, setExpandTab] = useState({});
  const [propertiesChanges, setPropertiesChanges] = useState({});
  const [userExtraData, setUserExtraData] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userIsAuthorized, setUserIsAuthorized] = useState(false);
  const [responseOnInfoUpdate, setResponseOnUpdate] = useState("");
  const [closeAccountAuthorized, setCloseAccountAuthorized] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const securityDialogRef = useRef();
  const usernameInputRef = useRef();
  const closeAccountDialog = useRef();
  const selectedStyle = {
    backgroundColor: "rgba(9, 185, 255, .09)",
    borderRight: "solid 2px rgb(29, 155, 240)",
  };

  const handleCloseAccount = async () => {
    if (user.googleID) {
      try {
        const response = await axios.get(
          "http://localhost:5000/social/close-account?google=true"
        );
        if (response.status === 200) {
          ///re-using the element
          return setErrorMessage(response.message);
        }
      } catch (error) {
        console.log(error);
        return setErrorMessage("An unexpected error has occured, try again.");
      }
    } else if (closeAccountAuthorized) {
      try {
        const response = await axios.get(
          "http://localhost:5000/social/close-account"
        );
        if (response.status === 200) {
          await axios.get("http://localhost:5000/social/logout");
        }
      } catch (error) {
        console.log(error);
        return setErrorMessage("An unexpected error has occured, try again.");
      }
    }
  };

  const handleSecurityUpdate = async (field) => {
    async function update(obj) {
      const options = {
        method: "POST",
        data: obj,
        url: "http://localhost:5000/social/user-security-update",
        headers: {
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await axios(options);
        if (response.status === 200) {
          if (obj.password) {
            setPropertiesChanges({});
            return setConfirmationMessage("Password Successfully changed");
          }
          if (obj.email) {
            return setConfirmationMessage("Email Successfully changed");
          }
        }
      } catch (error) {
        console.log(error);
        return setResponseOnUpdate("An unexpected error has ocurred");
      }
    }

    if (field === "email") {
      if (propertiesChanges.email !== propertiesChanges.confirmEmail) {
        return setResponseOnUpdate("Emails do not match");
      } else {
        const sanitizedEmail = DOMPurify.sanitize(propertiesChanges.email);
        return update({ email: sanitizedEmail });
      }
    }
    if (field === "password") {
      if (propertiesChanges.password !== propertiesChanges.confirmPassword) {
        return setResponseOnUpdate("Passwords do not match");
      } else if (propertiesChanges.password.length < 8) {
        return setResponseOnUpdate("Passwords to short");
      } else {
        const sanitizedPassword = DOMPurify.sanitize(
          propertiesChanges.password
        );
        return update({ password: sanitizedPassword });
      }
    }
  };

  const attemptAuthorize = async (action) => {
    const sanitizedPassword = DOMPurify.sanitize(password);
    const obj = {
      password: sanitizedPassword,
    };
    const options = {
      method: "POST",
      data: obj,
      url: "http://localhost:5000/social/authorize-account-changes",
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await axios(options);
      if (response.status === 200 && response.data.authorized) {
        if (action === "close_account") {
          setCloseAccountAuthorized(true);
          setPassword("");
          setErrorMessage("");
          return closeAccountDialog.current.showModal();
        } else {
          setUserIsAuthorized(response.data.authorized);
          securityDialogRef.current.close();
          setPassword("");
          setErrorMessage("");
          return setSelected("Security");
        }
      }
    } catch (error) {
      console.log(error);
      if (error && error.response.status === 403) {
        return setErrorMessage(error.response.data.message);
      } else {
        return setErrorMessage("Something went wrong. Try again.");
      }
    }
  };

  const handleSecurityTab = () => {
    if (userIsAuthorized) {
      return setSelected("Security");
    } else {
      setExpandTab("");
      return securityDialogRef.current.showModal();
    }
  };

  const handleCommonInfoUpdate = async () => {
    const username = DOMPurify.sanitize(newUsername);
    const regex = /^@?[a-zA-Z0-9]+$/;
    const match = regex.test(username);
    if (username.length < 4) {
      return setErrorMessage("Username to short");
    }
    if (errorMessage === "Username already in use") {
      return;
    }
    if (match && username.length > 4) {
      let finalUsername;
      username.startsWith("@")
        ? (finalUsername = username)
        : (finalUsername = "@" + username);

      try {
        finalUsername = DOMPurify.sanitize(finalUsername);
        const response = await axios.get(
          "http://localhost:5000/social/common-account-changes?username=" +
            finalUsername
        );
        if (response.status === 200) {
          window.location.reload();
        }
      } catch (error) {
        console.log(error);
        if (error && error.response.data.message) {
          return setErrorMessage(error.response.data.message);
        }
        return setErrorMessage("An unexpected error has ocurred");
      }
    } else {
      return setErrorMessage(
        "Username cannot contain symbols other than @ at the beginning"
      );
    }
  };

  const checkIfUsernameAvailable = async (e) => {
    if (e.nativeEvent.data === " ") {
      return;
    }
    const sanitize = DOMPurify.sanitize(e.target.value);
    setNewUsername(sanitize);
    if (sanitize.length <= 3) {
      console.log(true);
      usernameInputRef.current.focus();
      return (usernameInputRef.current.style.border =
        "solid 1px rgba(128, 128, 128, 0.4)");
    }
    if (sanitize.length > 3) {
      try {
        const search = await axios.get(
          "http://localhost:5000/social/search?type=all&&searchValue=" +
            sanitize
        );
        if (search.status === 200) {
          let formatUsername;
          if (!sanitize.includes("@")) {
            formatUsername = "@" + sanitize.toLowerCase();
          } else if (sanitize.includes("@")) {
            formatUsername = sanitize.toLowerCase();
          }
          if (
            search.data.length === 0 ||
            search.data[0].username.toLowerCase() !== formatUsername
          ) {
            usernameInputRef.current.style.border = "solid green 1px";
            setErrorMessage("");
          } else {
            if (formatUsername === search.data[0].username.toLowerCase())
              usernameInputRef.current.style.border = "solid red 1px";
            setErrorMessage("Username already in use");
          }
        }
        return;
      } catch (error) {
        console.log(error);
        return;
      }
    }
  };

  useEffect(() => {
    setErrorMessage("");
    setResponseOnUpdate("");
  }, [expandTab]);

  //user222@user22.com to user222@user222.com

  return (
    <div id="settings-container">
      <div
        style={{ display: confirmationMessage ? "flex" : "none" }}
        id="confirmation-message"
      >
        <p>{confirmationMessage}</p>
        <CloseIcon
          id="close-btn"
          onClick={() => setConfirmationMessage(false)}
          style={{
            width: "20px",
            fill: "white",
            marginLeft: "2rem",
            stroke: "white",
            strokeWidth: "100",
          }}
        />
      </div>
      <dialog ref={closeAccountDialog}>
        <div style={{ color: "white" }}>
          <h1>
            <span style={{ color: "rgb(175, 12, 12)" }}>Caution! </span>
            <br />
            This action cannot be undone.
            <br /> Are you sure you want to proceed?
          </h1>
          <div style={{ display: "flex", width: "60%", margin: "auto" }}>
            <button
              className="white-button"
              style={{ margin: " 1rem auto " }}
              onClick={() => closeAccountDialog.current.close()}
            >
              Cancel
            </button>
            <button
              style={{ margin: "1rem auto " }}
              className="black-button"
              id="close-account-btn"
              onClick={handleCloseAccount}
            >
              Close Account
            </button>
          </div>
        </div>
      </dialog>
      <dialog ref={securityDialogRef}>
        <div
          style={{
            color: "white",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "80%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3>Enter your password</h3>
          <input
            type="password"
            className="input-style"
            onKeyDown={(e) => {
              if (e.code === "Space") {
                e.preventDefault();
              }
            }}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
          <p
            style={{
              color: "darkorange",
              fontSize: "17px",
              fontWeight: "bolder",
              margin: 0,
            }}
          >
            {errorMessage}
          </p>
          <div style={{ margin: "1.5rem auto" }}>
            <button
              style={{ margin: "auto 1rem" }}
              className="black-button"
              onClick={() => securityDialogRef.current.close()}
            >
              Cancel
            </button>
            <button
              style={{ margin: "auto 1rem" }}
              className="white-button"
              onClick={attemptAuthorize}
            >
              Submit
            </button>
          </div>
        </div>
      </dialog>
      <main>
        <div id="settings-sidebar">
          <div className="main topbar">
            <h3>Settings</h3>
          </div>
          <div id="options-list">
            <div
              className="options-tab"
              onClick={() => setSelected("Account")}
              style={selected === "Account" ? selectedStyle : null}
            >
              <p>Account</p>
              <ChevronIcon
                style={{
                  fill: "gray",
                  width: "15px",
                  marginRight: ".5rem",
                  justifySelf: "flex-end",
                }}
              />
            </div>
            <div
              onClick={handleSecurityTab}
              style={selected === "Security" ? selectedStyle : null}
              className="options-tab"
            >
              <p>Security</p>
              <ChevronIcon
                style={{
                  fill: "gray ",
                  width: "15px",
                  marginRight: ".5rem",
                  justifySelf: "flex-end",
                }}
              />
            </div>

            <div
              onClick={() => setSelected("Display")}
              style={selected === "Display" ? selectedStyle : null}
              className="options-tab"
            >
              <p>Display</p>
              <ChevronIcon
                style={{
                  fill: "gray",
                  width: "15px",
                  marginRight: ".5rem",
                  justifySelf: "flex-end",
                }}
              />
            </div>
          </div>
        </div>
        <div id="expanded-section">
          <div className="main topbar">
            <h3>{selected}</h3>
          </div>
          <div id="expanded-options">
            {selected === "Account" ? (
              <div>
                <div className="options-tab">
                  <div
                    onClick={() => {
                      setExpandTab({ username: !expandTab.username });
                    }}
                  >
                    <p>
                      Username |<span> {user.username}</span>
                    </p>
                    <ChevronIcon
                      className="chevron"
                      style={{
                        transform: expandTab.username ? "rotate(90deg)" : null,
                      }}
                    />
                  </div>
                  {expandTab.username && (
                    <div className="expanded-tab">
                      <p>Change username</p>
                      <input
                        className="input-style"
                        ref={usernameInputRef}
                        type="text"
                        placeholder={user.username}
                        value={newUsername}
                        onChange={checkIfUsernameAvailable}
                      />
                      <p
                        style={{
                          fontSize: "15px",
                          color: "darkorange",
                          marginBottom: "1rem",
                        }}
                      >
                        {errorMessage}
                      </p>
                      <button
                        className="black-button"
                        onClick={handleCommonInfoUpdate}
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                <div className="options-tab">
                  {/* <div
                    onClick={() => setExpandTab({ gender: !expandTab.gender })}
                  >
                    <p>
                      Gender |<span> {user.gender || ""}</span>
                    </p>
                    <ChevronIcon
                      className="chevron"
                      style={{
                        transform: expandTab.gender ? "rotate(90deg)" : null,
                      }}
                    />{" "}
                  </div> */}
                  {/* {expandTab.gender ? (
                    <div className="expanded-tab">
                      <h3>Change or set your gender</h3>
                      <input className="input-style" type="text" />
                      <button className="black-button">Change</button>
                    </div>
                  ) : null} */}
                </div>
                {/* <div className="options-tab">
                  <div onClick={() => setExpandTab({ age: !expandTab.age })}>
                    <p>
                      Age |<span> {userAge}</span>
                    </p>
                    <ChevronIcon
                      className="chevron"
                      style={{
                        transform: expandTab.age ? "rotate(90deg)" : null,
                      }}
                    />{" "}
                  </div>
                  {expandTab.age ? (
                    <div className="expanded-tab">
                      <p>Change Age</p>
                      <input className="input-style" type="text" />
                      <button className="black-button">Change</button>
                    </div>
                  ) : null}
                </div> */}
                {/* <div className="options-tab">
                  <p>Languages</p>
                  <ChevronIcon
                    style={{
                      fill: "gray",
                      width: "15px",
                      marginRight: ".5rem",
                      justifySelf: "flex-end",
                      transform: expandTab.username ? "rotate(90deg)" : null,
                    }}
                  />
                </div> */}
              </div>
            ) : selected === "Security" ? (
              <div>
                <div
                  className="options-tab"
                  style={{ color: user.googleID ? "gray" : "white" }}
                >
                  <div
                    onClick={() =>
                      user.googleID
                        ? null
                        : setExpandTab({ email: !expandTab.email })
                    }
                  >
                    <p>
                      Email | <span>{user.email}</span>
                    </p>
                    <ChevronIcon
                      className="chevron"
                      style={{
                        transform: expandTab.email ? "rotate(90deg)" : null,
                      }}
                    />
                  </div>
                  {expandTab.email ? (
                    <form className="expanded-tab">
                      <p>Change Email</p>
                      <input
                        className="input-style"
                        type="email"
                        placeholder={user.email}
                        onChange={(e) =>
                          setPropertiesChanges((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                      <p>Confirm Email</p>
                      <input
                        className="input-style"
                        type="email"
                        onChange={(e) =>
                          setPropertiesChanges((prev) => ({
                            ...prev,
                            confirmEmail: e.target.value,
                          }))
                        }
                      />
                      <p style={{ color: "darkorange", marginBottom: "1rem" }}>
                        {responseOnInfoUpdate}
                      </p>
                      <button
                        className="black-button"
                        onClick={() => handleSecurityUpdate("email")}
                      >
                        Change
                      </button>
                    </form>
                  ) : null}
                </div>
                <div
                  className="options-tab"
                  style={{ color: user.googleID ? "gray" : "white" }}
                >
                  <div
                    onClick={() =>
                      user.googleID
                        ? null
                        : setExpandTab({ password: !expandTab.password })
                    }
                  >
                    <p>Password |</p>
                    <ChevronIcon
                      className="chevron"
                      style={{
                        transform: expandTab.password ? "rotate(90deg)" : null,
                      }}
                    />
                  </div>
                  {expandTab.password ? (
                    <div className="expanded-tab">
                      <p>Change Password</p>
                      <div className="input-container">
                        <input
                          className="input-style"
                          type={showChangePassword ? "text" : "password"}
                          autoComplete="password-change"
                          value={
                            !confirmationMessage
                              ? propertiesChanges.password
                              : ""
                          }
                          onKeyDown={(e) => {
                            if (e.code === "Space") {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) =>
                            setPropertiesChanges((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                        />
                        <label
                          className="show-password-label"
                          onClick={(E) =>
                            setShowChangePassword(!showChangePassword)
                          }
                        >
                          Show
                        </label>
                      </div>
                      <p style={{ fontSize: "13px" }}>
                        *Password must contain at least 8 character
                      </p>
                      <p>Confirm Password</p>
                      <input
                        className="input-style"
                        type={showChangePassword ? "text" : "password"}
                        autoComplete="password-change"
                        value={
                          !confirmationMessage
                            ? propertiesChanges.confirmPassword
                            : ""
                        }
                        onKeyDown={(e) => {
                          if (e.code === "Space") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) =>
                          setPropertiesChanges((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                      />
                      <p style={{ color: "darkorange", marginBottom: "1rem" }}>
                        {responseOnInfoUpdate}
                      </p>
                      <button
                        className="black-button"
                        onClick={() => handleSecurityUpdate("password")}
                      >
                        Change
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="options-tab">
                  <div
                    onClick={() =>
                      setExpandTab({ close_account: !expandTab.close_account })
                    }
                  >
                    <p>Close Account |</p>
                    <ChevronIcon
                      className="chevron"
                      style={{
                        transform: expandTab.close_account
                          ? "rotate(90deg)"
                          : null,
                      }}
                    />{" "}
                  </div>
                  {expandTab.close_account ? (
                    <div className="expanded-tab">
                      <div
                        className="expanded-tab"
                        style={{ display: user.googleID ? "none" : "flex" }}
                      >
                        {/* <h3>Enter password</h3> */}
                        <input
                          className="input-style"
                          type="password"
                          disabled={true}
                          aria-disabled={true}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <p
                          style={{ color: "darkorange", marginBottom: "1rem" }}
                        >
                          {errorMessage}
                        </p>
                      </div>
                      <button
                        className="black-button"
                        id="close-account-btn"
                        disabled={true}
                        aria-disabled={true}
                        onClick={() =>
                          user.googleID
                            ? securityDialogRef.current.showModal()
                            : attemptAuthorize("close_account")
                        }
                      >
                        Close
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div> not implemented</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
