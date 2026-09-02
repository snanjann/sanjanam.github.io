---
layout: default
title: "Reading the Yield Curve Through Nelson–Siegel"
description: "A technical note on yield-curve factors, parameter instability, and why ridge regression helps."
permalink: /nelson-siegel-model/
---

<style>
  .ns-note { --ink:#172331; --blue:#24547e; --teal:#2c857d; --orange:#ca7838; --line:#d7dce2; color:var(--ink); font-size:17px; line-height:1.75; }
  .ns-note h1 { font-size:clamp(2.4rem,6vw,4.8rem); line-height:.98; letter-spacing:-.045em; margin-bottom:1rem; }
  .ns-note h2 { margin-top:3.2rem; font-size:2rem; letter-spacing:-.025em; }
  .ns-note .subtitle { color:#64707d; font-size:1.1rem; max-width:700px; }
  .ns-lab { margin:2.5rem 0; padding:1.25rem; border:1px solid #c9d0d7; background:#fbfcfd; box-shadow:8px 8px 0 #e8edf1; }
  .ns-lab-head { display:flex; justify-content:space-between; align-items:center; gap:1rem; border-bottom:1px solid var(--line); padding-bottom:1rem; }
  .ns-lab-head h2 { margin:0; font-size:1.5rem; }
  .ns-tabs { display:flex; border:1px solid #bfc6ce; padding:3px; }
  .ns-tabs button,.ns-reset { border:0; padding:.55rem .75rem; background:transparent; cursor:pointer; color:#65717c; }
  .ns-tabs button.active { color:white; background:var(--blue); }
  .ns-grid { display:grid; grid-template-columns:minmax(0,1fr) 220px; gap:1.5rem; padding-top:1.25rem; }
  .ns-chart { min-width:0; }
  #ns-svg { display:block; width:100%; height:auto; overflow:visible; }
  .ns-axis-title { margin:0; text-align:right; color:#77818b; font-size:.75rem; }
  .ns-controls { border-left:1px solid var(--line); padding-left:1.25rem; }
  .ns-control { margin-bottom:1.05rem; }
  .ns-control label { display:flex; justify-content:space-between; font-size:.82rem; font-weight:600; }
  .ns-control output { color:var(--blue); font-family:monospace; }
  .ns-control input { width:100%; accent-color:var(--blue); }
  .ns-reset { width:100%; border:1px solid #bfc6ce; margin-top:.4rem; }
  .ns-readouts { display:grid; grid-template-columns:repeat(3,1fr); margin-top:1rem; border-top:1px solid var(--line); }
  .ns-readouts div { padding:1rem .7rem 0; border-right:1px solid var(--line); }
  .ns-readouts div:last-child { border:0; }
  .ns-readouts span,.ns-readouts small { display:block; color:#74808b; font-size:.7rem; }
  .ns-readouts strong { display:block; font-size:1.25rem; font-family:Georgia,serif; }
  .ns-equation { overflow-x:auto; margin:1.75rem 0; padding:1.25rem; text-align:center; white-space:nowrap; border:solid var(--line); border-width:1px 0; color:var(--blue); font:italic 1.1rem/2 Georgia,serif; }
  .ns-frac { display:inline-flex; flex-direction:column; vertical-align:middle; line-height:1.25; margin:0 .2em; }
  .ns-frac span:first-child { border-bottom:1px solid; padding:0 .2em; }
  .ns-callout { margin:2.5rem 0; padding:1.5rem; color:white; background:var(--blue); border-left:7px solid var(--orange); }
  .ns-callout strong { display:block; font:1.45rem/1.3 Georgia,serif; }
  .ns-source { margin-top:4rem; padding-top:1rem; border-top:1px solid var(--line); font-size:.9rem; }
  @media(max-width:700px){ .ns-grid{grid-template-columns:1fr}.ns-controls{border-left:0;border-top:1px solid var(--line);padding:1rem 0 0}.ns-readouts{grid-template-columns:1fr}.ns-readouts div{border-right:0;border-bottom:1px solid var(--line)}.ns-lab-head{align-items:flex-start;flex-direction:column}.ns-tabs{width:100%}.ns-tabs button{flex:1} }
</style>

<article class="ns-note" markdown="1">

# Reading the Yield Curve Through Nelson–Siegel

<p class="subtitle">The appeal of Nelson–Siegel is not simply that it draws a smooth yield curve. It gives us a compact way to ask what has changed in that curve—and whether the factors we recover are stable enough to mean anything.</p>

<section class="ns-lab" id="ns-explorer">
  <div class="ns-lab-head">
    <h2>Shape the yield curve</h2>
    <div class="ns-tabs" aria-label="Chart view">
      <button type="button" class="active" data-view="curve">Yield curve</button>
      <button type="button" data-view="loadings">Factor loadings</button>
    </div>
  </div>
  <div class="ns-grid">
    <div class="ns-chart">
      <svg id="ns-svg" viewBox="0 0 720 400" role="img" aria-label="Interactive Nelson-Siegel chart"></svg>
      <p class="ns-axis-title">Maturity, τ</p>
    </div>
    <div class="ns-controls">
      <div class="ns-control"><label for="ns-b0"><span>β₀ · Level</span><output id="ns-b0-out">5.00</output></label><input id="ns-b0" type="range" min="0" max="10" value="5" step="0.1"></div>
      <div class="ns-control"><label for="ns-b1"><span>β₁ · Slope</span><output id="ns-b1-out">−2.40</output></label><input id="ns-b1" type="range" min="-8" max="8" value="-2.4" step="0.1"></div>
      <div class="ns-control"><label for="ns-b2"><span>β₂ · Curvature</span><output id="ns-b2-out">2.80</output></label><input id="ns-b2" type="range" min="-8" max="8" value="2.8" step="0.1"></div>
      <div class="ns-control"><label for="ns-lambda"><span>λ · Decay</span><output id="ns-lambda-out">0.55</output></label><input id="ns-lambda" type="range" min="0.08" max="1.5" value="0.55" step="0.01"></div>
      <button type="button" class="ns-reset">Reset parameters</button>
    </div>
  </div>
  <div class="ns-readouts">
    <div><span>SHORT-RATE LIMIT</span><strong id="ns-short">2.60%</strong><small>β₀ + β₁</small></div>
    <div><span>LONG-RATE LIMIT</span><strong id="ns-long">5.00%</strong><small>β₀</small></div>
    <div><span>CURVATURE PEAK</span><strong id="ns-peak">3.26 years</strong><small>1.793 / λ</small></div>
  </div>
</section>

A yield curve is not a single observation. On any trading day, we see a collection of rates across maturities, all moving together but not by the same amount. Treating every maturity as an unrelated variable loses the structure of the curve; using one average rate loses almost everything else. Nelson–Siegel offers a useful compromise. It represents the entire cross-section using three factors that correspond, approximately, to the curve’s level, slope, and curvature.

I find the model interesting because it makes two different ideas meet. The first is economic: long rates, the short end, and the middle of the curve often respond differently to information. The second is statistical: a large set of correlated yields can be represented in a much smaller space. Nelson–Siegel gives that smaller space an explicit functional form rather than asking the data to discover it afresh each day.

## The model

<div class="ns-equation">y(τ) = β₀ + β₁ <span class="ns-frac"><span>1 − e<sup>−λτ</sup></span><span>λτ</span></span> + β₂ [<span class="ns-frac"><span>1 − e<sup>−λτ</sup></span><span>λτ</span></span> − e<sup>−λτ</sup>]</div>

The equation is easier to read as a set of maturity-dependent loadings. The coefficient **β₀** multiplies a constant, so it shifts every point on the curve by the same amount. It is the level factor. The loading on **β₁** begins close to one at the short end and gradually decays, which allows the short and long ends to move differently. **β₂** has no lasting effect at either extreme: its loading rises and then falls, producing a hump—or a trough—in the middle of the curve.

The limiting cases make the first two interpretations precise:

<div class="ns-equation">lim<sub>τ→0</sub> y(τ) = β₀ + β₁ &nbsp;&nbsp;&nbsp; lim<sub>τ→∞</sub> y(τ) = β₀</div>

As maturity approaches zero, the fitted yield approaches β₀ + β₁; as maturity becomes very long, it approaches β₀. This is why −β₁ can be read as the long-minus-short spread. The remaining parameter, **λ**, controls the location of the curvature loading. Under the convention used here, it peaks at approximately **τ\* = 1.793/λ**. A larger λ moves the hump towards shorter maturities, while a smaller value lets it operate further along the curve.

Seen this way, the model is a projection. A noisy cross-section of rates is mapped onto three basis functions, and the coefficients become coordinates for the day’s curve. That compression is useful only if the coordinates themselves are reliable—which is where the estimation problem becomes more interesting than the equation.

## A good fit can hide a weak estimate

Once λ is fixed, estimating Nelson–Siegel is an ordinary linear-regression problem. For each maturity, we calculate the three factor loadings, collect them in a design matrix, and regress the observed zero-coupon yields on that matrix:

<div class="ns-equation">β̂ = (X<sup>T</sup>X)<sup>−1</sup>X<sup>T</sup>y</div>

We can repeat this calculation across plausible values of λ and choose the value that produces the smallest pricing or yield error. On the surface, that seems sufficient: if the fitted curve lies close to the observed points, the model appears to have done its job. The paper by Annaert, Claes, De Ceuster, and Zhang shows why that conclusion can be premature.

For some values of λ, the slope and curvature loadings begin to resemble each other. Their columns in the design matrix become highly correlated, and X<sup>T</sup>X moves towards singularity. At that point, several very different combinations of β₁ and β₂ can generate almost the same fitted curve. The pricing error may remain small even as the estimated factors become implausibly large, jump from one day to the next, or respond sharply to a change of only a basis point in the underlying data.

<aside class="ns-callout">
  <strong>The curve may be stable even when the parameters behind it are not.</strong>
  This distinction matters as soon as the factors are used for something beyond drawing the curve—for example, forecasting, hedging, or interpreting a change in monetary-policy expectations.
</aside>

The authors address this problem with ridge regression. Rather than minimising only the squared fitting error, they add a penalty on the coefficient magnitudes:

<div class="ns-equation">β̂<sub>ridge</sub> = (X<sup>T</sup>X + αD<sup>T</sup>D)<sup>−1</sup>X<sup>T</sup>y</div>

The additional diagonal term makes the inverse better behaved. The resulting coefficients are biased towards smaller values, but their variance can fall substantially. Here, a small deterioration in the in-sample fit may be a reasonable price for factors that remain interpretable across adjacent dates. It is a familiar bias–variance trade-off, but in this setting the trade-off has a direct financial interpretation: are we fitting each day as closely as possible, or are we trying to recover movements that can be used consistently over time?

## What I take from the model

Nelson–Siegel is useful because it imposes enough structure to make the curve readable without trying to explain every small irregularity in the data. A spline may fit local movements more closely, while a fully specified term-structure model can impose stronger economic restrictions. Nelson–Siegel makes a different choice: it gives up some flexibility in return for a small number of factors whose shapes we can inspect and whose movements we can discuss.

There are important limits to that convenience. The basic model is not automatically arbitrage-free. Nor should yields on coupon-bearing bonds be inserted as though they were zero-coupon rates; in practice, the spot curve must be bootstrapped first, or the parameters must be estimated from bond prices through the model-implied discount factors. These are not minor implementation details. They determine what object is actually being fitted.

What stays with me from the ridge-regression extension is that yield-curve estimation has two layers. We need a curve that prices the cross-section reasonably well, but we also need to know whether its apparent level, slope, and curvature are genuinely identified by the data. A visually convincing curve answers the first question. It does not, by itself, answer the second.

<p class="ns-source"><strong>Primary reference:</strong> Annaert, J., Claes, A. G. P., De Ceuster, M. J. K., and Zhang, H. (2013), “<a href="https://doi.org/10.1016/j.iref.2013.01.005">Estimating the Spot Rate Curve Using the Nelson–Siegel Model: A Ridge Regression Approach</a>.”</p>

</article>

<script src="{{ '/assets/js/nelson-siegel.js' | relative_url }}"></script>
