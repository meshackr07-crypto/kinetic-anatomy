# Content Guide

## Disclaimer (show on every stance and muscle page)
> This site is for education. It is not medical advice, diagnosis, or a training program. See a qualified professional before starting or changing physical training, and stop if you feel pain.

## Standards
- Use standard anatomical names with a plain-language alias (example: Quadriceps femoris, "front thigh").
- Every stance and muscle starts as `draft`. It becomes `approved` only after the reviewer (D-2) signs off.
- Do not state injury causes or cures as fact unless a reviewer confirms them.
- Record where each fact came from in the `physiology` JSON under `sources`.
- Record every 3D model, image, and text license here:

| Asset | Source | License | Allows commercial web use? |
|---|---|---|---|
| (fill in) | | | |

## Stance page sections
1. Name, native name, style
2. Short description
3. Body position: feet, knees, hips, spine, arms
4. Muscles by role: primary, stabilizer, stretched
5. Joints and their angles
6. Physiology: balance and center of mass, breathing, energy demand, common errors, injury risks and prevention
7. Disclaimer

## Physiology JSON shape
```json
{
  "balance": "text",
  "breathing": "text",
  "energy": "text",
  "common_errors": ["text"],
  "injury_risks": ["text"],
  "prevention": ["text"],
  "sources": ["text"]
}
```

## Starter muscle list (names only; reviewer fills in details)
Lower body: Gluteus maximus, Gluteus medius, Quadriceps femoris, Hamstrings, Adductor group, Gastrocnemius, Soleus, Tibialis anterior, Iliopsoas
Core: Rectus abdominis, External obliques, Internal obliques, Transversus abdominis, Erector spinae, Multifidus
Upper body: Latissimus dorsi, Trapezius, Rhomboids, Deltoids, Pectoralis major, Biceps brachii, Triceps brachii, Forearm flexors and extensors, Rotator cuff

## Starter joint list
Ankle, Knee, Hip, Lumbar spine, Thoracic spine, Cervical spine, Scapulothoracic, Shoulder (glenohumeral), Elbow, Wrist

## Starter stances (final list depends on D-3)
Horse stance (Kiba-dachi), Front stance (Zenkutsu-dachi), Back stance (Kokutsu-dachi), Cat stance, Fighting guard (boxing), Muay Thai guard, Taekwondo fighting stance, Sanchin stance, BJJ closed guard, BJJ mount
