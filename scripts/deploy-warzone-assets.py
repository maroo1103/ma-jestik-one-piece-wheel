#!/usr/bin/env python3
"""Prépare les 27 visuels Warzone depuis le ZIP original ou optimisé.
Aucune donnée utilisateur, aucun Worker, aucune D1.
"""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
import hashlib
import json

ASSETS = Path("dist/assets")
OUT = ASSETS / "warzone"
OPTIMIZED = ASSETS / "warzone-pack.zip"
ORIGINAL = ASSETS / "lieux-et-map.zip"
LIMIT = 5 * 1024 * 1024

HAJIN = [
    ("14th Political Prison", "DMZ_Hajin_POI_Prison.webp"),
    ("Chang-san Air Base", "DMZ_Hajin_POI_Chang-San_Air_Base.webp"),
    ("Deadtown", "DMZ_Hajin_POI_Deadtown.webp"),
    ("Imjin Farmland", "DMZ_Hajin_POI_Imjin_Farmland.webp"),
    ("Cheongun Village", "DMZ_Hajin_POI_Cheongun_Village.webp"),
    ("Haneul Nuclear Reactor", "COD-WZ-HAJIN-HANEUL-NUCLEAR-REACTOR-POI.webp"),
    ("Mirae General Hospital", "DMZ_Hajin_POI_Mirae_General_Hospital.webp"),
    ("NuriGo Mall", "DMZ_Hajin_POI_NuriGO_Mall.webp"),
    ("Cheonwang Peak Array", "DMZ_Hajin_POI_Cheonwang_Peak_Array.webp"),
    ("The Grid", "DMZ_Hajin_POI_The_Grid.webp"),
    ("Songdo Wharf", "DMZ_Hajin_POI_Songdo_Wharf.webp"),
    ("Wolves Stadium", "DMZ_Hajin_POI_Wolves_Stadium.webp"),
    ("Hajin River Heights", "DMZ_Hajin_POI_Hajin_River_Heights.webp"),
]
ZODIAC = [
    ("Admin", "COD-WZ-ZODIAC-ADMIN.webp"),
    ("Trackline", "COD-WZ-ZODIAC-TRACKLINE.webp"),
    ("Furnace", "COD-WZ-ZODIAC-FURNACE.webp"),
    ("Solar", "COD-WZ-ZODIAC-SOLAR.webp"),
    ("Old Mines", "COD-WZ-ZODIAC-OLD-MINES.webp"),
    ("Dispatch", "COD-WZ-ZODIAC-DISPATCH.webp"),
    ("Depot", "COD-WZ-ZODIAC-DEPOT.webp"),
    ("Sentinel", "COD-WZ-ZODIAC-SENTINEL.webp"),
    ("Cooling", "COD-WZ-ZODIAC-COOLING.webp"),
    ("R&D", "COD-WZ-ZODIAC-R-D.webp"),
]
MAPS = {
    "hajin": ("carte hajin/carte-hajin-sans-poi.png", "carte hajin/carte-zoom-hajin.png"),
    "zodiac": ("carte zodiac/carte-zodiac-sans-poi.png", "carte zodiac/carte-zoom.png"),
}


def expected_paths():
    result = {f"hajin/poi-{i:02}.webp" for i in range(1, 14)}
    result |= {f"zodiac/poi-{i:02}.webp" for i in range(1, 11)}
    for game in ("hajin", "zodiac"):
        result |= {f"{game}/map-preview.webp", f"{game}/map-full.png"}
    return result


def store_file(relative, payload):
    if relative not in expected_paths():
        raise ValueError(f"Nom non autorisé : {relative}")
    if len(payload) > LIMIT:
        raise ValueError(f"Image trop volumineuse : {relative}")
    if relative.endswith(".webp") and (payload[:4] != b"RIFF" or payload[8:12] != b"WEBP"):
        raise ValueError(f"WebP invalide : {relative}")
    if relative.endswith(".png") and not payload.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"PNG invalide : {relative}")
    target = OUT / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(payload)
    return {"bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()}


def manifest_template():
    return {"format": "ma-jestik-warzone-assets", "version": 1, "games": {}, "files": {}}


def image_to_webp(blob, maximum):
    from PIL import Image
    with Image.open(BytesIO(blob)) as pic:
        pic.load()
        if pic.width * pic.height > 40_000_000:
            raise ValueError("Dimensions d'image trop grandes.")
        if pic.mode not in ("RGB", "RGBA"):
            pic = pic.convert("RGBA" if "A" in pic.getbands() else "RGB")
        pic.thumbnail((maximum, maximum), Image.Resampling.LANCZOS)
        buf = BytesIO()
        pic.save(buf, format="WEBP", quality=85, method=5)
        return buf.getvalue()


def install_original():
    with ZipFile(ORIGINAL) as z:
        files = {n for n in z.namelist() if not n.endswith("/")}
        expected_sources = {f"hajin/{source}" for _, source in HAJIN}
        expected_sources |= {f"Zodiac/{source}" for _, source in ZODIAC}
        for preview, full in MAPS.values():
            expected_sources.update((preview, full))
        if files != expected_sources or len(files) != len([n for n in z.namelist() if not n.endswith("/")]):
            raise ValueError("Le ZIP original ne contient pas exactement les 27 fichiers attendus.")
        if sum(z.getinfo(n).file_size for n in files) > 80 * 1024 * 1024:
            raise ValueError("L'archive est trop volumineuse.")
        manifest = manifest_template()
        for game, prefix, entries in (("hajin", "hajin", HAJIN), ("zodiac", "Zodiac", ZODIAC)):
            manifest["games"][game] = []
            for i, (name, source) in enumerate(entries, 1):
                location = f"{game}/poi-{i:02}.webp"
                data = image_to_webp(z.read(f"{prefix}/{source}"), 1100)
                manifest["files"][location] = store_file(location, data)
                manifest["games"][game].append({
                    "id": ("hj" if game == "hajin" else "zd") + f"{i:02}",
                    "name": name, "file": location, "sourceName": source
                })
            preview_source, full_source = MAPS[game]
            preview = f"{game}/map-preview.webp"
            full = f"{game}/map-full.png"
            manifest["files"][preview] = store_file(
                preview, image_to_webp(z.read(preview_source), 1024)
            )
            manifest["files"][full] = store_file(full, z.read(full_source))
    return manifest


def install_optimized():
    with ZipFile(OPTIMIZED) as z:
        names = z.namelist()
        expected = expected_paths()
        if len(names) != len(set(names)) or set(names) != expected | {"manifest.json"}:
            raise ValueError("Contenu du ZIP optimisé inattendu.")
        manifest = json.loads(z.read("manifest.json"))
        if (manifest.get("format") != "ma-jestik-warzone-assets"
            or manifest.get("version") != 1
            or set(manifest.get("files", {})) != expected
            or len(manifest.get("games", {}).get("hajin", [])) != 13
            or len(manifest.get("games", {}).get("zodiac", [])) != 10):
            raise ValueError("Manifeste Warzone non conforme.")
        for name in expected:
            data = z.read(name)
            found = store_file(name, data)
            if found != manifest["files"][name]:
                raise ValueError(f"Empreinte d'image incorrecte : {name}")
    return manifest


if __name__ == "__main__":
    if OPTIMIZED.exists():
        manifest = install_optimized()
        OPTIMIZED.unlink()  # le ZIP n'est pas servi publiquement
        print("Pack Warzone optimisé : 23 captures et 4 cartes installées.")
    elif ORIGINAL.exists():
        manifest = install_original()
        ORIGINAL.unlink()  # le ZIP original n'est pas servi publiquement
        print("Archive originale de l'utilisateur : 23 captures et 4 cartes installées.")
    else:
        print("Pas d'archive Warzone : les roues existantes restent accessibles.")
        raise SystemExit(0)
    if set(manifest["files"]) != expected_paths():
        raise ValueError("La liste des 27 assets Warzone est incomplète.")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
