import os
import re
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SERVICE_API_KEY = os.environ.get("SERVICE_API_KEY", "")
ALPHAGENOME_API_KEY = os.environ.get("ALPHAGENOME_API_KEY", "")

ag_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ag_client
    if ALPHAGENOME_API_KEY:
        try:
            from alphagenome.models import dna_client
            ag_client = dna_client.create(ALPHAGENOME_API_KEY)
            logger.info("AlphaGenome client initialized")
        except Exception as e:
            logger.warning(f"AlphaGenome client failed to init: {e}")
    else:
        logger.warning("ALPHAGENOME_API_KEY not set — running in simulation mode")
    yield
    ag_client = None

app = FastAPI(title="AlphaGenome Proxy", lifespan=lifespan)


class VariantRequest(BaseModel):
    chromosome: str
    position: int
    reference_allele: str
    alternate_allele: str
    gene: str
    hgvs_c: str
    hgvs_p: str | None = None


class PredictionResponse(BaseModel):
    variant_effect_score: float
    predicted_effect: str
    rna_seq_effect: float
    splice_effect_score: float
    splice_effect_type: str
    chromatin_effect: float
    confidence: float
    model_version: str
    prediction_time_ms: int
    source: str


def _auth(x_api_key: str):
    if not SERVICE_API_KEY:
        return
    if x_api_key != SERVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


@app.get("/health")
def health():
    return {"status": "ok", "ag_client_ready": ag_client is not None}


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    req: VariantRequest,
    x_api_key: str = Header(default=""),
):
    _auth(x_api_key)
    start = time.monotonic()

    if ag_client is not None:
        result = await _call_alphagenome(req, start)
    else:
        result = _simulate(req, start)

    return result


async def _call_alphagenome(req: VariantRequest, start: float) -> PredictionResponse:
    """Call the real AlphaGenome API via the Python SDK."""
    try:
        from alphagenome.data import genome
        from alphagenome.models import dna_client

        chrom = req.chromosome if req.chromosome.startswith("chr") else f"chr{req.chromosome}"

        variant = genome.Variant(
            chromosome=chrom,
            position=req.position,
            reference_bases=req.reference_allele,
            alternate_bases=req.alternate_allele,
        )
        interval = variant.reference_interval.resize(dna_client.SEQUENCE_LENGTH_1MB)

        variant_output = ag_client.predict_variant(
            interval=interval,
            variant=variant,
            requested_outputs=[dna_client.OutputType.RNA_SEQ],
        )

        ref_vals = np.array(variant_output.reference.values)
        alt_vals = np.array(variant_output.alternate.values)
        delta = alt_vals - ref_vals

        rna_delta = float(np.mean(delta))
        ves = float(min(1.0, max(0.0, np.mean(np.abs(delta)))))

        splice_score = 0.0
        splice_type = "none"
        if hasattr(variant_output, "splice_junction"):
            sj = np.array(variant_output.splice_junction.values) if variant_output.splice_junction else np.array([0.0])
            splice_score = float(np.max(np.abs(sj)))
            if splice_score > 0.5:
                splice_type = "splice_site_loss"

        chromatin = 0.0
        if hasattr(variant_output, "chromatin"):
            chromatin = float(np.mean(np.array(variant_output.chromatin.values) if variant_output.chromatin else [0.0]))

        if ves > 0.8:
            effect = "loss_of_function"
        elif splice_score > 0.5:
            effect = "splice_disruption"
        elif ves > 0.5:
            effect = "damaging_missense"
        elif ves > 0.2:
            effect = "tolerated_missense"
        else:
            effect = "benign"

        elapsed_ms = int((time.monotonic() - start) * 1000)
        return PredictionResponse(
            variant_effect_score=round(ves, 3),
            predicted_effect=effect,
            rna_seq_effect=round(rna_delta, 3),
            splice_effect_score=round(splice_score, 3),
            splice_effect_type=splice_type,
            chromatin_effect=round(chromatin, 3),
            confidence=0.92,
            model_version="alphagenome-v1",
            prediction_time_ms=elapsed_ms,
            source="alphagenome",
        )
    except Exception as e:
        logger.error(f"AlphaGenome API error: {e}, falling back to simulation")
        return _simulate(req, start)


def _simulate(req: VariantRequest, start: float) -> PredictionResponse:
    """Biologically-informed simulation when real API is unavailable."""
    import math, random

    hgvs_p = req.hgvs_p or ""
    hgvs_c = req.hgvs_c or ""

    is_frameshift = "fs" in hgvs_p
    is_nonsense = "*" in hgvs_p
    is_splice = bool(re.search(r"[+-][12]", hgvs_c)) or (
        ("+" in hgvs_c or "-" in hgvs_c) and any(c.isdigit() for c in hgvs_c)
    )
    is_inframe_del = "del" in hgvs_p and not is_frameshift
    is_missense = bool(hgvs_p) and not any([is_frameshift, is_nonsense, is_inframe_del])

    rng = random.Random(f"{req.chromosome}:{req.position}:{req.alternate_allele}")

    if is_frameshift or is_nonsense:
        ves = 0.92 + rng.random() * 0.07
        effect = "loss_of_function"
        rna = -0.7 - rng.random() * 0.25
        splice_score, splice_type = 0.1, "none"
        chromatin = -0.2 - rng.random() * 0.3
        confidence = 0.95
    elif is_splice:
        ves = 0.75 + rng.random() * 0.2
        effect = "splice_disruption"
        rna = -0.4 - rng.random() * 0.4
        splice_score = 0.8 + rng.random() * 0.18
        splice_type = rng.choice(["exon_skipping", "cryptic_activation", "intron_retention", "splice_site_loss"])
        chromatin = -0.1 - rng.random() * 0.2
        confidence = 0.88
    elif is_inframe_del:
        ves = 0.5 + rng.random() * 0.35
        effect = "protein_truncation"
        rna = -0.2 - rng.random() * 0.3
        splice_score, splice_type = 0.15, "none"
        chromatin = -0.1 - rng.random() * 0.1
        confidence = 0.82
    elif is_missense:
        pos_factor = math.sin(req.position / 10000) * 0.3 + 0.5
        ves = pos_factor * (0.3 + rng.random() * 0.5)
        effect = "damaging_missense" if ves > 0.6 else "tolerated_missense"
        rna = (rng.random() - 0.5) * 0.3
        splice_score, splice_type = 0.05 + rng.random() * 0.1, "none"
        chromatin = (rng.random() - 0.5) * 0.2
        confidence = 0.75 + rng.random() * 0.1
    else:
        ves = rng.random() * 0.25
        effect = "benign"
        rna = (rng.random() - 0.5) * 0.1
        splice_score, splice_type = rng.random() * 0.1, "none"
        chromatin = (rng.random() - 0.5) * 0.1
        confidence = 0.9

    ves = max(0.0, min(1.0, ves + (rng.random() - 0.5) * 0.05))
    elapsed_ms = int((time.monotonic() - start) * 1000)

    return PredictionResponse(
        variant_effect_score=round(ves, 3),
        predicted_effect=effect,
        rna_seq_effect=round(rna, 3),
        splice_effect_score=round(splice_score, 3),
        splice_effect_type=splice_type,
        chromatin_effect=round(chromatin, 3),
        confidence=round(confidence, 2),
        model_version="alphagenome-v0.6.1-sim",
        prediction_time_ms=elapsed_ms,
        source="estimated",
    )
