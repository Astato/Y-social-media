import { ReactComponent as Logo } from "../icons/logo.svg";
import { ReactComponent as CloseIcon } from "../icons/close_icon.svg";
// import { format, endOfMonth, startOfMonth, getDaysInMonth } from "date-fns";
import DatePicker from "./DatePicker";
import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import visibility_on from "../icons/visibility.svg";
import visibility_off from "../icons/visibility_off.svg";
import { BASEURL } from "../App";

async function createUser(email, name, password, birthDate, username) {
  const joinedDate = new Date().toISOString();
  const obj = { email, name, password, birthDate, joinedDate, username };
  const options = {
    method: "POST",
    url: BASEURL + "/social/create-account",
    data: obj,
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

const LoginScreen = ({ setUser, user }) => {
  const [signup, setSignup] = useState(false);
  const [validCreedentials, setValidCreedentials] = useState(false);
  const [username, setUsername] = useState("@");
  const [errorMessage, setErrorMessage] = useState("");
  const [dateOfBirth, setDateOFBirth] = useState(null);
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const dialogRef = useRef(null);
  const passRecoveryDialogRef = useRef(null);
  const [incorrectCode, setIncorrectCode] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [emailToRecover, setEmailToRecover] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const [emailRecoverCodeError, setEmailRecoverCodeError] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    n_password: false,
    nr_password: false,
  });
  const inputRefs = {
    input1: useRef(null),
    input2: useRef(null),
    input3: useRef(null),
    input4: useRef(null),
    input5: useRef(null),
    input6: useRef(null),
  };
  const [code, setCode] = useState("");
  const [passwordChangeUI, setPasswordRecoveryUI] = useState(false);
  const navigate = useNavigate();

  const passwordRecovery = () => {
    dialogRef.current.close();
    passRecoveryDialogRef.current.showModal();
  };

  const handleSendPasswordRecoveryCodeEmail = async () => {
    if (sendingEmail) {
      return;
    }
    setSendingEmail(true);
    passRecoveryDialogRef.current.style.cursor = "wait";
    try {
      const options = {
        url: BASEURL + "/social/generate-restore-code",
        method: "POST",
        data: "email=" + emailToRecover,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
      };
      const response = await axios(options);
      if (response.status === 200) {
        setShowCodeInput(true);
      } else {
        setEmailRecoverCodeError(response.message);
      }
      passRecoveryDialogRef.current.style.cursor = "";
      return setSendingEmail(false);
    } catch (error) {
      passRecoveryDialogRef.current.style.cursor = "";
      setSendingEmail(false);
      setEmailRecoverCodeError("Email Not Found");
      return setShowCodeInput(false);
    }
  };

  async function checkCodeValidity(code) {
    const data = {
      inputed_code: code,
      email: DOMPurify.sanitize(emailToRecover),
    };

    const options = {
      url: BASEURL + "/social/authorize-password-restore",
      method: "POST",
      data: data,
      headers: {
        "Content-type": "application/json",
      },
    };
    try {
      const response = await axios(options);
      if (response.status === 200) {
        setIncorrectCode(false);
        return setPasswordRecoveryUI(true);
      } else {
        return setIncorrectCode(true);
      }
    } catch (error) {
      console.log(error);
      return setIncorrectCode(true);
    }
  }

  const passwordRestore = async () => {
    const data = {
      new_password: DOMPurify.sanitize(passwordChange),
      email: DOMPurify.sanitize(emailToRecover),
    };

    const options = {
      url: BASEURL + "/social/password-restore",
      method: "POST",
      data: data,
      headers: {
        "Content-type": "application/json",
      },
    };
    try {
      const response = await axios(options);
      if (response.status === 200) {
        setUser(response.data);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const handleCreateAccount = async () => {
    const sanitizedPassword = DOMPurify.sanitize(password);
    const sanitizedEmail = DOMPurify.sanitize(email);
    const sanitizeName = DOMPurify.sanitize(name);
    const splitDOB = dateOfBirth.split("/");
    const IsoDate = new Date(
      splitDOB[0],
      splitDOB[1],
      splitDOB[2]
    ).toISOString();
    if (sanitizeName && sanitizedEmail && dateOfBirth && sanitizedPassword) {
      const newUser = await createUser(
        sanitizedEmail,
        sanitizeName,
        sanitizedPassword,
        IsoDate,
        username
      );
      if (newUser.message) {
        return setErrorMessage(newUser.message);
      } else {
        setUser(newUser);
        return navigate("/");
      }
    } else {
      setErrorMessage("There was an error creating your account");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateOfBirth) {
      setErrorMessage("Please select your date of birth");
      return;
    } else {
      try {
        const checkForConflict = await axios.post(
          BASEURL + "/social/create-account?email=" + DOMPurify.sanitize(email)
        );
        if (checkForConflict.status === 200) {
          return setValidCreedentials(true);
        }
      } catch (error) {
        setErrorMessage(error.response.data.message);
        return error;
      }
    }
  };

  const checkUsernameAvailability = async () => {
    try {
      const response = await axios.post(
        BASEURL + "/social/create-account?username=" + username
      );
      if (response.status === 409) {
        return setErrorMessage(response.data.message);
      }
      if (response.status === 200) {
        return handleCreateAccount();
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const handleSetUsername = (e) => {
    setUsername(e.target.value);
    if (e.target.value[0] !== "@") {
      setUsername("@");
    }
  };

  const handleCodeInput = (e, inputNumber) => {
    const currentInput = inputRefs["input" + inputNumber];
    const KEY = e.key;
    const isValidInput = /^[a-zA-Z0-9]$/i.test(KEY) && KEY.length === 1;
    if (!isValidInput && KEY !== "Backspace") {
      return;
    }
    if (e.key === "Tab") {
      return;
    }
    if (inputNumber === 6 && e.key !== "Backspace") {
      currentInput.current.value = e.key;
      if (code[inputNumber - 1]) {
        return setCode((prev) => prev.replace(code[inputNumber - 1], e.key));
      } else {
        setCode((prev) => prev + KEY);
        return;
      }
    }
    if (inputNumber === 1 && e.key === "Backspace") {
      setCode("");
      return;
    }

    if (e.key === "Backspace") {
      e.target.value = "";
      const prevInput = inputRefs["input" + (inputNumber - 1)];
      return prevInput.current.focus();
    } else {
      e.target.value = e.key;
      if (code[inputNumber - 1]) {
        setCode((prev) => prev.replace(code[inputNumber - 1], e.key));
      }
      if (!code[inputNumber - 1]) {
        setCode((prev) => prev + e.key);
      }
      const nextInput = inputRefs["input" + (inputNumber + 1)];
      nextInput.current.focus();
      return nextInput.current.value;
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    const googleLoginWindow = window.open(
      BASEURL + "/social/oauth2/redirect/google",
      "_blank",
      "width=300, height=400, position=absolute, left=50, top=50"
    );
    googleLoginWindow.focus();
    if (user) {
      googleLoginWindow.close();
      window.location.reload();
    }
  };

  useEffect(() => {
    if (code.length === 6) {
      checkCodeValidity(code);
    }
  }, [code]);

  const handleLogin = async () => {
    const sanitizedEmail = DOMPurify.sanitize(email);
    const sanitizedPassword = DOMPurify.sanitize(password);
    const obj = { email: sanitizedEmail, password: sanitizedPassword };
    try {
      const options = {
        method: "POST",
        url: BASEURL + "/social/authenticate",
        data: obj,
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios(options);
      if (response.status === 200) {
        return setUser(response.data);
      } else {
        return setErrorMessage(response.data.message);
      }
    } catch (error) {
      return setErrorMessage(error.response.data.message);
    }
  };

  useEffect(() => {
    if (dateOfBirth) {
      setErrorMessage("");
    }
  }, [dateOfBirth]);

  console.log(window.location.pathname);
  ////// maube split into two componenets

  const [passwordChange, setPasswordChange] = useState("");
  const [passwordChangeConfirm, setPasswordChangeConfirm] = useState("");
  const [passMatchError, setPassMatchError] = useState(false);

  const handlePasswordChange = () => {
    const sanitizedPassword = DOMPurify.sanitize(passwordChange);
    if (sanitizedPassword === passwordChangeConfirm) {
      setPassMatchError(false);
      return passwordRestore();
    } else {
      return setPassMatchError(true);
    }
  };

  if (passwordChangeUI) {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{
          fontSize: "30px",
          fontWeight: "bolder",
          marginTop: "3rem",
        }}
      >
        <p>Enter a new password:</p>
        <input
          className="input-style"
          style={{ width: "100%" }}
          type="password"
          minLength={8}
          autoComplete="new-password"
          onChange={(e) => setPasswordChange(e.target.value)}
        />
        <p>Confirm Password:</p>
        <input
          className="input-style"
          style={{ width: "100%" }}
          type="password"
          autoComplete="new-password"
          minLength={8}
          onChange={(e) => {
            setPasswordChangeConfirm(e.target.value);
          }}
        />
        <div style={{ marginTop: "2rem" }}>
          <p
            style={{
              fontSize: "20px",
              textAlign: "center",
              color: "darkorange",
              opacity: passMatchError ? 1 : 0,
            }}
          >
            Password don't match
          </p>
          <button
            className="white-button"
            type="submit"
            onClick={handlePasswordChange}
          >
            Accept
          </button>
        </div>
      </form>
    );
  }

  return (
    <div id="login-screen">
      <div id="banner">
        <Logo
          style={{
            width: "450px",
            height: "450px",
          }}
        />
        <h4 style={{ color: "graytext", margin: 0 }}>
          Where algorithms socialize
        </h4>
      </div>
      <div id="signup-form-container">
        <h1>Happening now</h1>
        {/* //"/social/oauth2/redirect/google" */}
        <div id="login-container">
          <h2>Join Today.</h2>
          <a
            onClick={(e) => {
              setIsGoogleLogin(true);
              handleGoogleLogin(e);
            }}
          >
            <button className="white-button" style={{ width: "100%" }}>
              Login with Google
            </button>
          </a>
          <p style={{ textAlign: "center" }}>or</p>
          <button
            className="blue-button"
            onClick={() => {
              setSignup(true);
              dialogRef.current.showModal();
            }}
          >
            Create Account
          </button>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              marginTop: "100px",
            }}
          >
            <p style={{ fontSize: "15px" }}>Already have an account?</p>
            <button
              className="black-button"
              onClick={() => dialogRef.current.showModal()}
            >
              Sign in
            </button>
          </div>
        </div>
        <dialog ref={dialogRef}>
          <CloseIcon
            className="close-button"
            onClick={() => {
              dialogRef.current.close();
              setSignup(false);
            }}
          />
          <form onSubmit={(e) => e.preventDefault()} id="signup-form">
            {signup ? (
              <div>
                <p
                  style={{
                    color: "white",
                    margin: "0",
                    fontSize: "30px",
                    fontWeight: "900",
                    marginBottom: "40px",
                    textAlign: "center",
                  }}
                >
                  {validCreedentials
                    ? "Choose an username"
                    : "Create your account"}
                </p>
                <div
                  style={{
                    display: validCreedentials ? "none" : "flex",
                    flexDirection: "column",
                    width: "70%",
                    overflowX: "hidden",
                    margin: "auto",
                    gap: "2rem",
                  }}
                >
                  <label>
                    Name*
                    <input
                      onInput={(e) => setName(e.target.value)}
                      name="name"
                      type="text"
                      className="input-style"
                      placeholder="Name"
                      required
                    />
                  </label>
                  <label>
                    Email:
                    <input
                      onInput={(e) => setEmail(e.target.value)}
                      name="email"
                      type="email"
                      className="input-style"
                      placeholder="Email"
                      required
                    />
                  </label>
                  <label>
                    Password:
                    <input
                      onInput={(e) => setPassword(e.target.value)}
                      id="password"
                      name="password"
                      type={
                        !passwordVisibility.n_password ? "password" : "text"
                      }
                      className="input-style"
                      placeholder="Password"
                      required
                    />
                    <img
                      src={
                        passwordVisibility.n_password
                          ? visibility_off
                          : visibility_on
                      }
                      style={{ position: "absolute", right: "3rem" }}
                      onClick={() =>
                        setPasswordVisibility((prev) => ({
                          ...prev,
                          n_password: !prev.n_password,
                        }))
                      }
                    ></img>
                  </label>
                  <div>
                    <p style={{ color: "white", fontWeight: 900 }}>
                      Date of Birth
                    </p>
                    <DatePicker setDateOFBirth={setDateOFBirth} />
                    <p
                      className="white-button error-message"
                      style={{
                        display: errorMessage && signup ? "block" : "none",
                      }}
                    >
                      {errorMessage}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="white-button"
                    onClick={handleSubmit}
                  >
                    Create!
                  </button>
                </div>
                <div
                  id="account-setup"
                  style={{ display: validCreedentials ? "flex" : "none" }}
                >
                  <label>
                    Username
                    <input
                      className="input-style"
                      placeholder="@yourName"
                      type="text"
                      name="username"
                      onInput={handleSetUsername}
                      value={username}
                    ></input>
                  </label>
                  <button
                    className="black-button"
                    onClick={checkUsernameAvailability}
                  >
                    Finish
                  </button>
                  <p
                    className="white-button error-message"
                    style={{ display: errorMessage ? "block" : "none" }}
                  >
                    {errorMessage}
                  </p>
                </div>
              </div>
            ) : (
              //// sign-in
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "50%",
                    margin: "auto",
                    gap: "1.5rem",
                  }}
                >
                  <label>
                    Email
                    <input
                      name="text"
                      type="text"
                      className="input-style"
                      onInput={(e) => setEmail(e.target.value)}
                      placeholder="Email or Username"
                    />
                  </label>
                  <label>
                    Password:
                    <input
                      id="password"
                      name="password"
                      type={!passwordVisibility.password ? "password" : "text"}
                      onInput={(e) => setPassword(e.target.value)}
                      className="input-style"
                      placeholder="Password"
                    />
                    <img
                      src={
                        passwordVisibility.password
                          ? visibility_off
                          : visibility_on
                      }
                      style={{ position: "absolute", right: "3rem" }}
                      onClick={() =>
                        setPasswordVisibility((prev) => ({
                          ...prev,
                          password: !prev.password,
                        }))
                      }
                    ></img>
                  </label>
                  <button className="white-button" onClick={handleLogin}>
                    Login
                  </button>
                  <p
                    className="white-button error-message"
                    style={{
                      display: errorMessage ? "block" : "none",
                      margin: "auto",
                    }}
                  >
                    {errorMessage}
                  </p>
                  <button className="black-button" onClick={passwordRecovery}>
                    Forgot Password?
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    margin: "auto",
                    color: "white",
                    gap: "1rem",
                  }}
                >
                  <p>Dont have an account?</p>
                  <p
                    id="sign-up"
                    onClick={() => {
                      setSignup(true);
                      setPassword("");
                      setEmail("");
                    }}
                  >
                    Sign up
                  </p>
                </div>
              </div>
            )}
          </form>
        </dialog>
        {/* PASSWORDRECOVERY */}
        <dialog id="pass-recovery-dialog" ref={passRecoveryDialogRef}>
          <div>
            <CloseIcon
              className="close-button"
              onClick={() => passRecoveryDialogRef.current.close()}
            ></CloseIcon>
            {!showCodeInput ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <p style={{ color: "white", fontSize: "25px" }}>Enter Email:</p>
                <input
                  id="email"
                  name="email"
                  className="input-style"
                  type="email"
                  placeholder="example@gmail.com"
                  onChange={(e) => setEmailToRecover(e.target.value)}
                  style={{ width: "60%", margin: "auto" }}
                ></input>
                <p
                  style={{
                    color: "darkorange ",
                    fontSize: "18px",
                    textAlign: "center",
                    fontWeight: "bolder",
                    marginBottom: 0,
                  }}
                >
                  {emailRecoverCodeError}
                </p>
                <div style={{ display: "flex" }}>
                  <Link
                    to="/recoverpassword"
                    onClick={handleSendPasswordRecoveryCodeEmail}
                    style={{ width: "fit-content", margin: "3rem 1rem 0 auto" }}
                    className="white-button"
                  >
                    Send
                  </Link>
                  <button
                    style={{ width: "fit-content", margin: "3rem auto 0 2rem" }}
                    className="black-button"
                    onClick={() => {
                      passRecoveryDialogRef.current.close();
                      dialogRef.current.showModal();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  color: "white",
                }}
              >
                <p style={{ color: "white", fontSize: "25px" }}>
                  A code was sent to your email.{" "}
                  <span style={{ fontSize: "16px" }}>(Check spam folder)</span>
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "3rem",
                  }}
                >
                  <input
                    className="input-style"
                    ref={inputRefs.input1}
                    type="text"
                    maxLength={1}
                    style={{
                      width: "20px",
                      fontSize: "20px",
                      fontWeight: "bolder",
                      margin: "auto .3rem",
                      textAlign: "center",
                    }}
                    onKeyUp={(e) => handleCodeInput(e, 1)}
                    autoFocus={true}
                  ></input>
                  <input
                    className="input-style"
                    ref={inputRefs.input2}
                    type="text"
                    maxLength={1}
                    style={{
                      width: "20px",
                      fontSize: "20px",
                      fontWeight: "bolder",
                      margin: "auto .3rem",
                      textAlign: "center",
                    }}
                    onKeyUp={(e) => handleCodeInput(e, 2)}
                  ></input>
                  <input
                    className="input-style"
                    ref={inputRefs.input3}
                    type="text"
                    maxLength={1}
                    style={{
                      width: "20px",
                      fontSize: "20px",
                      fontWeight: "bolder",
                      margin: "auto .3rem",
                      textAlign: "center",
                    }}
                    onKeyUp={(e) => handleCodeInput(e, 3)}
                  ></input>
                  <input
                    className="input-style"
                    ref={inputRefs.input4}
                    type="text"
                    maxLength={1}
                    style={{
                      width: "20px",
                      fontSize: "20px",
                      fontWeight: "bolder",
                      margin: "auto .3rem",
                      textAlign: "center",
                    }}
                    onKeyUp={(e) => handleCodeInput(e, 4)}
                  ></input>
                  <input
                    className="input-style"
                    ref={inputRefs.input5}
                    type="text"
                    maxLength={1}
                    style={{
                      width: "20px",
                      fontSize: "20px",
                      fontWeight: "bolder",
                      margin: "auto .3rem",
                      textAlign: "center",
                    }}
                    onKeyUp={(e) => handleCodeInput(e, 5)}
                  ></input>
                  <input
                    className="input-style"
                    ref={inputRefs.input6}
                    type="text"
                    maxLength={1}
                    style={{
                      width: "20px",
                      fontSize: "20px",
                      fontWeight: "bolder",
                      margin: "auto .3rem",
                      textAlign: "center",
                    }}
                    onKeyUp={(e) => handleCodeInput(e, 6)}
                  ></input>
                </div>
                <p
                  style={{
                    opacity: incorrectCode ? "1" : "0",
                    margin: "3rem 0 0 0",
                    textAlign: "center",
                    color: "darkorange",
                    fontWeight: "bolder",
                    fontSize: "16px",
                  }}
                >
                  Incorrect code
                </p>
                <p style={{ margin: "1rem 0 0 0" }}>
                  Didn't get it?{" "}
                  <button className="black-button" style={{ fontSize: "13px" }}>
                    Send again
                  </button>
                </p>
              </div>
            )}
          </div>
        </dialog>
      </div>
      <footer>
        <p>
          Created by
          <a
            href="https://www.github.com/Astato?tab=repositories"
            target="_blank"
          >
            github/Astato
          </a>
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;
