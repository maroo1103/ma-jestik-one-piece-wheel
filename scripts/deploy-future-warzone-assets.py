#!/usr/bin/env python3
"""Complète le pack Warzone existant, un jeu à la fois, sans changer Fortnite.
Rebirth et Verdansk restent absents du sélecteur tant que la liste exacte
de leurs photos et leurs deux cartes n'a pas été publiée avec succès.

Paquets attendus :
  dist/assets/rebirth-pack.zip
  dist/assets/verdansk-pack.zip
Chaque archive contient strictement <jeu>/poi-01.webp ... poi-NN.webp,
<jeu>/map-preview.webp (carte SANS noms) et <jeu>/map-full.png (carte AVEC noms).
Aucun fichier HTML/JS distant, aucun Worker, aucune D1.
"""
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile, BadZipFile
import hashlib
import json

from PIL import Image, UnidentifiedImageError

ROOT = Path("dist/assets")
OUTPUT = ROOT / "warzone"
MANIFEST = OUTPUT / "manifest.json"
SOURCES = {
    "rebirth": (
        13,
        ["Bioweapons", "Industries", "Chemical Engineering", "Dock", "Turbine",
         "Control Center", "Prison", "Harbor", "Headquarters", "Factory",
         "Living Quarters", "Outpost", "Stronghold"],
        "rb",
    ),
    "verdansk": (
        21,
        ["Dam", "Military Base", "Quarry", "Airport", "TV Station",
         "Storage Town", "Superstore", "Stadium", "Lumber", "Boneyard",
         "Train Station", "Hospital", "Downtown", "Farmland",
         "Promenade West", "Promenade East", "Hills", "Park", "Port",
         "Prison", "Drone Labs"],
        "vd",
    ),
}
# Empêche ZIP bombs / décompressions malicieuses et poids excessif sur Pages.
MAX_ENTRY = 5 * 1024 * 1024
MAX_ARCHIVE_UNPACKED = 95 * 1024 * 1024


def expected(game, count):
    return {
        *(f"{game}/poi-{i:02}.webp" for i in range(1, count + 1)),
        f"{game}/map-preview.webp",
        f"{game}/map-full.png",
    }


def validated_file(file, path):
    if len(file) > MAX_ENTRY:
        raise ValueError(f"{path} dépasse la taille autorisée.")
    if path.endswith(".webp"):
        if not (file[:4] == b"RIFF" and file[8:12] == b"WEBP"):
            raise ValueError(f"{path} ne semble pas être un WebP.")
    elif not file.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"{path} ne semble pas être un PNG.")
    try:
        with Image.open(BytesIO(file)) as img:
            img.verify()
        with Image.open(BytesIO(file)) as img:
            if img.width * img.height > 36_000_000:
                raise ValueError(f"{path} a des dimensions déraisonnables.")
            if img.width < 180 or img.height < 150:
                raise ValueError(f"{path} est trop petit pour un visuel de lieu.")
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError(f"{path} est une image invalide.") from exc
    return {"bytes": len(file), "sha256": hashlib.sha256(file).hexdigest()}


def archive_path(game):
    """Le propriétaire a conservé le nom « Rebirth island.zip » au dépôt.
    Reconnaître aussi ce nom sans renommer le ZIP ni modifier les anciens lots.
    """
    canonical = ROOT / f"{game}-pack.zip"
    if canonical.exists():
        return canonical
    if game == "rebirth":
        return ROOT / "Rebirth island.zip"
    return canonical


def import_pack(game, count, names, prefix, manifest):
    archive = archive_path(game)
    if not archive.exists():
        return False
    expected_names = expected(game, count)
    with ZipFile(archive) as z:
        names_in_zip = [info.filename for info in z.infolist() if not info.is_dir()]
        if len(names_in_zip) != len(set(names_in_zip)) or set(names_in_zip) != expected_names:
            raise ValueError(
                f"Archive {archive} invalide : {len(expected_names)} fichiers attendus, "
                f"{len(names_in_zip)} reçus (ne pas modifier le site si incomplet)."
            )
        if sum(z.getinfo(name).file_size for name in expected_names) > MAX_ARCHIVE_UNPACKED:
            raise ValueError("Archive décompressée trop lourde.")
        payloads = {}
        for name in sorted(expected_names):
            payload = z.read(name)
            manifest["files"][name] = validated_file(payload, name)
            payloads[name] = payload
    # Le manifeste n'est publié qu'après vérification de toutes les images.
    for name, payload in payloads.items():
        output = OUTPUT / name
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(payload)
    manifest["games"][game] = [
        {"id": prefix + f"{i:02}", "name": title,
         "file": f"{game}/poi-{i:02}.webp"}
        for i, title in enumerate(names, 1)
    ]
    archive.unlink()  # absent de l'artefact GitHub Pages, présent en source GitHub.
    return True


def main():
    available = [game for game in SOURCES if archive_path(game).exists()]
    if not available:
        print("Rebirth et Verdansk non fournis : modèles masqués et QG inchangé.")
        return
    if not MANIFEST.exists():
        raise ValueError("Manifeste Hajin/Zodiac absent : ne pas publier de roues incomplètes.")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if (manifest.get("format") != "ma-jestik-warzone-assets"
        or manifest.get("version") != 1
        or len(manifest.get("games", {}).get("hajin", [])) != 13
        or len(manifest.get("games", {}).get("zodiac", [])) != 10):
        raise ValueError("Le manifeste de référence Warzone est incorrect.")
    for game in available:
        count, names, prefix = SOURCES[game]
        if import_pack(game, count, names, prefix, manifest):
            print(f"Pack {game} vérifié : {count} photos authentiques + 2 cartes.")
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
