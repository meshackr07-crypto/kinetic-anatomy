# 3D Body Model Plan (Decision D-1)

Status: **proposed, awaiting Jason's approval**. No model file has been
downloaded or committed. Do not download or commit any model until Jason
approves this plan.

Goal (from `docs/3D_GUIDE.md`): one rigged `public/models/body.glb` file with
a named humanoid skeleton plus separate named meshes for skin, muscles, and
bones. Bone names must match `joints.bone_name`, muscle mesh names must match
`muscles.mesh_name`. Target: under 5 MB after compression, under 100,000
triangles, smooth on a mid-range phone.

---

## 1. Open datasets

### 1a. Z-Anatomy

- What it is: an open-source 3D human anatomy atlas built in Blender.
  Separate named meshes for muscles, bones, organs, vessels.
- Formats available: `.blend` (from the author's Google Drive folder) and
  FBX (in the GitHub repo under `Resources/Models/FBX`).
- Rig: ships as **static meshes, no skeleton/armature included**
  (VERIFIED 2026-09-28: inspected all four FBX files in Blender —
  0 armatures; meshes carry `.l`/`.r` side variants for muscles and
  mirrored `.s`/`.t` variants for bones. Our own armature is required.)
- License (quoted from the official GitHub README and LICENSE file):
  **"Creative Commons Attribution-ShareAlike 4.0 International License"**
  (CC BY-SA 4.0).
- Commercial website use: **yes, allowed** — CC BY-SA 4.0 permits commercial
  use.
- What it requires from us:
  1. **Credit**: name Z-Anatomy and link the license on the site (an
     "Attribution / licenses" page plus a line on stance pages is enough).
  2. **Share-alike**: our adapted body model (`body.glb`) is a derivative
     work, so it must be shared under **the same license (CC BY-SA 4.0)**.
     Practically: keep a `LICENSE-3D.md` next to the model, and record the
     asset in `docs/CONTENT_GUIDE.md` as the project rules require.

### 1b. BodyParts3D (Database Center for Life Science, Japan)

- What it is: a research database of human body parts as polygon meshes,
  each part mapped to a standard anatomy concept (FMA ontology). Good for
  checking official part names.
- Format: Wavefront OBJ static meshes (polygon data, several density
  levels). **No skeleton, no rig.**
- License (quoted from the official LSDB license page and dataset README):
  **"Creative Commons Attribution-Share Alike 2.1 Japan"** (CC BY-SA 2.1 Japan).
- Required credit line (quoted from the official README):
  "BodyParts3D, Copyright © 2008 The Database Center for Life Science
  licensed by CC Attribution-Share Alike 2.1 Japan".
- Commercial website use: **yes, allowed** under CC BY-SA 2.1 Japan, with:
  1. The credit line above shown with the content.
  2. **Share-alike**: derivatives distributed under the same license, and
     the Additional License asks you to display the license text with the
     derivative and to cite the database in any papers.
- Fit for us: usable as a **name reference and fallback mesh source**, but
  awkward as the main body (parts are separate OBJs with no skeleton, old
  geometry, extra assembly work).

### 1c. OpenStax Anatomy & Physiology (text reference, not a model)

- The 1st edition is licensed **"Creative Commons Attribution 4.0
  International (CC BY)"** — commercial reuse allowed with attribution.
- Warning: the **2nd edition is CC BY-NC-SA 4.0 (non-commercial)**. Because
  Jason has not decided free vs paid yet (D-4), **only the 1st edition
  (CC BY 4.0) may be used** as a text source, so the paid option stays open.
- Use: verify muscle actions and attachment wording during content review.
  Every fact still needs the D-2 reviewer's sign-off before `approved`.

---

## 2. Paid, licensed, rigged models

| Option | Price (checked Sept 2026) | License terms for our use |
|---|---|---|
| Daz 3D figure + anatomy add-ons | Per-product price on each product page (varies, roughly tens of USD per item); the **Interactive License** is a paid add-on per product | The free Standard License covers **2D renders only**. A website that poses/animates the 3D data in the browser needs an **Interactive License** for each asset, and only if the product's creator offers one. The asset must stay embedded and not be extractable. Full terms: EULA Section 3.0 |
| Zygote (makers of ZygoteBody) | Viewer subscriptions ($4/month Premium, $98/month Professional) are **viewer access only, not models**. Real-time/software model licenses are **custom quote, usually with royalties or subscription fees** | Allows embedding models in distributed software, but Zygote must approve; content must be protected from extraction. Contact Zygote sales for a quote |
| TurboSquid Royalty-Free models | Per-model price on each product page (no royalties after purchase) | Royalty-Free license allows interactive software use, BUT the model must be in a **proprietary format that cannot be opened in public software**. Our architecture serves an open `.glb` that anyone can download and open in Blender — the license text explicitly lists only Unity/Unreal/Lumberyard/Stingray WebGL exports as permitted and **prohibits other open WebGL formats**. **TurboSquid models are therefore a poor fit unless our delivery method changes — flagged as a blocker for this option** |
| Adobe Mixamo (free auto-rigger + characters) | Free with an Adobe account | Unlimited commercial and non-commercial use, no credit required, BUT **raw character/animation files may not be redistributed**. Serving our final `.glb` publicly is arguably redistribution — do not ship a Mixamo character as `body.glb` without legal advice. Using the auto-rigger on our own mesh is lower-risk but still uses Adobe's service on our content |

Bottom line: no paid option gives us "buy once, ship an open GLB" without
strings attached. The cleanest legal path for an open `.glb` served to
browsers is a **share-alike open dataset (Z-Anatomy)** with proper credit.

---

## 3. Recommended pipeline (step by step)

**Recommended choice: Z-Anatomy meshes + our own Blender armature.**

1. **Download** (after Jason approves): Z-Anatomy `.blend` collection from
   the author's Drive folder (link in the GitHub README). Nothing else.
2. **Select and clean** in Blender: keep one skin surface, the ~24 starter
   muscles from `docs/CONTENT_GUIDE.md`, and the major bones. Delete organs,
   vessels, nerves for v1 (they return later as extra layers). Decimate to
   stay under 100,000 triangles total.
3. **Build the skeleton**: add a Blender armature with one bone per entry in
   the `joints` table (ankle → wrist, plus hips/spine). Freeze a naming
   convention (Mixamo-style names such as `Hips`, `LeftUpLeg`, `LeftLeg`
   match the pose JSON example in `docs/3D_GUIDE.md`) and write every
   `joints.bone_name` to match exactly.
4. **Attach (skinning)**: parent each muscle mesh to the armature with
   automatic weights, then hand-fix the big joints (shoulder, hip, knee).
   Rename every muscle mesh to its `muscles.mesh_name` exactly
   (e.g. `QuadricepsFemoris_L` style — exact strings frozen in T-030).
5. **Export headless to GLB** (no Blender window needed):
   `blender -b cleaned.blend -P export_glb.py` where the script calls
   `bpy.ops.export_scene.gltf(filepath="body.glb", export_format="GLB")`.
   Flags `-b/--background` and `-P/--python` are the official Blender
   command-line interface (see Blender manual, "Command Line Arguments").
6. **Compress and inspect**:
   `gltf-transform optimize body.glb body.opt.glb --compress draco`
   (or `--compress meshopt`), then `gltf-transform inspect body.opt.glb`
   to check triangle count and size. Official tool: `@gltf-transform/cli`.
7. **Phone test**: serve the file, load it on a real mid-range Android
   phone over 4G, confirm first render under ~4 seconds and smooth orbit.
   If over 5 MB: reduce texture sizes first, then decimate, then split
   muscle groups into a second lazy-loaded file.
8. **Record**: license + credit in `docs/CONTENT_GUIDE.md`, `LICENSE-3D.md`
   next to the model, share `body.glb` under CC BY-SA 4.0.

Fallback if Z-Anatomy quality disappoints: BodyParts3D meshes for names +
commission a clean-up pass from a 3D artist (budget decision for Jason).

---

## 4. Anatomical landmarks needed for the first 10 stances

Stances (starter list from `docs/CONTENT_GUIDE.md`; final list needs D-3):
Horse stance (Kiba-dachi), Front stance (Zenkutsu-dachi), Back stance
(Kokutsu-dachi), Cat stance, Boxing fighting guard, Muay Thai guard,
Taekwondo fighting stance, Sanchin stance, BJJ closed guard, BJJ mount.

The rig must expose **all 10 starter joints** (so every stance is posable):
ankle, knee, hip, lumbar spine, thoracic spine, cervical spine,
scapulothoracic, shoulder (glenohumeral), elbow, wrist — on both body sides
where applicable.

The mesh set must contain **all 24 starter muscles** as separately named
meshes: gluteus maximus, gluteus medius, quadriceps femoris, hamstrings,
adductor group, gastrocnemius, soleus, tibialis anterior, iliopsoas, rectus
abdominis, external obliques, internal obliques, transversus abdominis,
erector spinae, multifidus, latissimus dorsi, trapezius, rhomboids, deltoids,
pectoralis major, biceps brachii, triceps brachii, forearm flexors/extensors,
rotator cuff.

- Muscle **actions and attachment points (origin/insertion)**: UNVERIFIED —
  the seed data has names only. Source to check: OpenStax A&P 1st edition
  (CC BY 4.0). Final wording requires D-2 reviewer approval.
- **Which muscles are primary / stabilizer / stretched in each stance**:
  UNVERIFIED — draft content for the reviewer, not facts yet.
- **Joint angles per stance**: UNVERIFIED — captured with the pose tool
  (T-040) and checked by the reviewer (T-041).
- Part-name spelling reference: BodyParts3D/FMA concept names.

---

## 5. Recommendation, risks, time, and what Jason must do

**Recommendation**: approve Z-Anatomy (CC BY-SA 4.0) as the mesh source,
build our own armature in Blender, serve the adapted `body.glb` under
CC BY-SA 4.0 with credit. It is free, commercial-safe, editable, and the
share-alike duty (publish our adapted file under the same license) costs us
nothing on an education site.

**Main risks**:
1. Z-Anatomy has no skeleton — rigging/skinning is skilled manual work; bad
   weights make knees and shoulders look broken.
2. Share-alike is viral by design: any site using our `body.glb` must also
   credit and share alike — fine for us, but no taking it proprietary later
   without re-modeling.
3. File size: a full muscle set easily exceeds 5 MB; expect 2–3 compression
   rounds and possibly dropping small muscles from v1.
4. TurboSquid-style marketplaces are **not** compatible with serving an open
   GLB — do not buy models there for this architecture.
5. Anatomy accuracy liability: no stance is published until the D-2 reviewer
   approves it; the disclaimer ships on every page regardless.

**Rough time per stage** (agent + Jason review time, part-time):
download + select meshes 0.5 day; cleanup + decimate 1–2 days; armature +
naming 1 day; skinning + fixing weights 2–3 days; headless export +
compression + phone test 1 day; docs + license records 0.5 day.
Total roughly **1.5–2 weeks** before T-030 can use the file.

**Jason must install or decide**:
1. Install Blender (free, blender.org) only if he wants to open the model
   himself — not required; the agent runs it headless.
2. Decide D-1: approve or reject this Z-Anatomy recommendation (blocks T-030).
3. Decide D-3 (which martial arts first) and D-2 (who reviews anatomy) —
   needed before stance content starts.
4. Nothing to buy. No accounts needed for this stage.

---

## Sources (every URL consulted)

- Z-Anatomy repo, license and model formats:
  https://github.com/LluisV/Z-Anatomy
- Z-Anatomy viewer site: https://www.z-anatomy.com/
- BodyParts3D top/app page: https://lifesciencedb.jp/bp3d/
- BodyParts3D license page:
  https://lifesciencedb.jp/bp3d/info_en/license/index.html
- BodyParts3D use license (LSDB Archive):
  https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- BodyParts3D dataset README (license + OBJ polygon data):
  https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20090209/README_e.html
- CC BY-SA 4.0 deed: http://creativecommons.org/licenses/by-sa/4.0/
- OpenStax Anatomy & Physiology 1e preface (CC BY 4.0):
  https://openstax.org/books/anatomy-and-physiology/pages/preface
- OpenStax Anatomy & Physiology 2e preface (CC BY-NC-SA, do not use):
  https://openstax.org/books/anatomy-and-physiology-2e/pages/preface
- Daz 3D Interactive License info:
  https://www.daz3d.com/interactive-license-info
- Daz 3D EULA (Section 3.0): https://www.daz3d.com/eula
- Daz 3D Interactive License explainer:
  https://www.daz3d.com/blog/daz-3d-interactive-license
- Zygote real-time licensing FAQ: https://www.zygote.com/help
- ZygoteBody pricing (viewer only): https://www.zygotebody.com/pricing
- ZygoteBody terms: https://www.zygotebody.com/terms
- TurboSquid Royalty Free License:
  https://www.turbosquid.com/help/en/articles/9937422-royalty-free-license
- TurboSquid Royalty Free FAQ (software/game conditions):
  https://www.turbosquid.com/help/en/articles/9937423-royalty-free-license-faq
- Adobe Mixamo licensing FAQ (community):
  https://community.adobe.com/questions-696/mixamo-faq-licensing-royalties-ownership-eula-and-tos-589400
- Blender manual, command-line arguments (`-b`, `-P`, `--python-expr`):
  https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html
- Khronos Blender-to-glTF converter tutorial (headless pattern):
  https://github.khronos.org/glTF-Tutorials/BlenderGltfConverter/
- glTF-Transform CLI docs (optimize/draco/meshopt/inspect):
  https://gltf-transform.dev/cli
- glTF-Transform repo: https://github.com/donmccurdy/glTF-Transform
