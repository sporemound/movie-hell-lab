# Movie Hell Mathematics — Python Reference v0.1.0

This package accompanies the Movie Hell / Uniflora Antigravity rebuild context.

It turns the current mathematical architecture into executable Python.

## Included mathematics

### Grassroots systems

For finite communities:

\[
\varnothing \subset P \subset P' \subseteq \Pi
\]

the design target is:

\[
TS(P) \subset TS(P')/P
\]

The Python reference provides executable finite-state checks for:

- non-interference;
- strict interactivity;
- projection from `P'` back to `P`;
- friend-to-friend dissemination.

These are sanity checks for a concrete finite model, **not a formal proof of the full protocol family**.

### Blocklace

Implements an authenticated DAG corresponding conceptually to:

\[
b = (h_p, H, x)
\]

with:

- creator/authentication;
- finite hash-pointer set;
- payload;
- DAG acyclicity checks.

The demo uses HMAC only so it has zero external dependencies.
Production should use asymmetric signatures such as Ed25519.

### Relay-tree mathematics

For fanout \(f\) and depth \(d\):

\[
N_{\max} = \sum_{i=0}^{d}f^i
\]

and for \(f \ne 1\):

\[
N_{\max} = \frac{f^{d+1}-1}{f-1}
\]

The module computes the exact minimum integer depth needed for a target room size.

Approximate relay uplink:

\[
U \approx fR
\]

with an optional transport-overhead term.

### Redundancy

Idealized independent multi-parent estimate:

\[
P(\text{all paths miss}) \approx p_m^r
\]

This is an engineering approximation, not a theorem from Shapiro.

### Transparent architecture prioritization

A sample explicit scoring equation is included for survey-to-roadmap experiments.

It is deliberately transparent and replaceable and must never override:

- accessibility;
- security;
- legal review;
- human governance.

## Run

```powershell
python .\movie_hell_math.py
```
