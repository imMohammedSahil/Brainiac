# Psychometrics Formulation and Scoring Engine

## 1. Metric Formulation

The assessment matrix consists of 20 empirical items distributed across 10 functional anatomical regions.

Let $r_i \in [1, 5]$ denote the raw user response for item $i$, where $1$ corresponds to "Strongly Disagree" and $5$ corresponds to "Strongly Agree".

### Valence Inversion

For items where a higher raw score indicates dysfunction, fatigue, or stress, valence inversion is applied:

$$r'_i = 6 - r_i$$

For standard positive items, $r'_i = r_i$.

---

## 2. Regional Normalization

Each brain region $k$ aggregates its corresponding subset of survey indices $I_k$:

$$S_k = \frac{\sum_{i \in I_k} (r'_i - 1)}{\sum_{i \in I_k} 4} \times 100$$

Where $S_k \in [0, 100]$.

---

## 3. Cognitive Pillars

| Region Index | Anatomical Region | Associated Cognitive Pillar | Valence Polarity |
| :--- | :--- | :--- | :--- |
| 1 | Prefrontal Cortex | Executive Function & Working Memory | Mixed |
| 2 | Anterior Cingulate | Error Detection & Cognitive Flexibility | Positive |
| 3 | Amygdala | Threat Detection & Emotional Regulation | Inverted |
| 4 | Hippocampus | Memory Consolidation & Spatial Context | Positive |
| 5 | Insular Cortex | Interoception & Somatic Awareness | Positive |
| 6 | Temporal Lobes | Auditory Processing & Semantic Memory | Positive |
| 7 | Parietal Lobes | Sensory Integration & Spatial Attention | Positive |
| 8 | Occipital Cortex | Visual Cognition & Spatial Mapping | Positive |
| 9 | Cerebellum | Motor Timing & Procedural Coordination | Positive |
| 10 | Brainstem / Reticular | Autonomic Homeostasis & Arousal Control | Inverted |
