# The Sound Of Sorting

As the title suggest, this application lets you hear the sound made my different algorithms during sorting. It also lets you see the sorting in action ( Its basically a sorting visualiser-audioliser ).

The sound produced has frequency based on the difference of the values of the elements that are being compared.

You can checkout the demo [here](https://kumaraditya1999.github.io/The-Sound-Of-Sorting/).

This project was inspired by this [video](https://www.youtube.com/watch?v=kPRA0W1kECg).

## How to run it locally
1. Clone this repo.
2. Host the index.html file on a server.

### Warnings
1. [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext) is not supported on Internet Explorer so ....
2. Don't use large array size for Stooge Sort ( Complexity is around O(n<sup>2.7</sup>) ) , so you might hear a small stray audio is the begining.

##

Run http-server on the folder to run this
