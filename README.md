# Atomic Protocol

> Documentation coming soon

Atomic Protocol is a modern, efficient, and fully TypeScript-rewritten version of  
[PrismarineJS/bedrock-protocol](https://github.com/PrismarineJS/bedrock-protocol).  
It’s built with performance and maintainability in mind.

- ✅ Minecraft Version: `1.21.100`
- ✅ Written in TypeScript  
- ✅ Strongly-typed packet definitions
- ✅ Clean API for client creation  
- ❌ No proxy or server implementation (for those, use the original [PrismarineJS/bedrock-protocol](https://github.com/PrismarineJS/bedrock-protocol))

---

## 📦 Installation

```bash
bun add atomic-protocol
# or
npm install atomic-protocol
```

---

## 🚀 Usage

```ts
import { Client } from "atomic-protocol";

const client = new Client({
  host: "example.com",
  port: 19132,
});

client.on("start_game", () => {
  console.log("Game started!");
});

client.on("add_player", packet => {
  console.log("New player joined:", packet.username);
});
```

---

## 📑 Packet Type Definitions

All packet structures are auto-generated from [`src/config/protocol.json`](./src/config/protocol.json) into TypeScript definitions under [`src/packets/`](./src/packets).  

This means you get **full IntelliSense and type-safety** when working with packets:

```ts
client.on("text", (packet) => {
  // `packet` is strongly typed as `TextPacket`
  console.log(`[${packet.source}] ${packet.message}`);
});
```

---

## 🗺️ Roadmap

- [ ] API & FAQ Documentation
- [ ] Shrink Package Requirements
- [ ] Nethernet Support
- [ ] **Future Enhancements**
  - Consider adding proxy support (client ↔ server pass-through).
  - Explore server implementation (stretch goal).

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests to improve Atomic Protocol.

---

## 👥 Authors

- **[Serial-V](https://github.com/Serial-V)**
- **[NoVa Gh0ul](https://github.com/NoVa-Gh0ul)**

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.