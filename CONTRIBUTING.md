# Contributing to Brainiac

Thank you for your interest in contributing to **Brainiac**! We welcome contributions, bug reports, feature suggestions, and pull requests from everyone.

Please review the guidelines below to help ensure a smooth and productive collaboration.

---

## Code of Conduct

This project and everyone participating in it is governed by the [Brainiac Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior following the guidelines in that document.

---

## How Can I Contribute?

### 1. Reporting Bugs

Before creating bug reports, please check existing issues to see if the problem has already been reported.

When logging a bug, please include:
* A clear and descriptive title
* Steps to reproduce the behavior
* Expected vs actual behavior
* Screenshots or console logs (WebGL errors, network errors, etc.)
* Your environment (OS, browser and version, GPU specs if WebGL-related)

### 2. Suggesting Enhancements

Feature requests are welcome! When opening an issue:
* Provide a clear and detailed explanation of the proposed feature
* Explain the use case and why it would be beneficial to users or developers
* Suggest potential implementations or architectural changes if known

### 3. Submitting Pull Requests

1. **Fork the Repository**: Create a fork of `imMohammedSahil/Brainiac`.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/Brainiac.git
   cd Brainiac
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix
   ```
4. **Install dependencies**:
   ```bash
   npm install
   cd brainiac-backend && npm install && cd ..
   ```
5. **Implement changes**:
   * Adhere to existing code conventions and formatting styles.
   * Keep changes focused and minimal to the issue at hand.
6. **Verify build & test**:
   ```bash
   npm run build
   ```
7. **Commit & Push**:
   ```bash
   git commit -m "feat: add 3D neural map node interaction"
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request**: Submit your PR against the `main` branch with a clear description of the problem solved.

---

## Development Setup

* **Frontend**: React 19, Three.js, React Three Fiber, Tailwind CSS, Vite
* **Backend**: Node.js, Express, Hugging Face Inference API

Refer to the main [README.md](README.md) for detailed installation and environment setup instructions.

---

## License

By contributing to Brainiac, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
