import math
import logging
from app.schemas.lab1_schemas import LCGParams
from app.repositories.lab1_repository import Lab1Repository, lab1_repo
from app.exception_handlers.lab1_exception_handlers import ValidationException, BusinessLogicException

logger = logging.getLogger(__name__)


class Lab1Service:
    def __init__(self, repo: Lab1Repository):
        self.repo = repo
        logger.debug("Lab1Service initialized")

    def _validate_params(self, params: LCGParams):
        errors = []
        if params.m <= 0:
            errors.append("Parameter 'm' (modulus) must be greater than 0")
        if params.a <= 0:
            errors.append("Parameter 'a' (multiplier) must be greater than 0")
        if params.c < 0:
            errors.append("Parameter 'c' (increment) must be non-negative")
        if params.x0 < 0:
            errors.append("Parameter 'x0' (seed) must be non-negative")
        if params.x0 >= params.m:
            errors.append(f"Parameter 'x0' ({params.x0}) must be less than 'm' ({params.m})")

        if errors:
            logger.warning(f"Parameter validation failed: {errors}")
            raise ValidationException(
                "Invalid LCG parameters",
                details={"errors": errors, "params": params.dict()}
            )
        logger.debug(f"Parameters validated successfully: {params}")

    def _next(self, state: int, params: LCGParams) -> int:
        try:
            return (params.a * state + params.c) % params.m
        except ZeroDivisionError:
            logger.error(f"ZeroDivisionError in _next: params.m={params.m}")
            raise ValidationException("Invalid modulus parameter",
                                      details={"m": params.m, "message": "Modulus (m) cannot be zero"})

    async def generate_sequence(self, count: int, params: LCGParams) -> list[int]:
        if params is None:
            m, a, c, x0 = 67108863, 2197, 1597, 13
            params = LCGParams(a=a, c=c, m=m, x0=x0)
        else:
            m, a, c, x0 = params.m, params.a, params.c, params.x0
        self._validate_params(params)

        if count <= 0:
            raise ValidationException("Count must be greater than 0", details={"count": count})
        if count > 1_000_000:
            raise BusinessLogicException("Count too large", details={"count": count, "max": 1_000_000})

        logger.debug(f"Generating sequence: count={count}, a={params.a}, c={params.c}, m={params.m}")

        sequence = []
        state = params.x0
        for i in range(count):
            state = self._next(state, params)
            sequence.append(state)
            if i < 5:
                logger.debug(f"Generated[{i}]: {state}")

        logger.debug("Saving sequence to repository...")
        await self.repo.save_sequence(sequence)
        logger.debug("Sequence saved successfully")
        return sequence

    def check_period(self, params: LCGParams) -> dict:
        self._validate_params(params)
        logger.debug(f"Checking period: a={params.a}, c={params.c}, m={params.m}, x0={params.x0}")

        state = params.x0
        visited = {state: 0}
        limit = min(params.m + 1000, 2_000_000)
        logger.debug(f"Period check limit: {limit}")

        for i in range(1, limit):
            state = self._next(state, params)
            if state in visited:
                period = i - visited[state]
                start_index = visited[state]
                logger.info(f"Period found at iteration {i}: period={period}, start_index={start_index}")
                return {
                    "found": True,
                    "period": period,
                    "start_index": start_index
                }
            visited[state] = i
            if i % 10000 == 0:
                logger.debug(f"Period check progress: {i}/{limit} iterations")

        logger.warning(f"Period not found after {limit} iterations")
        return {"found": False, "period": 0, "start_index": -1}

    def cesaro_test(self, params: LCGParams, pairs: int = 10000) -> dict:
        self._validate_params(params)
        if pairs <= 0:
            raise ValidationException("Pairs must be greater than 0", details={"pairs": pairs})
        if pairs > 100_000:
            raise BusinessLogicException("Pairs count too large", details={"pairs": pairs, "max": 100_000})

        logger.debug(f"Starting Cesaro test: pairs={pairs}, a={params.a}, c={params.c}, m={params.m}")

        state = params.x0
        coprime_count = 0

        for i in range(pairs):
            val1 = self._next(state, params)
            state = val1
            val2 = self._next(state, params)
            state = val2

            if self._gcd(val1, val2) == 1:
                coprime_count += 1

            if (i + 1) % 2000 == 0:
                logger.debug(f"Cesaro progress: {i + 1}/{pairs} pairs, coprime={coprime_count}")

        prob = coprime_count / pairs
        pi_est = math.sqrt(6 / prob) if prob > 0 else 0
        deviation = abs(math.pi - pi_est)

        logger.info(f"Cesaro test results: coprime_pairs={coprime_count}/{pairs} ({prob:.4f})")

        return {
            "pi_estimate": pi_est,
            "deviation": deviation,
            "pairs_tested": pairs
        }

    def _gcd(self, a, b):
        while b:
            a, b = b, a % b
        return a

def get_lab1_service() -> Lab1Service:
    return Lab1Service(repo=lab1_repo)
