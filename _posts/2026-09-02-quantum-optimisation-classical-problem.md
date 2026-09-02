---
layout: default
title: "Why Quantum Optimisation Begins with the Classical Problem"
author: "Sanjana M"
categories: [Quantum Computing, Optimisation]
description: "Before choosing a quantum algorithm, we need to understand the decision problem, its constraints, and the classical methods it must compete with."
permalink: /quantum-optimisation-classical-problem/
---

<script>
window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] } };
</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<style>
  .qo-note { --ink:#172331; --blue:#24547e; --orange:#ca7838; --line:#d5dbe1; color:var(--ink); font-size:17px; line-height:1.78; }
  .qo-note h1 { font-size:clamp(2.35rem,6vw,4.4rem); line-height:1; letter-spacing:-.045em; margin-bottom:1.2rem; }
  .qo-note h2 { margin-top:3.1rem; font-size:2rem; letter-spacing:-.025em; }
  .qo-note h3 { margin-top:2rem; }
  .qo-note table { display:block; overflow-x:auto; width:100%; border-collapse:collapse; font-size:.9rem; }
  .qo-note th { background:var(--blue); color:white; text-align:left; }
  .qo-note th,.qo-note td { padding:.7rem .8rem; border:1px solid #cfd6dc; }
  .qo-note blockquote { margin:2rem 0; padding:1rem 1.3rem; background:#eef3f6; border-left:6px solid var(--orange); }
  .qo-note pre { padding:1.2rem; overflow-x:auto; background:#162432; color:#e5edf4; font-size:14px; line-height:1.65; }
  .qo-note code { font-size:.9em; }
  .qo-note mjx-container[display="true"] { overflow-x:auto; overflow-y:hidden; padding:.6rem 0; }
</style>

<div class="qo-note" markdown="1">

# Why Quantum Optimisation Begins with the Classical Problem

Quantum optimisation is usually introduced from the wrong end. We are shown a quantum circuit, told that it represents an optimisation problem, and then presented with a bitstring that supposedly solves it. The circuit may be correct. The bitstring may even be optimal. But the most important part of the work has already been hidden: deciding what the problem actually is.

An optimisation problem is not made quantum by replacing ordinary bits with qubits. It begins as a decision problem. We have a set of choices, a rule for deciding which choices are permitted, and a way to compare one permitted choice with another. Only after those pieces are written carefully can we ask whether a quantum algorithm offers a useful way to search the resulting space.

This order matters in finance. A portfolio that has high expected return but violates its budget is not a portfolio. A bond allocation that matches duration but cannot be traded at the quoted prices is not implementable. A model that selects the right assets using tomorrow's returns has not solved an investment problem; it has used information that was unavailable at the time of the decision. Quantum computation does not repair any of these mistakes. It only solves—or approximately solves—the mathematical problem we give it.

The first task in quantum optimisation is therefore not circuit design. It is formulation.

## 1. The basic object: a decision problem

Write a general optimisation problem as

$$
\min_{x\in\mathcal{X}} f(x).
$$

There are three separate objects here:

1. $x$ is the decision variable. It records the choices under our control.
2. $\mathcal{X}$ is the feasible set. It contains the decisions that satisfy all hard requirements.
3. $f(x)$ is the objective function. It assigns a numerical value to every feasible decision.

The notation is compact, but each part requires judgement.

Suppose a fund wants to choose three bonds from a set of ten. We could define

$$
x_i=
\begin{cases}
1, & \text{if bond }i\text{ is selected},\\
0, & \text{otherwise}.
\end{cases}
$$

The decision vector is $x=(x_1,\ldots,x_{10})\in\{0,1\}^{10}$. The requirement to select exactly three bonds becomes

$$
\sum_{i=1}^{10}x_i=3.
$$

This equality is part of the feasible set. It does not tell us which three bonds are desirable. For that, we need an objective: perhaps tracking error, credit risk, expected return, liquidity cost, or a weighted combination of several quantities.

These are not interchangeable formulations. Minimising tracking error asks for a portfolio that behaves like a benchmark. Maximising expected return asks for a portfolio with the largest forecast payoff. Penalising illiquidity asks for a portfolio that is easier to trade. Before discussing QAOA, annealing, or any other solver, we need to know which economic question is being answered.

## 2. Variables are modelling choices

The choice of variable determines what the model is capable of expressing.

### 2.1 Continuous variables

In a standard long-only portfolio model, $w_i$ may denote the fraction of capital invested in asset $i$:

$$
w_i\geq 0,
\qquad
\sum_{i=1}^n w_i=1.
$$

The weights are continuous. An asset can receive $3.2\%$ of the portfolio or $7.85\%$. If the objective is convex and the constraints are linear or convex, this problem may be solved efficiently by mature classical methods. Converting it into a binary problem merely because a quantum algorithm expects binary variables can make the formulation larger and less natural.

### 2.2 Binary variables

Binary variables describe yes-or-no choices:

$$
x_i\in\{0,1\}.
$$

They are appropriate when we ask whether an asset is included, whether a trade is executed, whether a facility is opened, or whether an order is assigned to a venue.

### 2.3 Integer variables

An integer variable may represent the number of lots purchased:

$$
q_i\in\{0,1,2,\ldots\}.
$$

If a quantum formulation accepts only binary variables, $q_i$ must be encoded using several bits. With a binary expansion,

$$
q_i=\sum_{k=0}^{m-1}2^k x_{ik}.
$$

An integer bounded by $2^m-1$ therefore requires $m$ binary variables. The number of qubits grows with the number of encoded bits, not simply with the number of financial assets. This is one reason that a claim such as “the model contains 50 assets” says very little about the size of the quantum problem.

## 3. Objective functions are compressed economic arguments

Consider the mean–variance objective

$$
\min_w \; \lambda w^\top\Sigma w-\mu^\top w.
$$

Here $\mu$ is a vector of expected returns, $\Sigma$ is a covariance matrix, and $\lambda>0$ controls the weight given to variance. This equation is sometimes presented as if it were a neutral mathematical description of investing. It is not. It contains several assumptions:

- Expected return is represented by $\mu$.
- Risk is represented by return variance.
- Pairwise covariance is sufficient to describe portfolio risk.
- A single parameter $\lambda$ can represent the investor's risk preference.
- The estimates of $\mu$ and $\Sigma$ are informative enough to use.

The optimiser can solve the expression we provide, but it cannot decide whether these assumptions are appropriate. In practice, estimation error in $\mu$ can matter more than the numerical error of the solver. A quantum algorithm that finds the exact optimum of a poorly estimated objective may produce a worse investment than a classical heuristic applied to a more robust model.

This distinction is important:

$$
\text{optimisation error}\neq\text{model error}\neq\text{estimation error}.
$$

Optimisation error is the gap between the returned solution and the true optimum of the stated mathematical problem. Model error arises because the mathematical problem is an imperfect representation of the economic decision. Estimation error arises because quantities such as expected return and covariance are not known and must be inferred from data.

Quantum optimisation normally addresses only the first of these.

## 4. Constraints: hard, soft, and accidentally ignored

A hard constraint defines feasibility. If a portfolio must contain exactly $K$ assets, then

$$
\sum_i x_i=K

$$

is not a preference. A solution with $K+1$ assets is invalid even if its risk-return score is attractive.

A soft constraint expresses a preference that may be violated at a cost. For example, the manager may prefer turnover below a target but accept higher turnover when the expected benefit is large. One representation is

$$
f(x)+\tau\max\{0,T(x)-T_{\max}\},
$$

where $T(x)$ measures turnover.

The boundary between hard and soft constraints is an economic decision. Regulatory capital limits, accounting identities, and physical balance conditions are usually hard. Style preferences and trading targets may be soft. Treating a hard condition as a small penalty can produce infeasible solutions. Treating every preference as hard can remove useful flexibility.

### 4.1 Turning a constraint into a penalty

Binary quantum optimisation often absorbs constraints into the objective. The equality

$$
\sum_i x_i=K

$$

can be imposed through

$$
P(x)=A\left(\sum_i x_i-K\right)^2,
$$

where $A>0$ is a penalty coefficient. The unconstrained problem becomes

$$
\min_{x\in\{0,1\}^n} f(x)+A\left(\sum_i x_i-K\right)^2.
$$

Because $x_i^2=x_i$ for binary variables,

$$
\left(\sum_i x_i-K\right)^2
=
\sum_i x_i+2\sum_{i<j}x_ix_j-2K\sum_i x_i+K^2.
$$

The penalty is therefore quadratic and can enter a QUBO directly.

But $A$ is not a harmless technical constant. If it is too small, an infeasible solution may have lower penalised cost than every feasible solution. If it is unnecessarily large, it can dominate the original objective, widen coefficient ranges, and make parameter optimisation and hardware execution more difficult. Penalty selection is part of the model.

An alternative is to design the quantum dynamics so that the state never leaves the feasible subspace. This requires a feasible initial state and a constraint-preserving mixer. It can remove the need for a large penalty, but it also produces a more specialised circuit. We will return to this distinction later in the series.

## 5. From a general problem to a QUBO

Many gate-model quantum optimisation workflows begin with a quadratic unconstrained binary optimisation problem:

$$
\min_{x\in\{0,1\}^n} C(x),
\qquad
C(x)=c+\sum_i a_i x_i+\sum_{i<j}b_{ij}x_ix_j.
$$

Equivalently,

$$
C(x)=x^\top Qx+c,
$$

after choosing a convention for storing linear and pairwise coefficients in $Q$.

“Quadratic” means that the objective contains individual terms $x_i$ and pairwise interactions $x_ix_j$, but no cubic term such as $x_ix_jx_k$. “Unconstrained” does not mean that the original decision had no constraints. It often means that the constraints have been incorporated through penalties. “Binary” describes the domain of each decision variable.

The QUBO form is useful because pairwise binary interactions map naturally to one- and two-qubit Pauli-$Z$ operators. That mapping is the subject of the next article. For now, the important point is that obtaining a QUBO is a modelling exercise, not an automatic change of notation.

## 6. A small example: selecting two assets

Suppose we must select exactly two of four assets. Let $x_i=1$ when asset $i$ is selected. Consider the simplified objective

$$
C_0(x)=\lambda x^\top\Sigma x-\mu^\top x.
$$

Take

$$
\mu=
\begin{bmatrix}
0.08\\0.06\\0.07\\0.05
\end{bmatrix},
\qquad
\Sigma=
\begin{bmatrix}
0.040&0.006&0.012&0.004\\
0.006&0.025&0.008&0.003\\
0.012&0.008&0.036&0.005\\
0.004&0.003&0.005&0.016
\end{bmatrix}.
$$

This is a selection model, not yet a conventional fully invested portfolio model. Every selected asset effectively receives the same unit exposure in the objective. That simplification is acceptable for studying the optimisation machinery, but it must be stated.

Add the cardinality penalty:

$$
C(x)=\lambda x^\top\Sigma x-\mu^\top x
+A\left(\sum_{i=1}^4x_i-2\right)^2.
$$

Since there are only $2^4=16$ bitstrings, we can enumerate the entire space.

```python
from itertools import product
import numpy as np

mu = np.array([0.08, 0.06, 0.07, 0.05])
sigma = np.array([
    [0.040, 0.006, 0.012, 0.004],
    [0.006, 0.025, 0.008, 0.003],
    [0.012, 0.008, 0.036, 0.005],
    [0.004, 0.003, 0.005, 0.016],
])

risk_aversion = 1.0
penalty = 1.0
target_assets = 2

def base_objective(x):
    return risk_aversion * x @ sigma @ x - mu @ x

def penalised_objective(x):
    violation = x.sum() - target_assets
    return base_objective(x) + penalty * violation**2

rows = []
for bits in product([0, 1], repeat=len(mu)):
    x = np.asarray(bits, dtype=float)
    rows.append({
        "bitstring": "".join(map(str, bits)),
        "selected": int(x.sum()),
        "base_cost": base_objective(x),
        "penalised_cost": penalised_objective(x),
        "feasible": bool(x.sum() == target_assets),
    })

for row in sorted(rows, key=lambda r: r["penalised_cost"]):
    print(row)
```

This elementary calculation should not be skipped. It tells us:

- whether the signs in the objective are correct;
- whether the constraint has been encoded correctly;
- whether the chosen penalty makes infeasible solutions unattractive;
- what the exact optimum is for a small instance;
- how close any approximate method comes to that optimum.

If a quantum result disagrees with this table, the first response should not be to interpret the quantum output. It should be to check the formulation, bit ordering, sign convention, and code.

## 7. Complexity does not begin and end with “NP-hard”

Binary portfolio selection with realistic constraints can be computationally difficult. It is tempting to move directly from that statement to “therefore quantum computing is useful.” The conclusion does not follow.

Worst-case complexity describes how resource requirements grow for the hardest instances as problem size increases. A problem class may be NP-hard while many economically relevant instances remain easy for modern classical solvers. Structure matters: sparsity, coefficient distribution, constraint tightness, graph topology, and the quality of relaxations can all change practical difficulty.

The correct comparison is not

$$
\text{QAOA versus exhaustive enumeration}.
$$

It is closer to

$$
\text{complete quantum workflow versus the strongest appropriate classical workflow}
$$

under comparable accuracy, time, and resource conditions.

For a QUBO, classical baselines may include:

- exact enumeration for small instances;
- mixed-integer quadratic programming;
- branch-and-bound or branch-and-cut;
- convex or semidefinite relaxations followed by rounding;
- simulated annealing;
- tabu search;
- greedy construction and local improvement;
- problem-specific heuristics.

The strongest baseline will depend on the problem. A generic quantum heuristic should not be credited with an advantage because it beats a deliberately weak classical method.

## 8. What exactly should be benchmarked?

The phrase “QAOA found the optimal solution” is incomplete. We need to know how often, at what cost, and relative to what.

### 8.1 Objective gap

For minimisation, define

$$
\Delta=C(x_{\text{alg}})-C(x^*),
$$

where $x^*$ is an exact optimum. A relative gap may be useful when objective scales differ, although care is required when $C(x^*)$ is zero or negative.

### 8.2 Feasibility rate

If samples can violate constraints,

$$
r_{\mathrm{feas}}=
\frac{\text{number of feasible samples}}
{\text{total number of samples}}.
$$

A low expected penalised energy can conceal a distribution that wastes most measurements on infeasible strings.

### 8.3 Success probability

If $\mathcal{X}^*$ is the set of optimal bitstrings,

$$
p_{\mathrm{opt}}=\sum_{x\in\mathcal{X}^*}p(x).
$$

This is different from reporting the best string observed after many shots. Given enough repeated samples, even a small $p_{\mathrm{opt}}$ may eventually produce the optimum. The sampling cost required to do so must be counted.

### 8.4 Time to solution

If a single independent run succeeds with probability $p_s$, the number of runs needed to achieve target confidence $1-\delta$ is

$$
R=
\frac{\log\delta}{\log(1-p_s)}.
$$

Time to solution should include repeated circuit execution, parameter optimisation, compilation, queue or communication overhead where relevant, and classical post-processing. Solver time alone is only one part of the workflow.

### 8.5 Financial performance

For a portfolio application, optimisation metrics are necessary but insufficient. We also need out-of-sample quantities such as realised return, volatility, drawdown, turnover, transaction cost, and constraint stability. A small in-sample objective improvement may disappear after estimation error and trading costs are included.

## 9. A useful separation of questions

A careful project asks three questions in order.

First, is the economic formulation meaningful? This concerns the objective, data, constraints, and decision timing.

Second, is the computational instance genuinely difficult for strong classical methods? This requires classical benchmarking rather than an assertion based on the problem label.

Third, does the quantum method improve some relevant frontier—solution quality, time, energy use, scaling, or another measurable resource—after the full workflow is counted?

These questions should not be collapsed. A financially useful model may not require quantum computation. A computationally difficult QUBO may have little financial meaning. A quantum circuit may be scientifically interesting even when it does not yet outperform classical methods. Each can be a valid research result, provided the claim matches the evidence.

## 10. Where the quantum part actually begins

Once the variables, objective, constraints, and baselines are clear, the quantum question becomes precise. We have a cost function

$$
C:\{0,1\}^n\rightarrow\mathbb{R}
$$

and want a quantum operator whose eigenvalue on each computational-basis state $|x\rangle$ equals $C(x)$:

$$
H_C|x\rangle=C(x)|x\rangle.
$$

This is the bridge from optimisation to quantum mechanics. The cost function becomes a diagonal Hamiltonian. Its low-energy eigenstates encode low-cost decisions. A variational algorithm such as QAOA then tries to prepare a state that places substantial probability on those decisions.

Nothing in this construction changes what the decision means. The Hamiltonian inherits every strength and weakness of the formulation. That is precisely why quantum optimisation begins with the classical problem.

## References

1. E. Farhi, J. Goldstone and S. Gutmann, [“A Quantum Approximate Optimization Algorithm”](https://arxiv.org/abs/1411.4028), 2014.
2. S. Hadfield et al., [“From the Quantum Approximate Optimization Algorithm to a Quantum Alternating Operator Ansatz”](https://arxiv.org/abs/1709.03489), 2019.
3. D. J. Egger, J. Mareček and S. Woerner, [“Warm-starting quantum optimization”](https://quantum-journal.org/papers/q-2021-06-17-479/), *Quantum*, 2021.
4. IBM Quantum, [“Quantum approximate optimization algorithm”](https://quantum.cloud.ibm.com/docs/en/tutorials/quantum-approximate-optimization-algorithm).

</div>
