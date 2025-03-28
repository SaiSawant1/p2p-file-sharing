# P2P File Sharing System ⚡

🚀 **A blazing-fast, private, and secure peer-to-peer (P2P) file-sharing system using WebRTC, Go, and Next.js.**

## 🌟 Features

- **📡 Pure P2P Transfer** – Files are sent directly between peers using WebRTC, no middleman.
- **🔒 Secure & Private** – End-to-end encryption ensures safe transfers.
- **⚡ No Cloud Storage** – Your files never touch a third-party server.
- **📲 QR Code & Link Sharing** – Easily send files with a generated link or QR code.
- **⏸️ Pause & Resume** – Handles connection drops and resumes transfers seamlessly.
- **🔥 Fast & Lightweight** – Optimized for high-speed, real-time file sharing.

## 🚀 Tech Stack

- **Frontend:** Next.js (React) for an intuitive UI.
- **Backend:** Go (Golang) WebSocket server for WebRTC signaling.
- **WebRTC:** Real-time peer-to-peer file transfer.
- **STUN/TURN Servers:** NAT traversal for connecting users behind firewalls.

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/p2p-file-sharing.git
cd p2p-file-sharing

# Start the Go signaling server
cd server
go run main.go

# Start the Next.js frontend
cd ../frontend
npm install
npm run dev
```

## 🎯 How It Works

1. **User A selects a file** to share.
2. A **unique link & QR code** is generated.
3. **User B opens the link**, and a WebRTC connection is established.
4. The file **transfers directly** from User A to User B.
5. **Done!** 🎉

## 🛠 Future Enhancements

- **📂 Multi-file & folder sharing**
- **🌐 Browser extensions for easier access**
- **🔄 Decentralized peer discovery**

## 🤝 Contributing

PRs are welcome! Open an issue or start hacking. 🚀

## 📜 License

MIT License © [Your Name](https://github.com/yourusername)
