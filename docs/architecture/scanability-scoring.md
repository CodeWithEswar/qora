# NXTQR Scanability Scoring Methodology

*Deterministic Mathematical Signal Integrity Model — Policy V1 (2026.1)*

---

## 1. Overview & Core Invariants

The NXTQR Scanability Engine does not generate random, arbitrary, or "black-box" scores.
Instead, it measures the physical and optical properties of the encoded QR matrix across **five protective diagnostic channels**:

```
                    ┌─────────────────────────┐
                    │      QR MATRIX          │
                    │   Payload + ECC Grid    │
                    └────────────┬────────────┘
                                 │
     ┌─────────────┬─────────────┼─────────────┬─────────────┐
     ▼             ▼             ▼             ▼             ▼
01 CONTRAST  02 QUIET ZONE  03 LOGO AREA  04 MODULE SIZE 05 RECOVERY
```

### Core Invariants
1. **Deterministic Execution**: Given the same content, design configuration, and output context, the engine returns the exact same result every time.
2. **Explainable Penalties**: The score starts at 100 (a theoretically optimal QR code) and applies itemized, documented deductions based on concrete empirical optical thresholds.
3. **Blocker Supremacy**: If any check detects a condition that physically breaks optical decoding (e.g. contrast $< 2.0:1$, quiet zone $< 1$ module, logo exceeding Reed-Solomon recovery capacity, unencodable payload), publication is blocked and the score is capped at 35 regardless of other parameters.
4. **State Integrity**:
   - Incomplete content $\rightarrow$ `not_ready` (Score undefined, UI shows "WAITING FOR CONTENT").
   - Invalid input $\rightarrow$ `blocking` (Structured blocker finding).
   - Internal calculation fault $\rightarrow$ `error` (Never defaults to 94 or "Good").

---

## 2. Channel Penalties & Deductions

### Baseline: 100 Points

| Channel | Condition / Measurement | Severity | Score Deduction | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **01 Contrast** | Ratio $\ge 7.0:1$ | Pass | $0$ | Optimal separation under all ambient lighting conditions. |
| | Ratio $4.5 - 6.9:1$ | Notice | $-5$ | WCAG AA compliance; minor decode delay in direct sunlight. |
| | Ratio $3.0 - 4.4:1$ | Warning | $-15$ | Suboptimal contrast; older camera sensors may struggle with glare. |
| | Ratio $< 2.0:1$ | Blocking | $-35$ | Insufficient luminance gradient for edge detection algorithms. |
| **02 Quiet Zone** | $\ge 4$ modules | Pass | $0$ | Complies with ISO/IEC 18004 standard margin. |
| | $3$ modules | Notice | $-5$ | Slight margin reduction; acceptable on plain white backgrounds. |
| | $2$ modules | Warning | $-12$ | Risk of graphic boundary interference on textured surfaces. |
| | $< 2$ modules | Blocking | $-30$ | External elements bleed into finder patterns; scan bounds lost. |
| **03 Logo Area** | Coverage $\le 10\%$ on Q/H | Pass | $0$ | Center occlusion safely absorbed by Reed-Solomon capacity. |
| | Coverage $11\% - 18\%$ | Warning | $-15$ | Consumes $> 65\%$ of safe recovery budget; scratch vulnerability. |
| | Coverage $>$ EC limit | Blocking | $-40$ | Data loss exceeds mathematical codeword repair threshold. |
| **04 Module Size** | Screen preview | Pass | $0$ | High resolution digital display context. |
| | Digital export $< 5\text{px}$ | Warning | $-10$ | Anti-aliasing blurring module edges on raster displays. |
| | Digital export $< 3\text{px}$ | Blocking | $-25$ | Severe raster grid downsampling corruption. |
| | Print press $< 0.7\text{mm}$ | Warning | $-15$ | Close-range scanning required; arm-length scanning difficult. |
| | Print press $< 0.5\text{mm}$ | Blocking | $-30$ | Falls below mobile camera optical resolving threshold. |
| **05 Recovery** | Dense matrix + Level L | Warning | $-8$ | Dense grid with only 7% redundancy is fragile to print wear. |

---

## 3. Score Calculation Formula

$$\text{Final Score} = \max\left(10, \min\left(100, 100 - \sum \text{penalties}\right)\right)$$

If any check returns `blocking: true`:
$$\text{Final Score} \le 35$$

### Example Score Breakdown
```text
Base Score:                100
- 03 Logo Area (16.4%):     -15  (Consumes >65% of Level Q recovery budget)
- 02 Quiet Zone (3 mod):     -5  (Slightly below 4-module standard)
---------------------------------
Final Score:                 80  (Status: Warning — 2 Recommendations)
```

---

## 4. Score Limitations & Philosophy

1. **The Score Is Secondary**:
   The primary value of NXTQR's Scanability Engine is not the aggregate number, but the **diagnostic trace**:
   - *What part of the QR is at risk?*
   - *Why is it at risk?*
   - *How serious is it?*
   - *What concrete parameter can the user adjust?*
2. **No False Certification**:
   NXTQR does not claim "100% scannable on all devices" or "ISO Certified". Physical optical decoding depends on real-world factors outside software control (lens cleanliness, print paper ink bleed, ambient shadows, camera autofocus quality). The engine evaluates mathematical and geometric compliance.
