# Security Policy

## Supported Versions

We release patches and security updates for actively maintained branches:

| Version | Supported | Automated Scans |
| :--- | :--- | :--- |
| `main`  | Yes | CodeQL (Weekly), Dependabot (Weekly) |
| < 1.0.0 | No | Inactive |

---

## Reporting a Vulnerability

The Brainiac team takes security and user privacy seriously. If you discover a security vulnerability or exploit within this repository or associated backend services:

1. **Do not create a public GitHub issue.**
2. Please privately disclose the vulnerability to the project maintainers via GitHub's private vulnerability reporting feature:
   * Go to the **Security** tab of [imMohammedSahil/Brainiac](https://github.com/imMohammedSahil/Brainiac).
   * Click **Report a vulnerability**.
3. Alternatively, contact the maintainer directly through their GitHub profile [@imMohammedSahil](https://github.com/imMohammedSahil).

### What to Include

Please provide detailed information to help us reproduce and resolve the issue swiftly:
* Type of vulnerability (e.g., API key leak, prompt injection, CORS misconfiguration, XSS)
* Step-by-step instructions or proof-of-concept (PoC) to reproduce the vulnerability
* Affected endpoints, components, or files
* Potential impact and proposed mitigations (if known)

### Response Timeline

* **Acknowledgment:** Within 48 hours
* **Assessment & Patch:** We aim to review and publish a fix within 7-14 business days depending on severity
* **Public Disclosure:** Coordinated after a fix is verified and deployed
