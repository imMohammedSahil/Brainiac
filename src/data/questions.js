export const questions = [
  // paste all 30 question objects here
  {
  id: 1,
  section: "Executive Control",
  region: "Prefrontal Cortex",
  reverse: false,
  text: "When working on an important task with a deadline, which best describes your usual focus level?",
  options: [
    { label: "I stay deeply focused from start to finish with minimal distraction.", value: 5 },
    { label: "I focus well but occasionally get briefly distracted.", value: 4 },
    { label: "My focus fluctuates between productive and distracted periods.", value: 3 },
    { label: "I get distracted frequently and struggle to maintain momentum.", value: 2 },
    { label: "I can rarely stay focused for more than a few minutes.", value: 1 }
  ]
},

{
  id: 2,
  section: "Executive Control",
  region: "Prefrontal Cortex",
  reverse: false,
  text: "Before making an important decision, how do you typically approach it?",
  options: [
    { label: "I carefully analyze consequences and alternatives before deciding.", value: 5 },
    { label: "I usually think things through but may miss minor details.", value: 4 },
    { label: "I consider some consequences but not deeply.", value: 3 },
    { label: "I often decide quickly without full consideration.", value: 2 },
    { label: "I make impulsive decisions without thinking ahead.", value: 1 }
  ]
},

/* ================= ORBITOFRONTAL ================= */

{
  id: 3,
  section: "Executive Control",
  region: "Orbitofrontal Cortex",
  reverse: false,
  text: "When tempted by distractions like social media or gaming while work is pending, how do you respond?",
  options: [
    { label: "I consistently resist and prioritize my responsibilities.", value: 5 },
    { label: "I resist most of the time with minor slips.", value: 4 },
    { label: "I sometimes give in but return to work.", value: 3 },
    { label: "I frequently give in to distractions.", value: 2 },
    { label: "I almost always choose the distraction over responsibilities.", value: 1 }
  ]
},

{
  id: 4,
  section: "Executive Control",
  region: "Orbitofrontal Cortex",
  reverse: false,
  text: "After realizing you made a poor choice, what usually happens?",
  options: [
    { label: "I immediately acknowledge it and correct my behavior.", value: 5 },
    { label: "I recognize it fairly quickly and adjust.", value: 4 },
    { label: "I sometimes recognize mistakes after reflection.", value: 3 },
    { label: "I notice mistakes late or only after consequences.", value: 2 },
    { label: "I rarely recognize mistakes or change behavior.", value: 1 }
  ]
},

/* ================= ANTERIOR CINGULATE ================= */

{
  id: 5,
  section: "Executive Control",
  region: "Anterior Cingulate Cortex",
  reverse: false,
  text: "When you make a mistake, how do you typically respond?",
  options: [
    { label: "I quickly detect it and actively correct it.", value: 5 },
    { label: "I usually notice and fix it.", value: 4 },
    { label: "I sometimes notice mistakes after some time.", value: 3 },
    { label: "I rarely notice unless someone points it out.", value: 2 },
    { label: "I often overlook mistakes entirely.", value: 1 }
  ]
},

{
  id: 6,
  section: "Executive Control",
  region: "Anterior Cingulate Cortex",
  reverse: false,
  text: "When facing a difficult challenge, how persistent are you?",
  options: [
    { label: "I persist until I solve it regardless of difficulty.", value: 5 },
    { label: "I stay determined but may need short breaks.", value: 4 },
    { label: "I try but may give up if progress is slow.", value: 3 },
    { label: "I lose motivation quickly when it becomes hard.", value: 2 },
    { label: "I give up almost immediately when challenged.", value: 1 }
  ]
},

/* ================= AMYGDALA ================= */

{
  id: 7,
  section: "Emotional Regulation",
  region: "Amygdala",
  reverse: true,
  text: "When unexpected problems occur, how intensely do you feel anxiety?",
  options: [
    { label: "I feel extreme anxiety and struggle to cope.", value: 5 },
    { label: "I feel strong anxiety but manage eventually.", value: 4 },
    { label: "I feel moderate stress but stay functional.", value: 3 },
    { label: "I feel mild concern but remain calm.", value: 2 },
    { label: "I stay calm and composed even under pressure.", value: 1 }
  ]
},

{
  id: 8,
  section: "Emotional Regulation",
  region: "Amygdala",
  reverse: false,
  text: "During highly stressful days, how emotionally stable do you remain?",
  options: [
    { label: "Very calm and emotionally steady.", value: 5 },
    { label: "Mostly stable with minor stress spikes.", value: 4 },
    { label: "Some emotional fluctuations but manageable.", value: 3 },
    { label: "Noticeable emotional instability.", value: 2 },
    { label: "Highly reactive and emotionally overwhelmed.", value: 1 }
  ]
},

/* ================= HIPPOCAMPUS ================= */

{
  id: 9,
  section: "Emotional Regulation",
  region: "Hippocampus",
  reverse: false,
  text: "After studying new information, how well can you recall it the next day?",
  options: [
    { label: "I recall most details clearly without review.", value: 5 },
    { label: "I remember main concepts with small gaps.", value: 4 },
    { label: "I remember parts but forget details.", value: 3 },
    { label: "I struggle to recall without revising.", value: 2 },
    { label: "I remember very little unless I relearn it.", value: 1 }
  ]
},

{
  id: 10,
  section: "Emotional Regulation",
  region: "Hippocampus",
  reverse: true,
  text: "How frequently do you forget important dates or commitments?",
  options: [
    { label: "Very frequently, even with reminders.", value: 5 },
    { label: "Often forget unless reminded.", value: 4 },
    { label: "Occasionally forget.", value: 3 },
    { label: "Rarely forget important commitments.", value: 2 },
    { label: "Almost never forget commitments.", value: 1 }
  ]
},

/* ================= INSULA ================= */

{
  id: 11,
  section: "Emotional Regulation",
  region: "Insular Cortex",
  reverse: false,
  text: "How aware are you of subtle emotional changes within yourself?",
  options: [
    { label: "Highly aware of even subtle emotional shifts.", value: 5 },
    { label: "Generally aware of most emotions.", value: 4 },
    { label: "Sometimes aware after reflection.", value: 3 },
    { label: "Often unaware until emotions intensify.", value: 2 },
    { label: "Rarely aware of internal emotional states.", value: 1 }
  ]
},

{
  id: 12,
  section: "Emotional Regulation",
  region: "Insular Cortex",
  reverse: false,
  text: "When stressed, how clearly can you identify the root cause?",
  options: [
    { label: "Very clearly and accurately identify causes.", value: 5 },
    { label: "Usually identify causes with some effort.", value: 4 },
    { label: "Sometimes understand but not fully.", value: 3 },
    { label: "Often unsure what triggers stress.", value: 2 },
    { label: "Cannot identify causes of stress.", value: 1 }
  ]
},

/* ================= BASAL GANGLIA ================= */

{
  id: 13,
  section: "Habits & Coordination",
  region: "Basal Ganglia",
  reverse: true,
  text: "How often do you repeat habits you know are unproductive?",
  options: [
    { label: "Very often repeat harmful habits.", value: 5 },
    { label: "Often repeat them despite knowing better.", value: 4 },
    { label: "Sometimes repeat them.", value: 3 },
    { label: "Rarely repeat them.", value: 2 },
    { label: "Almost never repeat harmful habits.", value: 1 }
  ]
},

{
  id: 14,
  section: "Habits & Coordination",
  region: "Basal Ganglia",
  reverse: false,
  text: "How effectively can you build and maintain new productive routines?",
  options: [
    { label: "Very consistently maintain new habits.", value: 5 },
    { label: "Mostly consistent with minor lapses.", value: 4 },
    { label: "Somewhat consistent.", value: 3 },
    { label: "Often struggle to maintain habits.", value: 2 },
    { label: "Rarely sustain new habits.", value: 1 }
  ]
},

/* ================= DOPAMINE & REWARD ================= */

{
  id: 15,
  section: "Motivation & Reward",
  region: "Dopamine Reward System",
  reverse: false,
  text: "How motivated do you feel to begin important tasks each morning?",
  options: [
    { label: "Highly motivated and eager to start.", value: 5 },
    { label: "Generally motivated with small resistance.", value: 4 },
    { label: "Moderately motivated.", value: 3 },
    { label: "Low motivation, often delay starting.", value: 2 },
    { label: "Very little motivation to begin tasks.", value: 1 }
  ]
},

{
  id: 16,
  section: "Motivation & Reward",
  region: "Dopamine Reward System",
  reverse: false,
  text: "After completing a goal, how strong is your sense of accomplishment?",
  options: [
    { label: "Very strong and energizing sense of reward.", value: 5 },
    { label: "Strong feeling of satisfaction.", value: 4 },
    { label: "Moderate satisfaction.", value: 3 },
    { label: "Minimal sense of accomplishment.", value: 2 },
    { label: "Little to no reward feeling.", value: 1 }
  ]
},

/* ================= NUCLEUS ACCUMBENS ================= */

{
  id: 17,
  section: "Motivation & Reward",
  region: "Nucleus Accumbens",
  reverse: false,
  text: "After achieving success such as good grades, praise, or completing a difficult task, how energized do you feel?",
  options: [
    { label: "Extremely energized and motivated to pursue further goals.", value: 5 },
    { label: "Strongly encouraged and motivated.", value: 4 },
    { label: "Moderately pleased but energy boost is brief.", value: 3 },
    { label: "Slight satisfaction with little motivational effect.", value: 2 },
    { label: "Little to no sense of reward or motivation.", value: 1 }
  ]
},

{
  id: 18,
  section: "Motivation & Reward",
  region: "Nucleus Accumbens",
  reverse: true,
  text: "How often do you choose immediate pleasure (scrolling, snacking, entertainment) over long-term benefits?",
  options: [
    { label: "Almost always choose immediate pleasure.", value: 5 },
    { label: "Frequently prioritize short-term rewards.", value: 4 },
    { label: "Sometimes give in to immediate gratification.", value: 3 },
    { label: "Rarely sacrifice long-term goals.", value: 2 },
    { label: "Consistently prioritize long-term rewards.", value: 1 }
  ]
},

/* ================= VENTRAL TEGMENTAL AREA ================= */

{
  id: 19,
  section: "Motivation & Reward",
  region: "Ventral Tegmental Area",
  reverse: false,
  text: "How driven are you to pursue long-term goals even when progress is slow?",
  options: [
    { label: "Extremely driven and persist regardless of obstacles.", value: 5 },
    { label: "Strongly driven with occasional dips in motivation.", value: 4 },
    { label: "Moderately driven but consistency varies.", value: 3 },
    { label: "Often lose drive when progress is slow.", value: 2 },
    { label: "Struggle to stay committed to long-term goals.", value: 1 }
  ]
},

{
  id: 20,
  section: "Motivation & Reward",
  region: "Ventral Tegmental Area",
  reverse: true,
  text: "How often do you lose interest in goals you were once excited about?",
  options: [
    { label: "Very frequently lose interest.", value: 5 },
    { label: "Often lose enthusiasm.", value: 4 },
    { label: "Sometimes lose interest.", value: 3 },
    { label: "Rarely lose motivation.", value: 2 },
    { label: "Almost never lose interest once committed.", value: 1 }
  ]
},

/* ================= HYPOTHALAMUS ================= */

{
  id: 21,
  section: "Emotional Regulation",
  region: "Hypothalamus",
  reverse: false,
  text: "How consistent is your sleep schedule throughout the week?",
  options: [
    { label: "Very consistent sleep and wake times daily.", value: 5 },
    { label: "Mostly consistent with minor variations.", value: 4 },
    { label: "Moderately consistent.", value: 3 },
    { label: "Irregular sleep schedule.", value: 2 },
    { label: "Highly inconsistent and unpredictable sleep.", value: 1 }
  ]
},

{
  id: 22,
  section: "Emotional Regulation",
  region: "Hypothalamus",
  reverse: true,
  text: "How often do you experience sudden mood or energy swings without clear reason?",
  options: [
    { label: "Very frequently experience sudden shifts.", value: 5 },
    { label: "Often notice unpredictable mood changes.", value: 4 },
    { label: "Occasionally experience fluctuations.", value: 3 },
    { label: "Rarely experience sudden changes.", value: 2 },
    { label: "Almost never experience unexplained shifts.", value: 1 }
  ]
},

/* ================= THALAMUS ================= */

{
  id: 23,
  section: "Sensory & Integration",
  region: "Thalamus",
  reverse: true,
  text: "How often do noise, screens, or multitasking make you feel mentally overloaded?",
  options: [
    { label: "Almost always feel overwhelmed.", value: 5 },
    { label: "Frequently feel overloaded.", value: 4 },
    { label: "Sometimes feel overstimulated.", value: 3 },
    { label: "Rarely feel overwhelmed.", value: 2 },
    { label: "Easily handle sensory input without overload.", value: 1 }
  ]
},

{
  id: 24,
  section: "Sensory & Integration",
  region: "Thalamus",
  reverse: false,
  text: "How effectively can you ignore background distractions when focusing?",
  options: [
    { label: "Filter distractions effortlessly.", value: 5 },
    { label: "Ignore most distractions.", value: 4 },
    { label: "Manage some distractions.", value: 3 },
    { label: "Often distracted by background noise.", value: 2 },
    { label: "Cannot focus when distractions are present.", value: 1 }
  ]
},

/* ================= CEREBELLUM ================= */

{
  id: 25,
  section: "Habits & Coordination",
  region: "Cerebellum",
  reverse: false,
  text: "How consistently do you follow daily routines and planned schedules?",
  options: [
    { label: "Always consistent and structured.", value: 5 },
    { label: "Mostly consistent with minor deviations.", value: 4 },
    { label: "Somewhat consistent.", value: 3 },
    { label: "Often skip planned routines.", value: 2 },
    { label: "Rarely follow routines.", value: 1 }
  ]
},

{
  id: 26,
  section: "Habits & Coordination",
  region: "Cerebellum",
  reverse: false,
  text: "How coordinated and physically balanced do you feel during activities?",
  options: [
    { label: "Highly coordinated and balanced.", value: 5 },
    { label: "Generally coordinated.", value: 4 },
    { label: "Moderately coordinated.", value: 3 },
    { label: "Somewhat uncoordinated.", value: 2 },
    { label: "Frequently clumsy or unbalanced.", value: 1 }
  ]
},

/* ================= PARIETAL LOBE ================= */

{
  id: 27,
  section: "Sensory & Integration",
  region: "Parietal Lobe",
  reverse: false,
  text: "How aware are you of your posture and body positioning during daily activities?",
  options: [
    { label: "Highly aware and maintain proper posture.", value: 5 },
    { label: "Mostly aware.", value: 4 },
    { label: "Occasionally aware.", value: 3 },
    { label: "Rarely aware of posture.", value: 2 },
    { label: "Completely unaware of posture.", value: 1 }
  ]
},

{
  id: 28,
  section: "Sensory & Integration",
  region: "Parietal Lobe",
  reverse: false,
  text: "How easily can you visualize spatial layouts such as maps or room arrangements?",
  options: [
    { label: "Visualize spaces clearly and accurately.", value: 5 },
    { label: "Visualize with good accuracy.", value: 4 },
    { label: "Moderately visualize spaces.", value: 3 },
    { label: "Struggle to visualize layouts.", value: 2 },
    { label: "Very difficult to imagine spatial arrangements.", value: 1 }
  ]
},

/* ================= TEMPORAL LOBE ================= */

{
  id: 29,
  section: "Sensory & Integration",
  region: "Temporal Lobe",
  reverse: false,
  text: "How easily do you understand and remember conversations?",
  options: [
    { label: "Understand and remember details clearly.", value: 5 },
    { label: "Understand well with minor gaps.", value: 4 },
    { label: "Remember main points only.", value: 3 },
    { label: "Often forget parts of conversations.", value: 2 },
    { label: "Struggle to understand or remember conversations.", value: 1 }
  ]
},

{
  id: 30,
  section: "Sensory & Integration",
  region: "Temporal Lobe",
  reverse: true,
  text: "How often do you struggle to find the right words while speaking?",
  options: [
    { label: "Very frequently struggle to find words.", value: 5 },
    { label: "Often experience difficulty.", value: 4 },
    { label: "Sometimes struggle.", value: 3 },
    { label: "Rarely struggle.", value: 2 },
    { label: "Almost never have difficulty expressing words.", value: 1 }
  ]
}
];