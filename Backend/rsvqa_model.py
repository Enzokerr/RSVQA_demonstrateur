# Modèles disponibles :
#   - google/paligemma-3b-ft-rsvqa-hr-224
#   - google/paligemma-3b-ft-rsvqa-lr-224 


# Token Hugging Face (accès aux modèles PaliGemma).
# Laissez vide si vous vous êtes connecté avec `hf auth login` (fait par les
# scripts d'installation) ; sinon collez votre token entre les guillemets.
# Ne publiez jamais ce fichier avec un token rempli.
HF_TOKEN = ""


from PIL import Image
import torch
from transformers import AutoProcessor, PaliGemmaForConditionalGeneration



_MODELS = {
    "hr": {
        "model_id":  "google/paligemma-3b-ft-rsvqa-hr-224",
        "processor": None,
        "model":     None,
    },
    "lr": {
        "model_id":  "google/paligemma-3b-ft-rsvqa-lr-224",
        "processor": None,
        "model":     None,
    },
}


def _load_model(resolution: str):
    """Charge le modèle demandé en mémoire"""
    entry = _MODELS[resolution]

    if entry["model"] is not None:
        return  # déjà chargé

    model_id = entry["model_id"]
    label    = resolution.upper()

    print(f"[RSVQA-{label}] Chargement de {model_id}...")
    print(f"[RSVQA-{label}] Premier lancement : téléchargement ~7 Go, patientez...")

    if torch.cuda.is_available():
        dtype  = torch.float16
        device = "cuda"
        print(f"[RSVQA-{label}] GPU détecté → float16")
    else:
        dtype  = torch.float32
        device = "cpu"
        print(f"[RSVQA-{label}] Pas de GPU → float32 sur CPU (plus lent, mais fonctionnel)")

    entry["processor"] = AutoProcessor.from_pretrained(
        model_id,
        token=HF_TOKEN or None,
    )

    entry["model"] = PaliGemmaForConditionalGeneration.from_pretrained(
        model_id,
        token=HF_TOKEN or None,
        torch_dtype=dtype,
    ).to(device)

    entry["model"].eval()
    print(f"[RSVQA-{label}] Modèle prêt ✓")


def rsvqa_inference(image: Image.Image, question: str, resolution: str = "hr") -> str:
    """
    Répond à une question sur une image satellite.
    Renvoie une réponse texte
    """
    if resolution not in _MODELS:
        raise ValueError(f"Resolution inconnue : {resolution!r}. Utilisez 'hr' ou 'lr'.")

    _load_model(resolution)

    entry  = _MODELS[resolution]
    device = next(entry["model"].parameters()).device

    # PaliGemma-RSVQA attend le format : "<image> question"
    prompt = f"<image> {question}"

    inputs = entry["processor"](
        text=prompt,
        images=image,
        return_tensors="pt",
    ).to(device)

    with torch.no_grad():
        output_ids = entry["model"].generate(
            **inputs,
            max_new_tokens=50,
            do_sample=False,
        )

    nb_input_tokens = inputs["input_ids"].shape[1]
    generated_ids   = output_ids[0][nb_input_tokens:]
    reponse = entry["processor"].decode(generated_ids, skip_special_tokens=True).strip()

    return reponse if reponse else "Aucune réponse générée."
