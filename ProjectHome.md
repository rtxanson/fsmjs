# Overview #
The goal of this project is a framework for (weighted) fine state automata and transducers in Javascript with all algorithms of this paper implemented:

[Mehryar Mohri - Weighted Automata Algorithms](http://www.cs.nyu.edu/~mohri/postscript/hwa.pdf)

(Quite?) All operations are already implemented, however maybe not in the most efficient way. Current goal is to write a regex parser creating FSMs in order to have a dynamic demo / tutorial for FSM operations.

[Current Demo](http://jaehnig.org/fsmjs/) is static.

Thanks to [Paul Dixon](http://www.furui.cs.titech.ac.jp/~dixonp/wfstexplorer.html) for fixing some bugs to make this work with the JScript .NET compiler.

# Prerequisites #
The library itself only uses
  * Javascript 1.7

The demo needs additionally
  * PHP (Even an old version should be OK - [this](http://code.google.com/p/fsmjs/source/browse/trunk/render_gif.php) is all of the code.)
  * DOT from Graphviz (not sure which version)