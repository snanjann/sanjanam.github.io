"""Reproduce the simulation in 'When a Good Yield-Curve Fit Lies'."""

import numpy as np

SEED = 42
SIMULATIONS = 5_000
NOISE_SD = 0.01  # one basis point when yields are in percentage points

MATURITIES = np.array([0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30])
BETA_TRUE = np.array([5.0, -2.4, 2.8])
LAMBDA = 0.02  # deliberately ill-conditioned stress case
PENALTIES = [0.0, 0.00001, 0.0001, 0.001, 0.01]


def loadings(tau: np.ndarray, lam: float) -> np.ndarray:
    x = lam * tau
    slope = (1.0 - np.exp(-x)) / x
    curvature = slope - np.exp(-x)
    return np.column_stack([np.ones_like(tau), slope, curvature])


def estimator_matrix(x: np.ndarray, alpha: float) -> np.ndarray:
    if alpha == 0:
        return np.linalg.pinv(x)
    penalty = np.diag([0.0, 1.0, 1.0])
    return np.linalg.solve(x.T @ x + alpha * penalty, x.T)


def run() -> None:
    rng = np.random.default_rng(SEED)
    x = loadings(MATURITIES, LAMBDA)
    true_yields = x @ BETA_TRUE
    noise = rng.normal(0.0, NOISE_SD, size=(SIMULATIONS, len(MATURITIES)))
    simulated_yields = true_yields + noise

    print(f"condition number: {np.linalg.cond(x):.2f}")
    print(f"slope-curvature correlation: {np.corrcoef(x[:, 1], x[:, 2])[0, 1]:.4f}")
    print("alpha,rmse_noisy_bp,rmse_true_bp,sd_beta0_bp,sd_beta1_bp,sd_beta2_bp")

    for alpha in PENALTIES:
        mapping = estimator_matrix(x, alpha)
        betas = simulated_yields @ mapping.T
        fitted = betas @ x.T
        rmse_noisy = np.sqrt(np.mean((simulated_yields - fitted) ** 2, axis=1))
        rmse_true = np.sqrt(np.mean((true_yields - fitted) ** 2, axis=1))
        sd_beta = betas.std(axis=0)
        values = [alpha, rmse_noisy.mean() * 100, rmse_true.mean() * 100, *(sd_beta * 100)]
        print(",".join(f"{value:.5f}" for value in values))


if __name__ == "__main__":
    run()
