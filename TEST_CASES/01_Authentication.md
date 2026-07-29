# Module 1: Authentication

**Functions covered:** Login, Sign Up, Forgot Password, Logout, Session Restore, Terms Acceptance

---

## TC-AUTH-001 — Successful login with valid credentials

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-001 |
| **Test Case Description** | Verify that a registered user can log in successfully with valid email and password |
| **Test Steps** | 1. Open the application<br>2. Click Login to open the login popup<br>3. Enter a registered email (e.g. `user@example.com`)<br>4. Enter the correct password (`password123`)<br>5. Click **Login** |
| **Expected Outcome** | Login succeeds; popup closes; user session/token is stored; authenticated UI (user menu) is displayed |

---

## TC-AUTH-002 — Login fails with incorrect password

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-002 |
| **Test Case Description** | Verify login is rejected when password is wrong |
| **Test Steps** | 1. Open Login popup<br>2. Enter registered email<br>3. Enter incorrect password<br>4. Click **Login** |
| **Expected Outcome** | Error alert shown (invalid credentials); user remains logged out; popup stays open |

---

## TC-AUTH-003 — Login fails with unregistered email

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-003 |
| **Test Case Description** | Verify login fails when email does not exist |
| **Test Steps** | 1. Open Login popup<br>2. Enter unregistered email (e.g. `nouser@test.com`)<br>3. Enter any password<br>4. Click **Login** |
| **Expected Outcome** | Login fails; error alert shown; user remains logged out |

---

## TC-AUTH-004 — Login with empty email

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-004 |
| **Test Case Description** | Verify required validation for empty email |
| **Test Steps** | 1. Open Login popup<br>2. Leave Email blank<br>3. Enter a password<br>4. Click **Login** |
| **Expected Outcome** | Form does not submit; message **“Email is required”** is displayed |

---

## TC-AUTH-005 — Login with empty password

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-005 |
| **Test Case Description** | Verify required validation for empty password |
| **Test Steps** | 1. Open Login popup<br>2. Enter valid email<br>3. Leave Password blank<br>4. Click **Login** |
| **Expected Outcome** | Form does not submit; message **“Password is required”** is displayed |

---

## TC-AUTH-006 — Login with both fields empty

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-006 |
| **Test Case Description** | Verify validation when both login fields are empty |
| **Test Steps** | 1. Open Login popup<br>2. Leave Email and Password blank<br>3. Click **Login** |
| **Expected Outcome** | Both field errors displayed; form is not submitted |

---

## TC-AUTH-007 — Login with invalid email format

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-007 |
| **Test Case Description** | Verify invalid email format is rejected |
| **Test Steps** | 1. Open Login popup<br>2. Enter invalid email (e.g. `user@` or `userexample.com`)<br>3. Enter password<br>4. Click **Login** |
| **Expected Outcome** | Browser/email validation blocks invalid format; login request not accepted |

---

## TC-AUTH-008 — Close login popup without logging in

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-008 |
| **Test Case Description** | Verify user can close login popup without authenticating |
| **Test Steps** | 1. Open Login popup<br>2. Optionally type email/password<br>3. Click **×** or click outside modal |
| **Expected Outcome** | Popup closes; form resets; user remains logged out |

---

## TC-AUTH-009 — Successful user registration

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-009 |
| **Test Case Description** | Verify new user can sign up with valid data |
| **Test Steps** | 1. Open Sign Up popup<br>2. Enter Name, unique Email, Password (min 6 characters)<br>3. Click **Sign Up** |
| **Expected Outcome** | Account created with role `user`; token returned; popup closes; user is logged in |

---

## TC-AUTH-010 — Sign up with empty required fields

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-010 |
| **Test Case Description** | Verify sign up validation for empty Name, Email, or Password |
| **Test Steps** | 1. Open Sign Up popup<br>2. Leave one or more required fields blank<br>3. Click **Sign Up** |
| **Expected Outcome** | Appropriate required-field error(s) shown; form not submitted |

---

## TC-AUTH-011 — Sign up with password less than 6 characters

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-011 |
| **Test Case Description** | Verify minimum password length of 6 characters |
| **Test Steps** | 1. Open Sign Up popup<br>2. Fill Name and Email<br>3. Enter password shorter than 6 characters<br>4. Click **Sign Up** |
| **Expected Outcome** | Error **“Minimum 6 characters”** shown; registration blocked |

---

## TC-AUTH-012 — Sign up with already registered email

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-012 |
| **Test Case Description** | Verify duplicate email is rejected |
| **Test Steps** | 1. Open Sign Up popup<br>2. Enter Name<br>3. Enter an already registered email<br>4. Enter valid password<br>5. Click **Sign Up** |
| **Expected Outcome** | Registration fails; uniqueness error returned for email |

---

## TC-AUTH-013 — Switch from Login to Sign Up

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-013 |
| **Test Case Description** | Verify mode switch from Login to Sign Up |
| **Test Steps** | 1. Open Login popup<br>2. Click **Sign Up** |
| **Expected Outcome** | Popup switches to Sign Up mode with Name, Email, and Password fields |

---

## TC-AUTH-014 — Switch from Sign Up back to Login

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-014 |
| **Test Case Description** | Verify mode switch from Sign Up to Login |
| **Test Steps** | 1. Open Sign Up popup<br>2. Click **Login** |
| **Expected Outcome** | Popup switches back to Login mode |

---

## TC-AUTH-015 — Forgot password with registered email

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-015 |
| **Test Case Description** | Verify forgot password accepts an existing email (demo flow) |
| **Test Steps** | 1. Open Login popup<br>2. Click **Forgot Password?**<br>3. Enter registered email<br>4. Click **Send Reset Link** |
| **Expected Outcome** | Success message shown (e.g. reset link sent demo); mode returns to Login |

---

## TC-AUTH-016 — Forgot password with unregistered email

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-016 |
| **Test Case Description** | Verify forgot password rejects email not in system |
| **Test Steps** | 1. Open Forgot Password mode<br>2. Enter email that does not exist<br>3. Click **Send Reset Link** |
| **Expected Outcome** | Error returned; reset not confirmed |

---

## TC-AUTH-017 — Forgot password with empty email

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-017 |
| **Test Case Description** | Verify required email on forgot password form |
| **Test Steps** | 1. Open Forgot Password mode<br>2. Leave Email blank<br>3. Click **Send Reset Link** |
| **Expected Outcome** | Message **“Email is required”** shown; request not sent |

---

## TC-AUTH-018 — Successful logout

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-018 |
| **Test Case Description** | Verify logged-in user can log out |
| **Test Steps** | 1. Log in as a valid user<br>2. Open user menu<br>3. Click **Logout** |
| **Expected Outcome** | Token/user cleared; guest UI shown (Login / Sign Up); protected pages no longer accessible |

---

## TC-AUTH-019 — Session restore after page refresh

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-019 |
| **Test Case Description** | Verify logged-in session persists after browser refresh |
| **Test Steps** | 1. Log in successfully<br>2. Refresh the page |
| **Expected Outcome** | User remains logged in using stored token; authenticated UI still shown |

---

## TC-AUTH-020 — Terms & Conditions acceptance after login

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-020 |
| **Test Case Description** | Verify Terms popup appears after login when not yet accepted |
| **Test Steps** | 1. Clear `termsAccepted` from local storage (or use fresh browser)<br>2. Log in successfully<br>3. View Terms popup<br>4. Click **Accept** |
| **Expected Outcome** | Terms popup appears after login; after Accept, `termsAccepted` is stored and popup does not reappear |

---

## TC-AUTH-021 — Login reminder for guests

| Field | Detail |
|-------|--------|
| **ID** | TC-AUTH-021 |
| **Test Case Description** | Verify periodic login reminder appears when user is logged out |
| **Test Steps** | 1. Ensure user is logged out<br>2. Stay on Home page for about 20 seconds<br>3. Observe reminder<br>4. Click Login, Sign Up, or dismiss |
| **Expected Outcome** | Reminder appears for guests; actions open login/signup or dismiss the reminder |
