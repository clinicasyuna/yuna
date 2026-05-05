import argparse
import base64
import json
import os
import sys
import urllib.parse
import urllib.error
import urllib.request
from pathlib import Path

from nacl import encoding, public


def gh_request(method: str, url: str, token: str, payload: dict | None = None) -> dict:
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url=url, method=method, data=data)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if payload is not None:
        req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            if not raw:
                return {}
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"GitHub API error {exc.code} on {url}: {body}") from exc


def encrypt_secret(public_key_b64: str, secret_value: str) -> str:
    public_key = public.PublicKey(public_key_b64.encode("utf-8"), encoding.Base64Encoder())
    sealed_box = public.SealedBox(public_key)
    encrypted = sealed_box.encrypt(secret_value.encode("utf-8"))
    return base64.b64encode(encrypted).decode("utf-8")


def set_secret(owner: str, repo: str, token: str, secret_name: str, secret_value: str) -> None:
    key_url = f"https://api.github.com/repos/{owner}/{repo}/actions/secrets/public-key"
    key_data = gh_request("GET", key_url, token)
    key_id = key_data["key_id"]
    key = key_data["key"]

    encrypted_value = encrypt_secret(key, secret_value)

    put_url = f"https://api.github.com/repos/{owner}/{repo}/actions/secrets/{secret_name}"
    gh_request(
        "PUT",
        put_url,
        token,
        {
            "encrypted_value": encrypted_value,
            "key_id": key_id,
        },
    )


def dispatch_workflow(owner: str, repo: str, token: str, workflow_name: str, ref: str) -> None:
    workflow_path = urllib.parse.quote(workflow_name, safe="")
    url = f"https://api.github.com/repos/{owner}/{repo}/actions/workflows/{workflow_path}/dispatches"
    gh_request("POST", url, token, {"ref": ref})


def parse_repo(repo_full: str) -> tuple[str, str]:
    parts = repo_full.split("/")
    if len(parts) != 2 or not parts[0] or not parts[1]:
        raise ValueError("Repositorio deve estar no formato owner/repo")
    return parts[0], parts[1]


def main() -> int:
    parser = argparse.ArgumentParser(description="Configura GitHub Actions secrets e dispara workflow")
    parser.add_argument("--repo", default="Samukajr/clinicasyuna", help="Repositorio no formato owner/repo")
    parser.add_argument("--firebase-file", default="firebase-service-account.json", help="Arquivo JSON da service account")
    parser.add_argument("--admin-url", default="https://clinicasyuna.github.io/yuna/admin/", help="URL do admin")
    parser.add_argument("--workflow", default="SLA Push Alerts", help="Nome exato do workflow")
    parser.add_argument("--ref", default="main", help="Branch/ref para disparar o workflow")
    args = parser.parse_args()

    token = os.getenv("GITHUB_TOKEN", "").strip()
    if not token:
        print("[ERRO] Variavel de ambiente GITHUB_TOKEN nao definida.")
        return 1

    firebase_path = Path(args.firebase_file)
    if not firebase_path.exists():
        print(f"[ERRO] Arquivo nao encontrado: {firebase_path}")
        return 1

    try:
        owner, repo = parse_repo(args.repo)
        firebase_json = firebase_path.read_text(encoding="utf-8")

        print(f"[INFO] Configurando secrets em {owner}/{repo}...")

        set_secret(owner, repo, token, "FIREBASE_SERVICE_ACCOUNT_JSON", firebase_json)
        print("[OK] Secret FIREBASE_SERVICE_ACCOUNT_JSON configurado")

        set_secret(owner, repo, token, "YUNA_ADMIN_URL", args.admin_url)
        print("[OK] Secret YUNA_ADMIN_URL configurado")

        dispatch_workflow(owner, repo, token, args.workflow, args.ref)
        print(f"[OK] Workflow '{args.workflow}' disparado em '{args.ref}'")

        print(f"[OK] Acompanhe em: https://github.com/{owner}/{repo}/actions")
        return 0
    except Exception as exc:
        print(f"[ERRO] {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
