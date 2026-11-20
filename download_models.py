"""
download_models.py
──────────────────
Télécharge et met en cache les modèles utilisés par le démonstrateur :

  - google/paligemma-3b-ft-rsvqa-hr-224  (RSVQA haute résolution)
  - google/paligemma-3b-ft-rsvqa-lr-224  (RSVQA basse résolution)
  - Salesforce/blip-vqa-base             (VQA généraliste)

Les fichiers vont dans le cache Hugging Face (~/.cache/huggingface/hub) et sont
réutilisés automatiquement par le backend. Les fichiers sont téléchargés sans
charger les modèles en mémoire.

Les modèles PaliGemma sont en accès restreint : il faut un compte Hugging Face,
avoir accepté leur licence, et un token. Il est cherché dans cet ordre :
  1. l'option --token hf_...
  2. la variable d'environnement HF_TOKEN
  3. la constante HF_TOKEN_DEFAULT ci-dessous (vide par défaut)
  4. le token enregistré par `hf auth login` (fait par les scripts d'installation)

Usage :
    python download_models.py
    python download_models.py --token hf_VOTRE_TOKEN
    python download_models.py --verify      (teste une inférence après coup)
"""

import argparse
import os
import sys
import time

# Optionnel : collez votre token ici (https://huggingface.co/settings/tokens).
# Ne publiez jamais ce fichier avec un token rempli.
HF_TOKEN_DEFAULT = ""

PALIGEMMA_MODELS = {
    "RSVQA-HR (haute résolution)": "google/paligemma-3b-ft-rsvqa-hr-224",
    "RSVQA-LR (basse résolution)": "google/paligemma-3b-ft-rsvqa-lr-224",
}
BLIP_MODEL = "Salesforce/blip-vqa-base"

# Fichiers utiles à transformers/PyTorch (on ignore les formats TF/JAX/.bin)
ALLOW_PATTERNS = ["*.json", "*.safetensors", "*.model", "*.txt"]


def find_token(cli_token):
    from huggingface_hub import get_token
    return cli_token or os.environ.get("HF_TOKEN") or HF_TOKEN_DEFAULT or get_token()


def download(label, model_id, token):
    from huggingface_hub import snapshot_download

    print(f"\n▶ {label}  ({model_id})", flush=True)
    start = time.time()
    try:
        snapshot_download(model_id, token=token, allow_patterns=ALLOW_PATTERNS)
    except Exception as e:
        print(f"\n[ERREUR] Téléchargement impossible : {e}")
        print("  Vérifiez que :")
        print("   1. votre token est valide  -> https://huggingface.co/settings/tokens")
        print(f"   2. la licence est acceptée -> https://huggingface.co/{model_id}")
        print("   3. votre connexion internet fonctionne")
        sys.exit(1)
    print(f"  ✔ prêt en {time.time() - start:.0f}s", flush=True)


def verify(model_id, token):
    """Charge le modèle depuis le cache et répond à une question sur une image noire."""
    import torch
    from PIL import Image
    from transformers import AutoProcessor, PaliGemmaForConditionalGeneration

    processor = AutoProcessor.from_pretrained(model_id, token=token)
    model = PaliGemmaForConditionalGeneration.from_pretrained(
        model_id, token=token, torch_dtype=torch.bfloat16
    ).eval()
    inputs = processor(text="<image> is there water?", images=Image.new("RGB", (224, 224)),
                       return_tensors="pt")
    with torch.no_grad():
        output = model.generate(**inputs, max_new_tokens=10, do_sample=False)
    answer = processor.decode(output[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    print(f"  ✔ {model_id} -> '{answer.strip() or '(vide)'}'")


def main():
    parser = argparse.ArgumentParser(description="Télécharge les modèles du démonstrateur RSVQA.")
    parser.add_argument("--token", help="Token Hugging Face")
    parser.add_argument("--verify", action="store_true", help="Tester une inférence après le téléchargement")
    args = parser.parse_args()

    try:
        import huggingface_hub  # noqa: F401
    except ImportError:
        print("[ERREUR] huggingface_hub manquant : pip install -r Backend/requirements.txt")
        sys.exit(1)

    token = find_token(args.token)
    if not token:
        print("[ERREUR] Aucun token Hugging Face trouvé.")
        print("  Connectez-vous avec :  hf auth login")
        print("  ou passez-le en option :  python download_models.py --token hf_...")
        sys.exit(1)

    print("=" * 60)
    print("  RSVQA - Téléchargement des modèles (~14 Go au total)")
    print("=" * 60)
    total = time.time()

    for label, model_id in PALIGEMMA_MODELS.items():
        download(label, model_id, token)
    download("BLIP VQA", BLIP_MODEL, None)

    if args.verify:
        print("\nVérification des modèles RSVQA...")
        for model_id in PALIGEMMA_MODELS.values():
            verify(model_id, token)

    print(f"\nTous les modèles sont en cache ({time.time() - total:.0f}s).")


if __name__ == "__main__":
    main()
