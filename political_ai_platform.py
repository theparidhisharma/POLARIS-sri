"""
╔══════════════════════════════════════════════════════════════════════════════╗
║     POLITICAL AI SENTIMENT PLATFORM — FULL WORKING ALGORITHM               ║
║     Synthetic Data Demonstration                                            ║
║                                                                             ║
║  Pipeline:                                                                  ║
║   1. Synthetic Data Generation                                              ║
║   2. Embedding + Topic Activation (LaBSE proxy)                            ║
║   3. Sentiment Scoring Ensemble (VADER + RoBERTa + Domain)                 ║
║   4. Feature Extraction (velocity, volatility, propagation, feedback)      ║
║   5. State Vector X(t) ∈ ℝ²¹ Construction                                 ║
║   6. Attention-GRU State Transition Model                                  ║
║   7. Spatial Smoothing (Gaussian Kernel + Kriging proxy)                   ║
║   8. Perturbation Vector U(t) Encoding                                     ║
║   9. Strategy Simulation Engine (6-step lookahead)                         ║
║  10. Alert Engine                                                           ║
║  11. Full State Trajectory Output                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import numpy as np
import json
from datetime import datetime, timedelta
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)
print("=" * 70)
print("  POLITICAL AI SENTIMENT PLATFORM — SYNTHETIC DEMONSTRATION")
print("=" * 70)

# ─────────────────────────────────────────────────────────────────────────────
# GLOBAL CONFIG
# ─────────────────────────────────────────────────────────────────────────────
K      = 6        # topic dimensions
T      = 24       # history steps to use (12 hours)
SIGMA  = 25.0     # Gaussian kernel radius (km)
DECAY  = 0.7      # perturbation decay per step
N_SIM  = 6        # lookahead steps in strategy sim

TOPICS = ["Economy", "Security", "Healthcare",
          "Infrastructure", "Governance", "Identity"]

TOPIC_SEEDS = {
    "Economy":        ["inflation","prices","jobs","rupee","growth","unemployment"],
    "Security":       ["border","army","terrorism","law","police","crime"],
    "Healthcare":     ["hospital","medicine","doctor","health","vaccine","disease"],
    "Infrastructure": ["roads","electricity","water","metro","bridge","connectivity"],
    "Governance":     ["corruption","scheme","government","policy","minister","tax"],
    "Identity":       ["culture","religion","language","community","tradition","caste"],
}

CONSTITUENCIES = {
    "Mumbai_South": {"lat":18.90,"lon":72.83,"tier":1},
    "Thane":        {"lat":19.21,"lon":72.98,"tier":1},
    "Nashik":       {"lat":19.99,"lon":73.79,"tier":2},
    "Pune":         {"lat":18.52,"lon":73.85,"tier":1},
    "Wardha":       {"lat":20.75,"lon":78.60,"tier":2},
}
C_NAMES = list(CONSTITUENCIES.keys())

PLATFORMS = ["Twitter","Reddit","Facebook","YouTube","Telegram","News"]
P_WEIGHTS = {  # (engagement_weight, reach_weight)
    "Twitter":  (1.0, 1.0), "Reddit":   (2.5, 0.4),
    "Facebook": (0.8, 1.8), "YouTube":  (3.0, 0.3),
    "Telegram": (1.5, 0.6), "News":     (5.0, 2.0),
}

POS_LEX = {"great","excellent","support","progress","improve","benefit",
           "growth","happy","proud","hope","success","strong","achieve","relief"}
NEG_LEX = {"inflation","prices","expensive","crisis","fail","corrupt",
           "problem","angry","suffer","worse","delay","broken","unfair","jobless"}

# ══════════════════════════════════════════════════════════════════════════════
# 1. SYNTHETIC DATA GENERATION
# ══════════════════════════════════════════════════════════════════════════════
print("\n[1/10] Generating synthetic data...")

def generate_posts(n_steps=T):
    posts = []
    base = datetime(2024, 3, 1, 0, 0)
    crisis_c = ["Wardha", "Nashik"]   # simulate inflation crisis
    pos_w = list(POS_LEX)
    neg_w = list(NEG_LEX)
    neu_w = ["discuss","meeting","announced","said","people","government","today"]

    for step in range(n_steps):
        ts = base + timedelta(minutes=step * 30)
        for cname, cinfo in CONSTITUENCIES.items():
            # Crisis deepens after step 8
            crisis = (step - 8) * 0.04 if (cname in crisis_c and step > 8) else 0
            n = int(np.random.poisson(max(4, 10 + crisis * 3)))

            for _ in range(n):
                platform = np.random.choice(PLATFORMS)
                topic    = np.random.choice(TOPICS)
                seeds    = TOPIC_SEEDS[topic]

                # Sentiment bias drifts negative in crisis constituencies
                if cname in crisis_c and step > 8:
                    s_bias = np.clip(-0.04 * (step - 8) + np.random.normal(0, 0.1), -1, 1)
                else:
                    s_bias = np.random.uniform(-0.15, 0.2)

                # Build text
                words = []
                for _ in range(np.random.randint(8, 22)):
                    r = np.random.random()
                    if r < 0.25:   words.append(np.random.choice(pos_w if s_bias > 0 else neg_w))
                    elif r < 0.45: words.append(np.random.choice(seeds))
                    else:          words.append(np.random.choice(neu_w))
                text = " ".join(words)

                followers = int(np.random.lognormal(7, 1.5))
                age_days  = np.random.randint(30, 2000)
                verified  = 1 if followers > 50000 else 0
                cred      = min(10.0, np.log(max(followers,1)) * verified * min(age_days/365,1.0))
                eng       = int(np.random.lognormal(3, 1.2))
                we, wr    = P_WEIGHTS[platform]
                norm_eng  = eng * we * wr

                n_replies = max(0, int(np.random.poisson(eng * 0.1)))
                reply_s   = [np.clip(s_bias + np.random.normal(0,0.15),-1,1)
                             for _ in range(max(1, n_replies))]

                posts.append({
                    "text":s_bias, "raw_text":text, "topic":topic,
                    "constituency":cname, "platform":platform,
                    "step":step, "ts":ts,
                    "followers":followers, "age_days":age_days,
                    "verified":verified, "cred":cred,
                    "eng":eng, "norm_eng":norm_eng,
                    "n_replies":n_replies, "reply_s":reply_s,
                    "s_bias":s_bias,
                })
    return posts

posts = generate_posts()
print(f"    ✓  {len(posts)} posts  |  {len(CONSTITUENCIES)} constituencies  "
      f"|  {len(PLATFORMS)} platforms  |  {T} time steps")

# ══════════════════════════════════════════════════════════════════════════════
# 2. EMBEDDING + TOPIC ACTIVATION  (LaBSE proxy via word-overlap cosine)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[2/10] Building embeddings and topic anchors...")

# Build vocabulary from all seed words
vocab = sorted({w for seeds in TOPIC_SEEDS.values() for w in seeds})
vocab_idx = {w: i for i, w in enumerate(vocab)}
V = len(vocab)

def embed(text):
    """Word-overlap vector (LaBSE proxy). Production: use sentence-transformers."""
    v = np.zeros(V)
    for w in text.lower().split():
        if w in vocab_idx:
            v[vocab_idx[w]] += 1.0
    n = np.linalg.norm(v)
    return v / n if n > 0 else v

def cos(a, b):
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    return float(np.dot(a,b)/(na*nb)) if na > 0 and nb > 0 else 0.0

# Anchor vectors âₖ for each topic
anchors = {}
for topic, seeds in TOPIC_SEEDS.items():
    v = np.zeros(V)
    for w in seeds:
        if w in vocab_idx: v[vocab_idx[w]] = 1.0
    n = np.linalg.norm(v)
    anchors[topic] = v/n if n > 0 else v

def topic_activation(text):
    """ωₖ = cosine(v_post, âₖ)  ∀ k"""
    v = embed(text)
    return np.array([cos(v, anchors[t]) for t in TOPICS])

print(f"    ✓  Vocabulary: {V} seed terms  |  {K} topic anchors built")

# ══════════════════════════════════════════════════════════════════════════════
# 3. SENTIMENT SCORING ENSEMBLE
#    s(t) = 0.30×VADER + 0.50×RoBERTa + 0.20×domain
# ══════════════════════════════════════════════════════════════════════════════
print("\n[3/10] Running sentiment ensemble...")

def vader_score(text):
    words = text.lower().split()
    pos = sum(1 for w in words if w in POS_LEX)
    neg = sum(1 for w in words if w in NEG_LEX)
    return np.clip((pos - neg) / max(len(words),1) * 3, -1.0, 1.0)

def roberta_score(post):
    """Proxy: uses generation bias + calibrated noise."""
    return np.clip(post["s_bias"] + np.random.normal(0, 0.07), -1.0, 1.0)

def domain_score(text, topic):
    seeds = TOPIC_SEEDS.get(topic,[])
    hits  = sum(1 for w in text.lower().split() if w in seeds)
    return np.clip(hits * 0.12 - 0.05, -1.0, 1.0)

def ensemble(post):
    v = vader_score(post["raw_text"])
    r = roberta_score(post)
    d = domain_score(post["raw_text"], post["topic"])
    return 0.30*v + 0.50*r + 0.20*d

# Score all posts
for p in posts:
    p["sentiment"] = ensemble(p)

print(f"    ✓  Scored {len(posts)} posts  "
      f"|  mean={np.mean([p['sentiment'] for p in posts]):.3f}  "
      f"|  std={np.std([p['sentiment'] for p in posts]):.3f}")

# ══════════════════════════════════════════════════════════════════════════════
# 4. FEATURE EXTRACTION  →  xt ∈ ℝ¹²  per (constituency, step)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[4/10] Extracting features per window...")

def extract_features(window):
    """window = list of posts in one (constituency, step)"""
    if not window:
        return np.zeros(6 + K)

    sents   = np.array([p["sentiment"] for p in window])
    r_sents = np.concatenate([p["reply_s"] for p in window])
    engs    = np.array([p["norm_eng"] for p in window])

    s_mean  = float(np.mean(sents))
    recep   = float(np.mean(r_sents))                    # reception
    phi     = float(np.log1p(np.mean(engs)))             # propagation proxy
    rho     = float(sum(p["n_replies"] for p in window) /
                    max(len(window),1))                  # feedback
    sigma   = float(np.var(sents)) if len(sents)>1 else 0.0  # volatility
    cred    = float(np.mean([p["cred"] for p in window]))

    # Topic salience Ω (engagement-weighted fraction)
    tc = defaultdict(float)
    for p,e in zip(window, engs):
        tc[p["topic"]] += e / max(engs.sum(), 1)
    omega = np.array([tc.get(t,0.0) for t in TOPICS])
    omega = omega / max(omega.sum(), 1e-8)

    return np.array([s_mean, recep, phi, rho, sigma, cred] + list(omega))

# Build feature table: feat[constituency][step]
feat = defaultdict(dict)
for step in range(T):
    for cname in C_NAMES:
        window = [p for p in posts if p["step"]==step and p["constituency"]==cname]
        feat[cname][step] = extract_features(window)

print(f"    ✓  Features extracted: {len(C_NAMES)} × {T} windows  "
      f"|  dim per window = {6+K}")

# ══════════════════════════════════════════════════════════════════════════════
# 5. STATE VECTOR  X(t) ∈ ℝ²¹
#    [s, ṡ, s̈, Σ, Ω(6), φ, ρ, reception, credibility, padding(4)]
# ══════════════════════════════════════════════════════════════════════════════
print("\n[5/10] Building state vectors X(t) ∈ ℝ²¹...")

def build_state(s_hist, f):
    """
    s_hist: list of past sentiment values
    f: feature vector (dim 6+K)
    """
    s      = s_hist[-1] if len(s_hist)>=1 else 0.0
    s_dot  = s_hist[-1]-s_hist[-2]    if len(s_hist)>=2 else 0.0
    s_ddot = (s_hist[-1] - 2*s_hist[-2] + s_hist[-3]) if len(s_hist)>=3 else 0.0
    Sigma  = f[4]
    Omega  = f[6:6+K]
    phi    = f[2]; rho = f[3]; recep = f[1]; cred = f[5]
    x = np.array([s, s_dot, s_ddot, Sigma] + list(Omega) +
                 [phi, rho, recep, cred, 0.0, 0.0, 0.0, 0.0])
    return x[:21]

# Build state history per constituency
states = defaultdict(list)  # states[cname] = [X(0), X(1), ..., X(T-1)]
for cname in C_NAMES:
    s_hist = []
    for step in range(T):
        f = feat[cname][step]
        s_hist.append(f[0])  # s_mean as position
        x = build_state(s_hist, f)
        states[cname].append(x)

print(f"    ✓  State tensors: {len(C_NAMES)} constituencies × {T} steps × 21 dims")

# ══════════════════════════════════════════════════════════════════════════════
# 6. ATTENTION-GRU STATE TRANSITION MODEL  (numpy)
#    X(t+1) = F(X(t)) + G(X(t),U(t)) + W(t)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[6/10] Initialising Attention-GRU model...")

class AttentionGRU:
    def __init__(self, xd=21, hd=32, ud=16, heads=4, seq=8):
        self.xd=xd; self.hd=hd; self.ud=ud; self.heads=heads; self.seq=seq
        s = 0.08
        # GRU gates
        self.Wz=np.random.randn(hd,xd+hd)*s; self.bz=np.zeros(hd)
        self.Wr=np.random.randn(hd,xd+hd)*s; self.br=np.zeros(hd)
        self.Wh=np.random.randn(hd,xd+hd)*s; self.bh=np.zeros(hd)
        # Attention
        self.Wa=np.random.randn(heads,hd)*s
        # F network (natural evolution, state only)
        self.Wf1=np.random.randn(hd,hd)*s
        self.Wf2=np.random.randn(xd,hd)*s
        # G network (perturbation response)
        self.Wg1=np.random.randn(hd,hd+ud)*s
        self.Wg2=np.random.randn(xd,hd)*s
        # Uncertainty head (Softplus → σ²)
        self.Wu=np.random.randn(xd,hd)*s
        self.Q = 0.015   # process noise scale

    def _sig(self,x): return 1/(1+np.exp(-np.clip(x,-30,30)))
    def _tanh(self,x): return np.tanh(np.clip(x,-30,30))
    def _relu(self,x): return np.maximum(0,x)

    def _gru(self, x, h):
        xh = np.concatenate([x,h])
        z  = self._sig(self.Wz@xh + self.bz)
        r  = self._sig(self.Wr@xh + self.br)
        h_ = self._tanh(self.Wh@np.concatenate([x,r*h]) + self.bh)
        return (1-z)*h + z*h_

    def _attention(self, seq):
        ctxs = []
        for a in self.Wa:
            scores = np.array([a@h for h in seq])
            scores -= scores.max()
            w = np.exp(scores)/(np.exp(scores).sum()+1e-8)
            ctxs.append(sum(wi*h for wi,h in zip(w,seq)))
        return np.mean(ctxs, axis=0)

    def forward(self, x_hist, u=None):
        """
        x_hist : list of recent state vectors
        u      : perturbation vector (optional)
        Returns: x_next, sigma2
        """
        h = np.zeros(self.hd)
        hs = []
        for x in x_hist[-self.seq:]:
            h = self._gru(x, h)
            hs.append(h.copy())

        ctx = self._attention(hs)

        # F: natural evolution
        f_delta = self.Wf2 @ self._relu(self.Wf1 @ ctx) * 0.08

        # G: perturbation response
        if u is not None:
            u_pad = np.zeros(self.ud)
            u_pad[:min(len(u),self.ud)] = u[:self.ud]
            g_delta = self.Wg2 @ self._relu(self.Wg1 @ np.concatenate([ctx,u_pad])) * 0.12
        else:
            g_delta = np.zeros(self.xd)

        # Process noise W ~ N(0, Q)
        w = np.random.randn(self.xd) * self.Q

        x_next = x_hist[-1] + f_delta + g_delta + w

        # Uncertainty: Softplus σ²
        sigma2 = np.log1p(np.exp(self.Wu @ ctx)) * 0.008

        return x_next, sigma2

model = AttentionGRU(xd=18, hd=32, ud=16, heads=4, seq=8)

# Run forward pass over all constituencies
print("    Running state transitions...")
predicted_states = defaultdict(list)
uncertainties    = defaultdict(list)

for cname in C_NAMES:
    hist = states[cname]
    for t in range(3, T):
        x_next, sig2 = model.forward(hist[:t])
        predicted_states[cname].append(x_next)
        uncertainties[cname].append(sig2)

print(f"    ✓  Forward pass complete  |  "
      f"mean σ²={np.mean([np.mean(u) for u in uncertainties.values()]):.4f}")

# ══════════════════════════════════════════════════════════════════════════════
# 7. SPATIAL SMOOTHING  (Gaussian kernel + Kriging proxy)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[7/10] Applying spatial smoothing (Gaussian kernel)...")

def haversine(lat1,lon1,lat2,lon2):
    R=6371.0
    dlat=np.radians(lat2-lat1); dlon=np.radians(lon2-lon1)
    a=np.sin(dlat/2)**2+np.cos(np.radians(lat1))*np.cos(np.radians(lat2))*np.sin(dlon/2)**2
    return R*2*np.arcsin(np.sqrt(a))

# Distance matrix
dists = {}
for c1 in C_NAMES:
    for c2 in C_NAMES:
        la1,lo1 = CONSTITUENCIES[c1]["lat"],CONSTITUENCIES[c1]["lon"]
        la2,lo2 = CONSTITUENCIES[c2]["lat"],CONSTITUENCIES[c2]["lon"]
        dists[(c1,c2)] = haversine(la1,lo1,la2,lo2)

def gaussian_smooth(raw_states, step_idx):
    """
    For each constituency, smooth its state at step_idx
    using Gaussian kernel over neighbouring constituency states.
    wᵢ = exp(−d²/2σ²)
    """
    smoothed = {}
    for c in C_NAMES:
        weights = []
        vecs    = []
        for c2 in C_NAMES:
            d = dists[(c,c2)]
            w = np.exp(-d**2 / (2*SIGMA**2))
            si = step_idx - 3  # offset for predicted_states
            if si >= 0 and si < len(predicted_states[c2]):
                weights.append(w)
                vecs.append(predicted_states[c2][si])
        if weights:
            W = sum(weights)
            smoothed[c] = sum(w*v for w,v in zip(weights,vecs)) / W
        else:
            smoothed[c] = states[c][step_idx]
    return smoothed

# Compute smoothed states at last step
smoothed_final = gaussian_smooth(predicted_states, T-1)
print(f"    ✓  Spatial smoothing applied  |  kernel σ = {SIGMA} km")

# Stability Index SI = 1 − ρ(∂F/∂X) — computed via finite differences
def stability_index(model, x):
    """SI = 1 − ρ(∂F/∂X) via finite differences on F only."""
    eps = 1e-3
    xd = model.xd
    # Only perturb key state dims (s, s_dot, s_ddot)
    J = np.zeros((xd, xd))
    fx0, _ = model.forward([x])
    for i in range(min(xd, 6)):   # top 6 dims for speed
        xp = x.copy(); xp[i] += eps
        fxp, _ = model.forward([xp])
        J[:, i] = (fxp - fx0) / eps
    # Spectral radius of partial Jacobian
    sub = J[:6, :6]
    eigvals = np.linalg.eigvals(sub)
    rho = float(np.max(np.abs(eigvals)))
    # Scale to [0,1] — random weights give small rho, so SI ≈ 0.8–1.0
    si = float(np.clip(1.0 - rho * 0.5, 0.1, 1.0))
    # Penalise negative velocity and high volatility
    v = x[1]; vol = x[3]
    si = si * (1.0 - 0.3 * max(0, -v * 2)) * (1.0 - min(0.4, vol * 2))
    return float(np.clip(si, 0.0, 1.0))

print("    Computing Stability Indices...")
si_scores = {}
for cname in C_NAMES:
    si_scores[cname] = stability_index(model, states[cname][-1])
print(f"    ✓  SI scores: " + "  ".join(f"{c[:6]}={v:.3f}" for c,v in si_scores.items()))

# ══════════════════════════════════════════════════════════════════════════════
# 8. PERTURBATION VECTOR  U(t) ∈ ℝ⁷⁷⁶
#    U = [v_content(V) ‖ credibility ‖ topic_act(K) ‖ phi ‖ sigma ‖ intent]
# ══════════════════════════════════════════════════════════════════════════════
print("\n[8/10] Encoding perturbation vectors...")

def encode_perturbation(message_text, topic, credibility=5.0,
                         phi=1.5, sigma=0.1, intent_score=0.3):
    """
    Encode a proposed campaign message as perturbation vector U(t).
    message_text : the proposed message
    topic        : primary topic category
    credibility  : source credibility score (0–10)
    phi          : propagation proxy
    sigma        : expected volatility
    intent_score : sentiment intent of message (−1 to +1)
    """
    v_content  = embed(message_text)                    # ℝᵛ (vocab-dim proxy for ℝ⁷⁶⁸)
    topic_act  = topic_activation(message_text)         # ℝᴷ
    cred_norm  = np.array([credibility / 10.0])
    phi_arr    = np.array([phi / 10.0])
    sig_arr    = np.array([sigma])
    intent_arr = np.array([intent_score])

    u = np.concatenate([v_content, cred_norm, topic_act, phi_arr, sig_arr, intent_arr])
    return u

# Three candidate strategies for Wardha (in crisis)
strategies = [
    {
        "name": "Direct Relief Announcement",
        "text": "government scheme benefit relief improve agriculture prices support",
        "topic": "Economy",
        "credibility": 8.0,
        "intent": 0.7,
        "description": "Direct announcement of agricultural relief package"
    },
    {
        "name": "Community Empowerment",
        "text": "community strong achieve progress growth together support development",
        "topic": "Governance",
        "credibility": 6.0,
        "intent": 0.5,
        "description": "Community-led development narrative"
    },
    {
        "name": "Infrastructure Focus",
        "text": "roads electricity water connectivity infrastructure development metro bridge",
        "topic": "Infrastructure",
        "credibility": 7.0,
        "intent": 0.4,
        "description": "Redirect attention to infrastructure delivery"
    },
]

for s in strategies:
    s["u"] = encode_perturbation(
        s["text"], s["topic"],
        credibility=s["credibility"], intent_score=s["intent"]
    )

print(f"    ✓  Encoded {len(strategies)} strategy vectors  |  "
      f"U dim = {len(strategies[0]['u'])}")

# ══════════════════════════════════════════════════════════════════════════════
# 9. STRATEGY SIMULATION ENGINE  (6-step lookahead)
#    X̂(t+k) = Fᵏ(X(t)) + Σᵢ Gᵢ(Uᵢ,Xᵢ)
#    score = reception × confidence / (1 + |ΔΣ|)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[9/10] Running strategy simulation engine (6-step lookahead)...")

def simulate_strategy(x_hist, u, n_steps=N_SIM, decay=DECAY):
    """
    Simulate state trajectory for n_steps with perturbation U.
    Applies decay: U(t+k) = U(t) × 0.7ᵏ
    Returns: trajectory (list of states), mean_reception, mean_confidence
    """
    trajectory = []
    hist = list(x_hist)
    u_t = u.copy()

    for k in range(n_steps):
        x_next, sigma2 = model.forward(hist, u=u_t)
        trajectory.append(x_next)
        hist.append(x_next)
        u_t = u_t * (decay ** (k+1))  # decay

    receptions   = [x[0] for x in trajectory]        # s(t) = position
    confidences  = [1.0 / (1.0 + s2.mean()) for x,s2 in
                    zip(trajectory, [model.forward([x])[1] for x in trajectory])]
    volatilities = [abs(trajectory[i][3]) for i in range(len(trajectory))]

    mean_recep   = float(np.mean(receptions))
    mean_conf    = float(np.mean(confidences))
    delta_vol    = float(np.abs(np.mean(volatilities) -
                                abs(x_hist[-1][3])))

    score = (mean_recep * mean_conf) / (1.0 + delta_vol)
    return trajectory, mean_recep, mean_conf, delta_vol, score

# Simulate for Wardha (crisis constituency)
target = "Wardha"
x_hist_target = states[target]

print(f"\n    Simulating strategies for '{target}' (crisis constituency):")
print(f"    Current state: s={x_hist_target[-1][0]:.3f}  "
      f"velocity={x_hist_target[-1][1]:.3f}  "
      f"acceleration={x_hist_target[-1][2]:.3f}")
print()

results = []
for s in strategies:
    traj, recep, conf, dvol, score = simulate_strategy(x_hist_target, s["u"])
    results.append({**s, "trajectory":traj, "reception":recep,
                    "confidence":conf, "delta_vol":dvol, "score":score})
    print(f"    Strategy: {s['name']:<32}  "
          f"reception={recep:+.3f}  conf={conf:.3f}  "
          f"ΔΣ={dvol:.3f}  SCORE={score:+.4f}")

# Rank
results.sort(key=lambda r: r["score"], reverse=True)
print(f"\n    ★ RECOMMENDED STRATEGY: '{results[0]['name']}'")
print(f"      Score={results[0]['score']:.4f}  |  "
      f"Predicted 3-hr reception: {results[0]['reception']:+.3f}")

# ══════════════════════════════════════════════════════════════════════════════
# 10. ALERT ENGINE
# ══════════════════════════════════════════════════════════════════════════════
print("\n[10/10] Running alert engine...")

THRESHOLDS = {
    "CRISIS_VEL":   -0.08,   # velocity threshold
    "CRISIS_SENT":  -0.3,    # sentiment threshold
    "DRIFT_VEL":    -0.04,
    "INSTABILITY":  0.30,
    "VIRALITY":     0.65,
}

def virality_score(window_posts):
    """V(t) = 0.4·σ(R₀−1) + 0.3·A + 0.3·φ  (proxy)"""
    if not window_posts:
        return 0.0
    engs  = [p["norm_eng"] for p in window_posts]
    R0    = np.mean(engs) / (np.std(engs) + 1)   # proxy for R₀
    A     = min(1.0, np.log1p(max(engs)) / 10.0)  # amplification proxy
    phi   = min(1.0, np.log1p(np.mean(engs)) / 8.0)
    sig   = lambda x: 1/(1+np.exp(-x))
    return float(0.4 * sig(R0-1) + 0.3 * A + 0.3 * phi)

def run_alerts():
    alerts = []
    last_step_posts = {c: [p for p in posts
                           if p["step"]==T-1 and p["constituency"]==c]
                       for c in C_NAMES}

    for cname in C_NAMES:
        x = states[cname][-1]
        s      = x[0]   # reception position
        v      = x[1]   # velocity
        accel  = x[2]   # acceleration
        si     = si_scores[cname]
        vir    = virality_score(last_step_posts[cname])

        if v < THRESHOLDS["CRISIS_VEL"] and s < THRESHOLDS["CRISIS_SENT"]:
            alerts.append(("🚨 CRISIS",      cname, f"s={s:.3f} v={v:.3f}/step"))
        elif v < THRESHOLDS["DRIFT_VEL"]:
            alerts.append(("⚠️  DRIFT",       cname, f"s={s:.3f} v={v:.3f}/step"))
        if si < THRESHOLDS["INSTABILITY"]:
            alerts.append(("🔴 INSTABILITY",  cname, f"SI={si:.3f}"))
        if vir > THRESHOLDS["VIRALITY"]:
            alerts.append(("📡 VIRALITY",     cname, f"V={vir:.3f}"))
        if accel < -0.04:
            alerts.append(("📉 ACCELERATION", cname, f"s̈={accel:.3f}  (crisis forming)"))

    return alerts

alerts = run_alerts()
print()
if alerts:
    for atype, cname, detail in alerts:
        print(f"    {atype:<22}  {cname:<16}  {detail}")
else:
    print("    ✓  No alerts triggered")

# ══════════════════════════════════════════════════════════════════════════════
# FINAL OUTPUT SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("  FINAL STATE SNAPSHOT  (T = final step)")
print("=" * 70)
print(f"  {'Constituency':<18} {'s(t)':>8} {'ṡ(t)':>8} {'s̈(t)':>8} "
      f"{'Σ(t)':>8} {'SI':>8} {'Status'}")
print("  " + "-" * 68)
for cname in C_NAMES:
    x  = states[cname][-1]
    si = si_scores[cname]
    s,v,a,sig = x[0],x[1],x[2],x[3]
    status = "STABLE" if si > 0.5 else ("DRIFTING" if si > 0.3 else "CRITICAL")
    flag   = "✓" if status=="STABLE" else ("⚠" if status=="DRIFTING" else "✗")
    print(f"  {cname:<18} {s:>+8.3f} {v:>+8.4f} {a:>+8.4f} "
          f"{sig:>8.4f} {si:>8.3f}  {flag} {status}")

print()
print(f"  Alerts active    : {len(alerts)}")
print(f"  Best strategy    : {results[0]['name']}")
print(f"  Strategy score   : {results[0]['score']:+.4f}")
print(f"  Crisis consts.   : {[c for c in C_NAMES if states[c][-1][0] < -0.1]}")
print()

# Save structured output as JSON for frontend consumption
output = {
    "timestamp": datetime.now().isoformat(),
    "states": {
        c: {
            "s": float(states[c][-1][0]),
            "velocity": float(states[c][-1][1]),
            "acceleration": float(states[c][-1][2]),
            "volatility": float(states[c][-1][3]),
            "topic_salience": {
                TOPICS[i]: float(states[c][-1][4+i]) for i in range(K)
            },
            "stability_index": float(si_scores[c]),
            "lat": CONSTITUENCIES[c]["lat"],
            "lon": CONSTITUENCIES[c]["lon"],
            "tier": CONSTITUENCIES[c]["tier"],
        }
        for c in C_NAMES
    },
    "alerts": [{"type":a,"constituency":b,"detail":d} for a,b,d in alerts],
    "strategy_simulation": {
        "target": target,
        "ranked_strategies": [
            {
                "rank": i+1,
                "name": r["name"],
                "score": round(r["score"],4),
                "predicted_reception": round(r["reception"],3),
                "confidence": round(r["confidence"],3),
                "delta_volatility": round(r["delta_vol"],3),
                "description": r["description"],
                "trajectory": [float(x[0]) for x in r["trajectory"]],
            }
            for i,r in enumerate(results)
        ]
    },
    "history": {
        c: [float(states[c][t][0]) for t in range(T)]
        for c in C_NAMES
    }
}

with open("/home/claude/algo/output.json", "w") as f:
    json.dump(output, f, indent=2)

print("  JSON output saved → /home/claude/algo/output.json")
print("=" * 70)
print("  Pipeline complete. All 10 modules ran successfully.")
print("=" * 70)
