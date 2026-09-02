---
layout: default
title: "From a Binary Objective Function to an Ising Hamiltonian"
author: "Sanjana M"
categories: [Quantum Computing, Optimisation, Mathematics]
description: "A careful derivation of the QUBO-to-Ising mapping, including signs, constants, penalties, bit ordering, and code checks."
permalink: /qubo-to-ising-hamiltonian/
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

# From a Binary Objective Function to an Ising Hamiltonian

The phrase “map the optimisation problem to a Hamiltonian” can make a simple algebraic step sound mysterious. There is no physical transformation of a portfolio, graph, or scheduling problem. We are constructing a diagonal quantum operator whose entries reproduce the classical objective function.

That construction is easy to state:

$$
H_C|x\rangle=C(x)|x\rangle.
$$

It is also easy to implement incorrectly. Sign conventions differ across papers and software libraries. Constant terms are often dropped without explanation. A maximisation problem may be sent to a minimum-eigensolver without changing its sign. Qiskit's displayed bitstrings may appear in the reverse order from the qubit labels used in a derivation. None of these mistakes is conceptually deep, but each can reverse the meaning of a result.

This article derives the mapping slowly enough that every coefficient can be checked.

## 1. Classical bits and quantum basis states

A classical binary variable satisfies

$$
x_i\in\{0,1\}.
$$

A qubit has computational-basis states $|0\rangle$ and $|1\rangle$. For $n$ qubits, every bitstring

$$
x=(x_1,\ldots,x_n)
$$

corresponds to a basis state

$$
|x\rangle=|x_1x_2\cdots x_n\rangle.
$$

The Pauli-$Z$ operator is

$$
Z=
\begin{bmatrix}
1&0\\
0&-1
\end{bmatrix}.
$$

Therefore,

$$
Z|0\rangle=+|0\rangle,
\qquad
Z|1\rangle=-|1\rangle.
$$

The eigenvalues of $Z$ are $+1$ and $-1$, whereas the values of a binary decision variable are $0$ and $1$. We need an operator that has eigenvalue $0$ on $|0\rangle$ and eigenvalue $1$ on $|1\rangle$.

That operator is

$$
\hat{x}=\frac{I-Z}{2}.
$$

Check both cases:

$$
\frac{I-Z}{2}|0\rangle
=\frac{1-1}{2}|0\rangle
=0|0\rangle,
$$

and

$$
\frac{I-Z}{2}|1\rangle
=\frac{1-(-1)}{2}|1\rangle
=1|1\rangle.
$$

For the $i$th qubit, write

$$
\hat{x}_i=\frac{I-Z_i}{2},
$$

where $Z_i$ means that $Z$ acts on qubit $i$ and the identity acts on every other qubit.

This identity is the entire basis of the usual QUBO-to-Ising mapping.

## 2. Bits, spins, and two equivalent conventions

Classical Ising models use spin variables $s_i\in\{-1,+1\}$. A common mapping is

$$
s_i=1-2x_i,
\qquad
x_i=\frac{1-s_i}{2}.
$$

Under this convention,

$$
x_i=0\Longleftrightarrow s_i=+1,
\qquad
x_i=1\Longleftrightarrow s_i=-1.
$$

Since the eigenvalues of $Z_i$ are also $\pm1$, we identify $s_i$ with $Z_i$ and obtain $x_i\mapsto(I-Z_i)/2$.

Some sources instead use $s_i=2x_i-1$, which gives $x_i=(1+s_i)/2$. That convention is equally valid, but it changes the signs of the linear Ising coefficients. The safest practice is not to memorise a table of signs. State the convention and derive the mapping.

## 3. Mapping a linear term

Consider

$$
C(x)=a_ix_i.
$$

Substitute the binary operator:

$$
a_ix_i
\mapsto
a_i\frac{I-Z_i}{2}
=
\frac{a_i}{2}I-\frac{a_i}{2}Z_i.
$$

A positive classical coefficient therefore contributes:

- a constant $a_i/2$;
- a $Z_i$ coefficient of $-a_i/2$.

Test the eigenvalues. For $x_i=0$, $Z_i$ has eigenvalue $+1$, giving

$$
\frac{a_i}{2}-\frac{a_i}{2}=0.
$$

For $x_i=1$, $Z_i$ has eigenvalue $-1$, giving

$$
\frac{a_i}{2}+\frac{a_i}{2}=a_i.
$$

The operator reproduces the classical term exactly.

## 4. Mapping a quadratic term

Now consider a pairwise interaction

$$
b_{ij}x_ix_j.
$$

Use the substitution twice:

$$
x_ix_j
\mapsto
\left(\frac{I-Z_i}{2}\right)
\left(\frac{I-Z_j}{2}\right).
$$

Because $Z_i$ and $Z_j$ act on different qubits, they commute. Expanding gives

$$
x_ix_j
\mapsto
\frac{1}{4}
\left(I-Z_i-Z_j+Z_iZ_j\right).
$$

Therefore,

$$
b_{ij}x_ix_j
\mapsto
\frac{b_{ij}}{4}I
-\frac{b_{ij}}{4}Z_i
-\frac{b_{ij}}{4}Z_j
+\frac{b_{ij}}{4}Z_iZ_j.
$$

The quadratic binary term produces four contributions. In particular, it changes the linear fields on both qubits as well as creating a two-qubit coupling.

This is a frequent source of hand-calculation errors. Mapping $x_ix_j$ directly to $Z_iZ_j$ is not correct under the $x_i=(1-Z_i)/2$ convention.

## 5. The general QUBO-to-Ising formula

Write the binary objective using each pair once:

$$
C(x)
=c+
\sum_{i=1}^n a_ix_i
+\sum_{i<j}b_{ij}x_ix_j.
$$

After substitution,

$$
H_C=\alpha I+\sum_i h_iZ_i+\sum_{i<j}J_{ij}Z_iZ_j,
$$

with

$$
J_{ij}=\frac{b_{ij}}{4},
$$

$$
h_i=-\frac{a_i}{2}-\frac{1}{4}\sum_{j\ne i}b_{ij},
$$

and

$$
\alpha=c+rac{1}{2}\sum_i a_i+rac{1}{4}\sum_{i<j}b_{ij}.
$$

The sum in $h_i$ includes every pair involving $i$. The precise matrix formula changes if a QUBO library stores both $Q_{ij}$ and $Q_{ji}$ or uses only the upper triangle. This is why the polynomial form above is safer for a derivation.

## 6. Why the constant is both irrelevant and useful

The identity term adds the same value to every eigenvalue:

$$
(H_C+\alpha I)|x\rangle
=
(C(x)+\alpha)|x\rangle.
$$

It does not change which bitstring minimises the energy. In a QAOA phase operator,

$$
e^{-i\gamma(H_C+\alpha I)}
=e^{-i\gamma\alpha}e^{-i\gamma H_C},
$$

and $e^{-i\gamma\alpha}$ is a global phase. A global phase does not affect measurement probabilities. We may therefore omit the constant when constructing the circuit.

But the constant should not be forgotten entirely. It is needed when:

- comparing a measured Hamiltonian expectation with the original objective value;
- checking a hand derivation against enumeration;
- comparing outputs from libraries that do or do not report the offset;
- reconstructing the full energy scale.

The precise statement is: the constant is irrelevant to the optimiser, but relevant to accounting.

## 7. A complete two-variable derivation

Consider

$$
C(x_1,x_2)=3x_1-2x_2+4x_1x_2+1.
$$

Substitute

$$
x_1=\frac{I-Z_1}{2},
\qquad
x_2=\frac{I-Z_2}{2}.
$$

Then

$$
\begin{aligned}
H_C
&=3\frac{I-Z_1}{2}
-2\frac{I-Z_2}{2}
+4\frac{I-Z_1-Z_2+Z_1Z_2}{4}
+I\\
&=\frac{3}{2}I-\frac{3}{2}Z_1
-I+Z_2
+I-Z_1-Z_2+Z_1Z_2
+I\\
&=\frac{5}{2}I-\frac{5}{2}Z_1+Z_1Z_2.
\end{aligned}
$$

The $Z_2$ terms cancel. That does not mean $x_2$ has disappeared from the problem. Its effect remains through the coupling $Z_1Z_2$.

Check all four basis states:

| $x_1x_2$ | Classical $C(x)$ | $z_1$ | $z_2$ | $\frac52-\frac52z_1+z_1z_2$ |
|---:|---:|---:|---:|---:|
| 00 | 1 | +1 | +1 | 1 |
| 01 | -1 | +1 | -1 | -1 |
| 10 | 4 | -1 | +1 | 4 |
| 11 | 6 | -1 | -1 | 6 |

The diagonal Hamiltonian reproduces the classical objective exactly.

## 8. Maximisation versus minimisation

Many quantum optimisation tools are written as minimum-eigensolvers. If the classical task is

$$
\max_x C(x),
$$

we can instead solve

$$
\min_x[-C(x)].
$$

The ground state of $-H_C$ corresponds to the maximum of $C$. Alternatively, one may search for the largest eigenvalue of $H_C$, but most standard QAOA conventions are phrased as energy minimisation.

The sign must remain consistent through:

- the classical objective;
- the Hamiltonian;
- the optimiser;
- the interpretation of reported energies;
- the approximation metric.

For a maximisation problem with nonnegative optimum $C^*$, a common approximation ratio is $C(x)/C^*$. For minimisation with possibly negative costs, blindly reusing the same ratio can be meaningless. Report an objective gap or define the normalisation explicitly.

## 9. Encoding a cardinality constraint

Suppose exactly $K$ variables must equal one:

$$
\sum_i x_i=K.
$$

Add

$$
P(x)=A\left(\sum_i x_i-K\right)^2.
$$

Using $x_i^2=x_i$,

$$
P(x)
=A\left[
(1-2K)\sum_i x_i
+2\sum_{i<j}x_ix_j
+K^2
\right].
$$

Map the constraint directly using the number operator

$$
\hat{N}=\sum_i\frac{I-Z_i}{2}.
$$

Then

$$
H_P=A(\hat{N}-KI)^2.
$$

This expression makes the meaning especially clear: any basis state with Hamming weight $K$ receives zero penalty. A state with Hamming weight $K\pm d$ receives penalty $Ad^2$.

### 9.1 How large must $A$ be?

A sufficient penalty must outweigh the largest improvement an infeasible solution could obtain from the original objective. If $C_0(x)$ lies between known bounds $L$ and $U$, then a conservative choice such as

$$
A>U-L
$$

ensures that a one-unit violation costs more than the full range of the base objective. This may be loose. Tighter problem-specific bounds are preferable because excessive penalties produce badly separated coefficient scales.

The exact threshold can also be found by enumeration for small instances. That calculation is useful during development even if it cannot scale to the final problem.

## 10. A transparent Python implementation

The following function accepts a polynomial written with one coefficient per linear term and one coefficient per unordered pair.

```python
from collections import defaultdict

def polynomial_to_ising(linear, quadratic, constant=0.0):
    """Map C(x)=constant+sum_i a_i x_i+sum_{i<j} b_ij x_i x_j.

    Returns alpha, h, J for
        H = alpha I + sum_i h_i Z_i + sum_{i<j} J_ij Z_i Z_j.
    """
    alpha = float(constant)
    h = defaultdict(float)
    J = defaultdict(float)

    for i, a_i in linear.items():
        alpha += a_i / 2
        h[i] -= a_i / 2

    for (i, j), b_ij in quadratic.items():
        if i == j:
            # x_i^2 = x_i for binary variables
            alpha += b_ij / 2
            h[i] -= b_ij / 2
            continue
        if i > j:
            i, j = j, i
        alpha += b_ij / 4
        h[i] -= b_ij / 4
        h[j] -= b_ij / 4
        J[(i, j)] += b_ij / 4

    return alpha, dict(h), dict(J)
```

Now verify the mapping over the full basis for a small problem.

```python
from itertools import product

def classical_cost(bits, linear, quadratic, constant=0.0):
    value = constant
    value += sum(a * bits[i] for i, a in linear.items())
    value += sum(b * bits[i] * bits[j]
                 for (i, j), b in quadratic.items())
    return value

def ising_energy(bits, alpha, h, J):
    spins = [1 - 2 * bit for bit in bits]
    value = alpha
    value += sum(coeff * spins[i] for i, coeff in h.items())
    value += sum(coeff * spins[i] * spins[j]
                 for (i, j), coeff in J.items())
    return value

linear = {0: 3.0, 1: -2.0}
quadratic = {(0, 1): 4.0}
constant = 1.0

alpha, h, J = polynomial_to_ising(linear, quadratic, constant)

for bits in product([0, 1], repeat=2):
    c = classical_cost(bits, linear, quadratic, constant)
    e = ising_energy(bits, alpha, h, J)
    assert abs(c - e) < 1e-12
    print(bits, c, e)
```

This basis-by-basis assertion is one of the most useful tests in a quantum optimisation project. It checks the mathematical mapping independently of QAOA.

## 11. Constructing the operator in Qiskit

Qiskit's `SparsePauliOp` stores weighted Pauli strings. The label order follows Qiskit's tensor convention: the rightmost character acts on qubit 0. A helper avoids manual reversal mistakes.

```python
from qiskit.quantum_info import SparsePauliOp

def pauli_label(n, z_qubits):
    label = ["I"] * n
    for q in z_qubits:
        label[n - 1 - q] = "Z"  # rightmost character is qubit 0
    return "".join(label)

def ising_operator(n, h, J, include_constant=False, alpha=0.0):
    terms = []

    if include_constant and alpha != 0:
        terms.append(("I" * n, alpha))

    for i, coeff in h.items():
        terms.append((pauli_label(n, [i]), coeff))

    for (i, j), coeff in J.items():
        terms.append((pauli_label(n, [i, j]), coeff))

    return SparsePauliOp.from_list(terms).simplify()

operator = ising_operator(2, h, J, include_constant=False)
print(operator)
print("Classical offset:", alpha)
```

Keeping the offset separate is often convenient. If a variational routine returns $\langle H_C-\alpha I\rangle$, add $\alpha$ before comparing it with the original QUBO value.

## 12. Higher-order terms and auxiliary variables

Not every objective is naturally quadratic. Suppose the model contains

$$
d,x_1x_2x_3.
$$

Direct substitution produces a three-qubit $Z_1Z_2Z_3$ interaction as well as lower-order terms. Gate-model circuits can implement higher-order Pauli interactions, but many optimisation frameworks and hardware mappings prefer quadratic forms.

One approach introduces an auxiliary variable $y$ intended to equal $x_1x_2$. The cubic term becomes $dyx_3$, and an additional penalty enforces $y=x_1x_2$. This reduces polynomial order at the cost of another binary variable, additional couplings, and a penalty scale.

There is no free reduction. Quadratization trades interaction order for problem size and coefficient complexity. A serious resource estimate should count the auxiliary qubits and the extra circuit depth they induce.

## 13. What the Hamiltonian representation does—and does not—give us

After the mapping, the optimisation problem is encoded spectrally:

- each bitstring $x$ labels a computational-basis eigenstate $|x\rangle$;
- the corresponding eigenvalue is $C(x)$;
- ground states encode global minima;
- near-ground states encode near-optimal decisions.

This does not yet provide an algorithm. We have described where the answer sits in the spectrum, not how to prepare the corresponding state. An arbitrary initial state need not have much probability on the ground state, and measuring a uniform superposition merely samples bitstrings uniformly.

QAOA adds dynamics. The cost Hamiltonian changes phases according to objective values. A noncommuting mixer moves amplitude among computational-basis states. Repeating these operations can create interference that concentrates probability on good solutions. That mechanism is the subject of the next article.

## 14. A mapping checklist

Before running any variational optimiser, verify the following:

1. Is the original task minimisation or maximisation?
2. Which binary-to-spin convention is being used?
3. Does every basis-state energy match the classical objective on a small instance?
4. Has the identity offset been stored?
5. Are quadratic coefficients counted once or twice?
6. Are diagonal QUBO terms treated using $x_i^2=x_i$?
7. Does the bitstring display order match the variable order?
8. Do penalty terms make every global optimum feasible?
9. Have auxiliary variables and their constraints been included in the resource count?

The mapping is not difficult because it requires advanced quantum mechanics. It is difficult because several small conventions must remain consistent at once. Once they do, the Hamiltonian has a clean interpretation: it is the classical objective written as a quantum observable.

## References

1. E. Farhi, J. Goldstone and S. Gutmann, [“A Quantum Approximate Optimization Algorithm”](https://arxiv.org/abs/1411.4028), 2014.
2. S. Hadfield et al., [“From the Quantum Approximate Optimization Algorithm to a Quantum Alternating Operator Ansatz”](https://arxiv.org/abs/1709.03489), 2019.
3. IBM Quantum, [“Quantum approximate optimization algorithm”](https://quantum.cloud.ibm.com/docs/en/tutorials/quantum-approximate-optimization-algorithm).
4. Qiskit Community, [Qiskit Optimization](https://github.com/qiskit-community/qiskit-optimization).

</div>
