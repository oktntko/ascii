# Key Mapper – ASCII / CSI u / XTerm Input Explorer

A small developer tool to inspect and generate terminal key sequences.

This app helps you:

- View ASCII codes
- Generate **CSI u** sequences
- Generate **XTerm modifyOtherKeys** sequences
- Create ready-to-use **Windows Terminal keybindings**
- Compare CSI u and XTerm formats side-by-side

Perfect for terminal nerds, Neovim users, and anyone fighting with keyboard encoding.

---

## ✨ Features

- 🔤 Displays ASCII code of pressed key

- 🧩 Generates **CSI u** format
  Example:

  ```
  Ctrl+Shift+G → \u001b[71;6u
  ```

- 🖥 Generates **XTerm input format**
  Example:

  ```
  Ctrl+Shift+G → \u001b[27;6;71~
  ```

- 🪟 Generates ready-to-copy Windows Terminal keybinding:

  ```json
  {
    "command": {
      "action": "sendInput",
      "input": "\u001b[27;6;71~"
    },
    "id": "User.sendInput.CTRL_SHIFT_G",
    "keys": "ctrl+shift+g"
  }
  ```

- 📊 Table view for:
  - Key name
  - CSI u
  - XTerm input
  - Windows Terminal binding snippet

---

## 🧠 Why This Exists

Terminal key encoding is messy.

Depending on your setup:

- Windows Terminal
- WezTerm
- xterm
- Neovim
- Tauri / Browser environments

You may encounter:

- ASCII control codes
- CSI u sequences
- `modifyOtherKeys`
- Legacy `~`-terminated sequences
- Browser `KeyboardEvent` inconsistencies

This tool helps you see exactly what each key combination produces.

---

## 🔬 Supported Formats

### 1. ASCII

Single-character keys.

Example:

```
a → 97
```

---

### 2. CSI u

Format:

```
\u001b[<codepoint>;<modifier>u
```

Example:

```
Shift+A → \u001b[97;2u
Ctrl+Shift+G → \u001b[71;6u
```

Modifier values follow xterm conventions:

| Modifier   | Value |
| ---------- | ----- |
| Shift      | 2     |
| Alt        | 3     |
| Ctrl       | 5     |
| Ctrl+Shift | 6     |
| etc.       |       |

---

### 3. XTerm modifyOtherKeys Format

Format:

```
\u001b[27;<modifier>;<codepoint>~
```

Example:

```
Shift+A → \u001b[27;2;97~
Ctrl+Shift+G → \u001b[27;6;71~
```

---

## 🧪 Special Keys

The tool also supports:

- Arrow keys
- Function keys (F1–F12)
- Home / End / Insert / Delete
- Backspace (8 vs 127 handling)
- Tab / Shift+Tab
- Enter
- Escape
- Space

It correctly displays CSI u equivalents when available.

---

## ⚙️ Use Cases

- Creating custom Neovim keymaps
- Debugging Tauri keyboard input
- Windows Terminal custom bindings
- Understanding CSI u behavior
- Comparing browser vs terminal key events

---

## 🚀 Installation

```bash
pnpm install
pnpm dev
```

Build:

```bash
pnpm build
```

---

## 🛠 Tech Stack

- Vue
- Tailwind
- Tauri (desktop build)

---

## 🧑‍💻 Author

Built for terminal power users who care about precise keyboard control.

---

If you want, I can also:

- Make it more minimal
- Make it more “terminal hacker” style
- Add a formal spec section
- Add a compatibility matrix (Windows Terminal / WezTerm / iTerm2)
- Add a deep explanation of modifier bitmask math

Just tell me the vibe you want 😄
