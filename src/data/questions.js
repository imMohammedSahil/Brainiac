export const questions = [
  /* ══════════════════════════════════════════════════
     PILLAR 01: EXECUTIVE CONTROL
     ══════════════════════════════════════════════════ */
  {
    id: 1,
    section: "Executive Control",
    region: "Prefrontal Cortex",
    reverse: false,
    text: "When you settle in to work on something meaningful to you, how easily does your mind find its calm, focused flow?",
    options: [
      { label: "I immerse myself deeply with ease, staying grounded in the moment.", value: 5 },
      { label: "I focus well, gently returning to flow whenever small distractions pass.", value: 4 },
      { label: "My focus ebbs and flows throughout the day, and I work with it as best I can.", value: 3 },
      { label: "I often feel pulled in many directions and find it hard to settle in.", value: 2 },
      { label: "Staying with one task for long feels exhausting and difficult right now.", value: 1 }
    ]
  },
  {
    id: 2,
    section: "Executive Control",
    region: "Prefrontal Cortex",
    reverse: false,
    text: "Before stepping into an important choice or commitment, how do you tend to reflect?",
    options: [
      { label: "I take thoughtful time to weigh what aligns best with my values and future.", value: 5 },
      { label: "I usually reflect with care, though I occasionally trust quick instinct.", value: 4 },
      { label: "I consider the main outcomes, but often decide without overthinking.", value: 3 },
      { label: "I tend to make quick choices and reflect only if challenges come up.", value: 2 },
      { label: "I frequently act in the moment without thinking ahead.", value: 1 }
    ]
  },
  {
    id: 3,
    section: "Executive Control",
    region: "Orbitofrontal Cortex",
    reverse: false,
    text: "When tempting distractions or quick pleasures beckon during quiet work hours, how do you care for your time?",
    options: [
      { label: "I honor my priorities with steady, gentle self-discipline.", value: 5 },
      { label: "I mostly stay on track, letting minor diversions pass without derailment.", value: 4 },
      { label: "I sometimes take unplanned detours, but find my way back to what matters.", value: 3 },
      { label: "I frequently lose myself in distractions and struggle to return to tasks.", value: 2 },
      { label: "I almost always give in to immediate impulses over my responsibilities.", value: 1 }
    ]
  },
  {
    id: 4,
    section: "Executive Control",
    region: "Anterior Cingulate Cortex",
    reverse: false,
    text: "When you realize a misstep or mistake has happened, how kindly and quickly do you adapt?",
    options: [
      { label: "I notice with clarity, treat myself with grace, and adjust course smoothly.", value: 5 },
      { label: "I acknowledge it quickly and take constructive steps forward.", value: 4 },
      { label: "I recognize it after a little reflection and adjust over time.", value: 3 },
      { label: "I often get caught in self-doubt before I can adjust my approach.", value: 2 },
      { label: "I struggle to see where things went off track or feel too discouraged to change.", value: 1 }
    ]
  },

  /* ══════════════════════════════════════════════════
     PILLAR 02: EMOTIONAL REGULATION
     ══════════════════════════════════════════════════ */
  {
    id: 5,
    section: "Emotional Regulation",
    region: "Amygdala",
    reverse: true,
    text: "When life brings unexpected pressure or sudden uncertainty, how does your inner space feel?",
    options: [
      { label: "I feel intense overwhelm or worry that takes significant time to soothe.", value: 5 },
      { label: "I feel noticeable stress, though I eventually find my footing.", value: 4 },
      { label: "I feel a temporary flutter of tension, but remain balanced and functional.", value: 3 },
      { label: "I feel mild concern while keeping an anchored, reassuring inner calm.", value: 2 },
      { label: "I remain serene, centered, and deeply peaceful even under pressure.", value: 1 }
    ]
  },
  {
    id: 6,
    section: "Emotional Regulation",
    region: "Hippocampus",
    reverse: false,
    text: "How effortlessly do cherished moments, new insights, and daily details stay vibrant in your memory?",
    options: [
      { label: "My mind retains stories, insights, and memories with vivid clarity.", value: 5 },
      { label: "I remember the heart of most experiences with only minor hazy details.", value: 4 },
      { label: "I hold onto main themes, but smaller details tend to fade with time.", value: 3 },
      { label: "I frequently forget meaningful things unless I write them down.", value: 2 },
      { label: "I find it very hard to hold onto recent learning or past details.", value: 1 }
    ]
  },
  {
    id: 7,
    section: "Emotional Regulation",
    region: "Insular Cortex",
    reverse: false,
    text: "How closely in tune are you with the subtle whispers of your body — like breath, heartbeat, and emotional cues?",
    options: [
      { label: "I feel deeply connected to my body's physical and emotional signals.", value: 5 },
      { label: "I easily notice shifts in energy, tension, or mood throughout the day.", value: 4 },
      { label: "I notice physical cues mostly when they become pronounced.", value: 3 },
      { label: "I often push through exhaustion or tension without realizing it until later.", value: 2 },
      { label: "I feel disconnected from what my body is physically experiencing.", value: 1 }
    ]
  },
  {
    id: 8,
    section: "Emotional Regulation",
    region: "Hypothalamus",
    reverse: false,
    text: "How harmoniously does your natural rhythm — from refreshing sleep to restorative daily energy — flow?",
    options: [
      { label: "My sleep is deeply nourishing and my daily energy feels steady and vibrant.", value: 5 },
      { label: "I enjoy restful sleep and consistent energy with occasional tired days.", value: 4 },
      { label: "My sleep and energy fluctuate, but I manage to keep a general rhythm.", value: 3 },
      { label: "My sleep is often fragmented and my energy swings unpredictably.", value: 2 },
      { label: "I battle chronic exhaustion and an erratic sleep schedule.", value: 1 }
    ]
  },

  /* ══════════════════════════════════════════════════
     PILLAR 03: MOTIVATION & REWARD
     ══════════════════════════════════════════════════ */
  {
    id: 9,
    section: "Motivation & Reward",
    region: "Dopamine Reward System",
    reverse: false,
    text: "When you greet a new morning, how much natural curiosity and genuine excitement do you feel for the day ahead?",
    options: [
      { label: "I wake up with genuine optimism, energized to explore and create.", value: 5 },
      { label: "I feel warm enthusiasm and a steady readiness for what lies ahead.", value: 4 },
      { label: "I feel moderate motivation, warming up as the morning unfolds.", value: 3 },
      { label: "It takes significant effort to find spark or purpose in my daily routine.", value: 2 },
      { label: "I feel weighed down by a persistent lack of drive or enthusiasm.", value: 1 }
    ]
  },
  {
    id: 10,
    section: "Motivation & Reward",
    region: "Nucleus Accumbens",
    reverse: false,
    text: "When you complete a meaningful effort or reach a personal milestone, how deeply do you savor the feeling?",
    options: [
      { label: "I feel deep, heartwarming fulfillment and genuine joy in my progress.", value: 5 },
      { label: "I feel happy, proud, and quietly energized by what I accomplished.", value: 4 },
      { label: "I feel a brief sense of relief before moving on to the next task.", value: 3 },
      { label: "I struggle to feel pride, often brushing off my own successes.", value: 2 },
      { label: "I rarely or never feel a sense of reward or satisfaction from my efforts.", value: 1 }
    ]
  },
  {
    id: 11,
    section: "Motivation & Reward",
    region: "Ventral Tegmental Area",
    reverse: false,
    text: "How patiently and faithfully do you nurture long-term aspirations, even when progress is quiet and gradual?",
    options: [
      { label: "I hold my long-term dreams with quiet devotion and enduring passion.", value: 5 },
      { label: "I stay committed to my path, even when small delays happen along the way.", value: 4 },
      { label: "I stay on course for a while, though my drive naturally dips without quick wins.", value: 3 },
      { label: "I frequently lose passion or abandon projects when things take time.", value: 2 },
      { label: "I find it nearly impossible to sustain devotion toward distant goals.", value: 1 }
    ]
  },
  {
    id: 12,
    section: "Motivation & Reward",
    region: "Dopamine Reward System",
    reverse: true,
    text: "How often do effortless digital dopamine loops (endless feeds, passive scrolling) crowd out what truly matters to you?",
    options: [
      { label: "Constantly — hours slip away into screens, leaving me drained and unfulfilled.", value: 5 },
      { label: "Frequently — I often catch myself scrolling longer than I intended.", value: 4 },
      { label: "Occasionally — I indulge from time to time, but can step away when needed.", value: 3 },
      { label: "Rarely — I consume media mindfully and prioritize real-life experiences.", value: 2 },
      { label: "Almost never — I naturally choose enriching, present-moment activities.", value: 1 }
    ]
  },

  /* ══════════════════════════════════════════════════
     PILLAR 04: HABITS & COORDINATION
     ══════════════════════════════════════════════════ */
  {
    id: 13,
    section: "Habits & Coordination",
    region: "Basal Ganglia",
    reverse: false,
    text: "How naturally do positive, caring daily rituals (nourishing food, movement, quiet reflection) weave into your life?",
    options: [
      { label: "Healthy rituals flow effortlessly as second nature in my daily life.", value: 5 },
      { label: "I maintain beneficial routines consistently with occasional gentle resets.", value: 4 },
      { label: "I keep up some good habits, though consistency can be a work in progress.", value: 3 },
      { label: "I find it difficult to anchor new nurturing habits into my daily schedule.", value: 2 },
      { label: "My days lack positive routines and I feel trapped in chaotic patterns.", value: 1 }
    ]
  },
  {
    id: 14,
    section: "Habits & Coordination",
    region: "Basal Ganglia",
    reverse: true,
    text: "When an unhelpful habit shows up, how difficult does it feel to step back and choose a kinder response?",
    options: [
      { label: "Extremely difficult — I feel automatically locked into repeating old habits.", value: 5 },
      { label: "Challenging — I often repeat habits even when I know they deplete me.", value: 4 },
      { label: "Moderate — with conscious awareness, I can usually redirect myself.", value: 3 },
      { label: "Gentle — I notice unhelpful impulses early and choose differently.", value: 2 },
      { label: "Effortless — I easily release habits that no longer serve my well-being.", value: 1 }
    ]
  },
  {
    id: 15,
    section: "Habits & Coordination",
    region: "Cerebellum",
    reverse: false,
    text: "How grounded, graceful, and physically connected do you feel when moving through your day?",
    options: [
      { label: "I feel wonderfully balanced, coordinated, and at home in my physical body.", value: 5 },
      { label: "I move with ease and natural physical poise throughout the day.", value: 4 },
      { label: "I feel generally coordinated, with occasional moments of stiffness or fatigue.", value: 3 },
      { label: "I often feel disconnected, clumsy, or physically off-balance.", value: 2 },
      { label: "I experience persistent physical awkwardness, tension, or poor coordination.", value: 1 }
    ]
  },
  {
    id: 16,
    section: "Habits & Coordination",
    region: "Cerebellum",
    reverse: false,
    text: "How seamlessly do your hands and body execute refined tasks, crafts, or rhythmic physical activities?",
    options: [
      { label: "My motor skills and physical timing feel fluid, precise, and effortless.", value: 5 },
      { label: "I learn and perform physical tasks and skills with good confidence.", value: 4 },
      { label: "I manage fine motor activities reasonably well with a bit of practice.", value: 3 },
      { label: "I find physical coordination and fine motor tasks frustrating or challenging.", value: 2 },
      { label: "I struggle substantially with hand-eye coordination and physical rhythm.", value: 1 }
    ]
  },

  /* ══════════════════════════════════════════════════
     PILLAR 05: SENSORY & INTEGRATION
     ══════════════════════════════════════════════════ */
  {
    id: 17,
    section: "Sensory & Integration",
    region: "Thalamus",
    reverse: true,
    text: "When spending time in busy environments with bright lights, chatter, or crowds, how does your mind feel?",
    options: [
      { label: "Deeply overloaded and drained, needing immediate silence and dark space.", value: 5 },
      { label: "Frequently overwhelmed by excessive sensory input and commotion.", value: 4 },
      { label: "Occasionally overstimulated, but manageable with brief breathers.", value: 3 },
      { label: "Comfortably resilient, maintaining my inner space despite bustle.", value: 2 },
      { label: "Completely at ease, naturally filtering sensory energy without fatigue.", value: 1 }
    ]
  },
  {
    id: 18,
    section: "Sensory & Integration",
    region: "Thalamus",
    reverse: false,
    text: "How gracefully can you immerse yourself in conversation or creative work while ignoring background chatter?",
    options: [
      { label: "I filter out background noise like water, staying peacefully present.", value: 5 },
      { label: "I tune into my focus zone well, brushing off most background sounds.", value: 4 },
      { label: "I can focus if the surroundings aren't too loud or chaotic.", value: 3 },
      { label: "I get pulled away easily whenever someone talks or makes noise nearby.", value: 2 },
      { label: "Any ambient sound completely breaks my concentration and train of thought.", value: 1 }
    ]
  },
  {
    id: 19,
    section: "Sensory & Integration",
    region: "Parietal Lobe",
    reverse: false,
    text: "How naturally do you sense your body's posture and spatial relationship to the spaces you move through?",
    options: [
      { label: "I have an intuitive, clear awareness of my posture, breath, and space.", value: 5 },
      { label: "I maintain good posture and navigate environments with comfortable ease.", value: 4 },
      { label: "I check in with my posture and body position periodically throughout the day.", value: 3 },
      { label: "I often catch myself slouching or bumping into furniture unintentionally.", value: 2 },
      { label: "I have very low awareness of my body posture and spatial surroundings.", value: 1 }
    ]
  },
  {
    id: 20,
    section: "Sensory & Integration",
    region: "Temporal Lobe",
    reverse: false,
    text: "When sharing heartfelt thoughts or listening to someone tell a story, how smoothly does language flow?",
    options: [
      { label: "I listen deeply and express my thoughts with warmth, eloquence, and ease.", value: 5 },
      { label: "I understand others clearly and find words to express myself well.", value: 4 },
      { label: "I follow conversations well, though I occasionally search for the right word.", value: 3 },
      { label: "I frequently stumble over words or lose track of what someone was saying.", value: 2 },
      { label: "I constantly struggle to articulate feelings or comprehend long speech.", value: 1 }
    ]
  }
];