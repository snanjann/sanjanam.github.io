---
layout: default
title: "When a Good Yield-Curve Fit Lies"
description: "A controlled experiment on parameter instability, collinearity, and ridge regularisation in the Nelson–Siegel model."
permalink: /nelson-siegel-stability/
---

<style>
  .nss-note { --ink:#172331; --blue:#24547e; --orange:#ca7838; --line:#d5dbe1; color:var(--ink); font-size:17px; line-height:1.78; }
  .nss-note h1 { font-size:clamp(2.4rem,6vw,4.6rem); line-height:1; letter-spacing:-.045em; margin-bottom:1rem; }
  .nss-note h2 { margin-top:3.2rem; font-size:2rem; letter-spacing:-.025em; }
  .nss-note h3 { margin-top:2rem; }
  .nss-subtitle { color:#63707d; font-size:1.1rem; max-width:720px; }
  .nss-equation { overflow-x:auto; margin:1.75rem 0; padding:1.2rem; text-align:center; white-space:nowrap; border:solid var(--line); border-width:1px 0; color:var(--blue); font:italic 1.08rem/2 Georgia,serif; }
  .nss-callout { margin:2.4rem 0; padding:1.4rem 1.5rem; background:#eef3f6; border-left:6px solid var(--orange); }
  .nss-callout strong { display:block; margin-bottom:.4rem; font:1.35rem/1.3 Georgia,serif; }
  .nss-table-wrap { overflow-x:auto; margin:1.8rem 0; }
  .nss-note table { width:100%; min-width:650px; border-collapse:collapse; font-size:.88rem; }
  .nss-note th { background:var(--blue); color:white; text-align:left; }
  .nss-note th,.nss-note td { padding:.7rem .8rem; border:1px solid #cfd6dc; }
  .nss-note tbody tr:nth-child(even) { background:#f3f6f8; }
  .nss-result { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; margin:2rem 0; background:#ccd4da; border:1px solid #ccd4da; }
  .nss-result div { padding:1.2rem; background:#fbfcfd; }
  .nss-result span,.nss-result small { display:block; color:#727e89; font-size:.72rem; }
  .nss-result strong { display:block; margin:.2rem 0; font:1.45rem Georgia,serif; }
  .nss-code { margin:2rem 0; padding:1.2rem; overflow-x:auto; background:#162432; color:#e5edf4; font:14px/1.65 ui-monospace,monospace; white-space:pre; }
  .nss-note footer { margin-top:4rem; padding-top:1rem; border-top:1px solid var(--line); font-size:.9rem; }
  @media(max-width:650px){ .nss-result{grid-template-columns:1fr} }
</style>

<article class="nss-note" markdown="1">

# When a Good Yield-Curve Fit Lies

<p class="nss-subtitle">A controlled experiment on parameter instability, collinearity, and ridge regularisation in the Nelson–Siegel model.</p>

In my previous note, I used Nelson–Siegel as a way of reading the yield curve through three factors: level, slope, and curvature. That interpretation is useful precisely because the coefficients appear to carry economic meaning. But it also creates a harder requirement. If I want to discuss a change in the slope factor, I need some confidence that the data have identified that factor, rather than merely one of several coefficient combinations capable of drawing the same curve.

This distinction is easy to miss when a model is assessed through its fitted curve. Two estimates can be almost indistinguishable in yield space and still imply different stories about level, slope, and curvature. This note is a theoretical and computational investigation, not an empirical study of a particular bond market. I isolate the mechanism with a controlled simulation built from ten maturities, a known Nelson–Siegel curve, and one-basis-point measurement noise. The aim is to see when the problem can arise, how it passes unnoticed, and what regularisation changes. My next step will be to take these diagnostics to real yield-curve data and publish the results separately.

## Fit and identification are different questions

For fixed \(\lambda\), the Nelson–Siegel model is linear in its three coefficients:

<div class="nss-equation">y = X(λ)β + ε, &nbsp;&nbsp;&nbsp; β̂<sub>OLS</sub> = (X<sup>T</sup>X)<sup>−1</sup>X<sup>T</sup>y.</div>

The columns of \(X(\lambda)\) are the level, slope, and curvature loadings evaluated at the observed maturities. A small residual norm tells me that \(X\hat\beta\) lies close to the observed yield vector. It says much less about the uncertainty surrounding \(\hat\beta\).

If two columns of \(X\) point in nearly the same direction, the data have difficulty separating their effects. Algebraically, one or more singular values of \(X\) become small. The condition number

<div class="nss-equation">κ(X) = σ<sub>max</sub>(X) / σ<sub>min</sub>(X)</div>

then becomes large. Geometrically, the least-squares objective develops a narrow, flat valley: moving a long distance in coefficient space may produce only a slight change in fitted yields. The curve can therefore be well determined while the decomposition behind it is not.

That is the reason I would not diagnose this problem from RMSE alone. I would examine the condition number, the correlations between loading columns, the response of the coefficients to small perturbations, and—when estimating curves over time—the turnover in the fitted factors.

## A controlled perturbation

I begin with ten maturities:

<div class="nss-equation">τ ∈ {0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30} years.</div>

The data-generating coefficients are \(\beta=(5,-2.4,2.8)\), with yields measured in percentage points. I intentionally set \(\lambda=0.02\), a value at which the slope and curvature loadings are close to collinear over this maturity set. Their sample correlation is −0.998, and the condition number of the design matrix is approximately 545. The reason is visible from the geometry of the model: at this value of \(\lambda\), the curvature loading reaches its maximum at approximately \(1.793/0.02=89.65\) years, well beyond the longest observed maturity. Within the 30-year window, we see only part of the curvature function, making it difficult to distinguish from the slope loading.

This is a stress case, not a claim that \(\lambda=0.02\) is a normal market estimate. Choosing it deliberately allows the experiment to test the mechanism rather than mix it with questions about market data, security selection, or the quality of a bootstrap procedure.

I then increase the observed two-year yield by one basis point and re-estimate the coefficients. The fitted values absorb only part of that isolated disturbance, so the maximum change anywhere on the fitted curve is about 0.18 basis points. The factors move much more:

<div class="nss-result">
  <div><span>CHANGE IN LEVEL</span><strong>+5.02 bp</strong><small>Δβ₀</small></div>
  <div><span>CHANGE IN SLOPE</span><strong>−4.83 bp</strong><small>Δβ₁</small></div>
  <div><span>CHANGE IN CURVATURE</span><strong>−6.83 bp</strong><small>Δβ₂</small></div>
</div>

The estimated curve has barely changed, yet each coefficient has moved by several times the disturbance applied to the data. Looking only at the before-and-after curves would conceal almost all of this movement.

The result is not paradoxical. Because the loading columns are nearly dependent, changes in one coefficient can be offset by changes in another. OLS uses those offsetting movements to preserve the fitted yields. The coefficients appear volatile not because the curve itself is volatile, but because the model has several nearly equivalent ways to represent it.

## Moving from one perturbation to a distribution

A single basis-point shock is useful for inspection, but it depends on which maturity is disturbed. I therefore repeat the exercise 5,000 times, adding independent Gaussian noise with a standard deviation of one basis point to every maturity. The true curve and the maturity set remain fixed. For every simulated cross-section, I estimate the factors using OLS and ridge regression.

Ridge replaces the OLS objective with

<div class="nss-equation">β̂<sub>ridge</sub> = arg min<sub>β</sub> { ‖y − Xβ‖²<sub>2</sub> + α‖Dβ‖²<sub>2</sub> }.</div>

Here, \(D=\operatorname{diag}(0,1,1)\): the direct penalty is applied to slope and curvature, while the level coefficient is left unpenalised. Level can still change indirectly because all three coefficients are estimated jointly.

The table reports the average RMSE against the noisy observations, the average RMSE against the unobserved true curve, and the Monte Carlo standard deviation of each coefficient. All entries other than \(\alpha\) are in basis points.

<div class="nss-table-wrap" markdown="1">

| Ridge penalty α | RMSE: noisy yields | RMSE: true curve | SD(β₀) | SD(β₁) | SD(β₂) |
|---:|---:|---:|---:|---:|---:|
| 0 (OLS) | 0.81 | 0.51 | 67.83 | 67.51 | 81.29 |
| 0.00001 | 0.81 | 0.49 | 60.98 | 60.69 | 73.07 |
| 0.00010 | 0.83 | 0.45 | 31.98 | 31.85 | 38.29 |
| 0.00100 | 0.95 | 0.55 | 5.95 | 6.03 | 6.92 |
| 0.01000 | 3.40 | 3.30 | 2.08 | 2.31 | 1.98 |

</div>

The comparison makes the trade-off visible. With \(\alpha=0.0001\), the fit to the noisy observations deteriorates only slightly—from 0.81 to 0.83 basis points—while the standard deviation of the curvature estimate falls from 81.29 to 38.29 basis points. The error measured against the true curve actually improves because the regularised model is less willing to fit noise.

Increasing the penalty further continues to stabilise the coefficients, but stability is not free. At \(\alpha=0.01\), the factors move very little and the curve is badly biased. A coefficient path can look reassuringly smooth simply because the model has been prevented from responding to information. Regularisation solves neither the model-selection problem nor the question of how much variation is economically meaningful.

The numerical values of \(\alpha\) in this table belong to this experiment; they are not suggested defaults for a Nelson–Siegel implementation. Their meaning depends on whether yields are represented as percentages or decimals, the scaling of the regressors, the maturity set, and which coefficients are penalised. Changing any of these choices changes the effective strength of the same numerical penalty.

## How I would choose the penalty

If \(\alpha\) is selected using in-sample yield RMSE alone, the procedure will usually prefer little or no regularisation. That repeats the original mistake: it judges a factor model only through the surface it draws. A more useful evaluation keeps fit and stability separate.

One possibility is a stability-adjusted objective,

<div class="nss-equation">J(α) = (1/T) Σ<sub>t</sub> ‖y<sub>t</sub> − X<sub>t</sub>β̂<sub>t,α</sub>‖² + η(1/(T−1)) Σ<sub>t</sub> ‖β̂<sub>t,α</sub> − β̂<sub>t−1,α</sub>‖².</div>

The parameter \(\eta\) makes the judgement explicit: how much additional pricing error am I willing to accept for lower factor turnover? I would report the frontier rather than hide that decision inside one preferred value.

For a real cross-section, maturity-based cross-validation is cleaner. I can withhold one or more maturities, estimate the curve using the remaining securities, and evaluate how well it recovers the omitted yields. This tests interpolation rather than merely rewarding a close in-sample fit. It also prevents “smooth coefficients” from becoming the definition of correctness.

## From a simulation to an empirical test

The controlled experiment establishes a possibility: under weak conditioning, a small disturbance to yields can create a much larger disturbance in the estimated factors. It does not establish how often this occurs in US Treasuries, Indian government bonds, or any other market. That requires daily data and a design that respects how the curve is constructed.

For an empirical extension, I would estimate OLS and ridge Nelson–Siegel curves each day and retain five sets of diagnostics:

1. yield or price RMSE;
2. the condition number of \(X(\lambda)\);
3. the correlation between the slope and curvature loadings;
4. factor turnover, \(\lVert\hat\beta_t-\hat\beta_{t-1}\rVert_2\); and
5. sensitivity to a controlled one-basis-point perturbation.

I would also compare the estimated factors with simple empirical proxies: a long yield for level, a long-minus-short spread for slope, and a butterfly combination for curvature. Agreement with these proxies would not prove that the factors are correct, but persistent disagreement would be informative. The analysis should then be repeated with different maturity subsets and, where possible, by fitting model-implied bond prices rather than treating coupon-bond yields as spot rates.

The final comparison depends on the intended use. If the curve is being used to price a security today, a small reduction in fitting error may be valuable. If its factors enter a forecasting model or define a steepener trade, parameter stability becomes part of model performance. “Best fit” has no meaning until the downstream task is specified.

## Reproducibility

The core of the experiment is short enough to inspect directly:

<div class="nss-code">def loadings(tau, lam):
    x = lam * tau
    slope = (1 - np.exp(-x)) / x
    curvature = slope - np.exp(-x)
    return np.column_stack([np.ones_like(tau), slope, curvature])

X = loadings(maturities, lam)
beta_ols = np.linalg.lstsq(X, yields, rcond=None)[0]
beta_ridge = np.linalg.solve(X.T @ X + alpha * D, X.T @ yields)</div>

The complete script fixes the random seed, reproduces the 5,000 simulations, and prints the table reported above. Keeping the simulation separate from the prose matters: the numbers in the article should be reproducible outputs, not decorative examples.

The broader lesson is not that ridge should replace OLS in every Nelson–Siegel implementation. It is that the curve and its factor decomposition are two related but distinct estimation objects. A curve may be accurate enough for one purpose while its coefficients are too unstable for another. Once the factors are given economic names, their identification deserves to be tested with the same care as the fit itself.

This theoretical exercise gives me a set of tests and a benchmark whose behaviour is already understood. The next step is empirical: estimate the model across daily government yield curves, track when weak conditioning actually occurs, and examine whether ridge-stabilised factors are more useful out of sample. I plan to publish those results as the next part of this series, including the cases in which regularisation does not improve the model.

<footer>
<strong>Primary reference:</strong> Annaert, J., Claes, A. G. P., De Ceuster, M. J. K., and Zhang, H. (2013), “<a href="https://doi.org/10.1016/j.iref.2013.01.005">Estimating the Spot Rate Curve Using the Nelson–Siegel Model: A Ridge Regression Approach</a>.”<br>
<strong>Related note:</strong> “<a href="{{ '/nelson-siegel-model/' | relative_url }}">Reading the Yield Curve Through Nelson–Siegel</a>.”
</footer>

</article>
