
# 🔐 encrypt-express

An Express middleware that encrypts outgoing JSON responses and decrypts incoming JSON request bodies using AES-256-CBC encryption. This package is designed to work seamlessly with the [`encrypt-react`](https://www.npmjs.com/package/encrypt-react) package, allowing for secure full-stack communication.

---

## 📦 Installation

Install the `encrypt-express` middleware package via npm:

```bash
npm install encrypt-express
````

> Requires Node.js v12+.

---

## 🚨 **Important Requirements to Make it Work**

To ensure that **`encrypt-express`** works seamlessly with your frontend application, you must meet the following **requirements**:

### 1. **Secret Key Consistency**

* **The secret key used for encryption and decryption must be the same** on both the **frontend** (via `encrypt-react`) and the **backend** (via `encrypt-express`).

* The secret key must be **64 hex characters** long (32 bytes).

* For example, in your `.env` or config file, you might store the key like this:

  ```bash
  SECRET_KEY=YOUR_64_CHARACTER_HEX_KEY
  ```

* The **frontend (`encrypt-react`)** must send the encrypted data with this same key, and the **backend (`encrypt-express`)** must use the same key to decrypt the data and encrypt outgoing responses.

### 2. **Backend (Express) Configuration**

* The backend must be using the `encrypt-express` middleware to automatically handle encryption and decryption.

* In your Express app, install and configure the middleware:

  ```bash
  npm install encrypt-express
  ```

* Then use it in your Express server:

  ```js
  const express = require('express');
  const encryptMiddleware = require('encrypt-express');

  const app = express();

  // Use the same 64-character hex secret key as the frontend
  const SECRET_KEY = 'YOUR_64_CHARACTER_HEX_KEY'; 

  // Middleware for encryption and decryption
  app.use(express.json());
  app.use(encryptMiddleware(SECRET_KEY));

  app.post('/api/test', (req, res) => {
    console.log('Decrypted request:', req.body); // { message: 'Hello World' }
    res.json({ reply: 'Received securely!' });
  });

  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
  ```

* This middleware will:

  * Automatically decrypt incoming requests that have the `encrypted: true` header and a `data` property in the body.
  * Automatically encrypt outgoing responses by wrapping them in a `data` field.

### 3. **Frontend (React) Configuration**

* The frontend must be using the `encrypt-react` package, which automatically encrypts the request body and decrypts the response body using the same encryption logic.

* Install `encrypt-react` in the frontend:

  ```bash
  npm install encrypt-react
  ```

* Use the `useAxiosEncrypt` hook in your React app to handle encryption/decryption:

  ```jsx
  import React from 'react';
  import axios from 'axios';
  import { useAxiosEncrypt } from 'encrypt-react';

  const SECRET_KEY = 'YOUR_64_CHARACTER_HEX_KEY'; // Same key as backend

  function App() {
    useAxiosEncrypt(SECRET_KEY); // Enable encryption/decryption globally

    const sendData = async () => {
      const res = await axios.post('/api/test', { message: 'Hello World' });
      console.log(res.data);
    };

    return (
      <div>
        <button onClick={sendData}>Send Encrypted Data</button>
      </div>
    );
  }

  export default App;
  ```

* This will automatically encrypt outgoing requests and decrypt incoming responses.

---

## 🔐 How It Works

### 1. **Incoming Requests**:

* The middleware checks if the request body contains an encrypted payload (`data`), and if the `encrypted: true` header is present.
* If these conditions are met, it will **decrypt** the `data` field using the secret key.

### 2. **Outgoing Responses**:

* The middleware automatically **encrypts** the response body using the secret key and prepends it with an `X-Encrypted: true` header.
* This tells the frontend that the data is encrypted and needs to be decrypted.

---

## 🔧 **Encryption Details**

* **Algorithm**: AES-256-CBC (via Node's `crypto` module)
* **Key**: 64-character hex string (32 bytes)
* **IV**: Random 16-byte IV prepended to the encrypted data
* **Encryption/Decryption**:

  * **Frontend (`encrypt-react`)**: Encrypts requests and decrypts responses.
  * **Backend (`encrypt-express`)**: Decrypts incoming requests and encrypts outgoing responses.

Both packages use the same algorithm and secret key to ensure data integrity and confidentiality.

---

## 🧪 Example Payloads

**Encrypted Request** (sent from the frontend):

```json
{
  "data": "3e1f7f9b3e3b7a2a1e...:7a8f21cb7b95d9e1..."
}
```

**Encrypted Response** (sent from the backend):

```json
{
  "data": "4b10ed32b6e62f9015...:7c8f21cb2b52ab5f..."
}
```

---

## ✅ Requirements

* **Secret Key**: Must be a **64-character hex string** for AES-256 encryption.
* **Frontend**: Must use the [`encrypt-react`](https://www.npmjs.com/package/encrypt-react) package for encryption and decryption.
* **Backend**: Must use `encrypt-express` to handle encrypted requests and responses.
* **Node.js**: Requires Node.js v12+ for `crypto` module support.
* **Express**: Compatible with Express 4.x and higher.

---

## 🤝 Frontend Integration

This middleware package works seamlessly with the [`encrypt-react`](https://www.npmjs.com/package/encrypt-react) frontend package.

* **Frontend**: Handles encryption of requests and decryption of responses automatically.
* **Backend**: Uses this middleware to decrypt incoming requests and encrypt outgoing responses.

Ensure that both the frontend and backend are configured with the **same secret key** for encryption to work correctly.

---

## 🧠 Tips

* **Store the Secret Key Securely**: Use environment variables to securely store your secret key on both frontend and backend. Never hard-code it in your codebase.
* **HTTPS**: Always use HTTPS in production environments to prevent the encryption key from being intercepted.
* **Debugging**: Encryption and decryption errors are logged in development. Set `NODE_ENV=production` to suppress these logs.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built by [@Sonu](https://github.com/sonumehtaskr). Contributions and feedback are welcome!

---

## 🛠️ Troubleshooting

### Error: `Secret key must be a 64-character hex string.`

Ensure the secret key on both the frontend and backend is exactly 64 hex characters (32 bytes).

### Error: `Invalid encrypted request data`

This indicates the incoming data cannot be properly decrypted. Ensure that the frontend is sending the data in the correct format.
