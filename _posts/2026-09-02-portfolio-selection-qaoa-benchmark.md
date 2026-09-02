---
layout: default
title: "Portfolio Selection with QAOA: A Benchmark, Not a Demonstration"
author: "Sanjana M"
categories: [Quantum Finance, QAOA, Portfolio Optimisation]
description: "A research design for cardinality-constrained portfolio selection that evaluates the model, the encoding, and the quantum workflow separately."
permalink: /portfolio-selection-qaoa-benchmark/
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

# Portfolio Selection with QAOA: A Benchmark, Not a Demonstration

Portfolio selection is probably the most common example in quantum finance. It is easy to see why. Returns provide a linear reward, covariance provides quadratic interactions, and investment rules provide constraints. The result can be written as a QUBO and mapped to an Ising Hamiltonian with little friction.

That clean mapping has also produced a weak experimental pattern. A handful of assets are passed to QAOA, the returned bitstring is translated into company names, and the exercise is described as quantum portfolio optimisation. The circuit may demonstrate that an encoding runs. It does not establish that the portfolio model is useful, that the quantum method is competitive, or that anything has been learned about scaling.

The more interesting project is a benchmark. We should ask where performance comes from, where it fails, and how the answer changes when the financial and computational assumptions are varied.

## 1. Begin with the investment decision

Suppose an investor must select exactly $K$ assets from a universe of $n$. Define

$$
x_i=
\begin{cases}
1,&\text{if asset }i\text{ is selected},\\
0,&\text{otherwise}.
\end{cases}
$$

A simple cardinality-constrained objective is

$$
\min_{x\in\{0,1\}^n}
\lambda x^\top\Sigma x-\mu^\top x
$$

subject to

$$
\sum_{i=1}^n x_i=K.
$$

Here $\mu$ is an expected-return vector, $\Sigma$ is a covariance matrix, and $\lambda$ controls risk aversion.

This is not yet a fully specified portfolio. The binary variable selects assets, but it does not determine continuous capital weights. If every selected asset receives equal weight, the implemented portfolio has

$$
w_i=\frac{x_i}{K}.
$$

Then the economically scaled mean–variance objective is

$$
\lambda\frac{1}{K^2}x^\top\Sigma x
-\frac{1}{K}\mu^\top x.
$$

The scaling factors can be absorbed into $\lambda$ and the coefficients, but they should not be ignored when interpreting risk and return. The model is best described as **equal-weight subset selection**, not general portfolio optimisation.

That distinction gives us a clean first research question:

> Can QAOA identify a high-quality equal-weight subset under a cardinality constraint, and how does its performance compare with exact and heuristic classical methods as the problem structure changes?

## 2. What data enter the problem?

The optimiser receives estimates, not population quantities.

Let $r_t\in\mathbb{R}^n$ be the vector of asset returns at time $t$. A sample mean is

$$
\hat\mu=\frac{1}{T}\sum_{t=1}^T r_t,
$$

and the sample covariance is

$$
\hat\Sigma=
\frac{1}{T-1}
\sum_{t=1}^T(r_t-\hat\mu)(r_t-\hat\mu)^\top.
$$

Expected returns are difficult to estimate. If daily or monthly sample means are inserted directly into a small experiment, minor changes in the estimation window can change the selected assets. Covariance estimates can also be unstable when $n$ is large relative to $T$.

A credible study should therefore separate two experiments.

### 2.1 Synthetic optimisation benchmark

Generate controlled $\mu$ and $\Sigma$ so that instance size, correlation, sparsity, and condition number can be varied deliberately. This experiment studies the optimiser.

### 2.2 Historical financial experiment

Estimate parameters using only information available before each rebalance date, select the portfolio, and evaluate it on future returns. This experiment studies the complete investment procedure.

The synthetic benchmark gives experimental control. The historical backtest gives economic meaning. Neither replaces the other.

## 3. From the portfolio model to a QUBO

Convert the cardinality constraint into a penalty:

$$
C(x)=
\lambda x^\top\Sigma x-\mu^\top x
+A\left(\sum_i x_i-K\right)^2.
$$

Expand the penalty:

$$
A\left[
(1-2K)\sum_i x_i
+2\sum_{i<j}x_ix_j
+K^2
\right].
$$

If $\Sigma$ is symmetric,

$$
x^\top\Sigma x
=\sum_i\Sigma_{ii}x_i
+2\sum_{i<j}\Sigma_{ij}x_ix_j,
$$

because $x_i^2=x_i$. Therefore the polynomial coefficients are

$$
a_i=\lambda\Sigma_{ii}-\mu_i+A(1-2K),
$$

and

$$
b_{ij}=2\lambda\Sigma_{ij}+2A.
$$

The constant is $AK^2$. These coefficients can then be mapped to

$$
H_C=\alpha I+\sum_i h_iZ_i+\sum_{i<j}J_{ij}Z_iZ_j.
$$

The penalty creates an all-to-all interaction: every pair receives the additional coefficient $2A$. Even if the covariance matrix is sparse, a global cardinality penalty makes the QUBO dense. On hardware with limited connectivity, implementing these dense interactions can substantially increase routing and circuit depth.

This is a concrete example of a modelling decision becoming a hardware cost.

## 4. Penalty QAOA versus a feasible-subspace formulation

There are two natural approaches.

### 4.1 Penalty formulation

Use the standard initial state $|+\rangle^{\otimes n}$, the penalised cost Hamiltonian, and the transverse-field mixer

$$
H_B=\sum_iX_i.
$$

Advantages:

- simple implementation;
- compatible with standard QAOA software;
- every bitstring is available to the circuit.

Costs:

- most basis states may be infeasible when $K$ is far from $n/2$;
- the circuit spends probability outside the feasible subspace;
- the penalty adds dense couplings;
- performance depends on $A$.

The fraction of all bitstrings that are feasible is

$$
\frac{\binom{n}{K}}{2^n}.
$$

For fixed small $K$ and increasing $n$, this fraction becomes very small. A uniform initial state may therefore place little total probability on valid portfolios.

### 4.2 Constraint-preserving formulation

Prepare an initial state with Hamming weight $K$, such as a Dicke state or a known feasible portfolio, and use a mixer that preserves Hamming weight. An $XY$ mixer can exchange excitations without changing their number:

$$
H_{XY}=\sum_{(i,j)\in E_M}(X_iX_j+Y_iY_j).
$$

The state remains within

$$
\mathcal{H}_K=
\operatorname{span}\{|x\rangle:\sum_ix_i=K\}.
$$

The search space dimension falls from $2^n$ to $\binom{n}{K}$. The penalty can be removed from the cost Hamiltonian. However, initial-state preparation and mixer implementation are more involved, and the mixer graph $E_M$ must connect the feasible subspace.

Comparing these two approaches is already a meaningful research project.

## 5. The classical baselines

A benchmark should form a ladder rather than choose one convenient comparator.

### 5.1 Exhaustive enumeration

For small $n$, enumerate all $\binom{n}{K}$ feasible portfolios. This gives the exact optimum and the entire feasible objective distribution.

```python
from itertools import combinations
import numpy as np

def exact_cardinality_solution(mu, sigma, k, risk_aversion):
    n = len(mu)
    best_x = None
    best_value = np.inf

    for selected in combinations(range(n), k):
        x = np.zeros(n)
        x[list(selected)] = 1
        value = risk_aversion * x @ sigma @ x - mu @ x
        if value < best_value:
            best_x = x.copy()
            best_value = value

    return best_x, best_value
```

Enumeration is not a scalable competitor, but it is the ground truth required to evaluate small-instance heuristics.

### 5.2 Greedy construction

A simple baseline adds the asset that produces the largest marginal improvement until $K$ assets are selected. It is fast and intentionally limited, but still useful as a lower rung.

### 5.3 Local search

Start from a feasible portfolio and swap one selected asset with one unselected asset whenever the swap improves the objective. Repeat until no improving swap remains. Multi-start local search can be surprisingly strong for structured portfolio instances.

### 5.4 Mixed-integer quadratic optimisation

Use a mature MIQP solver with the cardinality constraint represented directly. Record both the best incumbent and the solver's optimality gap under a fixed time limit. This is a far more serious comparator than brute force alone.

### 5.5 Simulated annealing or another QUBO heuristic

This compares QAOA with a classical stochastic method operating on a similar unconstrained penalised objective. Give both methods a defensible evaluation budget.

### 5.6 Continuous relaxation

Relax $x_i\in\{0,1\}$ to $x_i\in[0,1]$, solve the continuous problem, and round or use the result as a warm start. The relaxation also supplies a lower bound for a minimisation problem when formulated appropriately.

No single baseline answers every question. Exact methods establish correctness, heuristics test practical solution quality, and relaxations reveal exploitable structure.

## 6. Building the model with Qiskit Optimization

The following code uses a `QuadraticProgram` to express the binary model. API details can change across Qiskit releases, so the environment should be recorded with the experiment.

```python
import numpy as np
from qiskit_optimization import QuadraticProgram

def build_portfolio_problem(mu, sigma, k, risk_aversion=1.0):
    n = len(mu)
    qp = QuadraticProgram("cardinality_portfolio")

    for i in range(n):
        qp.binary_var(name=f"x_{i}")

    linear = {
        f"x_{i}": float(-mu[i])
        for i in range(n)
    }

    # QuadraticProgram accepts a full quadratic coefficient matrix.
    quadratic = risk_aversion * np.asarray(sigma, dtype=float)

    qp.minimize(linear=linear, quadratic=quadratic)
    qp.linear_constraint(
        linear={f"x_{i}": 1 for i in range(n)},
        sense="==",
        rhs=k,
        name="cardinality",
    )
    return qp
```

Convert the constraint to a penalty-based QUBO:

```python
from qiskit_optimization.converters import QuadraticProgramToQubo

qp = build_portfolio_problem(mu, sigma, k=3, risk_aversion=1.0)

converter = QuadraticProgramToQubo(penalty=10.0)
qubo = converter.convert(qp)

ising_operator, offset = qubo.to_ising()
print(ising_operator)
print("offset:", offset)
```

Do not treat the conversion as verification. For a small instance, compare the energy of every basis state with the original objective and constraint penalty. Also inspect the converter's coefficient convention before comparing it with a hand-derived matrix.

## 7. Running QAOA through the high-level interface

A noiseless sampler is appropriate for the first controlled test.

```python
from qiskit.primitives import StatevectorSampler
from qiskit_algorithms import QAOA
from qiskit_algorithms.optimizers import COBYLA
from qiskit_optimization.algorithms import MinimumEigenOptimizer

sampler = StatevectorSampler(seed=123)
optimizer = COBYLA(maxiter=500)

qaoa_mes = QAOA(
    sampler=sampler,
    optimizer=optimizer,
    reps=1,
    initial_point=[0.2, 0.8],
)

qaoa_optimizer = MinimumEigenOptimizer(qaoa_mes)
result = qaoa_optimizer.solve(qubo)

print(result.prettyprint())
```

The result should be passed through the converter if we want the interpretation in terms of the original constrained problem:

```python
interpreted = converter.interpret(result)
print(interpreted.prettyprint())
```

For research, the convenience output is not enough. Retain the sampled distribution, optimiser history, number of function evaluations, final expectation value, feasible mass, and probability assigned to exact optima.

## 8. A benchmark design

The experiment should vary one source of difficulty at a time.

### 8.1 Instance size

Use a sequence such as

$$
n\in\{6,8,10,12,16,20\},
$$

within the limits of exact simulation and the selected classical solvers. Do not imply asymptotic scaling from two or three tiny instances.

### 8.2 Cardinality

Compare sparse selection, balanced selection, and dense selection—for example $K=2$, $K\approx n/2$, and $K=n-2$. The feasible fraction $\binom{n}{K}/2^n$ changes sharply across these regimes.

### 8.3 Correlation structure

Generate covariance matrices representing:

- nearly independent assets;
- block-correlated sectors;
- a one-factor market structure;
- highly correlated assets;
- ill-conditioned covariance estimates.

These structures change the QUBO interaction graph and the difficulty of distinguishing portfolios.

### 8.4 Risk aversion

Vary $\lambda$. At low $\lambda$, the linear expected-return terms dominate. At high $\lambda$, covariance interactions dominate. The relative scale changes the Ising fields, couplings, and parameter landscape.

### 8.5 Penalty coefficient

Sweep $A$ over a theoretically and empirically motivated range. Report feasibility and objective quality separately. The best $A$ should not be chosen retrospectively on the test instances without disclosure.

### 8.6 QAOA depth and optimiser

Vary $p$, initialisation, optimiser, and restart count. Hold the total evaluation budget fixed in one experiment, then allow convergence in another. These answer different questions: performance under equal resources and best achievable performance under the chosen workflow.

### 8.7 Noise and compilation

Move in stages:

1. Exact statevector expectation.
2. Finite-shot noiseless sampling.
3. Noisy simulation using a stated device model.
4. Hardware execution after transpilation.

Record two-qubit gate count, depth, and layout. Dense portfolio QUBOs may look modest before compilation and expensive afterward.

## 9. Metrics that reveal different failures

### 9.1 Optimality gap

For the unpenalised objective $C_0$ and a feasible returned solution $x$,

$$
\Delta(x)=C_0(x)-C_0(x^*).
$$

Use the original financial objective, not only the penalised QUBO energy.

### 9.2 Feasible probability mass

$$
P_{\mathrm{feas}}
=\sum_{x:\sum_i x_i=K}p(x).
$$

This is more informative than the feasibility of the single best observed string.

### 9.3 Optimal-solution probability

$$
P_{\mathrm{opt}}
=\sum_{x\in\mathcal{X}^*}p(x).
$$

Include all degenerate optima.

### 9.4 Approximation relative to the feasible range

If $C_{\min}$ and $C_{\max}$ are the best and worst feasible costs, define

$$
q(x)=
\frac{C_{\max}-C(x)}{C_{\max}-C_{\min}}.
$$

Then $q=1$ is optimal and $q=0$ is the worst feasible value. This normalisation remains interpretable when costs are negative.

### 9.5 Rank quality

Where does the sampled solution sit among all feasible portfolios? A solution in the best $1\%$ may be useful even when it is not exactly optimal, particularly when several portfolios have nearly identical objective values.

### 9.6 Computational budget

Report:

- quantum circuit executions;
- shots per execution;
- classical objective evaluations;
- total wall-clock time;
- compilation time;
- classical solver settings and time limits.

Counting only the final quantum circuit ignores the most expensive part of many variational workflows.

## 10. Out-of-sample evaluation

An optimiser benchmark can use known $\mu$ and $\Sigma$. A finance claim requires a time-respecting backtest.

At rebalance date $t$:

1. Estimate $\hat\mu_t$ and $\hat\Sigma_t$ using returns available through $t$.
2. Construct the problem using only those estimates.
3. Run every solver on the same instance.
4. Form the equal-weight selected portfolio.
5. Hold it over $(t,t+1]$.
6. Deduct turnover-dependent transaction costs.
7. Repeat across rebalance dates.

If $w_t$ is the target weight vector and $w_{t^-}$ is the pre-trade portfolio after price movements, one simple turnover measure is

$$
\operatorname{TO}_t
=\frac{1}{2}\sum_i|w_{i,t}-w_{i,t^-}|.
$$

With proportional cost $c$, net portfolio return can be approximated by

$$
r^{\mathrm{net}}_{p,t+1}
=w_t^\top r_{t+1}-c\operatorname{TO}_t.
$$

Evaluate annualised return, volatility, Sharpe ratio, maximum drawdown, turnover, and selection stability. Use the same estimation window and rebalance schedule for every solver.

The purpose is not to show that a quantum method predicts markets. QAOA does not estimate expected returns. It solves the optimisation problem built from those estimates. The backtest asks whether differences in optimisation quality survive contact with parameter uncertainty and trading costs.

## 11. Statistical uncertainty

There are at least two sources of randomness:

- financial sampling variation;
- algorithmic variation from initial parameters, finite shots, noise, and stochastic classical optimisation.

The study should not report only one QAOA run per instance. For each instance and configuration, use multiple seeds and report medians, dispersion, and failure rates. For historical performance differences, use time-series-aware uncertainty estimates rather than treating daily returns as independent observations.

A useful hierarchical design is:

$$
\text{market window}
\rightarrow
\text{optimisation instance}
\rightarrow
\text{algorithm seed}
\rightarrow
\text{measurement shots}.
$$

This allows us to distinguish a method that fails on certain market regimes from one that is merely unstable across quantum or classical optimiser seeds.

## 12. Data leakage and other financial errors

Several mistakes can make a backtest look stronger without improving the method:

- estimating $\mu$ or $\Sigma$ with returns from the holding period;
- constructing today’s universe using companies that survive to the end of the sample;
- ignoring delistings and missing data;
- optimising on adjusted data unavailable in real time;
- tuning $\lambda$, $A$, $p$, or the optimiser using the final test period;
- ignoring transaction costs and turnover;
- comparing solvers on different objective formulations.

These are finance-research problems, not quantum-computing problems. They can dominate the result.

## 13. What a result may honestly claim

Different experiments support different levels of claim.

### Encoding claim

“The constrained portfolio problem was mapped correctly to an Ising Hamiltonian, and QAOA recovered an optimum on small noiseless instances.”

This validates the implementation.

### Algorithmic claim

“Under a fixed evaluation budget, one QAOA configuration produced a higher median feasible-solution quality than the selected baselines on these instance classes.”

This is a comparative result, bounded by the baselines and tested instances.

### Hardware claim

“After transpilation and noise, performance changed in the following measurable ways relative to noiseless simulation.”

This studies implementation effects.

### Financial claim

“Portfolios selected by the workflow produced the following out-of-sample properties under the stated estimation and cost assumptions.”

This concerns the full investment procedure.

### Quantum-advantage claim

This requires evidence that no relevant classical method can match the quantum method on a valuable task under a fair resource comparison. A small QAOA portfolio experiment does not establish it.

Restraint here does not weaken the project. It makes the contribution legible.

## 14. A research-ready experiment table

| Component | Minimum version | Stronger version |
|---|---|---|
| Data | Controlled synthetic $\mu,\Sigma$ | Synthetic classes plus historical walk-forward data |
| Exact reference | Enumeration | Enumeration and MIQP bounds |
| Heuristics | Greedy | Multi-start local search and annealing |
| Quantum method | $p=1$ penalty QAOA | Depth sweep, warm start, feasible mixer |
| Execution | Statevector | Shots, device noise, and hardware |
| Metrics | Best objective | Gap, rank, feasible mass, success probability, time |
| Finance | In-sample objective | Net out-of-sample return, risk, drawdown, turnover |
| Robustness | One instance | Many instances, windows, and seeds |

The minimum version is sufficient for a correct educational article. The stronger version becomes a serious personal research project.

## 15. The most useful extension: warm-start QAOA

Classical and quantum methods need not be treated as opponents. Solve a continuous relaxation, use its solution to prepare a biased initial quantum state, and adapt the mixer accordingly. Warm-start QAOA attempts to begin near a classically promising region without collapsing immediately to one binary string.

This is especially relevant for portfolio selection because continuous mean–variance relaxations are natural and computationally mature. Egger, Mareček, and Woerner showed how solutions of classical relaxations can be incorporated into quantum optimisation and studied the approach in a portfolio context.

A good follow-up experiment would compare:

1. standard QAOA from $|+\rangle^{\otimes n}$;
2. QAOA initialised from a random feasible portfolio;
3. warm-start QAOA using a continuous relaxation;
4. the rounded relaxation without any quantum step;
5. local search started from the same rounded solution.

The fifth baseline is essential. Otherwise, an improvement attributed to the quantum circuit may simply come from the classical warm start.

## 16. The conclusion this project should aim for

The purpose of the study is not to end with “QAOA works” or “QAOA does not work.” Both are too broad.

A useful conclusion would identify conditional structure:

- penalty QAOA loses feasible probability when $K$ is sparse;
- a constraint-preserving mixer improves feasibility but increases circuit cost;
- warm starts help at low depth for certain covariance structures;
- classical local search remains stronger under equal wall-clock budgets;
- noise removes an ideal-state advantage beyond a particular depth;
- optimisation differences have little out-of-sample financial effect because estimation error dominates.

Any one of these would teach us more than a successful four-asset demonstration.

Portfolio selection is a useful quantum optimisation case because it forces three kinds of reasoning to meet. The financial model determines what constitutes a good portfolio. The combinatorial formulation determines the search landscape. The quantum circuit determines how probability moves through that landscape. A benchmark keeps these layers separate long enough to understand each one—and then studies what happens when they interact.

## References

1. H. Markowitz, “Portfolio Selection,” *The Journal of Finance*, 1952.
2. E. Farhi, J. Goldstone and S. Gutmann, [“A Quantum Approximate Optimization Algorithm”](https://arxiv.org/abs/1411.4028), 2014.
3. S. Hadfield et al., [“From the Quantum Approximate Optimization Algorithm to a Quantum Alternating Operator Ansatz”](https://arxiv.org/abs/1709.03489), 2019.
4. D. J. Egger, J. Mareček and S. Woerner, [“Warm-starting quantum optimization”](https://quantum-journal.org/papers/q-2021-06-17-479/), *Quantum*, 2021.
5. IBM Quantum and Vanguard, [“IBM and Vanguard explore quantum optimization for portfolio construction”](https://www.ibm.com/quantum/blog/vanguard-portfolio-optimization), 2025.
6. Qiskit Optimization, [Warm-start QAOA tutorial](https://qiskit-community.github.io/qiskit-optimization/tutorials/10_warm_start_qaoa.html).
7. IBM Quantum, [Quantum Optimization Benchmarking Library](https://www.ibm.com/quantum/blog/quantum-optimization-benchmarking).

</div>
