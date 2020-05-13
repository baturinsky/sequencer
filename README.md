# sequencer

Sheduling function calls at certain time. Can be used for playing notes, spawning enemies etc.

Schedule are written as strings in following format.

* Number, or number/number, or /number: delay as much time before following actions

* Letter, followed by letters and numbers - call a function with such name, or start
playing sequence with such name in parralel.

* as before, but with (parameters) - call function with these parameters, as array split by ",". Can use numbers and strings without "" and spaces. 

Example:

```typescript
  let lib = sequencer(
    {zzfx:zzfx, say:(text)=>document.querySelector("p").innerHTML += text + "
  "},
    `
    a: zzfx(1.7,0,50,0.03,0.05,0.3,,2,,,,,,-0.1)
    b: zzfx(1.5,0.5,270,,0.1,,1,1.5,,,,,,,,0.1,0.01)
    seq1: a 1 a 1 a /8 b say(a) 7/8 a 1 a
    seq2: a /8 a /8 a /8 say(mooo) seq1 5/4 seq1
    `
  );

  lib("say(hi) seq2 1 b 0.5 b b 0.5 b b b").play();

```

## API

```typescript import sequencer from "./sequencer";```

and/or 

```typescript import {SequencePlayer, SequenceBuilder, SequenceCollection} from "./sequencer";```

**SequencePlayer** is created with [time, callback][] and can be used either by calling methods continue(deltaTime) or play(timeScaleInMilliseconds).
Can by used by itself if you are not interested in string-encoded sequences.

**SequenceBuilder** creates sequences that SequencePlayer can use from formatted string and library of sequences and function in form of "map name=>function/sequence as string"

**SequenceCollection** is created with a map of functions and a string with sequence codes on each line starting with "name:".
Has methods add(id, sequenceString) to add sequence and seq(id) to get it by id.

**sequencer(default export)** - same parameters as SequenceCollection. Returns a function that from sequenceCode creates a SequencePlayer.