import { parseChapterScript } from '../src/utils/scriptParser';

const script = `Rise of the Horde
Chapter 1 – The Battlefield
Page 1
Panel 1

Scene Prompt

Massive battlefield, tens of thousands of orcs standing in messy formation, dust in the air, crude weapons, chaotic army.

Narration

Tens of thousands stood on the battlefield.

Panel 2

Scene Prompt

Close shot of Xiao Chen among the orcs, towering muscular orc commander looking forward, gripping a metal sword and wooden shield.

Narration

Xiao Chen stood among them.

Panel 3

Scene Prompt

Wide shot showing the disorganized orc army, warriors pushing and shouting, messy formation.

Xiao Chen (thought)

Third row… fourth row… maybe the fifth?
It's impossible to tell in this mess.

Panel 4

Scene Prompt

Far distance view of the human army, perfectly aligned soldiers in metal armor and giant shields.

Narration

Their enemies stood in perfect formation.

Page 2
Panel 1

Scene Prompt

Human army line: soldiers in full metal armor, disciplined rows, long shields forming a wall.

Narration

A disciplined army.

Panel 2

Scene Prompt

Back to the orc side: warriors with crude weapons, axes, clubs, spears made from scrap metal.

Narration

Unlike Xiao Chen's kind.

Panel 3

Scene Prompt

Close up of different orcs: green skin, brownish skin, red scars, massive bodies.

Narration

Orcs of many tribes.

Panel 4

Scene Prompt

Orc holding a huge improvised weapon made from scrap metal and wood.

Narration

Weapons made from whatever they could find.

Page 3
Panel 1

Scene Prompt

Close shot of Xiao Chen examining his sword.

Narration

Xiao Chen looked at his own weapon.

Panel 2

Scene Prompt

Sword is small compared to his massive frame.

Xiao Chen (thought)

Too small.

Panel 3

Scene Prompt

Close up of his crude wooden shield with nails.

Xiao Chen (thought)

And this shield...

Panel 4

Scene Prompt

Orcs fighting each other earlier for equipment (flashback).

Narration

Good equipment was hard to obtain.

Page 4
Panel 1

Scene Prompt

Orcs brawling over weapons.

Narration

Even allies would fight each other for better gear.

Panel 2

Scene Prompt

Xiao Chen looking calm while chaos happens around him.

Xiao Chen (thought)

Survival of the strongest.

Panel 3

Scene Prompt

Orc army roaring loudly.

Orcs

RAAAAAAGHH!!

Panel 4

Scene Prompt

Human army still perfectly disciplined.

Narration

The enemy did not move.

Page 5
Panel 1

Scene Prompt

Human commander raising sword.

Human Commander

HOLD THE LINE!

Panel 2

Scene Prompt

Orc army charging forward wildly.

Orcs

ATTACK!!!

Panel 3

Scene Prompt

Xiao Chen tightening his grip on sword.

Xiao Chen (thought)

Here we go.

Panel 4

Scene Prompt

Massive clash between orc horde and human shield wall.

Narration

The battle began.

Page 6 (Cliffhanger)
Panel 1

Scene Prompt

Xiao Chen smashing into a human soldier.

Panel 2

Scene Prompt

Blood, chaos, battle everywhere.

Panel 3

Scene Prompt

Xiao Chen looking surprised suddenly.

Xiao Chen

What…?

Panel 4

Scene Prompt

Mysterious glowing light appearing in front of him.

Narration

Something strange appeared.

End of Chapter 1`;

const parsed = parseChapterScript(script);

console.log(JSON.stringify(parsed, null, 2));
console.log('--- TEST FINISHED ---');
console.log('Pages:', parsed.pages.length);
let panelCount = 0;
parsed.pages.forEach(pg => pg.panels.forEach(() => panelCount++));
console.log('Total Panels:', panelCount);
